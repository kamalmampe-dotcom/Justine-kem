import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, Edit, Calendar, Clock, MapPin, CheckCircle2, 
  Wallet, FileText, Download, User, Printer
} from 'lucide-react'
import { useData } from '@/contexts/DataContext'
import { formatFcfa, cn } from '@/lib/utils'

import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

export function OrderDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { orders, clients, payments } = useData()

  const order = orders.find((o) => o.id === id)
  const client = useMemo(() => clients.find(c => c.id === order?.client_id), [clients, order])
  const orderPayments = useMemo(() => payments.filter(p => p.order_id === id), [payments, id])

  if (!order || !client) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Commande introuvable.</p>
        <Button variant="link" onClick={() => navigate('/atelier/commandes')} className="mt-4 text-primary">
          Retour aux commandes
        </Button>
      </div>
    )
  }

  const isLate = order.status !== 'Livrée' && new Date(order.deadline) < new Date()
  const balancePaid = orderPayments.reduce((acc, p) => acc + p.amount, 0)
  const balanceDue = order.total_price - balancePaid
  const progress = (balancePaid / order.total_price) * 100

  // Étapes de production
  const steps = [
    { id: 'Devis', label: 'Devis validé' },
    { id: 'En production', label: 'En production' },
    { id: 'Essayage', label: 'Essayage' },
    { id: 'Prête', label: 'Prête' },
    { id: 'Livrée', label: 'Livrée' },
  ]
  const currentStepIndex = steps.findIndex(s => s.id === order.status)

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto pb-10">
      {/* ── Bouton Retour ──────────────────────────────────── */}
      <button
        onClick={() => navigate('/atelier/commandes')}
        className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors group"
      >
        <ArrowLeft className="h-4 w-4 mr-1 group-hover:-translate-x-1 transition-transform" />
        Retour au Kanban
      </button>

      {/* ── En-tête Commande ────────────────────────────────── */}
      <div className="flex flex-col md:flex-row gap-6 md:items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-serif text-foreground">Commande #{order.id.slice(0, 8)}</h1>
            <Badge variant="outline" className={cn(
              'text-sm px-3 py-0.5',
              order.status === 'Livrée' ? 'bg-muted text-muted-foreground border-border/60' : 'bg-primary/10 text-primary border-primary/20'
            )}>
              {order.status}
            </Badge>
          </div>
          <p className="text-xl text-muted-foreground font-medium">{order.type}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="border-border/60">
            <Edit className="h-4 w-4 mr-2" /> Modifier
          </Button>
          <Button variant="outline" className="border-border/60">
            <Printer className="h-4 w-4 mr-2" /> Imprimer Ticket
          </Button>
        </div>
      </div>

      {/* ── Barre de progression Statut ─────────────────────── */}
      <Card className="border-border/60 bg-muted/10">
        <CardContent className="p-6">
          <div className="relative flex justify-between items-center max-w-3xl mx-auto">
            {/* Ligne de fond */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-border/60 -z-10" />
            {/* Ligne active */}
            <div 
              className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary -z-10 transition-all duration-500" 
              style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }} 
            />
            
            {steps.map((step, idx) => {
              const isPast = idx <= currentStepIndex
              const isCurrent = idx === currentStepIndex
              return (
                <div key={step.id} className="flex flex-col items-center gap-2">
                  <div className={cn(
                    'h-8 w-8 rounded-full flex items-center justify-center transition-colors duration-300',
                    isCurrent ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30 ring-4 ring-primary/20' :
                    isPast ? 'bg-primary text-primary-foreground' : 'bg-card border-2 border-border text-muted-foreground'
                  )}>
                    {isPast ? <CheckCircle2 className="h-5 w-5" /> : <div className="h-2 w-2 rounded-full bg-current" />}
                  </div>
                  <span className={cn(
                    'text-xs font-medium',
                    isCurrent ? 'text-primary' : isPast ? 'text-foreground' : 'text-muted-foreground'
                  )}>
                    {step.label}
                  </span>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Colonne Principale ──────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Détails du vêtement */}
          <Card className="border-border/60">
            <CardHeader className="pb-3 border-b border-border/30 bg-muted/20">
              <CardTitle className="text-base font-medium">Description du vêtement</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="text-foreground whitespace-pre-wrap">
                {order.description || "Aucune description fournie pour cette commande."}
              </p>
              
              <div className="mt-6 flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px] p-4 rounded-xl bg-accent/50 border border-border/60">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Calendar className="h-4 w-4" /> <span className="text-sm">Date de commande</span>
                  </div>
                  <p className="font-medium text-foreground">{new Date(order.created_at).toLocaleDateString('fr-FR')}</p>
                </div>
                <div className={cn(
                  "flex-1 min-w-[200px] p-4 rounded-xl border",
                  isLate ? "bg-destructive/10 border-destructive/30" : "bg-accent/50 border-border/60"
                )}>
                  <div className={cn("flex items-center gap-2 mb-1", isLate ? "text-destructive" : "text-muted-foreground")}>
                    <Clock className="h-4 w-4" /> <span className="text-sm">Échéance de livraison</span>
                  </div>
                  <p className={cn("font-medium", isLate ? "text-destructive" : "text-foreground")}>
                    {new Date(order.deadline).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Fichiers & Modèles (Placeholder) */}
          <Card className="border-border/60">
            <CardHeader className="pb-3 border-b border-border/30 bg-muted/20">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-medium">Modèles et Tissus</CardTitle>
                <Button variant="ghost" size="sm" className="h-8 text-primary">
                  <Plus className="h-4 w-4 mr-1" /> Ajouter
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-4 flex items-center justify-center py-10">
              <div className="text-center text-muted-foreground">
                <FileText className="h-8 w-8 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Aucune photo de modèle ou tissu attachée.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Colonne Latérale ────────────────────────────────── */}
        <div className="space-y-6">
          {/* Cliente */}
          <Card className="border-border/60">
            <CardHeader className="pb-3 border-b border-border/30 bg-muted/20">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <User className="h-4 w-4" /> Cliente
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div 
                className="flex items-center gap-3 p-2 -mx-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => navigate(`/atelier/clientes/${client.id}`)}
              >
                <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold font-serif border border-primary/20 shrink-0">
                  {initials(client.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate group-hover:text-primary transition-colors">
                    {client.name}
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    Voir la fiche <ArrowLeft className="h-3 w-3 rotate-180" />
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Finances */}
          <Card className="border-border/60">
            <CardHeader className="pb-3 border-b border-border/30 bg-muted/20">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <Wallet className="h-4 w-4" /> Paiement
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Total à payer</span>
                <span className="font-bold text-foreground text-base">{formatFcfa(order.total_price)}</span>
              </div>
              
              {/* Jauge de paiement */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-emerald-600 font-medium">{formatFcfa(balancePaid)} payé</span>
                  <span className="text-destructive font-medium">{formatFcfa(balanceDue)} restant</span>
                </div>
                <div className="h-2.5 w-full bg-destructive/10 rounded-full overflow-hidden flex">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${progress}%` }} />
                </div>
              </div>

              <Separator className="bg-border/60" />

              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Historique des paiements</p>
                {orderPayments.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">Aucun paiement enregistré.</p>
                ) : (
                  orderPayments.map((p) => (
                    <div key={p.id} className="flex justify-between items-center text-sm p-2 rounded-lg bg-accent/50">
                      <span className="text-muted-foreground">{new Date(p.date).toLocaleDateString('fr-FR')}</span>
                      <span className="font-medium text-foreground">{formatFcfa(p.amount)}</span>
                    </div>
                  ))
                )}
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" disabled={balanceDue === 0}>
                  <Wallet className="h-4 w-4 mr-2" /> {balanceDue === 0 ? 'Soldé' : 'Ajouter un paiement'}
                </Button>
                <Button variant="outline" className="w-full">
                  <Download className="h-4 w-4 mr-2" /> Télécharger Facture
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
