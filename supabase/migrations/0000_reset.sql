-- ═══════════════════════════════════════════════════════════════════
-- Justine Kem's — Réinitialisation du schéma applicatif
--
-- ⚠️  DESTRUCTIF : supprime les 11 tables de l'app ET leurs données.
--
-- À exécuter UNIQUEMENT si ces tables existent déjà (essai précédent,
-- projet v0, etc.) et provoquent l'erreur :
--     ERROR: 42703: column "owner_id" does not exist
-- (mes scripts utilisent « create table if not exists » : ils ne
--  modifient donc pas une table déjà présente avec un autre schéma.)
--
-- N'affecte NI le schéma `auth`, NI le Storage, NI les autres tables.
-- Ne lance ceci que si tu n'as aucune donnée à conserver dans ces tables.
--
-- Ordre conseillé : 0000_reset → 0001_schema → 0002_accounts → 0003_seed
-- ═══════════════════════════════════════════════════════════════════

drop table if exists
  public.payments,
  public.appointments,
  public.rentals,
  public.measurements,
  public.orders,
  public.students,
  public.shop_items,
  public.rental_items,
  public.formations,
  public.clients,
  public.settings
cascade;

drop function if exists public.set_order_balance() cascade;
