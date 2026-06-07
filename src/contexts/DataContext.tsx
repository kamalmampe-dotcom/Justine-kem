import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import type {
  Client, Order, Formation, Student, RentalItem, Rental,
  Appointment, ShopItem, Payment, Settings, Measurements,
} from '@/types'
import {
  demoClients, demoOrders, demoFormations, demoStudents,
  demoRentalItems, demoRentals, demoAppointments, demoShopItems,
  demoPayments, demoSettings, demoMeasurements,
} from '@/data/demo-data'

// ── Helpers ──────────────────────────────────────────
let _counter = 1000
const uid = (prefix: string) => `${prefix}-${++_counter}`

// ── Interface du contexte ────────────────────────────
interface DataContextType {
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
  const [clients, setClients] = useState<Client[]>(demoClients)
  const [orders, setOrders] = useState<Order[]>(demoOrders)
  const [formations, setFormations] = useState<Formation[]>(demoFormations)
  const [students, setStudents] = useState<Student[]>(demoStudents)
  const [rentalItems, setRentalItems] = useState<RentalItem[]>(demoRentalItems)
  const [rentals, setRentals] = useState<Rental[]>(demoRentals)
  const [appointments, setAppointments] = useState<Appointment[]>(demoAppointments)
  const [shopItems, setShopItems] = useState<ShopItem[]>(demoShopItems)
  const [payments, setPayments] = useState<Payment[]>(demoPayments)
  const [measurements, setMeasurements] = useState<Measurements[]>(demoMeasurements)
  const [settings, setSettings] = useState<Settings>(demoSettings)

  const today = () => new Date().toISOString().split('T')[0]

  // ── Clientes ─────────────────────────────────────
  const getClient = useCallback((id: string) => clients.find((c) => c.id === id), [clients])

  const addClient = useCallback((data: Omit<Client, 'id' | 'created_at'>) => {
    const c: Client = { ...data, id: uid('cl'), created_at: today() }
    setClients((prev) => [c, ...prev])
    return c
  }, [])

  const updateClient = useCallback((id: string, data: Partial<Client>) => {
    setClients((prev) => prev.map((c) => (c.id === id ? { ...c, ...data } : c)))
  }, [])

  const deleteClient = useCallback((id: string) => {
    setClients((prev) => prev.filter((c) => c.id !== id))
  }, [])

  // ── Commandes ────────────────────────────────────
  const getOrder = useCallback((id: string) => orders.find((o) => o.id === id), [orders])

  const addOrder = useCallback((data: Omit<Order, 'id' | 'created_at' | 'balance'>) => {
    const o: Order = { ...data, id: uid('ord'), balance: data.price - data.deposit, created_at: today() }
    setOrders((prev) => [o, ...prev])
    return o
  }, [])

  const updateOrder = useCallback((id: string, data: Partial<Order>) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== id) return o
        const updated = { ...o, ...data }
        // Recalcul automatique du solde
        updated.balance = updated.price - updated.deposit
        return updated
      }),
    )
  }, [])

  const deleteOrder = useCallback((id: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== id))
  }, [])

  // ── Formations ───────────────────────────────────
  const addFormation = useCallback((data: Omit<Formation, 'id' | 'created_at'>) => {
    const f: Formation = { ...data, id: uid('fm'), created_at: today() }
    setFormations((prev) => [f, ...prev])
    return f
  }, [])

  const updateFormation = useCallback((id: string, data: Partial<Formation>) => {
    setFormations((prev) => prev.map((f) => (f.id === id ? { ...f, ...data } : f)))
  }, [])

  // ── Apprenantes ──────────────────────────────────
  const getStudent = useCallback((id: string) => students.find((s) => s.id === id), [students])

  const addStudent = useCallback((data: Omit<Student, 'id' | 'created_at'>) => {
    const s: Student = { ...data, id: uid('st'), created_at: today() }
    setStudents((prev) => [s, ...prev])
    return s
  }, [])

  const updateStudent = useCallback((id: string, data: Partial<Student>) => {
    setStudents((prev) => prev.map((s) => (s.id === id ? { ...s, ...data } : s)))
  }, [])

  const deleteStudent = useCallback((id: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== id))
  }, [])

  // ── Articles de location ─────────────────────────
  const addRentalItem = useCallback((data: Omit<RentalItem, 'id' | 'created_at'>) => {
    const r: RentalItem = { ...data, id: uid('ri'), created_at: today() }
    setRentalItems((prev) => [r, ...prev])
    return r
  }, [])

  const updateRentalItem = useCallback((id: string, data: Partial<RentalItem>) => {
    setRentalItems((prev) => prev.map((r) => (r.id === id ? { ...r, ...data } : r)))
  }, [])

  // ── Locations ────────────────────────────────────
  const addRental = useCallback((data: Omit<Rental, 'id' | 'created_at'>) => {
    const r: Rental = { ...data, id: uid('rn'), created_at: today() }
    setRentals((prev) => [r, ...prev])
    return r
  }, [])

  const updateRental = useCallback((id: string, data: Partial<Rental>) => {
    setRentals((prev) => prev.map((r) => (r.id === id ? { ...r, ...data } : r)))
  }, [])

  // ── Rendez-vous ──────────────────────────────────
  const addAppointment = useCallback((data: Omit<Appointment, 'id' | 'created_at'>) => {
    const a: Appointment = { ...data, id: uid('apt'), created_at: today() }
    setAppointments((prev) => [a, ...prev])
    return a
  }, [])

  const updateAppointment = useCallback((id: string, data: Partial<Appointment>) => {
    setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, ...data } : a)))
  }, [])

  const deleteAppointment = useCallback((id: string) => {
    setAppointments((prev) => prev.filter((a) => a.id !== id))
  }, [])

  // ── Boutique ─────────────────────────────────────
  const addShopItem = useCallback((data: Omit<ShopItem, 'id' | 'created_at'>) => {
    const s: ShopItem = { ...data, id: uid('si'), created_at: today() }
    setShopItems((prev) => [s, ...prev])
    return s
  }, [])

  const updateShopItem = useCallback((id: string, data: Partial<ShopItem>) => {
    setShopItems((prev) => prev.map((s) => (s.id === id ? { ...s, ...data } : s)))
  }, [])

  // ── Paiements ────────────────────────────────────
  const addPayment = useCallback((data: Omit<Payment, 'id' | 'created_at'>) => {
    const p: Payment = { ...data, id: uid('pay'), created_at: today() }
    setPayments((prev) => [p, ...prev])
    return p
  }, [])

  // ── Mesures ──────────────────────────────────────
  const addMeasurement = useCallback((data: Omit<Measurements, 'id' | 'created_at'>) => {
    const m: Measurements = { ...data, id: uid('mes'), created_at: today() } as Measurements
    setMeasurements((prev) => [m, ...prev])
    return m
  }, [])

  // ── Réglages ─────────────────────────────────────
  const updateSettings = useCallback((data: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...data }))
  }, [])

  return (
    <DataContext.Provider
      value={{
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
