import { useState, useMemo } from 'react'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, MapPin, User, Check, X } from 'lucide-react'
import { useData } from '@/contexts/DataContext'
import { cn } from '@/lib/utils'

import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const DAYS = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']
const MONTHS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']

export function AgendaPage() {
  const { appointments, clients } = useData()
  
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [view, setView] = useState<'month' | 'week' | 'day'>('month')

  // Navigation dans le calendrier
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  const today = () => {
    const now = new Date()
    setCurrentDate(now)
    setSelectedDate(now)
  }

  // Calcul des jours du mois
  const daysInMonth = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    
    const days = []
    // Jours vides au début
    for (let i = 0; i < firstDay; i++) {
      days.push(null)
    }
    // Jours du mois
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i))
    }
    return days
  }, [currentDate])

  // RDV du jour sélectionné
  const selectedDateStr = selectedDate.toISOString().split('T')[0]
  const dayAppointments = useMemo(() => {
    return appointments
      .filter(a => a.date === selectedDateStr)
      .sort((a, b) => a.time.localeCompare(b.time))
  }, [appointments, selectedDateStr])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmé': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
      case 'Annulé': return 'bg-destructive/10 text-destructive border-destructive/20'
      case 'Terminé': return 'bg-muted text-muted-foreground border-border/60'
      default: return 'bg-amber-500/10 text-amber-600 border-amber-500/20' // En attente
    }
  }

  return (
    <div className="space-y-6 h-[calc(100vh-theme(spacing.24))] flex flex-col animate-in fade-in duration-500">
      {/* ── En-tête ──────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-serif text-foreground">Agenda</h1>
          <p className="text-muted-foreground mt-1">Gérez vos rendez-vous et essayages</p>
        </div>
        <div className="flex gap-3">
          <div className="bg-card p-1 rounded-lg border border-border/60 flex">
            <Button variant={view === 'month' ? 'secondary' : 'ghost'} size="sm" onClick={() => setView('month')} className="h-8">Mois</Button>
            <Button variant={view === 'week' ? 'secondary' : 'ghost'} size="sm" onClick={() => setView('week')} className="h-8" disabled>Semaine</Button>
            <Button variant={view === 'day' ? 'secondary' : 'ghost'} size="sm" onClick={() => setView('day')} className="h-8" disabled>Jour</Button>
          </div>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20">
            <CalendarIcon className="h-4 w-4 mr-2" /> Nouveau RDV
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0 overflow-hidden">
        {/* ── Calendrier Principal (Vue Mois) ──────────────── */}
        <Card className="flex-[2] border-border/60 flex flex-col min-h-0">
          <CardHeader className="py-4 px-6 border-b border-border/40 bg-muted/20 shrink-0">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-foreground">
                {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={today} className="h-8 border-border/60">Aujourd'hui</Button>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" onClick={prevMonth} className="h-8 w-8 hover:bg-muted/50"><ChevronLeft className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={nextMonth} className="h-8 w-8 hover:bg-muted/50"><ChevronRight className="h-4 w-4" /></Button>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 flex-1 overflow-auto">
            <div className="grid grid-cols-7 gap-px bg-border/40 rounded-xl overflow-hidden border border-border/40">
              {/* Jours de la semaine */}
              {DAYS.map(day => (
                <div key={day} className="bg-muted/50 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {day}
                </div>
              ))}
              
              {/* Cases du calendrier */}
              {daysInMonth.map((date, i) => {
                const isToday = date && date.toDateString() === new Date().toDateString()
                const isSelected = date && date.toDateString() === selectedDate.toDateString()
                const dayApts = date ? appointments.filter(a => a.date === date.toISOString().split('T')[0]) : []
                
                return (
                  <div 
                    key={i}
                    onClick={() => date && setSelectedDate(date)}
                    className={cn(
                      'min-h-[100px] bg-card p-2 transition-colors relative cursor-pointer hover:bg-muted/30',
                      !date && 'bg-muted/10 cursor-default',
                      isSelected && 'bg-primary/5 ring-1 ring-inset ring-primary'
                    )}
                  >
                    {date && (
                      <>
                        <div className="flex items-center justify-between mb-2">
                          <span className={cn(
                            'h-7 w-7 rounded-full flex items-center justify-center text-sm font-medium',
                            isToday ? 'bg-primary text-primary-foreground shadow-md' : 'text-foreground'
                          )}>
                            {date.getDate()}
                          </span>
                        </div>
                        {/* Indicateurs de RDV */}
                        <div className="space-y-1">
                          {dayApts.slice(0, 3).map(apt => (
                            <div key={apt.id} className="text-[10px] truncate px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">
                              {apt.time} {apt.title}
                            </div>
                          ))}
                          {dayApts.length > 3 && (
                            <div className="text-[10px] text-muted-foreground pl-1 font-medium">
                              +{dayApts.length - 3} autres
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* ── Panneau RDV du jour ──────────────────────────── */}
        <Card className="flex-1 border-border/60 flex flex-col min-h-0 bg-muted/10">
          <CardHeader className="py-4 px-6 border-b border-border/40 bg-card shrink-0">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" /> 
              Programme du {selectedDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 flex-1 overflow-y-auto space-y-3">
            {dayAppointments.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground/60 space-y-3">
                <CalendarIcon className="h-12 w-12" />
                <p className="text-sm">Aucun rendez-vous prévu à cette date.</p>
              </div>
            ) : (
              dayAppointments.map(apt => {
                const client = clients.find(c => c.id === apt.client_id)
                return (
                  <div key={apt.id} className="bg-card p-4 rounded-xl border border-border/60 shadow-sm relative overflow-hidden group">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/60" />
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground">{apt.time}</span>
                        <span className="text-xs text-muted-foreground">({apt.duration_minutes} min)</span>
                      </div>
                      <Badge variant="outline" className={cn('text-[10px] px-2 py-0', getStatusColor(apt.status))}>
                        {apt.status}
                      </Badge>
                    </div>
                    
                    <h4 className="font-medium text-foreground mb-3">{apt.title}</h4>
                    
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <User className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{client?.name || 'Client anonyme'}</span>
                      </div>
                      {apt.notes && (
                        <div className="flex items-start gap-2">
                          <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                          <span className="line-clamp-2 text-xs">{apt.notes}</span>
                        </div>
                      )}
                    </div>

                    {/* Actions au survol */}
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-card rounded-lg shadow-sm border border-border">
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50">
                        <Check className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10">
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
