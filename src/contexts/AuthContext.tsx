import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { User } from '@/types'
import { supabaseConfigured, supabase } from '@/lib/supabase'

// ── Utilisateurs de démonstration ────────────────────
const DEMO_USERS: (User & { password: string })[] = [
  {
    id: 'usr-admin',
    email: 'admin@justinekems.com',
    name: 'Justine Kem',
    role: 'admin',
    password: 'admin',
  },
  {
    id: 'usr-cliente',
    email: 'aminatou@email.cm',
    name: 'Aminatou Bella',
    role: 'cliente',
    password: 'cliente',
  },
]

// ── Interface du contexte ────────────────────────────
interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>
  logout: () => void
  isAuthenticated: boolean
  isAdmin: boolean
  isDemoMode: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

// ── Provider ─────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const isDemoMode = !supabaseConfigured

  // Restaurer la session au démarrage
  useEffect(() => {
    if (isDemoMode) {
      const saved = localStorage.getItem('jk_demo_user')
      if (saved) {
        try { setUser(JSON.parse(saved)) } catch { /* ignore */ }
      }
      setLoading(false)
      return
    }

    // Mode Supabase
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email ?? '',
          name: session.user.user_metadata?.name ?? session.user.email ?? '',
          role: (session.user.user_metadata?.role as 'admin' | 'cliente') ?? 'cliente',
        })
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email ?? '',
          name: session.user.user_metadata?.name ?? session.user.email ?? '',
          role: (session.user.user_metadata?.role as 'admin' | 'cliente') ?? 'cliente',
        })
      } else {
        setUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [isDemoMode])

  // ── Login ──────────────────────────────────────────
  const login = async (email: string, password: string): Promise<{ ok: boolean; error?: string }> => {
    if (isDemoMode) {
      const found = DEMO_USERS.find(
        (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password,
      )
      if (!found) {
        return { ok: false, error: 'Email ou mot de passe incorrect. (Démo : admin@justinekems.com / admin)' }
      }
      const { password: _, ...userWithoutPwd } = found
      setUser(userWithoutPwd)
      localStorage.setItem('jk_demo_user', JSON.stringify(userWithoutPwd))
      return { ok: true }
    }

    // Supabase
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { ok: false, error: error.message }
    return { ok: true }
  }

  // ── Logout ─────────────────────────────────────────
  const logout = () => {
    if (isDemoMode) {
      setUser(null)
      localStorage.removeItem('jk_demo_user')
    } else {
      supabase.auth.signOut()
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        isDemoMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// ── Hook ─────────────────────────────────────────────
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
