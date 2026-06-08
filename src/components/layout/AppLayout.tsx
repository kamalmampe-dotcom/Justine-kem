import { useState } from 'react'
import { Outlet, Navigate } from 'react-router-dom'
import { Menu, Scissors } from 'lucide-react'
import { Sidebar } from './Sidebar'
import { useAuth } from '@/contexts/AuthContext'
import { useData } from '@/contexts/DataContext'

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { isAuthenticated, loading: authLoading } = useAuth()
  const { loading: dataLoading } = useData()

  const loadingScreen = (
    <div className="flex flex-col items-center justify-center h-screen bg-background gap-4">
      <div className="p-4 rounded-2xl bg-primary/10 animate-pulse">
        <Scissors className="h-10 w-10 text-primary" />
      </div>
      <p className="font-serif text-xl text-primary animate-pulse">Justine Kem's</p>
    </div>
  )

  /* ── Chargement de la session ─────────────────────── */
  if (authLoading) return loadingScreen

  /* ── Redirection si non connecté ──────────────────── */
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  /* ── Chargement des données (Supabase) ────────────── */
  if (dataLoading) return loadingScreen

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* ── Sidebar desktop ──────────────────────────── */}
      <div className="hidden lg:flex lg:w-72 lg:flex-shrink-0 border-r border-border">
        <Sidebar />
      </div>

      {/* ── Sidebar mobile (overlay) ─────────────────── */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Fond semi-transparent */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          {/* Panneau latéral */}
          <div className="fixed left-0 top-0 h-full w-72 shadow-2xl animate-in slide-in-from-left-full duration-300">
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* ── Zone principale ──────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header mobile */}
        <header className="lg:hidden flex items-center h-14 px-4 border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-30 shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-2 rounded-lg hover:bg-accent transition-colors"
            aria-label="Ouvrir le menu"
          >
            <Menu className="h-5 w-5 text-foreground" />
          </button>
          <div className="flex items-center gap-2 ml-3">
            <Scissors className="h-4 w-4 text-primary" />
            <span className="font-serif text-lg text-primary tracking-wide">
              Justine Kem's
            </span>
          </div>
        </header>

        {/* Contenu de la page */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-6 lg:p-8 max-w-[1440px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
