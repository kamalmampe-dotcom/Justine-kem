import { useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, GraduationCap, Calendar, Phone, Mail, CheckCircle2, Circle, Edit, FileBadge } from 'lucide-react'
import { useData } from '@/contexts/DataContext'
import { initials, cn } from '@/lib/utils'

import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

export function StudentDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { students, formations } = useData()

  const student = students.find((s) => s.id === id)
  const formation = useMemo(() => formations.find(f => f.id === student?.formation_id), [formations, student])

  if (!student || !formation) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Apprenante introuvable.</p>
        <Button variant="link" onClick={() => navigate('/atelier/apprenantes')} className="mt-4 text-primary">
          Retour à la liste
        </Button>
      </div>
    )
  }

  const completedModules = student.progress.filter(p => p.completed).length
  const totalModules = student.progress.length
  const progressPercent = totalModules === 0 ? 0 : Math.round((completedModules / totalModules) * 100)

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto pb-10">
      {/* ── Bouton Retour ──────────────────────────────────── */}
      <button
        onClick={() => navigate('/atelier/apprenantes')}
        className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors group"
      >
        <ArrowLeft className="h-4 w-4 mr-1 group-hover:-translate-x-1 transition-transform" />
        Retour aux apprenantes
      </button>

      {/* ── En-tête ────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row gap-6 md:items-start justify-between">
        <div className="flex items-start gap-5">
          <Avatar className="h-20 w-20 border-2 border-primary/20 shadow-lg">
            <AvatarFallback className="bg-primary/10 text-primary text-2xl font-serif">
              {initials(student.name)}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-serif text-foreground">{student.name}</h1>
              <Badge variant="outline" className={cn(
                'text-xs',
                progressPercent === 100 ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-primary/10 text-primary border-primary/20'
              )}>
                {progressPercent === 100 ? 'Diplômée' : 'En cours'}
              </Badge>
            </div>
            
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground mt-2">
              {student.phone && (
                <a href={`tel:${student.phone}`} className="flex items-center gap-1.5 hover:text-primary transition-colors">
                  <Phone className="h-4 w-4" /> {student.phone}
                </a>
              )}
              {student.email && (
                <a href={`mailto:${student.email}`} className="flex items-center gap-1.5 hover:text-primary transition-colors">
                  <Mail className="h-4 w-4" /> {student.email}
                </a>
              )}
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" /> Inscrite le {new Date(student.enrollment_date).toLocaleDateString('fr-FR')}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="border-border/60">
            <Edit className="h-4 w-4 mr-2" /> Modifier
          </Button>
          {progressPercent === 100 && (
            <Button onClick={() => navigate(`/atelier/apprenantes/${id}/certificat`)} className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20">
              <FileBadge className="h-4 w-4 mr-2" /> Attestation PDF
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
        {/* ── Colonne Principale : Progression ──────────────── */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-border/60">
            <CardHeader className="pb-3 border-b border-border/30 bg-muted/20">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-primary" /> {formation.title}
                </CardTitle>
                <span className="text-sm font-bold text-primary">{progressPercent}%</span>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {/* Barre globale */}
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden mb-6">
                <div 
                  className="h-full bg-primary transition-all duration-1000 ease-out" 
                  style={{ width: `${progressPercent}%` }} 
                />
              </div>

              {/* Liste des modules */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Modules du programme</h3>
                {student.progress.map((module, idx) => (
                  <div 
                    key={idx} 
                    className={cn(
                      "flex items-center justify-between p-3 rounded-xl border transition-colors",
                      module.completed ? "bg-accent/50 border-border/40" : "bg-card border-border/60 hover:border-primary/40"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <button className="focus:outline-none transition-colors">
                        {module.completed ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                        ) : (
                          <Circle className="h-5 w-5 text-muted-foreground hover:text-primary" />
                        )}
                      </button>
                      <span className={cn(
                        "font-medium text-sm",
                        module.completed ? "text-foreground" : "text-foreground"
                      )}>
                        {module.name || 'Module'}
                      </span>
                    </div>
                    {module.completed && (
                      <span className="text-xs text-muted-foreground">Terminé</span>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Colonne Latérale : Notes & Paiement ────────────── */}
        <div className="space-y-6">
          {/* Notes */}
          <Card className="border-border/60">
            <CardHeader className="pb-3 border-b border-border/30 bg-muted/20">
              <CardTitle className="text-base font-medium">Notes & Observations</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                {student.notes || "Aucune observation pour le moment."}
              </p>
            </CardContent>
          </Card>

          {/* Calendrier de formation (Placeholder) */}
          <Card className="border-border/60">
            <CardHeader className="pb-3 border-b border-border/30 bg-muted/20">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" /> Prochaine séance
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground mb-3">Agenda de l'apprenante non configuré</p>
                <Button variant="outline" size="sm" className="w-full">Planifier une séance</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
