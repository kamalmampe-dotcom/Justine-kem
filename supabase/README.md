# Supabase — Justine Kem's

Schéma SQL, comptes de connexion et données de démonstration pour la
plateforme. Tout est aligné sur `src/types/index.ts`.

## Contenu

| Fichier | Rôle |
|---|---|
| `migrations/0000_reset.sql` | ⚠️ Optionnel/destructif — supprime d'anciennes tables en conflit |
| `migrations/0001_schema.sql` | Tables, contraintes, index, trigger de solde, **RLS** |
| `migrations/0002_accounts.sql` | Comptes admin + cliente (SQL pur) |
| `migrations/0003_seed.sql` | Données de démo (8 clientes, 12 commandes, etc.) |
| `create-users.mjs` | Création des comptes via l'API Admin (alternative robuste) |

## Ordre d'exécution

Exécutez les fichiers **dans l'ordre** : `0001` → `0002` → `0003`.

> **Erreur `column "owner_id" does not exist` ?**
> Des tables (`clients`, `orders`, …) existent déjà dans `public` (essai
> précédent, projet v0…). Comme `0001` utilise `create table if not exists`,
> il ne touche pas une table déjà présente avec un autre schéma, puis échoue
> sur `owner_id`. Lancez **`0000_reset.sql`** d'abord (⚠️ il supprime ces
> tables et leurs données), puis `0001` → `0002` → `0003`.
>
> Pour vérifier ce que contient une table existante :
> ```sql
> select column_name from information_schema.columns
> where table_schema = 'public' and table_name = 'clients'
> order by ordinal_position;
> ```

### Option A — SQL Editor (le plus simple)

Dashboard Supabase → **SQL Editor** → collez le contenu de chaque fichier,
l'un après l'autre, et lancez « Run ».

### Option B — Supabase CLI

```bash
supabase link --project-ref <votre-ref>
supabase db push          # applique migrations/*.sql
```

## Comptes créés

| Rôle | Email | Mot de passe | `role` (user_metadata) |
|---|---|---|---|
| Admin (atelier) | `admin@justinekems.com` | `admin` | `admin` |
| Cliente (portail) | `aminatou@email.cm` | `cliente` | `cliente` |

> 🔒 **Changez ces mots de passe après la première connexion.**

Si `0002_accounts.sql` échoue (le schéma interne `auth` de Supabase varie
selon la version), créez les comptes autrement :

- **Dashboard** → Authentication → Users → « Add user » (cochez *Auto Confirm
  User*), puis renseignez le `user_metadata` : `{ "name": "...", "role": "admin" }` ;
- **ou** le script API Admin :
  ```bash
  SUPABASE_URL="https://xxxx.supabase.co" \
  SUPABASE_SERVICE_ROLE_KEY="eyJ..." \
  node supabase/create-users.mjs
  ```

`AuthContext.tsx` lit le rôle depuis `user_metadata.role` : il **doit** valoir
`admin` ou `cliente`.

## Sécurité (RLS)

Chaque table porte un `owner_id` (= `auth.uid()`). Les politiques RLS
n'autorisent un utilisateur connecté qu'à voir/modifier **ses propres
lignes**. Le seed attribue toutes les données démo au compte **admin**.

> Le portail **cliente** (espace `/cliente`) est encore à l'état d'ébauches
> dans l'app. Pour qu'une cliente voie ses propres commandes/mesures, il
> faudra relier les enregistrements `clients` à un compte `auth` (ex. colonne
> `clients.user_id`) et ajouter des politiques de lecture dédiées.

## ⚠️ Important — le front-end n'est pas encore branché sur ces tables

Aujourd'hui, `src/contexts/DataContext.tsx` charge les **données de démo en
mémoire** (`src/data/demo-data.ts`) — il ne lit/écrit **pas** encore Supabase.
Seule l'**authentification** passe par Supabase (`AuthContext` + `lib/supabase.ts`).

Donc : créer ce schéma permet de se connecter avec les comptes ci-dessus,
mais l'app continuera d'afficher les données de démo tant que la couche de
données n'est pas câblée sur Supabase.

### Notes de correspondance schéma ↔ types (pour le câblage)

- `orders.balance` : calculé par trigger (`price − deposit`) — ne pas l'envoyer à l'insert.
- `shop_items.quantity` : la page Boutique lit `stock` → mapper `quantity → stock`.
- `rental_items` : colonnes canoniques `photos`, `rental_price`, `deposit_amount`
  (les types tolèrent les alias `images` / `price_per_day` / `deposit`).
- `clients.measurements` (objet embarqué dans le type) : à reconstituer depuis
  le dernier relevé de la table `measurements`.

Dis-moi si tu veux que je **branche `DataContext` sur Supabase** (requêtes
CRUD + mapping ci-dessus) pour que l'app utilise réellement ces données.
