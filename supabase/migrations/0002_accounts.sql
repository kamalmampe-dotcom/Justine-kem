-- ═══════════════════════════════════════════════════════════════════
-- Justine Kem's — Comptes de connexion Supabase
-- À exécuter APRÈS 0001_schema.sql.
--
-- Crée deux utilisateurs dans le schéma `auth` de Supabase :
--   • Admin (atelier)  : admin@justinekems.com    / admin     (role=admin)
--   • Cliente (portail): aminatou@email.cm         / cliente   (role=cliente)
--
-- Le rôle est stocké dans user_metadata.role — lu par src/contexts/AuthContext.tsx.
--
-- ⚠️  Le schéma interne `auth` de Supabase (GoTrue) peut varier selon la version.
--     Si ce script échoue, utilisez plutôt :
--       - le Dashboard : Authentication → Users → « Add user » (cochez
--         « Auto Confirm User »), puis ajoutez le user_metadata {name, role} ;
--       - ou le script robuste supabase/create-users.mjs (API Admin).
--
-- 🔒  Changez ces mots de passe après la première connexion.
-- ═══════════════════════════════════════════════════════════════════

create extension if not exists pgcrypto;

do $$
declare
  v_id uuid;
begin
  -- ── Compte ADMIN ──────────────────────────────────────────────────
  select id into v_id from auth.users where email = 'admin@justinekems.com';
  if v_id is null then
    v_id := gen_random_uuid();

    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, created_at, updated_at,
      raw_app_meta_data, raw_user_meta_data,
      confirmation_token, recovery_token, email_change_token_new, email_change
    ) values (
      '00000000-0000-0000-0000-000000000000', v_id, 'authenticated', 'authenticated',
      'admin@justinekems.com', crypt('admin', gen_salt('bf')),
      now(), now(), now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"name":"Justine Kem","role":"admin"}'::jsonb,
      '', '', '', ''
    );

    insert into auth.identities (
      provider_id, user_id, identity_data, provider,
      last_sign_in_at, created_at, updated_at
    ) values (
      v_id::text, v_id,
      jsonb_build_object('sub', v_id::text, 'email', 'admin@justinekems.com', 'email_verified', true),
      'email', now(), now(), now()
    );

    raise notice 'Compte admin créé (%).', v_id;
  else
    raise notice 'Compte admin déjà présent (%).', v_id;
  end if;

  -- ── Compte CLIENTE ────────────────────────────────────────────────
  select id into v_id from auth.users where email = 'aminatou@email.cm';
  if v_id is null then
    v_id := gen_random_uuid();

    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, created_at, updated_at,
      raw_app_meta_data, raw_user_meta_data,
      confirmation_token, recovery_token, email_change_token_new, email_change
    ) values (
      '00000000-0000-0000-0000-000000000000', v_id, 'authenticated', 'authenticated',
      'aminatou@email.cm', crypt('cliente', gen_salt('bf')),
      now(), now(), now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"name":"Aminatou Bella","role":"cliente"}'::jsonb,
      '', '', '', ''
    );

    insert into auth.identities (
      provider_id, user_id, identity_data, provider,
      last_sign_in_at, created_at, updated_at
    ) values (
      v_id::text, v_id,
      jsonb_build_object('sub', v_id::text, 'email', 'aminatou@email.cm', 'email_verified', true),
      'email', now(), now(), now()
    );

    raise notice 'Compte cliente créé (%).', v_id;
  else
    raise notice 'Compte cliente déjà présent (%).', v_id;
  end if;
end $$;
