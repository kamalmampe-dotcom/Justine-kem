# 🧵 PROMPT MAÎTRE — Plateforme « Justine Kem's »
### Couture sur-mesure · Formation · Location · Boutique — back-office + espace cliente

> À coller dans Claude Code (dans un dossier de projet vide). Construis par phases, explique ton plan avant de coder, commit + push après chaque module, et pré-remplis chaque écran avec des données et images de démonstration.

---

## 1. RÔLE & MÉTHODE
Agis comme une équipe : Product Manager senior, UX/UI Designer SaaS premium, Architecte logiciel et Développeur full-stack React expert. Le porteur du projet **n'est pas développeur** : explique tout en français, simplement. Avance **par modules**, propose ton plan avant de coder, puis **commit + push** (déploiement auto Vercel). Après chaque module : dis quoi tester.

## 2. VISION
Plateforme de gestion **complète et premium** pour une maison de haute couture à Yaoundé (Justine Kem's) qui exerce **quatre activités** : couture sur-mesure, **formation** (école de couture), **location** de tenues de prestige, et **boutique** (vente). Deux espaces :
- **Espace ATELIER** (back-office, Justine et son équipe).
- **Espace CLIENTE** (portail : voir le stock, commander, réserver, suivre, prendre RDV, et pour les apprenantes suivre leur formation).

Pensée pour devenir ensuite un **SaaS** (gestion d'atelier + école de couture) pour d'autres maisons d'Afrique francophone : isolation stricte des données par compte.

## 3. STACK TECHNIQUE
- **React + Vite + TypeScript + Tailwind CSS + shadcn/ui** (composants premium).
- **Supabase** : Auth (email + mot de passe), PostgreSQL, Storage (images), **Edge Functions** pour la logique sensible (ex. génération d'attestations).
- **Vercel** (déploiement auto depuis GitHub). **PWA** installable.
- Librairies recommandées (npm, pas seulement CDN) : `recharts` (graphiques), `pdfmake` ou `jspdf` + `jspdf-autotable` (PDF), `FullCalendar` ou `react-big-calendar` (agenda), `lucide-react` (icônes), `date-fns` (dates).
- **Français** partout, **FCFA**, **pas de Mobile Money** (paiements saisis manuellement), relances **WhatsApp** via `wa.me`.

## 4. SÉCURITÉ (exigence forte)
- **Build de production minifié + obscurci** (ajouter un plugin d'obfuscation type `vite-plugin-javascript-obfuscator`) : le code ne doit pas être lisible en clair via les outils développeurs.
- **Aucun secret sensible côté client.** La clé Supabase `anon` est publique par design (protégée par RLS) ; la clé `service_role` ne doit JAMAIS apparaître dans le front.
- **Logique critique côté serveur** (Edge Functions Supabase) : génération des attestations officielles, opérations sensibles.
- **RLS strictes** sur toutes les tables : `owner_id = auth.uid()` pour l'atelier ; politiques de lecture limitées pour la cliente (uniquement ses données).
- Clés via variables d'environnement Vite (`.env`, non commité).
> Note d'honnêteté à inscrire dans le README : une app web ne peut jamais cacher 100 % de son code, mais minification + obfuscation + secrets côté serveur rendent le code pratiquement illisible et les données protégées.

## 5. DONNÉES DE DÉMONSTRATION (pour TOUS les modules)
Fournir un **script de seed** qui pré-remplit chaque module avec des données réalistes **et des images**, pour que tout soit illustré dès l'ouverture :
- clientes (avec photos et carnets de mesures remplis), commandes à tous les statuts, paiements,
- apprenantes avec progression variée, formations,
- articles de location avec photos + disponibilités, réservations en cours,
- rendez-vous répartis dans l'agenda,
- articles boutique/stock avec photos, prix et quantités.
Images : photos de modèles/tenues (placeholders réalistes, ex. Unsplash « african fashion / haute couture / wedding dress »).

## 6. IDENTITÉ VISUELLE — haute couture premium
- **Palette** : noir profond `#1a1614`, ivoire `#faf6ef`, **or** `#c9a24b` (accent), prune `#6e2a3c` (secondaire), neutres doux.
- **Typographie** : titres serif élégant (`Playfair Display`), texte `Plus Jakarta Sans`.
- shadcn/ui, beaucoup d'espace blanc, ombres douces, coins arrondis, **animations discrètes**, squelettes au chargement, états vides soignés. **Mobile-first**, 3 clics max, responsive impeccable.

---

## 7. MODULES — ESPACE ATELIER

### 7.1 Tableau de bord
KPI : CA du mois, commandes en cours, **à livrer cette semaine**, soldes à recouvrer, **apprenantes actives**, **articles en location dehors**. Graphiques (recharts) : CA 6 mois, commandes par statut (donut), **revenus par activité** (couture / formation / location / boutique). Listes : échéances de la semaine, retours de location attendus, RDV du jour, alertes (retards de livraison, cautions non rendues).

### 7.2 Clientes (CRM + carnet de mesures)
Fiche : nom, téléphone (WhatsApp), ville, email, photo, notes. **Carnet de mesures** (champ JSON flexible, en cm) : `tour_poitrine, tour_taille, tour_bassin, longueur_taille_devant, longueur_taille_dos, carrure_devant, carrure_dos, tour_encolure, hauteur_poitrine, ecart_poitrine, tour_bras, longueur_manche, tour_poignet, longueur_epaule, longueur_robe, longueur_jupe, tour_cou, longueur_boubou` + mesures libres. Recherche instantanée, historique des commandes/locations/paiements.

### 7.3 Commandes (couture sur-mesure)
Cliente, type (Robe de mariée, Soirée, Traditionnel, Boubou/Bazin, Ensemble, Sur-mesure, Autre), description, tissu, photo du modèle, photo de la pièce finie, prix, acompte, **solde auto**, date de livraison **avec alerte d'échéance**. **Vue Kanban** : Devis → En production → Essayage → Prête → Livrée. Générer **Devis PDF** et **Facture PDF** (avec logo).

### 7.4 Formation / Apprenantes (mini-SaaS de formation)
- Fiches apprenantes : photo, contact, niveau, date d'inscription, formation suivie.
- **Suivi d'évolution** : modules/compétences de la formation, **% d'avancement**, évaluations/notes, commentaires de la formatrice, dates.
- **Paiements de formation** : montant total, échéancier, statut (payé/en attente), reçus PDF.
- **Attestations / certificats PDF** : générées quand la formation est complétée — logo, nom de l'apprenante, intitulé de la formation, dates, mention de réussite, espace signature. (Génération via Edge Function pour fiabilité.)

### 7.5 Location de prestige (détaillée)
- **Catalogue d'articles à louer** : photo(s), nom, taille, prix de location, **montant de caution**, état.
- **Calendrier de disponibilité** par article.
- **Réservations** : cliente, dates début/fin, statut (Réservé → Loué → Rendu), suivi de la **caution** (versée / rendue), **alerte de retour en retard**.

### 7.6 Agenda / Rendez-vous
Calendrier (vues jour/semaine/mois) des consultations, essayages, retraits, cours de formation. RDV lié à une cliente/commande. **Rappel WhatsApp** en 1 clic. Mise en évidence des RDV du jour.

### 7.7 Boutique / Stock
Articles en vente (prêt-à-porter, accessoires) : photo(s), prix, **quantité en stock**, catégorie, description. Gestion du stock (entrées/sorties). C'est ce catalogue que la cliente voit dans son espace.

### 7.8 Paiements (vue unifiée)
Tous les paiements (couture, formation, location, boutique), filtres par activité, **reçus/factures PDF**.

### 7.9 Réglages
Profil de l'atelier + **logo** (téléverser le logo de Justine — disponible sur son site : `https://www.justinekems.com/logo-justine-kems.png`). Le logo et les coordonnées s'affichent en en-tête de **tous les documents** (devis, factures, reçus, attestations).

---

## 8. MODULES — ESPACE CLIENTE (portail)
- Connexion cliente (email + mot de passe).
- **Catalogue / Stock** : voir les articles en vente et les tenues disponibles à la location (photos, prix, disponibilité).
- **Commander** : commande sur-mesure (décrire + déposer une photo de modèle), achat d'un article en stock, ou **réservation d'une location** (choix des dates).
- **Suivre** : ses commandes (statut + échéance), ses paiements et **factures PDF**.
- **Prendre rendez-vous** (essayage/consultation) depuis l'agenda.
- Si elle est **apprenante** : voir sa **progression**, ses paiements de formation, **télécharger son attestation**.

---

## 9. DOCUMENTS PDF (tous avec le logo de l'atelier)
**Devis**, **Facture**, **Reçu**, **Attestation de formation**. En-tête : logo + nom + coordonnées (depuis Réglages). Mise en page soignée, niveau professionnel.

## 10. BASE DE DONNÉES (Supabase) — fournir le SQL complet
Tables (toutes avec `owner_id uuid default auth.uid()` + RLS `owner_id = auth.uid()`) :
`clients` (+ `measurements jsonb`), `orders`, `payments`, `students`, `formations`, `enrollments` (progression : jsonb des modules/%), `rental_items`, `rentals`, `appointments`, `shop_items`, `settings` (profil + logo).
Politiques **cliente** : lecture limitée à ses propres lignes (par email/lien). Bucket Storage **`media`** (public) pour toutes les images.

## 11. ORDRE DE CONSTRUCTION RECOMMANDÉ
1. Fondations : projet Vite + Supabase + Auth + design system + SQL + seed de démo.
2. Atelier : Tableau de bord → Clientes/mesures → Commandes (kanban + devis/facture PDF).
3. Formation : apprenantes + progression + paiements + **attestations PDF**.
4. Location détaillée (catalogue + calendrier + réservations + caution).
5. Agenda + Boutique/Stock + Paiements unifiés + Réglages/logo.
6. Espace cliente (catalogue, commande, suivi, RDV, formation).
7. Sécurité : build minifié + obfuscation, vérif RLS, secrets côté serveur. PWA.

## 12. OBJECTIF FINAL
Une plateforme qui semble développée par une startup financée à plusieurs millions : élégante, rapide, complète, illustrée, crédible en 10 secondes — et indispensable au quotidien de Justine (couture + école + location + boutique), avec un code protégé.
