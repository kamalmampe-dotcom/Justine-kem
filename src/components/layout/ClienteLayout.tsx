import { Outlet, Navigate, NavLink } from 'react-router-dom'
import { Scissors, LogOut, Home, Calendar, ShoppingBag, BookOpen } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'

export function ClienteLayout() {
  const { user, isAuthenticated, logout } = useAuth()

  if (!isAuthenticated || user?.role === 'admin') {
    return <Navigate to="/login" replace />
  }

  const NAV_ITEMS = [
    { label: 'Mon Espace', icon: Home, href: '/cliente' },
    { label: 'Rendez-vous', icon: Calendar, href: '/cliente/rdv' },
    { label: 'Catalogue', icon: ShoppingBag, href: '/cliente/catalogue' },
    { label: 'Formation', icon: BookOpen, href: '/cliente/formation' },
  ]

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* ── Navigation (Top Bar) ──────────────────────── */}
      <header className="sticky top-0 z-40 w-full bg-card/80 backdrop-blur-lg border-b border-border/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-6xl">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <Scissors className="h-5 w-5 text-primary" />
            </div>
            <span className="font-serif text-xl text-foreground tracking-wide hidden sm:block">
              Justine Kem's
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                end={item.href === '/cliente'}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )
                }
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium leading-none">{user?.name}</p>
              <p className="text-xs text-muted-foreground mt-1">Espace Cliente</p>
            </div>
            <button
              onClick={logout}
              className="p-2 rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
              title="Déconnexion"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* ── Navigation Mobile (Bottom Bar) ──────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border/60 z-40 pb-safe">
        <div className="flex items-center justify-around p-2">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.href === '/cliente'}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center gap-1 p-2 min-w-[64px] rounded-xl transition-colors',
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground hover:bg-muted/50'
                )
              }
            >
              <item.icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      {/* ── Contenu Principal ───────────────────────────── */}
      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl pb-24 md:pb-8">
        <Outlet />
      </main>
    </div>
  )
}
