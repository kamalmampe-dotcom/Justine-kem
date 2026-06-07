import { useState, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Search, Plus, GraduationCap, ChevronRight, Filter } from 'lucide-react'
import { useData } from '@/contexts/DataContext'
import { cn, initials } from '@/lib/utils'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

export function StudentsPage() {
  const { students, formations } = useData()
  const navigate = useNavigate()
  const location = useLocation()
  
  // Si on vient de la page Formations, on peut avoir un filtre initial
  const initialFormationFilter = location.state?.filterFormation || 'all'
  
  const [search, setSearch] = useState('')
  const [formationFilter, setFormationFilter] = useState<string>(initialFormationFilter)

  // Filtrage
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchSearch = 
        !search.trim() || 
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.email?.toLowerCase().includes(search.toLowerCase())
        
      const matchFormation = 
        formationFilter === 'all' || 
        s.formation_id === formationFilter

      return matchSearch && matchFormation
    })
  }, [students, search, formationFilter])

  const getStudentProgress = (progressArray: any[]) => {
    if (!progressArray.length) return 0
    const completed = progressArray.filter(p => p.completed).length
    return Math.round((completed / progressArray.length) * 100)
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* ── En-tête ──────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif text-foreground">Apprenantes</h1>
          <p className="text-muted-foreground mt-1">Suivi des étudiantes et de leur progression</p>
        </div>
        <Button className="shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20">
          <Plus className="h-4 w-4 mr-2" /> Inscrire une Apprenante
        </Button>
      </div>

      {/* ── Filtres ──────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-4 bg-card p-3 rounded-2xl border border-border/60 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher une apprenante..."
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
            value={formationFilter}
            onChange={(e) => setFormationFilter(e.target.value)}
          >
            <option value="all">Toutes les formations</option>
            {formations.map(f => (
              <option key={f.id} value={f.id}>{f.title}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Grille des Apprenantes ───────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredStudents.map((student) => {
          const formation = formations.find(f => f.id === student.formation_id)
          const progressPercent = getStudentProgress(student.progress)
          
          return (
            <Card 
              key={student.id} 
              onClick={() => navigate(`/atelier/apprenantes/${student.id}`)}
              className="border-border/60 hover:shadow-lg hover:border-primary/40 transition-all duration-300 cursor-pointer group flex flex-col"
            >
              <CardContent className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <Avatar className="h-12 w-12 border-2 border-primary/20 shadow-sm group-hover:scale-105 transition-transform">
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                      {initials(student.name)}
                    </AvatarFallback>
                  </Avatar>
                  <Badge variant="outline" className={cn(
                    progressPercent === 100 ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-muted text-muted-foreground border-border/60"
                  )}>
                    {progressPercent === 100 ? 'Diplômée' : 'En cours'}
                  </Badge>
                </div>
                
                <h3 className="text-base font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                  {student.name}
                </h3>
                
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-2 mb-4">
                  <GraduationCap className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{formation?.title || 'Formation inconnue'}</span>
                </div>

                <div className="mt-auto space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-muted-foreground">Progression</span>
                    <span className="font-bold text-foreground">{progressPercent}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-500" 
                      style={{ width: `${progressPercent}%` }} 
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
        {filteredStudents.length === 0 && (
          <div className="col-span-full py-20 text-center text-muted-foreground">
            Aucune apprenante trouvée.
          </div>
        )}
      </div>
    </div>
  )
}
