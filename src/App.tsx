import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { DataProvider } from '@/contexts/DataContext'
import { Toaster } from '@/components/ui/sonner'

// Layouts
import { AppLayout } from '@/components/layout/AppLayout'

// Pages Auth
import { LoginPage } from '@/pages/auth/LoginPage'

// Pages Atelier
import { DashboardPage } from '@/pages/atelier/DashboardPage'
// import { ClientsPage } from '@/pages/atelier/ClientsPage'
// import { ClientDetailPage } from '@/pages/atelier/ClientDetailPage'
// import { OrdersPage } from '@/pages/atelier/OrdersPage'
// import { OrderDetailPage } from '@/pages/atelier/OrderDetailPage'
// import { FormationsPage } from '@/pages/atelier/FormationsPage'
// import { StudentsPage } from '@/pages/atelier/StudentsPage'
// import { StudentDetailPage } from '@/pages/atelier/StudentDetailPage'
// import { RentalCatalogPage } from '@/pages/atelier/RentalCatalogPage'
// import { AgendaPage } from '@/pages/atelier/AgendaPage'
// import { ShopPage } from '@/pages/atelier/ShopPage'
// import { PaymentsPage } from '@/pages/atelier/PaymentsPage'
// import { SettingsPage } from '@/pages/atelier/SettingsPage'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DataProvider>
          <Routes>
            {/* Route par défaut → redirige vers login ou atelier */}
            <Route path="/" element={<Navigate to="/atelier" replace />} />

            {/* Auth */}
            <Route path="/login" element={<LoginPage />} />

            {/* Espace Atelier (Protégé) */}
            <Route path="/atelier" element={<AppLayout />}>
              <Route index element={<DashboardPage />} />
              
              {/* Ces routes seront décommentées au fur et à mesure de leur création */}
              {/*
              <Route path="clientes" element={<ClientsPage />} />
              <Route path="clientes/:id" element={<ClientDetailPage />} />
              <Route path="commandes" element={<OrdersPage />} />
              <Route path="commandes/:id" element={<OrderDetailPage />} />
              <Route path="formations" element={<FormationsPage />} />
              <Route path="apprenantes" element={<StudentsPage />} />
              <Route path="apprenantes/:id" element={<StudentDetailPage />} />
              <Route path="location" element={<RentalCatalogPage />} />
              <Route path="agenda" element={<AgendaPage />} />
              <Route path="boutique" element={<ShopPage />} />
              <Route path="paiements" element={<PaymentsPage />} />
              <Route path="reglages" element={<SettingsPage />} />
              */}
            </Route>

            {/* Espace Cliente (À venir) */}
            {/* <Route path="/cliente" element={<ClienteLayout />}> ... </Route> */}
            
            {/* 404 */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Toaster richColors position="top-right" />
        </DataProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
