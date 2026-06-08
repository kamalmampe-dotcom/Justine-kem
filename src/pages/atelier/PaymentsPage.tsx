import { useState, useMemo } from 'react'
import { Search, Filter, Download } from 'lucide-react'
import { useData } from '@/contexts/DataContext'
import { formatFcfa } from '@/lib/utils'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export function PaymentsPage() {
  const { payments, clients, orders } = useData()
  const [search, setSearch] = useState('')

  const filteredPayments = useMemo(() => {
    return payments.filter(p => {
      const client = clients.find(c => c.id === p.client_id)
      const matchSearch = 
        !search.trim() || 
        p.activity.toLowerCase().includes(search.toLowerCase()) ||
        (p.method?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
        client?.name.toLowerCase().includes(search.toLowerCase())
      return matchSearch
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [payments, search, clients])

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* ── En-tête ──────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif text-foreground">Paiements</h1>
          <p className="text-muted-foreground mt-1">Historique des transactions de l'atelier</p>
        </div>
        <Button className="shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20">
          <Download className="h-4 w-4 mr-2" /> Exporter (CSV)
        </Button>
      </div>

      {/* ── Filtres ──────────────────────────────────────── */}
      <div className="flex items-center gap-4 bg-card p-2 rounded-2xl border border-border/60 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par cliente, méthode, activité..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 border-none bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 h-10"
          />
        </div>
        <div className="h-6 w-px bg-border/60" />
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
          <Filter className="h-4 w-4 mr-2" /> Filtres
        </Button>
      </div>

      {/* ── Tableau ──────────────────────────────────────── */}
      <Card className="border-border/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground uppercase text-xs tracking-wider border-b border-border/60">
              <tr>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Cliente</th>
                <th className="px-6 py-4 font-medium">Activité</th>
                <th className="px-6 py-4 font-medium">Méthode</th>
                <th className="px-6 py-4 font-medium">Montant</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-muted-foreground">
                    Aucun paiement trouvé
                  </td>
                </tr>
              ) : (
                filteredPayments.map((payment) => {
                  const client = clients.find(c => c.id === payment.client_id)
                  const order = payment.order_id ? orders.find(o => o.id === payment.order_id) : null

                  return (
                    <tr key={payment.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 text-muted-foreground">
                        {new Date(payment.date).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4 font-medium text-foreground">
                        {client?.name || 'Inconnu'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1 items-start">
                          <Badge variant="outline" className="font-medium bg-background">
                            {payment.activity}
                          </Badge>
                          {order && (
                            <span className="text-xs text-muted-foreground">Cmd #{order.id.slice(0, 8)}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {payment.method}
                      </td>
                      <td className="px-6 py-4 font-bold text-emerald-600">
                        {formatFcfa(payment.amount)}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
