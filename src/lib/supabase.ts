import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

/** Indique si les clés Supabase sont bien renseignées dans le fichier .env */
export const supabaseConfigured = Boolean(url && anonKey)

if (!supabaseConfigured) {
  // Message clair, visible dans la console du navigateur, pour la 1re configuration.
  console.warn(
    "[Supabase] Configuration manquante. Renseigne VITE_SUPABASE_URL et " +
      'VITE_SUPABASE_ANON_KEY dans le fichier .env (voir .env.example), puis relance « npm run dev ».',
  )
}

/**
 * Client Supabase unique pour toute l'application.
 * Seule la clé « anon » (publique par design, protégée par les règles RLS) est utilisée
 * côté navigateur. La clé « service_role » ne doit JAMAIS apparaître ici.
 */
export const supabase = createClient(url ?? '', anonKey ?? '', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})
