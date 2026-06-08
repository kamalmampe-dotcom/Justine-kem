// ═══════════════════════════════════════════════════════════════════
// Couche d'accès aux données Supabase — Justine Kem's
//
// Convertit les lignes SQL (cf. supabase/migrations) en types de l'app
// (src/types) et inversement. Gère les petites différences de schéma :
//   • orders.balance   → calculé par trigger : jamais envoyé en écriture
//   • shop_items.quantity ↔ champ `stock` lu par la page Boutique
//   • rental_items      → colonnes canoniques photos/rental_price/deposit_amount
//   • clients.measurements → reconstitué depuis le dernier relevé du carnet
//   • measurements.extra → mesures libres (jsonb)
// ═══════════════════════════════════════════════════════════════════

import { supabase } from './supabase'
import type {
  Client, Order, Formation, Student, RentalItem, Rental,
  Appointment, ShopItem, Payment, Settings, Measurements,
} from '@/types'

// ── Helpers ─────────────────────────────────────────────────────────
const num = (v: unknown): number => (v == null ? 0 : Number(v))
const numOpt = (v: unknown): number | undefined => (v == null ? undefined : Number(v))

/** Retire les clés `undefined` (pour ne pas écraser des colonnes en update). */
function clean<T extends Record<string, unknown>>(obj: T): Partial<T> {
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(obj)) if (v !== undefined) out[k] = v
  return out as Partial<T>
}

/** Colonnes de mesures dédiées (le reste va dans `extra`). */
const MEASURE_COLUMNS = [
  'tour_poitrine', 'tour_taille', 'tour_bassin', 'longueur_taille_devant',
  'longueur_taille_dos', 'carrure_devant', 'carrure_dos', 'tour_encolure',
  'hauteur_poitrine', 'ecart_poitrine', 'tour_bras', 'longueur_manche',
  'tour_poignet', 'longueur_epaule', 'longueur_robe', 'longueur_jupe',
  'tour_cou', 'longueur_boubou',
] as const

// ── Row (base) → App ────────────────────────────────────────────────
/* eslint-disable @typescript-eslint/no-explicit-any */
function rowToMeasurements(r: any): Measurements {
  const m: Measurements = { id: r.id, client_id: r.client_id, created_at: r.created_at }
  for (const c of MEASURE_COLUMNS) if (r[c] != null) m[c] = Number(r[c])
  if (r.extra && typeof r.extra === 'object') Object.assign(m, r.extra)
  return m
}

const rowToOrder = (r: any): Order => ({
  ...r,
  price: num(r.price),
  total_price: numOpt(r.total_price),
  deposit: num(r.deposit),
  balance: num(r.balance),
})

const rowToStudent = (r: any): Student => ({
  ...r,
  progress: Array.isArray(r.progress) ? r.progress : [],
  total_amount: num(r.total_amount),
  paid_amount: num(r.paid_amount),
})

const rowToFormation = (r: any): Formation => ({
  ...r,
  duration_months: num(r.duration_months),
  price: num(r.price),
  modules: Array.isArray(r.modules) ? r.modules : [],
})

const rowToRentalItem = (r: any): RentalItem => ({
  ...r,
  photos: Array.isArray(r.photos) ? r.photos : [],
  rental_price: num(r.rental_price),
  deposit_amount: num(r.deposit_amount),
})

const rowToShopItem = (r: any): ShopItem => ({
  ...r,
  photos: Array.isArray(r.photos) ? r.photos : [],
  price: num(r.price),
  quantity: num(r.quantity),
  stock: num(r.quantity), // la page Boutique lit `stock`
})

const rowToPayment = (r: any): Payment => ({ ...r, amount: num(r.amount) })
const rowToAppointment = (r: any): Appointment => ({ ...r, duration_minutes: num(r.duration_minutes) })
/* eslint-enable @typescript-eslint/no-explicit-any */

// ── App → Row (base), champs dérivés/joints retirés ─────────────────
const clientToRow = (c: Partial<Client>) =>
  clean({ id: c.id, name: c.name, phone: c.phone, city: c.city, email: c.email, photo: c.photo, notes: c.notes, created_at: c.created_at })

const orderToRow = (o: Partial<Order>) =>
  // balance : calculé par trigger → non envoyé
  clean({ id: o.id, client_id: o.client_id, type: o.type, description: o.description, fabric: o.fabric, model_photo: o.model_photo, finished_photo: o.finished_photo, price: o.price, total_price: o.total_price, deposit: o.deposit, deadline: o.deadline, status: o.status, created_at: o.created_at })

const formationToRow = (f: Partial<Formation>) =>
  clean({ id: f.id, title: f.title, description: f.description, duration_months: f.duration_months, price: f.price, modules: f.modules, created_at: f.created_at })

const studentToRow = (s: Partial<Student>) =>
  clean({ id: s.id, name: s.name, phone: s.phone, email: s.email, photo: s.photo, city: s.city, level: s.level, enrollment_date: s.enrollment_date, formation_id: s.formation_id, progress: s.progress, notes: s.notes, total_amount: s.total_amount, paid_amount: s.paid_amount, created_at: s.created_at })

const rentalItemToRow = (r: Partial<RentalItem>) =>
  clean({ id: r.id, name: r.name, photos: r.photos ?? r.images, size: r.size, rental_price: r.rental_price ?? r.price_per_day, deposit_amount: r.deposit_amount ?? r.deposit, category: r.category, state: r.state, description: r.description, created_at: r.created_at })

const rentalToRow = (r: Partial<Rental>) =>
  clean({ id: r.id, rental_item_id: r.rental_item_id, client_id: r.client_id, start_date: r.start_date, end_date: r.end_date, status: r.status, deposit_paid: r.deposit_paid, deposit_returned: r.deposit_returned, created_at: r.created_at })

const appointmentToRow = (a: Partial<Appointment>) =>
  clean({ id: a.id, client_id: a.client_id, order_id: a.order_id, type: a.type, title: a.title, date: a.date, time: a.time, duration_minutes: a.duration_minutes, status: a.status, notes: a.notes, created_at: a.created_at })

const shopItemToRow = (s: Partial<ShopItem>) =>
  clean({ id: s.id, name: s.name, photos: s.photos ?? s.images, price: s.price, quantity: s.quantity ?? s.stock ?? 0, category: s.category, description: s.description, created_at: s.created_at })

const paymentToRow = (p: Partial<Payment>) =>
  clean({ id: p.id, client_id: p.client_id, activity: p.activity, reference_id: p.reference_id, order_id: p.order_id, amount: p.amount, date: p.date, method: p.method, notes: p.notes, created_at: p.created_at })

const settingsToRow = (s: Partial<Settings>) =>
  clean({ id: s.id, atelier_name: s.atelier_name, logo: s.logo, phone: s.phone, email: s.email, address: s.address, city: s.city, slogan: s.slogan })

function measurementToRow(m: Partial<Measurements>) {
  const row: Record<string, unknown> = { id: m.id, client_id: m.client_id, created_at: m.created_at }
  const extra: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(m)) {
    if (k === 'id' || k === 'client_id' || k === 'created_at' || v == null) continue
    if ((MEASURE_COLUMNS as readonly string[]).includes(k)) row[k] = v
    else extra[k] = v
  }
  if (Object.keys(extra).length) row.extra = extra
  return clean(row)
}

// ── Lecture ─────────────────────────────────────────────────────────
async function sel(table: string, ordered = true) {
  let q = supabase.from(table).select('*')
  if (ordered) q = q.order('created_at', { ascending: false })
  const { data, error } = await q
  if (error) throw new Error(`${table}: ${error.message}`)
  return data ?? []
}

export interface AllData {
  clients: Client[]
  orders: Order[]
  formations: Formation[]
  students: Student[]
  rentalItems: RentalItem[]
  rentals: Rental[]
  appointments: Appointment[]
  shopItems: ShopItem[]
  payments: Payment[]
  measurements: Measurements[]
  settings: Settings | null
}

/** Charge toutes les collections du propriétaire connecté (filtrées par RLS). */
export async function fetchAllData(): Promise<AllData> {
  const [clients, measurements, orders, formations, students, rentalItems, rentals, appointments, shopItems, payments, settings] =
    await Promise.all([
      sel('clients'), sel('measurements'), sel('orders'), sel('formations'),
      sel('students'), sel('rental_items'), sel('rentals'), sel('appointments'),
      sel('shop_items'), sel('payments'), sel('settings', false),
    ])

  const mappedMeasurements = measurements.map(rowToMeasurements)

  // Dernier relevé par cliente (les lignes sont déjà triées du + récent au + ancien)
  const latestByClient: Record<string, Measurements> = {}
  for (const m of mappedMeasurements) {
    if (m.client_id && !(m.client_id in latestByClient)) latestByClient[m.client_id] = m
  }

  return {
    clients: clients.map((r) => ({ ...r, measurements: latestByClient[r.id] ?? {} }) as Client),
    orders: orders.map(rowToOrder),
    formations: formations.map(rowToFormation),
    students: students.map(rowToStudent),
    rentalItems: rentalItems.map(rowToRentalItem),
    rentals: rentals as Rental[],
    appointments: appointments.map(rowToAppointment),
    shopItems: shopItems.map(rowToShopItem),
    payments: payments.map(rowToPayment),
    measurements: mappedMeasurements,
    settings: settings.length ? (settings[0] as Settings) : null,
  }
}

// ── Écriture (best-effort, utilisée par les futures formulaires) ─────
async function run(q: PromiseLike<{ error: { message: string } | null }>) {
  const { error } = await q
  if (error) throw new Error(error.message)
}

const crud = <A>(table: string, toRow: (v: Partial<A>) => Record<string, unknown>) => ({
  insert: (v: A) => run(supabase.from(table).insert(toRow(v))),
  update: (id: string, v: Partial<A>) => run(supabase.from(table).update(toRow(v)).eq('id', id)),
  remove: (id: string) => run(supabase.from(table).delete().eq('id', id)),
})

export const api = {
  fetchAll: fetchAllData,
  clients: crud<Client>('clients', clientToRow),
  orders: crud<Order>('orders', orderToRow),
  formations: crud<Formation>('formations', formationToRow),
  students: crud<Student>('students', studentToRow),
  rentalItems: crud<RentalItem>('rental_items', rentalItemToRow),
  rentals: crud<Rental>('rentals', rentalToRow),
  appointments: crud<Appointment>('appointments', appointmentToRow),
  shopItems: crud<ShopItem>('shop_items', shopItemToRow),
  payments: crud<Payment>('payments', paymentToRow),
  measurements: crud<Measurements>('measurements', measurementToRow),
  settings: {
    upsert: (s: Settings) => run(supabase.from('settings').upsert(settingsToRow(s) as Record<string, unknown>, { onConflict: 'owner_id' })),
  },
}
