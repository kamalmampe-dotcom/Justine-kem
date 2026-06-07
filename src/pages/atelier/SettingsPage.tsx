import { useState } from 'react'
import { Save, User, Building, CreditCard, Lock } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

export function SettingsPage() {
  const { user } = useAuth()
  const [saving, setSaving] = useState(false)

  const handleSave = () => {
    setSaving(true)
    setTimeout(() => setSaving(false), 1000)
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl">
      {/* ── En-tête ──────────────────────────────────────── */}
      <div>
        <h1 className="text-3xl font-serif text-foreground">Réglages</h1>
        <p className="text-muted-foreground mt-1">Configurez votre profil et les paramètres de l'atelier</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Navigation verticale (placeholder visuel) */}
        <div className="space-y-1">
          <Button variant="secondary" className="w-full justify-start">
            <User className="h-4 w-4 mr-2" /> Profil Utilisateur
          </Button>
          <Button variant="ghost" className="w-full justify-start text-muted-foreground">
            <Building className="h-4 w-4 mr-2" /> Infos Atelier
          </Button>
          <Button variant="ghost" className="w-full justify-start text-muted-foreground">
            <CreditCard className="h-4 w-4 mr-2" /> Méthodes de Paiement
          </Button>
          <Button variant="ghost" className="w-full justify-start text-muted-foreground">
            <Lock className="h-4 w-4 mr-2" /> Sécurité
          </Button>
        </div>

        {/* Contenu */}
        <div className="md:col-span-3 space-y-6">
          <Card className="border-border/60">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Informations Personnelles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom complet</Label>
                  <Input id="name" defaultValue={user?.name} className="bg-background/50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Adresse e-mail</Label>
                  <Input id="email" type="email" defaultValue={user?.email} className="bg-background/50" disabled />
                </div>
              </div>
              
              <Separator className="bg-border/60" />
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="role">Rôle</Label>
                  <Input id="role" defaultValue={user?.role === 'admin' ? 'Administrateur' : 'Cliente'} disabled className="bg-background/50" />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button onClick={handleSave} disabled={saving} className="bg-primary text-primary-foreground">
                  {saving ? 'Enregistrement...' : <><Save className="h-4 w-4 mr-2" /> Enregistrer les modifications</>}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
