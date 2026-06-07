import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, BookOpen, Users, Clock, Edit } from 'lucide-react'
import { useData } from '@/contexts/DataContext'
import { formatFcfa } from '@/lib/utils'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export function FormationsPage() {
  const { formations, students } = useData()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')

  // Filtrage
  const filteredFormations = useMemo(() => {
    if (!search.trim()) return formations
    const q = search.toLowerCase()
    return formations.filter((f) => f.title.toLowerCase().includes(q))
  }, [formations, search])

  // Calcul du nombre d'apprenantes actives par formation
  const getActiveStudentsCount = (formationId: string) => {
    return students.filter(s => 
      s.formation_id === formationId && 
      s.progress.some(p => !p.completed)
    ).length
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* ── En-tête ──────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif text-foreground">Formations</h1>
          <p className="text-muted-foreground mt-1">Gérez vos programmes d'apprentissage</p>
        </div>
        <Button className="shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20">
          <Plus className="h-4 w-4 mr-2" /> Nouvelle Formation
        </Button>
      </div>

      {/* ── Filtres ──────────────────────────────────────── */}
      <div className="flex items-center gap-4 bg-card p-2 rounded-2xl border border-border/60 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher une formation..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 border-none bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 h-10"
          />
        </div>
      </div>

      {/* ── Grille des Formations ────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFormations.map((formation) => (
          <Card key={formation.id} className="border-border/60 hover:shadow-lg transition-all duration-300 group flex flex-col">
            <CardContent className="p-6 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-primary/10 rounded-xl group-hover:scale-105 transition-transform">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <Badge variant="secondary" className="font-semibold bg-background border-border/60">
                  {formatFcfa(formation.price)}
                </Badge>
              </div>
              
              <h3 className="text-lg font-serif font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                {formation.title}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-6 flex-1">
                {formation.description}
              </p>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/60 mb-6">
                <div className="flex flex-col gap-1">
                  <span className="flex items-center text-xs text-muted-foreground">
                    <Clock className="h-3 w-3 mr-1" /> Durée
                  </span>
                  <span className="font-medium text-foreground text-sm">{formation.duration_months} mois</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="flex items-center text-xs text-muted-foreground">
                    <Users className="h-3 w-3 mr-1" /> Actives
                  </span>
                  <span className="font-medium text-foreground text-sm">{getActiveStudentsCount(formation.id)} apprenantes</span>
                </div>
              </div>

              <div className="flex gap-3 mt-auto">
                <Button 
                  variant="outline" 
                  className="flex-1 border-border/60 hover:bg-muted/50"
                  onClick={() => navigate('/atelier/apprenantes', { state: { filterFormation: formation.id } })}
                >
                  Voir Apprenantes
                </Button>
                <Button variant="ghost" size="icon" className="border border-border/60 hover:bg-muted/50 shrink-0">
                  <Edit className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {filteredFormations.length === 0 && (
          <div className="col-span-full py-20 text-center text-muted-foreground">
            Aucune formation trouvée.
          </div>
        )}
      </div>
    </div>
  )
}
