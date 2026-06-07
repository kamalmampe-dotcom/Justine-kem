import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Filter, Clock, MoreVertical, Paperclip } from 'lucide-react'
import { useData } from '@/contexts/DataContext'
import { Order } from '@/types'
import { formatFcfa, cn, initials } from '@/lib/utils'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

const ORDER_STATUSES = ['Devis', 'En production', 'Essayage', 'Prête', 'Livrée'] as const

export function OrdersPage() {
  const { orders, clients } = useData()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')

  // Map des couleurs par statut
  const STATUS_COLORS: Record<string, string> = {
    'Devis': 'bg-primary/10 text-primary border-primary/20',
    'En production': 'bg-secondary/10 text-secondary border-secondary/20',
    'Essayage': 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    'Prête': 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    'Livrée': 'bg-muted text-muted-foreground border-border/60',
  }

  // Filtrage
  const filteredOrders = useMemo(() => {
    if (!search.trim()) return orders
    const q = search.toLowerCase()
    return orders.filter((o) => {
      const client = clients.find(c => c.id === o.client_id)
      return (
        o.type.toLowerCase().includes(q) ||
        o.description?.toLowerCase().includes(q) ||
        client?.name.toLowerCase().includes(q)
      )
    })
  }, [orders, clients, search])

  // Groupement par statut
  const ordersByStatus = useMemo(() => {
    const grouped: Record<string, Order[]> = {
      'Devis': [],
      'En production': [],
      'Essayage': [],
      'Prête': [],
      'Livrée': [],
    }
    filteredOrders.forEach((o) => {
      if (grouped[o.status]) grouped[o.status].push(o)
    })
    return grouped
  }, [filteredOrders])

  return (
    <div className="space-y-6 h-[calc(100vh-theme(spacing.24))] flex flex-col animate-in fade-in duration-500">
      {/* ── En-tête ──────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-serif text-foreground">Commandes</h1>
          <p className="text-muted-foreground mt-1">Suivez la production de votre atelier de couture</p>
        </div>
        <Button className="shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20">
          <Plus className="h-4 w-4 mr-2" /> Nouvelle Commande
        </Button>
      </div>

      {/* ── Filtres ──────────────────────────────────────── */}
      <div className="flex items-center gap-4 bg-card p-2 rounded-2xl border border-border/60 shadow-sm shrink-0">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par cliente, vêtement..."
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

      {/* ── Kanban Board ─────────────────────────────────── */}
      <div className="flex-1 overflow-x-auto pb-4">
        <div className="flex gap-6 h-full min-w-max">
          {ORDER_STATUSES.map((status) => {
            const columnOrders = ordersByStatus[status]
            return (
              <div key={status} className="w-80 flex flex-col h-full bg-muted/20 rounded-2xl border border-border/40 overflow-hidden">
                {/* En-tête de colonne */}
                <div className="p-4 border-b border-border/40 bg-muted/40 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2">
                    <span className={cn('w-2.5 h-2.5 rounded-full', STATUS_COLORS[status].split(' ')[0])} />
                    <h3 className="font-semibold text-foreground">{status}</h3>
                  </div>
                  <Badge variant="secondary" className="bg-background text-muted-foreground font-mono">
                    {columnOrders.length}
                  </Badge>
                </div>

                {/* Cartes de commandes */}
                <div className="flex-1 overflow-y-auto p-3 space-y-3">
                  {columnOrders.map((order) => {
                    const client = clients.find(c => c.id === order.client_id)
                    const isLate = order.status !== 'Livrée' && new Date(order.deadline) < new Date()
                    
                    return (
                      <div
                        key={order.id}
                        onClick={() => navigate(`/atelier/commandes/${order.id}`)}
                        className="bg-card rounded-xl p-4 border border-border/60 shadow-sm hover:shadow-md hover:border-primary/40 transition-all cursor-pointer group"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <Badge variant="outline" className={cn('font-medium', STATUS_COLORS[status])}>
                            {order.type}
                          </Badge>
                          <Button variant="ghost" size="icon" className="h-6 w-6 -mr-2 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <p className="text-sm text-foreground font-medium mb-1 line-clamp-2">
                          {order.description || 'Commande sur mesure'}
                        </p>

                        <div className="flex items-center gap-2 mt-4 mb-3">
                          <Avatar className="h-6 w-6 border border-border">
                            <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold">
                              {initials(client?.name || '?')}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-muted-foreground truncate">{client?.name}</span>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-border/60">
                          <div className={cn(
                            'flex items-center gap-1.5 text-xs font-medium',
                            isLate ? 'text-destructive' : 'text-muted-foreground'
                          )}>
                            <Clock className="h-3.5 w-3.5" />
                            {new Date(order.deadline).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                          </div>
                          <div className="text-xs font-bold text-foreground">
                            {formatFcfa(order.total_price)}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  {columnOrders.length === 0 && (
                    <div className="h-24 border-2 border-dashed border-border/40 rounded-xl flex items-center justify-center text-sm text-muted-foreground/60">
                      Glisser ici
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
