import { useParams, useNavigate } from 'react-router-dom'
import { Printer, ArrowLeft } from 'lucide-react'
import { useData } from '@/contexts/DataContext'
import { Button } from '@/components/ui/button'

export function CertificatePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { students, formations } = useData()

  const student = students.find((s) => s.id === id)
  const formation = formations.find(f => f.id === student?.formation_id)

  if (!student || !formation) {
    return <div className="p-10 text-center">Apprenante introuvable</div>
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="min-h-screen bg-muted/30 p-8 print:p-0 print:bg-white flex flex-col items-center">
      {/* ── Actions (cachées à l'impression) ── */}
      <div className="w-full max-w-4xl flex justify-between mb-8 print:hidden">
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Retour
        </Button>
        <Button onClick={handlePrint} className="bg-emerald-600 hover:bg-emerald-700">
          <Printer className="h-4 w-4 mr-2" /> Imprimer / Sauvegarder PDF
        </Button>
      </div>

      {/* ── Certificat (A4 Landscape) ── */}
      <div className="bg-white w-[297mm] h-[210mm] shadow-2xl print:shadow-none relative overflow-hidden border border-border/50 print:border-none p-16 flex flex-col items-center justify-center text-center">
        {/* Bordures décoratives */}
        <div className="absolute inset-4 border-2 border-primary/20" />
        <div className="absolute inset-6 border border-primary/40" />

        <div className="relative z-10 flex flex-col items-center w-full">
          <h1 className="font-serif text-5xl text-primary mb-2 uppercase tracking-widest">Justine Kem's</h1>
          <p className="text-muted-foreground uppercase tracking-[0.3em] text-sm mb-16">Académie de Haute Couture</p>

          <h2 className="text-4xl font-serif text-foreground mb-10">Attestation de Fin de Formation</h2>

          <p className="text-lg text-muted-foreground mb-4">Nous certifions que</p>
          <p className="text-5xl font-serif text-foreground mb-8 text-primary border-b border-primary/30 pb-2 px-10">
            {student.name}
          </p>

          <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed mb-16">
            A suivi et validé avec succès l'ensemble du programme de formation 
            <strong className="text-foreground font-semibold"> « {formation.title} » </strong> 
            d'une durée de {formation.duration_months} mois.
          </p>

          <div className="flex justify-between w-full max-w-3xl px-10 mt-10">
            <div className="flex flex-col items-center">
              <p className="text-sm text-muted-foreground mb-2">Fait à Yaoundé, le</p>
              <p className="font-medium text-foreground border-b border-border pb-1 min-w-[150px]">
                {new Date().toLocaleDateString('fr-FR')}
              </p>
            </div>

            <div className="flex flex-col items-center">
              <p className="text-sm text-muted-foreground mb-2">La Directrice</p>
              <div className="h-16 flex items-end">
                <p className="font-serif text-2xl text-primary/80 italic transform -rotate-6">Justine Kem</p>
              </div>
              <p className="font-medium text-foreground border-t border-border pt-1 mt-2 min-w-[200px]">
                Signature et Cachet
              </p>
            </div>
          </div>
        </div>

        {/* Filigrane bg */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] text-[300px] font-serif pointer-events-none select-none">
          JK
        </div>
      </div>
    </div>
  )
}
