import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Scissors, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export function LoginPage() {
  const { login, isAuthenticated, isDemoMode, loading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  /* ── Chargement ─────────────────────────────────── */
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-pulse text-primary font-serif text-2xl">Justine Kem's</div>
      </div>
    )
  }

  /* ── Déjà connecté → dashboard ──────────────────── */
  if (isAuthenticated) {
    return <Navigate to="/atelier" replace />
  }

  /* ── Soumission ─────────────────────────────────── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    const result = await login(email, password)
    if (!result.ok) setError(result.error ?? 'Erreur de connexion')
    setSubmitting(false)
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background p-4 overflow-hidden">
      {/* ── Décorations d'arrière-plan ─────────────── */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-1/3 -right-1/4 w-[700px] h-[700px] rounded-full bg-primary/[0.04] blur-3xl" />
        <div className="absolute -bottom-1/3 -left-1/4 w-[500px] h-[500px] rounded-full bg-secondary/[0.06] blur-3xl" />
        {/* Motif doré subtil */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full border border-primary/[0.06]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-primary/[0.04]" />
      </div>

      <Card className="relative z-10 w-full max-w-md shadow-2xl shadow-black/5 border-border/50 bg-card/90 backdrop-blur-md animate-in fade-in slide-in-from-bottom-6 duration-700">
        <CardHeader className="text-center pb-2 pt-10">
          {/* Logo animé */}
          <div className="flex justify-center mb-5">
            <div className="relative p-5 rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/20 shadow-lg shadow-primary/10">
              <Scissors className="h-10 w-10 text-primary" />
              <div className="absolute inset-0 rounded-2xl bg-primary/5 animate-pulse" />
            </div>
          </div>
          <h1 className="font-serif text-3xl text-foreground tracking-wide">
            Justine Kem's
          </h1>
          <p className="text-muted-foreground text-sm mt-1.5 tracking-wide">
            Haute Couture — Yaoundé
          </p>
        </CardHeader>

        <CardContent className="pt-6 pb-10 px-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="login-email" className="text-sm font-medium">
                Adresse e-mail
              </Label>
              <Input
                id="login-email"
                type="email"
                placeholder="admin@justinekems.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                className="h-11 bg-background/50"
              />
            </div>

            {/* Mot de passe */}
            <div className="space-y-2">
              <Label htmlFor="login-password" className="text-sm font-medium">
                Mot de passe
              </Label>
              <div className="relative">
                <Input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11 pr-11 bg-background/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Erreur */}
            {error && (
              <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm animate-in fade-in duration-300">
                {error}
              </div>
            )}

            {/* Bouton */}
            <Button
              type="submit"
              disabled={submitting}
              className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-[15px] rounded-xl shadow-lg shadow-primary/20 transition-all duration-200 active:scale-[0.98]"
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Connexion…
                </span>
              ) : (
                'Se connecter'
              )}
            </Button>
          </form>

          {/* Bannière mode démo */}
          {isDemoMode && (
            <div className="mt-6 p-4 rounded-xl bg-accent/80 border border-border/80 text-sm animate-in fade-in slide-in-from-bottom-2 duration-500 delay-300">
              <p className="font-semibold text-foreground mb-2.5 flex items-center gap-2">
                <span className="text-base">🎭</span> Mode démonstration
              </p>
              <div className="space-y-1.5 text-muted-foreground text-[13px]">
                <p>
                  <span className="font-medium text-foreground/80">Admin :</span>{' '}
                  admin@justinekems.com / admin
                </p>
                <p>
                  <span className="font-medium text-foreground/80">Cliente :</span>{' '}
                  aminatou@email.cm / cliente
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Signature en bas */}
      <p className="absolute bottom-4 text-xs text-muted-foreground/50">
        © 2026 Justine Kem's — L'élégance sur mesure
      </p>
    </div>
  )
}
