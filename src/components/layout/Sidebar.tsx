import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Users, ClipboardList, GraduationCap, BookOpen,
  Crown, Calendar, ShoppingBag, Wallet, Settings, LogOut, X, Scissors,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { cn, initials } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

interface SidebarProps {
  onClose?: () => void
}

const NAV_SECTIONS = [
  {
    items: [
      { label: 'Tableau de bord', icon: LayoutDashboard, href: '/atelier', end: true },
    ],
  },
  {
    title: 'GESTION',
    items: [
      { label: 'Clientes', icon: Users, href: '/atelier/clientes' },
      { label: 'Commandes', icon: ClipboardList, href: '/atelier/commandes' },
    ],
  },
  {
    title: 'FORMATION',
    items: [
      { label: 'Formations', icon: GraduationCap, href: '/atelier/formations' },
      { label: 'Apprenantes', icon: BookOpen, href: '/atelier/apprenantes' },
    ],
  },
  {
    title: 'ACTIVITÉS',
    items: [
      { label: 'Location', icon: Crown, href: '/atelier/location' },
      { label: 'Agenda', icon: Calendar, href: '/atelier/agenda' },
      { label: 'Boutique', icon: ShoppingBag, href: '/atelier/boutique' },
    ],
  },
  {
    title: 'FINANCES',
    items: [
      { label: 'Paiements', icon: Wallet, href: '/atelier/paiements' },
    ],
  },
]

export function Sidebar({ onClose }: SidebarProps) {
  const { user, logout } = useAuth()

  return (
    <aside className="flex flex-col h-full w-72 bg-sidebar text-sidebar-foreground">
      {/* ── Logo ────────────────────────────────────── */}
      <div className="flex items-center justify-between h-16 px-6 border-b border-sidebar-border shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-sidebar-primary/15">
            <Scissors className="h-5 w-5 text-sidebar-primary" />
          </div>
          <span className="font-serif text-xl text-sidebar-primary tracking-wide">
            Justine Kem's
          </span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* ── Navigation ──────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {NAV_SECTIONS.map((section, i) => (
          <div key={i}>
            {section.title && (
              <p className="px-3 mb-2 text-[11px] font-semibold tracking-[0.15em] text-sidebar-foreground/40 uppercase select-none">
                {section.title}
              </p>
            )}
            <ul className="space-y-0.5">
              {section.items.map((item) => (
                <li key={item.href}>
                  <NavLink
                    to={item.href}
                    end={item.end}
                    onClick={onClose}
                    className={({ isActive }) =>
                      cn(
                        'group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                        isActive
                          ? 'bg-sidebar-accent text-sidebar-primary shadow-sm shadow-sidebar-primary/10'
                          : 'text-sidebar-foreground/65 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground',
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <span className="absolute left-0 w-[3px] h-5 rounded-r-full bg-sidebar-primary" />
                        )}
                        <item.icon
                          className={cn(
                            'h-[18px] w-[18px] shrink-0 transition-colors',
                            isActive ? 'text-sidebar-primary' : 'text-sidebar-foreground/50 group-hover:text-sidebar-foreground/80',
                          )}
                        />
                        <span>{item.label}</span>
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* ── Réglages ────────────────────────────────── */}
      <div className="px-3 pb-2 shrink-0">
        <NavLink
          to="/atelier/reglages"
          onClick={onClose}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
              isActive
                ? 'bg-sidebar-accent text-sidebar-primary'
                : 'text-sidebar-foreground/65 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground',
            )
          }
        >
          <Settings className="h-[18px] w-[18px]" />
          Réglages
        </NavLink>
      </div>

      {/* ── Profil utilisateur ──────────────────────── */}
      <div className="border-t border-sidebar-border p-4 shrink-0">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9 border border-sidebar-border">
            <AvatarFallback className="bg-sidebar-accent text-sidebar-primary text-xs font-bold">
              {initials(user?.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name}</p>
            <p className="text-xs text-sidebar-foreground/45 truncate">{user?.email}</p>
          </div>
          <button
            onClick={logout}
            className="p-2 rounded-lg text-sidebar-foreground/40 hover:text-red-400 hover:bg-sidebar-accent transition-colors"
            title="Déconnexion"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}
