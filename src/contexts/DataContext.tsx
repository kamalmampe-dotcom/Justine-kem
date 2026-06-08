import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react'
import { toast } from 'sonner'
import type {
  Client, Order, Formation, Student, RentalItem, Rental,
  Appointment, ShopItem, Payment, Settings, Measurements,
} from '@/types'
import {
  demoClients, demoOrders, demoFormations, demoStudents,
  demoRentalItems, demoRentals, demoAppointments, demoShopItems,
  demoPayments, demoSettings, demoMeasurements,
} from '@/data/demo-data'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/lib/supabase-data'

// ── Helpers ──────────────────────────────────────────
let _counter = 1000
const uid = (prefix: string) => `${prefix}-${++_counter}`

// ── Interface du contexte ────────────────────────────
interface DataContextType {
  loading: boolean

  // Clientes
  clients: Client[]
  getClient: (id: string) => Client | undefined
  addClient: (c: Omit<Client, 'id' | 'created_at'>) => Client
  updateClient: (id: string, c: Partial<Client>) => void
  deleteClient: (id: string) => void

  // Commandes
  orders: Order[]
  getOrder: (id: string) => Order | undefined
  addOrder: (o: Omit<Order, 'id' | 'created_at' | 'balance'>) => Order
  updateOrder: (id: string, o: Partial<Order>) => void
  deleteOrder: (id: string) => void

  // Formations
  formations: Formation[]
  addFormation: (f: Omit<Formation, 'id' | 'created_at'>) => Formation
  updateFormation: (id: string, f: Partial<Formation>) => void

  // Apprenantes
  students: Student[]
  getStudent: (id: string) => Student | undefined
  addStudent: (s: Omit<Student, 'id' | 'created_at'>) => Student
  updateStudent: (id: string, s: Partial<Student>) => void
  deleteStudent: (id: string) => void

  // Articles de location
  rentalItems: RentalItem[]
  addRentalItem: (r: Omit<RentalItem, 'id' | 'created_at'>) => RentalItem
  updateRentalItem: (id: string, r: Partial<RentalItem>) => void

  // Locations / Réservations
  rentals: Rental[]
  addRental: (r: Omit<Rental, 'id' | 'created_at'>) => Rental
  updateRental: (id: string, r: Partial<Rental>) => void

  // Rendez-vous
  appointments: Appointment[]
  addAppointment: (a: Omit<Appointment, 'id' | 'created_at'>) => Appointment
  updateAppointment: (id: string, a: Partial<Appointment>) => void
  deleteAppointment: (id: string) => void

  // Boutique
  shopItems: ShopItem[]
  addShopItem: (s: Omit<ShopItem, 'id' | 'created_at'>) => ShopItem
  updateShopItem: (id: string, s: Partial<ShopItem>) => void

  // Paiements
  payments: Payment[]
  addPayment: (p: Omit<Payment, 'id' | 'created_at'>) => Payment

  // Mesures
  measurements: Measurements[]
  addMeasurement: (m: Omit<Measurements, 'id' | 'created_at'>) => Measurements

  // Réglages
  settings: Settings
  updateSettings: (s: Partial<Settings>) => void
}

const DataContext = createContext<DataContextType | null>(null)

// ── Provider ─────────────────────────────────────────
export function DataProvider({ children }: { children: ReactNode }) {
  const { user, isDemoMode } = useAuth()

  // Mode démo : données en mémoire. Mode Supabase : chargées via l'effet ci-dessous.
  const [clients, setClients] = useState<Client[]>(isDemoMode ? demoClients : [])
  const [orders, setOrders] = useState<Order[]>(isDemoMode ? demoOrders : [])
  const [formations, setFormations] = useState<Formation[]>(isDemoMode ? demoFormations : [])
  const [students, setStudents] = useState<Student[]>(isDemoMode ? demoStudents : [])
  const [rentalItems, setRentalItems] = useState<RentalItem[]>(isDemoMode ? demoRentalItems : [])
  const [rentals, setRentals] = useState<Rental[]>(isDemoMode ? demoRentals : [])
  const [appointments, setAppointments] = useState<Appointment[]>(isDemoMode ? demoAppointments : [])
  const [shopItems, setShopItems] = useState<ShopItem[]>(isDemoMode ? demoShopItems : [])
  const [payments, setPayments] = useState<Payment[]>(isDemoMode ? demoPayments : [])
  const [measurements, setMeasurements] = useState<Measurements[]>(isDemoMode ? demoMeasurements : [])
  const [settings, setSettings] = useState<Settings>(demoSettings)
  const [loading, setLoading] = useState(!isDemoMode)

  const today = () => new Date().toISOString().split('T')[0]

  const fail = (label: string, e: unknown) => {
    console.error(`[Supabase] ${label} :`, e)
    toast.error(`Échec de l'enregistrement (${label}).`)
  }

  // ── Chargement depuis Supabase (mode connecté) ───
  useEffect(() => {
    if (isDemoMode) return
    let cancelled = false

    const load = async () => {
      // Promise.resolve() garantit que les setState suivants sont « post-await »
      // (conforme à la règle react-hooks/set-state-in-effect).
      await Promise.resolve()
      if (cancelled) return
      setLoading(true)
      try {
        const d = user ? await api.fetchAll() : null
        if (cancelled) return
        setClients(d?.clients ?? [])
        setOrders(d?.orders ?? [])
        setFormations(d?.formations ?? [])
        setStudents(d?.students ?? [])
        setRentalItems(d?.rentalItems ?? [])
        setRentals(d?.rentals ?? [])
        setAppointments(d?.appointments ?? [])
        setShopItems(d?.shopItems ?? [])
        setPayments(d?.payments ?? [])
        setMeasurements(d?.measurements ?? [])
        if (d?.settings) setSettings(d.settings)
      } catch (e) {
        if (!cancelled) {
          console.error('[Supabase] Chargement des données :', e)
          toast.error('Impossible de charger les données depuis Supabase.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDemoMode, user?.id])

  // ── Clientes ─────────────────────────────────────
  const getClient = useCallback((id: string) => clients.find((c) => c.id === id), [clients])

  const addClient = useCallback((data: Omit<Client, 'id' | 'created_at'>) => {
    const c: Client = { ...data, id: uid('cl'), created_at: today() }
    setClients((prev) => [c, ...prev])
    if (!isDemoMode) void api.clients.insert(c).catch((e) => fail('cliente', e))
    return c
  }, [isDemoMode])

  const updateClient = useCallback((id: string, data: Partial<Client>) => {
    setClients((prev) => prev.map((c) => (c.id === id ? { ...c, ...data } : c)))
    if (!isDemoMode) void api.clients.update(id, data).catch((e) => fail('cliente', e))
  }, [isDemoMode])

  const deleteClient = useCallback((id: string) => {
    setClients((prev) => prev.filter((c) => c.id !== id))
    if (!isDemoMode) void api.clients.remove(id).catch((e) => fail('cliente', e))
  }, [isDemoMode])

  // ── Commandes ────────────────────────────────────
  const getOrder = useCallback((id: string) => orders.find((o) => o.id === id), [orders])

  const addOrder = useCallback((data: Omit<Order, 'id' | 'created_at' | 'balance'>) => {
    const o: Order = { ...data, id: uid('ord'), balance: data.price - data.deposit, created_at: today() }
    setOrders((prev) => [o, ...prev])
    if (!isDemoMode) void api.orders.insert(o).catch((e) => fail('commande', e))
    return o
  }, [isDemoMode])

  const updateOrder = useCallback((id: string, data: Partial<Order>) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== id) return o
        const updated = { ...o, ...data }
        updated.balance = updated.price - updated.deposit // recalcul automatique du solde
        return updated
      }),
    )
    if (!isDemoMode) void api.orders.update(id, data).catch((e) => fail('commande', e))
  }, [isDemoMode])

  const deleteOrder = useCallback((id: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== id))
    if (!isDemoMode) void api.orders.remove(id).catch((e) => fail('commande', e))
  }, [isDemoMode])

  // ── Formations ───────────────────────────────────
  const addFormation = useCallback((data: Omit<Formation, 'id' | 'created_at'>) => {
    const f: Formation = { ...data, id: uid('fm'), created_at: today() }
    setFormations((prev) => [f, ...prev])
    if (!isDemoMode) void api.formations.insert(f).catch((e) => fail('formation', e))
    return f
  }, [isDemoMode])

  const updateFormation = useCallback((id: string, data: Partial<Formation>) => {
    setFormations((prev) => prev.map((f) => (f.id === id ? { ...f, ...data } : f)))
    if (!isDemoMode) void api.formations.update(id, data).catch((e) => fail('formation', e))
  }, [isDemoMode])

  // ── Apprenantes ──────────────────────────────────
  const getStudent = useCallback((id: string) => students.find((s) => s.id === id), [students])

  const addStudent = useCallback((data: Omit<Student, 'id' | 'created_at'>) => {
    const s: Student = { ...data, id: uid('st'), created_at: today() }
    setStudents((prev) => [s, ...prev])
    if (!isDemoMode) void api.students.insert(s).catch((e) => fail('apprenante', e))
    return s
  }, [isDemoMode])

  const updateStudent = useCallback((id: string, data: Partial<Student>) => {
    setStudents((prev) => prev.map((s) => (s.id === id ? { ...s, ...data } : s)))
    if (!isDemoMode) void api.students.update(id, data).catch((e) => fail('apprenante', e))
  }, [isDemoMode])

  const deleteStudent = useCallback((id: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== id))
    if (!isDemoMode) void api.students.remove(id).catch((e) => fail('apprenante', e))
  }, [isDemoMode])

  // ── Articles de location ─────────────────────────
  const addRentalItem = useCallback((data: Omit<RentalItem, 'id' | 'created_at'>) => {
    const r: RentalItem = { ...data, id: uid('ri'), created_at: today() }
    setRentalItems((prev) => [r, ...prev])
    if (!isDemoMode) void api.rentalItems.insert(r).catch((e) => fail('article de location', e))
    return r
  }, [isDemoMode])

  const updateRentalItem = useCallback((id: string, data: Partial<RentalItem>) => {
    setRentalItems((prev) => prev.map((r) => (r.id === id ? { ...r, ...data } : r)))
    if (!isDemoMode) void api.rentalItems.update(id, data).catch((e) => fail('article de location', e))
  }, [isDemoMode])

  // ── Locations ────────────────────────────────────
  const addRental = useCallback((data: Omit<Rental, 'id' | 'created_at'>) => {
    const r: Rental = { ...data, id: uid('rn'), created_at: today() }
    setRentals((prev) => [r, ...prev])
    if (!isDemoMode) void api.rentals.insert(r).catch((e) => fail('location', e))
    return r
  }, [isDemoMode])

  const updateRental = useCallback((id: string, data: Partial<Rental>) => {
    setRentals((prev) => prev.map((r) => (r.id === id ? { ...r, ...data } : r)))
    if (!isDemoMode) void api.rentals.update(id, data).catch((e) => fail('location', e))
  }, [isDemoMode])

  // ── Rendez-vous ──────────────────────────────────
  const addAppointment = useCallback((data: Omit<Appointment, 'id' | 'created_at'>) => {
    const a: Appointment = { ...data, id: uid('apt'), created_at: today() }
    setAppointments((prev) => [a, ...prev])
    if (!isDemoMode) void api.appointments.insert(a).catch((e) => fail('rendez-vous', e))
    return a
  }, [isDemoMode])

  const updateAppointment = useCallback((id: string, data: Partial<Appointment>) => {
    setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, ...data } : a)))
    if (!isDemoMode) void api.appointments.update(id, data).catch((e) => fail('rendez-vous', e))
  }, [isDemoMode])

  const deleteAppointment = useCallback((id: string) => {
    setAppointments((prev) => prev.filter((a) => a.id !== id))
    if (!isDemoMode) void api.appointments.remove(id).catch((e) => fail('rendez-vous', e))
  }, [isDemoMode])

  // ── Boutique ─────────────────────────────────────
  const addShopItem = useCallback((data: Omit<ShopItem, 'id' | 'created_at'>) => {
    const s: ShopItem = { ...data, id: uid('si'), created_at: today() }
    setShopItems((prev) => [s, ...prev])
    if (!isDemoMode) void api.shopItems.insert(s).catch((e) => fail('article boutique', e))
    return s
  }, [isDemoMode])

  const updateShopItem = useCallback((id: string, data: Partial<ShopItem>) => {
    setShopItems((prev) => prev.map((s) => (s.id === id ? { ...s, ...data } : s)))
    if (!isDemoMode) void api.shopItems.update(id, data).catch((e) => fail('article boutique', e))
  }, [isDemoMode])

  // ── Paiements ────────────────────────────────────
  const addPayment = useCallback((data: Omit<Payment, 'id' | 'created_at'>) => {
    const p: Payment = { ...data, id: uid('pay'), created_at: today() }
    setPayments((prev) => [p, ...prev])
    if (!isDemoMode) void api.payments.insert(p).catch((e) => fail('paiement', e))
    return p
  }, [isDemoMode])

  // ── Mesures ──────────────────────────────────────
  const addMeasurement = useCallback((data: Omit<Measurements, 'id' | 'created_at'>) => {
    const m: Measurements = { ...data, id: uid('mes'), created_at: today() } as Measurements
    setMeasurements((prev) => [m, ...prev])
    if (!isDemoMode) void api.measurements.insert(m).catch((e) => fail('mesures', e))
    return m
  }, [isDemoMode])

  // ── Réglages ─────────────────────────────────────
  const updateSettings = useCallback((data: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...data }))
    if (!isDemoMode) void api.settings.upsert({ ...settings, ...data }).catch((e) => fail('réglages', e))
  }, [isDemoMode, settings])

  return (
    <DataContext.Provider
      value={{
        loading,
        clients, getClient, addClient, updateClient, deleteClient,
        orders, getOrder, addOrder, updateOrder, deleteOrder,
        formations, addFormation, updateFormation,
        students, getStudent, addStudent, updateStudent, deleteStudent,
        rentalItems, addRentalItem, updateRentalItem,
        rentals, addRental, updateRental,
        appointments, addAppointment, updateAppointment, deleteAppointment,
        shopItems, addShopItem, updateShopItem,
        payments, addPayment,
        measurements, addMeasurement,
        settings, updateSettings,
      }}
    >
      {children}
    </DataContext.Provider>
  )
}

// ── Hook ─────────────────────────────────────────────
export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used inside <DataProvider>')
  return ctx
}
