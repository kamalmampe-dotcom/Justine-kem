-- ═══════════════════════════════════════════════════════════════════
-- Justine Kem's — Schéma Supabase (PostgreSQL)
-- Aligné sur src/types/index.ts
--
-- À exécuter en premier (SQL Editor Supabase, ou `supabase db push`).
-- Modèle de sécurité : chaque ligne appartient à un propriétaire (owner_id
-- = auth.uid()). Les politiques RLS isolent les données par compte.
-- ═══════════════════════════════════════════════════════════════════

create extension if not exists pgcrypto;

-- ── Clientes ────────────────────────────────────────────────────────
create table if not exists public.clients (
  id         text primary key default gen_random_uuid()::text,
  name       text not null,
  phone      text not null,
  city       text not null,
  email      text,
  photo      text,
  notes      text,
  created_at timestamptz not null default now(),
  owner_id   uuid not null default auth.uid() references auth.users(id) on delete cascade
);

-- ── Carnet de mesures (historique, en cm) ───────────────────────────
create table if not exists public.measurements (
  id                     text primary key default gen_random_uuid()::text,
  client_id              text not null references public.clients(id) on delete cascade,
  tour_poitrine          numeric,
  tour_taille            numeric,
  tour_bassin            numeric,
  longueur_taille_devant numeric,
  longueur_taille_dos    numeric,
  carrure_devant         numeric,
  carrure_dos            numeric,
  tour_encolure          numeric,
  hauteur_poitrine       numeric,
  ecart_poitrine         numeric,
  tour_bras              numeric,
  longueur_manche        numeric,
  tour_poignet           numeric,
  longueur_epaule        numeric,
  longueur_robe          numeric,
  longueur_jupe          numeric,
  tour_cou               numeric,
  longueur_boubou        numeric,
  extra                  jsonb not null default '{}'::jsonb,  -- mesures libres
  created_at             timestamptz not null default now(),
  owner_id               uuid not null default auth.uid() references auth.users(id) on delete cascade
);

-- ── Commandes ───────────────────────────────────────────────────────
create table if not exists public.orders (
  id             text primary key default gen_random_uuid()::text,
  client_id      text not null references public.clients(id) on delete cascade,
  type           text not null check (type in (
                    'Robe de mariée','Soirée','Traditionnel','Boubou/Bazin',
                    'Ensemble','Sur-mesure','Autre')),
  description    text not null default '',
  fabric         text,
  model_photo    text,
  finished_photo text,
  price          numeric not null default 0,
  total_price    numeric,
  deposit        numeric not null default 0,
  balance        numeric not null default 0,  -- auto = price - deposit (trigger ci-dessous)
  deadline       date,
  status         text not null default 'Devis' check (status in (
                    'Devis','En production','Essayage','Prête','Livrée')),
  created_at     timestamptz not null default now(),
  owner_id       uuid not null default auth.uid() references auth.users(id) on delete cascade
);

-- Recalcul automatique du solde (= prix − acompte) à chaque insert/update.
create or replace function public.set_order_balance()
returns trigger language plpgsql as $$
begin
  new.balance := coalesce(new.price, 0) - coalesce(new.deposit, 0);
  return new;
end $$;

drop trigger if exists trg_orders_balance on public.orders;
create trigger trg_orders_balance
  before insert or update on public.orders
  for each row execute function public.set_order_balance();

-- ── Formations ──────────────────────────────────────────────────────
create table if not exists public.formations (
  id              text primary key default gen_random_uuid()::text,
  title           text not null,
  description     text not null default '',
  duration_months int not null default 0,
  price           numeric not null default 0,
  modules         text[] not null default '{}',
  created_at      timestamptz not null default now(),
  owner_id        uuid not null default auth.uid() references auth.users(id) on delete cascade
);

-- ── Apprenantes ─────────────────────────────────────────────────────
create table if not exists public.students (
  id              text primary key default gen_random_uuid()::text,
  name            text not null,
  phone           text not null,
  email           text,
  photo           text,
  city            text,
  level           text not null default 'Débutante',
  enrollment_date date,
  formation_id    text references public.formations(id) on delete set null,
  progress        jsonb not null default '[]'::jsonb,  -- FormationModule[]
  notes           text,
  total_amount    numeric not null default 0,
  paid_amount     numeric not null default 0,
  created_at      timestamptz not null default now(),
  owner_id        uuid not null default auth.uid() references auth.users(id) on delete cascade
);

-- ── Articles de location ────────────────────────────────────────────
create table if not exists public.rental_items (
  id             text primary key default gen_random_uuid()::text,
  name           text not null,
  photos         text[] not null default '{}',
  size           text not null default '',
  rental_price   numeric not null default 0,
  deposit_amount numeric not null default 0,
  category       text,
  state          text not null default 'Disponible' check (state in (
                    'Disponible','Loué','En maintenance')),
  description    text,
  created_at     timestamptz not null default now(),
  owner_id       uuid not null default auth.uid() references auth.users(id) on delete cascade
);

-- ── Locations / Réservations ────────────────────────────────────────
create table if not exists public.rentals (
  id               text primary key default gen_random_uuid()::text,
  rental_item_id   text not null references public.rental_items(id) on delete cascade,
  client_id        text not null references public.clients(id) on delete cascade,
  start_date       date,
  end_date         date,
  status           text not null default 'Réservé' check (status in (
                      'Réservé','Loué','Rendu')),
  deposit_paid     boolean not null default false,
  deposit_returned boolean not null default false,
  created_at       timestamptz not null default now(),
  owner_id         uuid not null default auth.uid() references auth.users(id) on delete cascade
);

-- ── Rendez-vous ─────────────────────────────────────────────────────
create table if not exists public.appointments (
  id               text primary key default gen_random_uuid()::text,
  client_id        text not null references public.clients(id) on delete cascade,
  order_id         text references public.orders(id) on delete set null,
  type             text not null check (type in (
                      'Consultation','Essayage','Retrait','Cours','Autre')),
  title            text not null default '',
  date             date,
  time             text,
  duration_minutes int not null default 30,
  status           text,
  notes            text,
  created_at       timestamptz not null default now(),
  owner_id         uuid not null default auth.uid() references auth.users(id) on delete cascade
);

-- ── Boutique / Stock ────────────────────────────────────────────────
create table if not exists public.shop_items (
  id          text primary key default gen_random_uuid()::text,
  name        text not null,
  photos      text[] not null default '{}',
  price       numeric not null default 0,
  quantity    int not null default 0,
  category    text not null check (category in (
                'Prêt-à-porter','Accessoires','Sacs','Chaussures','Bijoux','Tissus')),
  description text,
  created_at  timestamptz not null default now(),
  owner_id    uuid not null default auth.uid() references auth.users(id) on delete cascade
);

-- ── Paiements ───────────────────────────────────────────────────────
create table if not exists public.payments (
  id           text primary key default gen_random_uuid()::text,
  client_id    text not null references public.clients(id) on delete cascade,
  activity     text not null check (activity in (
                 'Couture','Formation','Location','Boutique')),
  reference_id text not null default '',
  order_id     text references public.orders(id) on delete set null,
  amount       numeric not null default 0,
  date         date,
  method       text,
  notes        text,
  created_at   timestamptz not null default now(),
  owner_id     uuid not null default auth.uid() references auth.users(id) on delete cascade
);

-- ── Réglages (une ligne par propriétaire) ───────────────────────────
create table if not exists public.settings (
  id           text primary key default gen_random_uuid()::text,
  atelier_name text not null default '',
  logo         text,
  phone        text not null default '',
  email        text not null default '',
  address      text not null default '',
  city         text not null default '',
  slogan       text,
  owner_id     uuid not null unique default auth.uid() references auth.users(id) on delete cascade
);

-- ── Index ───────────────────────────────────────────────────────────
create index if not exists idx_clients_owner       on public.clients(owner_id);
create index if not exists idx_measurements_owner   on public.measurements(owner_id);
create index if not exists idx_measurements_client  on public.measurements(client_id);
create index if not exists idx_orders_owner         on public.orders(owner_id);
create index if not exists idx_orders_client        on public.orders(client_id);
create index if not exists idx_formations_owner     on public.formations(owner_id);
create index if not exists idx_students_owner       on public.students(owner_id);
create index if not exists idx_students_formation   on public.students(formation_id);
create index if not exists idx_rental_items_owner   on public.rental_items(owner_id);
create index if not exists idx_rentals_owner        on public.rentals(owner_id);
create index if not exists idx_rentals_item         on public.rentals(rental_item_id);
create index if not exists idx_rentals_client       on public.rentals(client_id);
create index if not exists idx_appointments_owner   on public.appointments(owner_id);
create index if not exists idx_appointments_client  on public.appointments(client_id);
create index if not exists idx_shop_items_owner     on public.shop_items(owner_id);
create index if not exists idx_payments_owner       on public.payments(owner_id);
create index if not exists idx_payments_client      on public.payments(client_id);

-- ── Privilèges + RLS (isolation par propriétaire) ───────────────────
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;

do $$
declare t text;
begin
  foreach t in array array[
    'clients','measurements','orders','formations','students','rental_items',
    'rentals','appointments','shop_items','payments','settings'
  ] loop
    execute format('alter table public.%I enable row level security;', t);
    execute format('drop policy if exists %I on public.%I;', t || '_owner_all', t);
    execute format(
      'create policy %I on public.%I for all to authenticated '
      || 'using (owner_id = auth.uid()) with check (owner_id = auth.uid());',
      t || '_owner_all', t);
  end loop;
end $$;
