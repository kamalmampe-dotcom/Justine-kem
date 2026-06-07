import { useMemo } from 'react'
import { Calendar, Clock, ShoppingBag } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useData } from '@/contexts/DataContext'
import { formatFcfa, cn } from '@/lib/utils'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export function ClienteDashboardPage() {
  const { user } = useAuth()
  const { orders, appointments } = useData()

  // Dans un vrai cas, on filtrerait par user.id. 
  // En mode démo, on cherche la cliente par email ou nom pour matcher les fausses données.
  const myOrders = useMemo(() => {
    // Hack mode démo : on simule que l'user courant est "Aminatou" si on est cliente
    const fakeClientId = 'c1' 
    return orders.filter(o => o.client_id === fakeClientId).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }, [orders])

  const myAppointments = useMemo(() => {
    const fakeClientId = 'c1'
    return appointments.filter(a => a.client_id === fakeClientId && new Date(a.date) >= new Date()).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }, [appointments])

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-serif text-foreground">Bonjour, {user?.name?.split(' ')[0]}</h1>
        <p className="text-muted-foreground mt-1">Bienvenue dans votre espace personnel Justine Kem's</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ── Mes Commandes ──────────────────────────────── */}
        <Card className="border-border/60">
          <CardHeader className="pb-3 border-b border-border/30 bg-muted/20">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" /> Mes tenues en cours
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            {myOrders.filter(o => o.status !== 'Livrée').length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Vous n'avez aucune commande en cours.</p>
            ) : (
              myOrders.filter(o => o.status !== 'Livrée').map(order => (
                <div key={order.id} className="p-4 rounded-xl bg-accent/50 border border-border/40">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-foreground">{order.type}</h4>
                    <Badge variant="outline" className={cn(
                      'text-xs font-medium',
                      order.status === 'Prête' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-primary/10 text-primary border-primary/20'
                    )}>
                      {order.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-1">{order.description}</p>
                  
                  <div className="flex justify-between items-center text-xs font-medium border-t border-border/60 pt-3">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" /> Prévu pour le {new Date(order.deadline).toLocaleDateString('fr-FR')}
                    </div>
                    <span className={order.balance > 0 ? 'text-destructive' : 'text-emerald-600'}>
                      {order.balance > 0 ? `Reste à payer : ${formatFcfa(order.balance)}` : 'Soldé'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* ── Mes Rendez-vous ────────────────────────────── */}
        <Card className="border-border/60">
          <CardHeader className="pb-3 border-b border-border/30 bg-muted/20">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" /> Prochains rendez-vous
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            {myAppointments.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Vous n'avez aucun rendez-vous à venir.</p>
            ) : (
              myAppointments.map(apt => (
                <div key={apt.id} className="flex gap-4 p-4 rounded-xl bg-card border border-border/60 shadow-sm relative overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                  <div className="text-center shrink-0">
                    <p className="text-xs font-semibold text-muted-foreground uppercase">{new Date(apt.date).toLocaleDateString('fr-FR', { weekday: 'short' })}</p>
                    <p className="text-xl font-bold text-foreground leading-none my-1">{new Date(apt.date).getDate()}</p>
                    <p className="text-xs text-muted-foreground">{new Date(apt.date).toLocaleDateString('fr-FR', { month: 'short' })}</p>
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <h4 className="font-semibold text-foreground">{apt.title}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm font-medium text-primary">{apt.time}</span>
                      <span className="text-xs text-muted-foreground">• {apt.type}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
