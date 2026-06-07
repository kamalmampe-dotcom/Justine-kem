import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useData } from '@/contexts/DataContext'
import { formatFcfa, cn } from '@/lib/utils'
import {
  TrendingUp, ClipboardList, Clock, AlertTriangle,
  GraduationCap, Crown, Calendar, ArrowRight, MessageCircle,
  Users, Wallet,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts'

/* ── Couleurs des graphiques ──────────────────────── */
const CHART_COLORS = ['#c9a24b', '#6e2a3c', '#8a6d3b', '#a9745f', '#4d4038']
const STATUS_COLORS: Record<string, string> = {
  Devis: '#c9a24b',
  'En production': '#6e2a3c',
  Essayage: '#8a6d3b',
  Prête: '#a9745f',
  Livrée: '#4d4038',
}

/* ── Composant KPI ────────────────────────────────── */
function KpiCard({
  icon: Icon, label, value, sub, color,
}: {
  icon: React.ElementType; label: string; value: string | number; sub?: string; color: string
}) {
  return (
    <Card className="group hover:shadow-lg hover:shadow-black/5 transition-all duration-300 border-border/60">
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <div className={cn('p-3 rounded-xl transition-transform group-hover:scale-105', color)}>
            <Icon className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-muted-foreground font-medium">{label}</p>
            <p className="text-2xl font-bold tracking-tight mt-0.5 font-serif">{value}</p>
            {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/* ── Tooltip personnalisé recharts ────────────────── */
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-card border border-border rounded-xl shadow-xl p-3 text-sm">
      <p className="font-medium mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-muted-foreground">
          <span className="inline-block w-2.5 h-2.5 rounded-full mr-2" style={{ background: p.fill || p.color }} />
          {p.name} : <strong className="text-foreground">{formatFcfa(p.value)}</strong>
        </p>
      ))}
    </div>
  )
}

/* ── Page Dashboard ───────────────────────────────── */
export function DashboardPage() {
  const { orders, students, rentalItems, rentals, appointments, payments, clients } = useData()

  /* ── Calcul des KPIs ────────────────────────────── */
  const kpis = useMemo(() => {
    const now = new Date()
    const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

    const caMonth = payments
      .filter((p) => p.date.startsWith(thisMonth))
      .reduce((s, p) => s + p.amount, 0)

    const inProgress = orders.filter((o) =>
      ['En production', 'Essayage', 'Prête'].includes(o.status),
    ).length

    const weekEnd = new Date(now)
    weekEnd.setDate(weekEnd.getDate() + 7)
    const dueThisWeek = orders.filter((o) => {
      const d = new Date(o.deadline)
      return d >= now && d <= weekEnd && o.status !== 'Livrée'
    }).length

    const balanceDue = orders
      .filter((o) => o.balance > 0 && o.status !== 'Livrée')
      .reduce((s, o) => s + o.balance, 0)

    const activeStudents = students.filter((s) =>
      s.progress.some((m) => !m.completed),
    ).length

    const itemsOut = rentalItems.filter((r) => r.state === 'Loué').length

    return { caMonth, inProgress, dueThisWeek, balanceDue, activeStudents, itemsOut }
  }, [orders, students, rentalItems, payments])

  /* ── Données pour graphique CA 6 mois ───────────── */
  const revenueChart = useMemo(() => {
    const now = new Date()
    const months: { name: string; key: string }[] = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      months.push({
        name: d.toLocaleDateString('fr-FR', { month: 'short' }),
        key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      })
    }
    return months.map((m) => ({
      name: m.name,
      montant: payments
        .filter((p) => p.date.startsWith(m.key))
        .reduce((s, p) => s + p.amount, 0),
    }))
  }, [payments])

  /* ── Données donut commandes par statut ─────────── */
  const statusChart = useMemo(() => {
    const counts: Record<string, number> = {}
    orders.forEach((o) => {
      counts[o.status] = (counts[o.status] || 0) + 1
    })
    return Object.entries(counts).map(([name, value]) => ({ name, value }))
  }, [orders])

  /* ── Données revenus par activité ───────────────── */
  const activityChart = useMemo(() => {
    const totals: Record<string, number> = { Couture: 0, Formation: 0, Location: 0, Boutique: 0 }
    payments.forEach((p) => {
      totals[p.activity] = (totals[p.activity] || 0) + p.amount
    })
    return Object.entries(totals).map(([name, montant]) => ({ name, montant }))
  }, [payments])

  /* ── RDV du jour ────────────────────────────────── */
  const todayStr = new Date().toISOString().split('T')[0]
  const todayAppointments = useMemo(
    () => appointments.filter((a) => a.date === todayStr).sort((a, b) => a.time.localeCompare(b.time)),
    [appointments, todayStr],
  )

  /* ── Échéances de la semaine ────────────────────── */
  const upcomingDeadlines = useMemo(() => {
    const now = new Date()
    const weekEnd = new Date(now)
    weekEnd.setDate(weekEnd.getDate() + 7)
    return orders
      .filter((o) => {
        const d = new Date(o.deadline)
        return d >= now && d <= weekEnd && o.status !== 'Livrée'
      })
      .sort((a, b) => a.deadline.localeCompare(b.deadline))
  }, [orders])

  /* ── Retours de location attendus ───────────────── */
  const pendingReturns = useMemo(
    () => rentals.filter((r) => r.status === 'Loué'),
    [rentals],
  )

  /* ── Alertes ────────────────────────────────────── */
  const alerts = useMemo(() => {
    const list: { message: string; type: 'warning' | 'danger' }[] = []
    const now = new Date()

    // Commandes en retard
    orders.forEach((o) => {
      if (o.status !== 'Livrée' && new Date(o.deadline) < now) {
        const client = clients.find((c) => c.id === o.client_id)
        list.push({
          message: `Commande ${o.type} de ${client?.name ?? '?'} — en retard (échéance : ${new Date(o.deadline).toLocaleDateString('fr-FR')})`,
          type: 'danger',
        })
      }
    })

    // Locations en retard
    rentals.forEach((r) => {
      if (r.status === 'Loué' && new Date(r.end_date) < now) {
        const client = clients.find((c) => c.id === r.client_id)
        const item = rentalItems.find((i) => i.id === r.rental_item_id)
        list.push({
          message: `Retour en retard : ${item?.name ?? 'Article'} — ${client?.name ?? '?'} (fin : ${new Date(r.end_date).toLocaleDateString('fr-FR')})`,
          type: 'warning',
        })
      }
    })

    return list
  }, [orders, rentals, clients, rentalItems])

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* ── En-tête ──────────────────────────────────── */}
      <div>
        <h1 className="text-3xl font-serif text-foreground">Tableau de bord</h1>
        <p className="text-muted-foreground mt-1">Vue d'ensemble de votre atelier</p>
      </div>

      {/* ── KPIs ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <KpiCard icon={TrendingUp} label="CA du mois" value={formatFcfa(kpis.caMonth)} color="bg-primary/10 text-primary" />
        <KpiCard icon={ClipboardList} label="Commandes en cours" value={kpis.inProgress} sub={`${orders.length} au total`} color="bg-secondary/10 text-secondary" />
        <KpiCard icon={Clock} label="À livrer cette semaine" value={kpis.dueThisWeek} color="bg-amber-500/10 text-amber-600" />
        <KpiCard icon={Wallet} label="Soldes à recouvrer" value={formatFcfa(kpis.balanceDue)} color="bg-rose-500/10 text-rose-500" />
        <KpiCard icon={GraduationCap} label="Apprenantes actives" value={kpis.activeStudents} sub={`${students.length} inscrites`} color="bg-emerald-500/10 text-emerald-600" />
        <KpiCard icon={Crown} label="Articles en location" value={kpis.itemsOut} sub={`${rentalItems.length} au catalogue`} color="bg-violet-500/10 text-violet-500" />
      </div>

      {/* ── Graphiques ───────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CA 6 mois */}
        <Card className="lg:col-span-2 border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Chiffre d'affaires — 6 derniers mois</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueChart} barSize={32}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <RechartsTooltip content={<ChartTooltip />} />
                  <Bar dataKey="montant" name="CA" fill="#c9a24b" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Commandes par statut (donut) */}
        <Card className="border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Commandes par statut</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-[260px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusChart}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {statusChart.map((entry, i) => (
                      <Cell key={i} fill={STATUS_COLORS[entry.name] ?? CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    formatter={(value: number, name: string) => [`${value} commande(s)`, name]}
                    contentStyle={{ borderRadius: 12, border: '1px solid var(--border)', background: 'var(--card)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Légende */}
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 justify-center mt-2">
              {statusChart.map((entry, i) => (
                <div key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: STATUS_COLORS[entry.name] ?? CHART_COLORS[i] }} />
                  {entry.name} ({entry.value})
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Revenus par activité ──────────────────────── */}
      <Card className="border-border/60">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">Revenus par activité</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityChart} layout="vertical" barSize={24}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} width={80} />
                <RechartsTooltip content={<ChartTooltip />} />
                <Bar dataKey="montant" name="Revenus" radius={[0, 6, 6, 0]}>
                  {activityChart.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* ── Listes ───────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alertes */}
        {alerts.length > 0 && (
          <Card className="border-destructive/30 bg-destructive/[0.02] lg:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-4 w-4" /> Alertes
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              {alerts.map((a, i) => (
                <div
                  key={i}
                  className={cn(
                    'flex items-start gap-3 p-3 rounded-xl text-sm',
                    a.type === 'danger' ? 'bg-destructive/10 text-destructive' : 'bg-amber-500/10 text-amber-700',
                  )}
                >
                  <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                  {a.message}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* RDV du jour */}
        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" /> Rendez-vous du jour
              </CardTitle>
              <Link to="/atelier/agenda" className="text-xs text-primary hover:underline flex items-center gap-1">
                Voir l'agenda <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-2">
            {todayAppointments.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">Aucun rendez-vous aujourd'hui</p>
            ) : (
              todayAppointments.map((apt) => {
                const client = clients.find((c) => c.id === apt.client_id)
                return (
                  <div key={apt.id} className="flex items-center gap-3 p-3 rounded-xl bg-accent/50 hover:bg-accent transition-colors">
                    <div className="text-center shrink-0">
                      <p className="text-sm font-bold text-foreground">{apt.time}</p>
                      <p className="text-[11px] text-muted-foreground">{apt.duration_minutes} min</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{apt.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{client?.name}</p>
                    </div>
                    <Badge variant="outline" className="shrink-0 text-[11px]">{apt.type}</Badge>
                    {client?.phone && (
                      <a
                        href={`https://wa.me/${client.phone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener"
                        className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors shrink-0"
                        title="Rappel WhatsApp"
                      >
                        <MessageCircle className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>

        {/* Échéances de la semaine */}
        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-500" /> Échéances cette semaine
              </CardTitle>
              <Link to="/atelier/commandes" className="text-xs text-primary hover:underline flex items-center gap-1">
                Commandes <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-2">
            {upcomingDeadlines.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">Aucune échéance cette semaine</p>
            ) : (
              upcomingDeadlines.map((o) => {
                const client = clients.find((c) => c.id === o.client_id)
                return (
                  <div key={o.id} className="flex items-center gap-3 p-3 rounded-xl bg-accent/50 hover:bg-accent transition-colors">
                    <div className="text-center shrink-0">
                      <p className="text-sm font-bold text-foreground">
                        {new Date(o.deadline).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                      </p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{o.type} — {client?.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{o.description?.slice(0, 60)}</p>
                    </div>
                    <Badge
                      className={cn(
                        'shrink-0 text-[11px]',
                        o.status === 'En production' && 'bg-secondary/10 text-secondary border-secondary/30',
                        o.status === 'Essayage' && 'bg-amber-500/10 text-amber-600 border-amber-500/30',
                        o.status === 'Prête' && 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30',
                      )}
                      variant="outline"
                    >
                      {o.status}
                    </Badge>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>

        {/* Retours de location attendus */}
        {pendingReturns.length > 0 && (
          <Card className="border-border/60 lg:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <Crown className="h-4 w-4 text-violet-500" /> Retours de location attendus
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {pendingReturns.map((r) => {
                  const item = rentalItems.find((i) => i.id === r.rental_item_id)
                  const client = clients.find((c) => c.id === r.client_id)
                  const isLate = new Date(r.end_date) < new Date()
                  return (
                    <div
                      key={r.id}
                      className={cn(
                        'flex items-center gap-3 p-3 rounded-xl',
                        isLate ? 'bg-destructive/5 border border-destructive/20' : 'bg-accent/50',
                      )}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item?.name}</p>
                        <p className="text-xs text-muted-foreground">{client?.name} — retour le {new Date(r.end_date).toLocaleDateString('fr-FR')}</p>
                      </div>
                      {isLate && <Badge variant="destructive" className="text-[11px]">En retard</Badge>}
                      {!r.deposit_returned && (
                        <Badge variant="outline" className="text-[11px] border-amber-500/30 text-amber-600">Caution</Badge>
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
