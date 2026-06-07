import { useState, useMemo } from 'react'
import { Plus, Search, Filter, Camera, CheckCircle2, Clock } from 'lucide-react'
import { useData } from '@/contexts/DataContext'
import { formatFcfa, cn } from '@/lib/utils'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export function RentalCatalogPage() {
  const { rentalItems } = useData()
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')

  const categories = useMemo(() => {
    const cats = new Set<string>()
    rentalItems.forEach(item => {
      if (item.category) cats.add(item.category)
    })
    return Array.from(cats)
  }, [rentalItems])

  const filteredItems = useMemo(() => {
    return rentalItems.filter(item => {
      const matchSearch = !search.trim() || item.name.toLowerCase().includes(search.toLowerCase())
      const matchCat = categoryFilter === 'all' || (item.category === categoryFilter)
      return matchSearch && matchCat
    })
  }, [rentalItems, search, categoryFilter])

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* ── En-tête ──────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif text-foreground">Catalogue Location</h1>
          <p className="text-muted-foreground mt-1">Gérez vos robes, accessoires et équipements en location</p>
        </div>
        <Button className="shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20">
          <Plus className="h-4 w-4 mr-2" /> Nouvel Article
        </Button>
      </div>

      {/* ── Filtres ──────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-4 bg-card p-3 rounded-2xl border border-border/60 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un article..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 border-none bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 h-10"
          />
        </div>
        <div className="hidden sm:block w-px bg-border/60 mx-1" />
        <div className="flex items-center gap-2 px-2 sm:px-0">
          <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
          <select 
            className="bg-transparent border-none text-sm text-foreground focus:ring-0 outline-none w-full sm:w-auto"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">Toutes les catégories</option>
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Grille d'articles ────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredItems.map((item) => (
          <Card key={item.id} className="border-border/60 hover:shadow-lg transition-all duration-300 group overflow-hidden flex flex-col">
            <div className="aspect-[4/5] bg-muted/40 relative flex items-center justify-center">
              {(item.images || item.photos) && (item.images?.length || item.photos?.length) ? (
                <img 
                  src={(item.images || item.photos)?.[0]} 
                  alt={item.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-muted-foreground/50">
                  <Camera className="h-10 w-10 mb-2" />
                  <span className="text-xs font-medium uppercase tracking-wider">Pas de photo</span>
                </div>
              )}
              
              {/* Badge d'état */}
              <div className="absolute top-3 left-3">
                <Badge variant="outline" className={cn(
                  'shadow-sm backdrop-blur-md font-medium text-xs border',
                  item.state === 'Disponible' && 'bg-emerald-500/80 text-white border-emerald-500/20',
                  item.state === 'Loué' && 'bg-amber-500/80 text-white border-amber-500/20',
                  item.state === 'En maintenance' && 'bg-destructive/80 text-white border-destructive/20'
                )}>
                  {item.state === 'Disponible' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                  {item.state === 'Loué' && <Clock className="h-3 w-3 mr-1" />}
                  {item.state}
                </Badge>
              </div>

              {/* Action rapide (overlay) */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button variant="secondary" className="bg-background/90 hover:bg-background text-foreground shadow-xl">
                  Voir / Gérer
                </Button>
              </div>
            </div>

            <CardContent className="p-5 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-base font-semibold text-foreground line-clamp-1">{item.name}</h3>
              </div>
              <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase mb-4">
                {item.category}
              </p>

              <div className="mt-auto space-y-3 pt-4 border-t border-border/60">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Prix (jour)</span>
                  <span className="font-bold text-foreground">{formatFcfa(item.price_per_day || item.rental_price)}</span>
                </div>
                {(item.deposit ?? item.deposit_amount ?? 0) > 0 && (
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Caution exigée</span>
                    <span className="font-medium text-amber-600 dark:text-amber-500">{formatFcfa(item.deposit ?? item.deposit_amount)}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredItems.length === 0 && (
          <div className="col-span-full py-20 text-center text-muted-foreground">
            Aucun article trouvé dans cette catégorie.
          </div>
        )}
      </div>
    </div>
  )
}
