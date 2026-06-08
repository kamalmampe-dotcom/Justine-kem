// ═══════════════════════════════════════════════════════════════════
// Justine Kem's — Création des comptes via l'API Admin Supabase
//
// Alternative ROBUSTE à 0002_accounts.sql (indépendante de la version
// interne du schéma `auth`). À utiliser si le script SQL échoue.
//
// Prérequis : la clé `service_role` (Dashboard → Project Settings → API).
// ⚠️  Ne JAMAIS committer cette clé ni l'exposer côté navigateur.
//
// Lancement :
//   SUPABASE_URL="https://xxxx.supabase.co" \
//   SUPABASE_SERVICE_ROLE_KEY="eyJ..." \
//   node supabase/create-users.mjs
// ═══════════════════════════════════════════════════════════════════

import { createClient } from '@supabase/supabase-js'

const url = process.env.SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceKey) {
  console.error('✗ Variables manquantes : SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const users = [
  { email: 'admin@justinekems.com', password: 'admin', name: 'Justine Kem', role: 'admin' },
  { email: 'aminatou@email.cm', password: 'cliente', name: 'Aminatou Bella', role: 'cliente' },
]

for (const u of users) {
  const { data, error } = await admin.auth.admin.createUser({
    email: u.email,
    password: u.password,
    email_confirm: true,
    user_metadata: { name: u.name, role: u.role },
  })

  if (error) {
    // 422 = l'utilisateur existe déjà : on l'ignore sans planter.
    const exists = /already|exist|registered/i.test(error.message)
    console.log(`${exists ? '•' : '✗'} ${u.email} : ${error.message}`)
  } else {
    console.log(`✓ ${u.email} créé (${data.user.id}) — role=${u.role}`)
  }
}

console.log('\nTerminé. Pensez à changer ces mots de passe après la première connexion.')
