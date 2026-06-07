// ═══════════════════════════════════════════════════════
// Types — Plateforme « Justine Kem's »
// ═══════════════════════════════════════════════════════

// ── Mesures (carnet de mesures, en cm) ───────────────
export interface Measurements {
  id?: string
  client_id?: string
  tour_poitrine?: number
  tour_taille?: number
  tour_bassin?: number
  longueur_taille_devant?: number
  longueur_taille_dos?: number
  carrure_devant?: number
  carrure_dos?: number
  tour_encolure?: number
  hauteur_poitrine?: number
  ecart_poitrine?: number
  tour_bras?: number
  longueur_manche?: number
  tour_poignet?: number
  longueur_epaule?: number
  longueur_robe?: number
  longueur_jupe?: number
  tour_cou?: number
  longueur_boubou?: number
  created_at?: string
  /** Mesures libres ajoutées par l'utilisatrice */
  [key: string]: number | string | undefined
}

/** Labels en français pour chaque mesure standard */
export const MEASUREMENT_LABELS: Record<string, string> = {
  tour_poitrine: 'Tour de poitrine',
  tour_taille: 'Tour de taille',
  tour_bassin: 'Tour de bassin',
  longueur_taille_devant: 'Longueur taille devant',
  longueur_taille_dos: 'Longueur taille dos',
  carrure_devant: 'Carrure devant',
  carrure_dos: 'Carrure dos',
  tour_encolure: "Tour d'encolure",
  hauteur_poitrine: 'Hauteur poitrine',
  ecart_poitrine: 'Écart poitrine',
  tour_bras: 'Tour de bras',
  longueur_manche: 'Longueur manche',
  tour_poignet: 'Tour de poignet',
  longueur_epaule: "Longueur d'épaule",
  longueur_robe: 'Longueur robe',
  longueur_jupe: 'Longueur jupe',
  tour_cou: 'Tour de cou',
  longueur_boubou: 'Longueur boubou',
}

// ── Cliente ──────────────────────────────────────────
export interface Client {
  id: string
  name: string
  phone: string
  city: string
  email?: string
  photo?: string
  notes?: string
  measurements: Measurements
  created_at: string
  owner_id?: string
}

// ── Commande ─────────────────────────────────────────
export const ORDER_TYPES = [
  'Robe de mariée',
  'Soirée',
  'Traditionnel',
  'Boubou/Bazin',
  'Ensemble',
  'Sur-mesure',
  'Autre',
] as const
export type OrderType = (typeof ORDER_TYPES)[number]

export const ORDER_STATUSES = [
  'Devis',
  'En production',
  'Essayage',
  'Prête',
  'Livrée',
] as const
export type OrderStatus = (typeof ORDER_STATUSES)[number]

export interface Order {
  id: string
  client_id: string
  client?: Client
  type: OrderType
  description: string
  fabric?: string
  model_photo?: string
  finished_photo?: string
  price: number
  total_price?: number
  deposit: number
  balance: number // auto = price − deposit
  deadline: string
  status: OrderStatus
  created_at: string
  owner_id?: string
}

// ── Formation ────────────────────────────────────────
export interface FormationModule {
  name: string
  completed: boolean
  grade?: number // 0–20
  comment?: string
  date?: string
}

export interface Formation {
  id: string
  title: string
  description: string
  duration_months: number
  price: number
  modules: string[]
  created_at: string
  owner_id?: string
}

// ── Apprenante (Student / Enrollment) ────────────────
export interface Student {
  id: string
  name: string
  phone: string
  email?: string
  photo?: string
  city?: string
  level: string
  enrollment_date: string
  formation_id: string
  formation?: Formation
  progress: FormationModule[]
  notes?: string
  total_amount: number
  paid_amount: number
  created_at: string
  owner_id?: string
}

// ── Location ─────────────────────────────────────────
export const RENTAL_ITEM_STATES = [
  'Disponible',
  'Loué',
  'En maintenance',
] as const
export type RentalItemState = (typeof RENTAL_ITEM_STATES)[number]

export interface RentalItem {
  id: string
  name: string
  photos?: string[]
  images?: string[]
  size: string
  rental_price: number
  price_per_day?: number
  deposit_amount: number
  deposit?: number
  category?: string
  state: RentalItemState
  description?: string
  created_at: string
  owner_id?: string
}

export const RENTAL_STATUSES = ['Réservé', 'Loué', 'Rendu'] as const
export type RentalStatus = (typeof RENTAL_STATUSES)[number]

export interface Rental {
  id: string
  rental_item_id: string
  rental_item?: RentalItem
  client_id: string
  client?: Client
  start_date: string
  end_date: string
  status: RentalStatus
  deposit_paid: boolean
  deposit_returned: boolean
  created_at: string
  owner_id?: string
}

// ── Rendez-vous ──────────────────────────────────────
export const APPOINTMENT_TYPES = [
  'Consultation',
  'Essayage',
  'Retrait',
  'Cours',
  'Autre',
] as const
export type AppointmentType = (typeof APPOINTMENT_TYPES)[number]

export interface Appointment {
  id: string
  client_id: string
  client?: Client
  order_id?: string
  type: AppointmentType
  title: string
  date: string
  time: string
  duration_minutes: number
  status?: string
  notes?: string
  created_at: string
  owner_id?: string
}

// ── Boutique / Stock ─────────────────────────────────
export const SHOP_CATEGORIES = [
  'Prêt-à-porter',
  'Accessoires',
  'Sacs',
  'Chaussures',
  'Bijoux',
  'Tissus',
] as const
export type ShopCategory = (typeof SHOP_CATEGORIES)[number]

export interface ShopItem {
  id: string
  name: string
  photos?: string[]
  images?: string[]
  price: number
  quantity: number
  stock?: number
  category: ShopCategory
  description?: string
  created_at: string
  owner_id?: string
}

// ── Paiement ─────────────────────────────────────────
export const PAYMENT_ACTIVITIES = [
  'Couture',
  'Formation',
  'Location',
  'Boutique',
] as const
export type PaymentActivity = (typeof PAYMENT_ACTIVITIES)[number]

export interface Payment {
  id: string
  client_id: string
  client?: Client
  activity: PaymentActivity
  reference_id: string
  order_id?: string
  amount: number
  date: string
  method?: string
  notes?: string
  created_at: string
  owner_id?: string
}

// ── Réglages ─────────────────────────────────────────
export interface Settings {
  id: string
  atelier_name: string
  logo?: string
  phone: string
  email: string
  address: string
  city: string
  slogan?: string
  owner_id?: string
}

// ── Utilisateur ──────────────────────────────────────
export type UserRole = 'admin' | 'cliente'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  avatar?: string
}
