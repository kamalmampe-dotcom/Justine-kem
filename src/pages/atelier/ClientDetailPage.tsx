import { useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Edit, Phone, Mail, MapPin, Calendar, ClipboardList, Ruler } from 'lucide-react'
import { useData } from '@/contexts/DataContext'
import { formatFcfa, initials } from '@/lib/utils'

import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function ClientDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { clients, orders, measurements } = useData()

  const client = clients.find((c) => c.id === id)
  const clientOrders = useMemo(() => orders.filter((o) => o.client_id === id), [orders, id])
  const clientMeasurements = useMemo(() => measurements.filter((m) => m.client_id === id).sort((a, b) => new Date(b.created_at as string).getTime() - new Date(a.created_at as string).getTime()), [measurements, id])

  const latestMeasurements = clientMeasurements[0]

  if (!client) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Cliente introuvable.</p>
        <Button variant="link" onClick={() => navigate('/atelier/clientes')} className="mt-4 text-primary">
          Retour à la liste
        </Button>
      </div>
    )
  }

  // Grouper les mensurations par catégorie pour un affichage propre
  const measurementGroups = [
    {
      title: 'Haut du corps',
      fields: [
        { key: 'shoulder', label: 'Épaule' },
        { key: 'chest', label: 'Poitrine' },
        { key: 'under_bust', label: 'Sous-poitrine' },
        { key: 'waist', label: 'Taille' },
        { key: 'back_width', label: 'Carrure dos' },
      ],
    },
    {
      title: 'Bas du corps',
      fields: [
        { key: 'hips', label: 'Hanches (Bassin)' },
        { key: 'thigh', label: 'Cuisse' },
        { key: 'knee', label: 'Genou' },
        { key: 'calf', label: 'Mollet' },
        { key: 'ankle', label: 'Cheville' },
      ],
    },
    {
      title: 'Bras & Manches',
      fields: [
        { key: 'armhole', label: 'Emmanchure' },
        { key: 'bicep', label: 'Biceps / Tour de bras' },
        { key: 'wrist', label: 'Poignet' },
        { key: 'sleeve_length', label: 'Longueur manche' },
      ],
    },
    {
      title: 'Longueurs (Verticales)',
      fields: [
        { key: 'front_length', label: 'Longueur taille devant' },
        { key: 'back_length', label: 'Longueur taille dos' },
        { key: 'skirt_length', label: 'Longueur jupe' },
        { key: 'pants_length', label: 'Longueur pantalon' },
        { key: 'dress_length', label: 'Longueur robe' },
        { key: 'crotch', label: 'Montant (Fourche)' },
      ],
    },
  ]

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto">
      {/* ── Bouton Retour ──────────────────────────────────── */}
      <button
        onClick={() => navigate('/atelier/clientes')}
        className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors group"
      >
        <ArrowLeft className="h-4 w-4 mr-1 group-hover:-translate-x-1 transition-transform" />
        Retour aux clientes
      </button>

      {/* ── En-tête Profil ──────────────────────────────────── */}
      <div className="flex flex-col md:flex-row gap-6 md:items-start justify-between">
        <div className="flex items-start gap-5">
          <Avatar className="h-20 w-20 border-2 border-primary/20 shadow-lg">
            <AvatarFallback className="bg-primary/10 text-primary text-2xl font-serif">
              {initials(client.name)}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <h1 className="text-3xl font-serif text-foreground">{client.name}</h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground mt-2">
              {client.phone && (
                <a href={`tel:${client.phone}`} className="flex items-center gap-1.5 hover:text-primary transition-colors">
                  <Phone className="h-4 w-4" /> {client.phone}
                </a>
              )}
              {client.email && (
                <a href={`mailto:${client.email}`} className="flex items-center gap-1.5 hover:text-primary transition-colors">
                  <Mail className="h-4 w-4" /> {client.email}
                </a>
              )}
              {client.city && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" /> {client.city}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" /> Inscrite le {new Date(client.created_at).toLocaleDateString('fr-FR')}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="border-border/60">
            <Edit className="h-4 w-4 mr-2" /> Modifier
          </Button>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20">
            <ClipboardList className="h-4 w-4 mr-2" /> Nouvelle Commande
          </Button>
        </div>
      </div>

      <Tabs defaultValue="measurements" className="w-full mt-8">
        <TabsList className="bg-card border border-border/60 p-1 w-full max-w-sm grid grid-cols-2">
          <TabsTrigger value="measurements" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
            <Ruler className="h-4 w-4 mr-2" /> Mensurations
          </TabsTrigger>
          <TabsTrigger value="orders" className="data-[state=active]:bg-secondary/10 data-[state=active]:text-secondary">
            <ClipboardList className="h-4 w-4 mr-2" /> Commandes ({clientOrders.length})
          </TabsTrigger>
        </TabsList>

        {/* ── Onglet: Mensurations ────────────────────────────── */}
        <TabsContent value="measurements" className="mt-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-serif text-foreground">Carnet de mesures</h2>
            {latestMeasurements && latestMeasurements.created_at && (
              <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                <Calendar className="h-4 w-4" /> Dernière mise à jour : {new Date(latestMeasurements.created_at).toLocaleDateString('fr-FR')}
              </span>
            )}
          </div>

          {!latestMeasurements ? (
            <Card className="border-dashed border-2 border-border/60 bg-transparent">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="p-4 rounded-full bg-primary/10 mb-4">
                  <Ruler className="h-8 w-8 text-primary" />
                </div>
                <p className="text-foreground font-medium mb-1">Aucune mensuration enregistrée</p>
                <p className="text-muted-foreground text-sm mb-4">Remplissez le carnet de mesures de cette cliente pour ses prochaines tenues.</p>
                <Button>Prendre les mesures</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {measurementGroups.map((group, i) => {
                // Filtrer les champs qui ont une valeur
                const fieldsWithValue = group.fields.filter(f => latestMeasurements[f.key] != null)
                if (fieldsWithValue.length === 0) return null

                return (
                  <Card key={i} className="border-border/60 shadow-sm">
                    <CardHeader className="pb-3 border-b border-border/30 bg-muted/20">
                      <CardTitle className="text-base font-medium">{group.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-3">
                      {fieldsWithValue.map((field) => (
                        <div key={field.key} className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">{field.label}</span>
                          <span className="font-semibold text-foreground">{latestMeasurements[field.key]} cm</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        {/* ── Onglet: Commandes ──────────────────────────────── */}
        <TabsContent value="orders" className="mt-6">
          <Card className="border-border/60 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 text-muted-foreground uppercase text-xs tracking-wider border-b border-border/60">
                  <tr>
                    <th className="px-6 py-4 font-medium">Type</th>
                    <th className="px-6 py-4 font-medium">Date création</th>
                    <th className="px-6 py-4 font-medium">Échéance</th>
                    <th className="px-6 py-4 font-medium">Statut</th>
                    <th className="px-6 py-4 font-medium text-right">Prix</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {clientOrders.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-10 text-center text-muted-foreground">
                        Aucune commande pour cette cliente
                      </td>
                    </tr>
                  ) : (
                    clientOrders.map((order) => (
                      <tr
                        key={order.id}
                        onClick={() => navigate(`/atelier/commandes/${order.id}`)}
                        className="hover:bg-muted/30 transition-colors cursor-pointer"
                      >
                        <td className="px-6 py-4 font-medium text-foreground">{order.type}</td>
                        <td className="px-6 py-4 text-muted-foreground">{new Date(order.created_at).toLocaleDateString('fr-FR')}</td>
                        <td className="px-6 py-4 text-muted-foreground">{new Date(order.deadline).toLocaleDateString('fr-FR')}</td>
                        <td className="px-6 py-4">
                          <Badge variant="outline" className="font-medium bg-background">
                            {order.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-right font-medium text-foreground">{formatFcfa(order.total_price)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
