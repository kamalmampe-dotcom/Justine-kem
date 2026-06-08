-- ═══════════════════════════════════════════════════════════════════
-- Justine Kem's — Données de démonstration (Yaoundé, Cameroun)
-- À exécuter APRÈS 0001_schema.sql et 0002_accounts.sql.
--
-- Toutes les lignes appartiennent au compte admin (admin@justinekems.com).
-- Ré-exécutable sans doublon (ON CONFLICT (id) DO NOTHING).
-- ═══════════════════════════════════════════════════════════════════

do $$
declare
  v_owner uuid;
begin
  select id into v_owner from auth.users where email = 'admin@justinekems.com';
  if v_owner is null then
    raise exception 'Compte admin introuvable — exécutez d''abord 0002_accounts.sql';
  end if;

  -- ── Réglages ──────────────────────────────────────────────────────
  insert into public.settings (id, atelier_name, phone, email, address, city, slogan, owner_id) values
    ('settings-001', 'Justine Kem''s', '+237 6 99 00 00 00', 'contact@justinekems.com',
     'Rue de la Couture, Bastos', 'Yaoundé, Cameroun', 'L''élégance sur mesure', v_owner)
  on conflict (owner_id) do nothing;

  -- ── Clientes ──────────────────────────────────────────────────────
  insert into public.clients (id, name, phone, city, email, photo, notes, created_at, owner_id) values
    ('cl-001','Aminatou Bella','+237 6 90 11 22 33','Yaoundé — Bastos','aminatou.bella@email.cm','https://picsum.photos/seed/jk-cl1/200/200','Cliente fidèle depuis 2023. Préfère les tissus en soie.','2024-03-15',v_owner),
    ('cl-002','Chantal Ndongo','+237 6 77 44 55 66','Yaoundé — Nlongkak','chantal.ndongo@email.cm','https://picsum.photos/seed/jk-cl2/200/200','Aime les coupes modernes sur tissu pagne.','2024-05-22',v_owner),
    ('cl-003','Danielle Mbarga','+237 6 55 88 99 00','Yaoundé — Omnisport','danielle.mbarga@email.cm','https://picsum.photos/seed/jk-cl3/200/200',null,'2024-07-10',v_owner),
    ('cl-004','Flore Atangana','+237 6 88 33 22 11','Yaoundé — Tsinga','flore.atangana@email.cm','https://picsum.photos/seed/jk-cl4/200/200','Préfère les robes longues et élégantes.','2024-09-03',v_owner),
    ('cl-005','Ghislaine Tchinda','+237 6 70 55 66 77','Yaoundé — Essos',null,'https://picsum.photos/seed/jk-cl5/200/200',null,'2025-01-18',v_owner),
    ('cl-006','Josiane Kamga','+237 6 99 88 77 66','Yaoundé — Mvog-Ada','josiane.kamga@email.cm','https://picsum.photos/seed/jk-cl6/200/200','Cliente régulière pour les tenues traditionnelles.','2025-02-14',v_owner),
    ('cl-007','Marie-Claire Fotso','+237 6 55 12 34 56','Douala — Bonanjo','mc.fotso@email.cm','https://picsum.photos/seed/jk-cl7/200/200',null,'2025-04-08',v_owner),
    ('cl-008','Nadège Tagne','+237 6 80 45 67 89','Yaoundé — Melen',null,'https://picsum.photos/seed/jk-cl8/200/200','Souhaite un ensemble pour son anniversaire en juillet.','2025-05-20',v_owner)
  on conflict (id) do nothing;

  -- ── Carnet de mesures (1 relevé par cliente) ──────────────────────
  insert into public.measurements (id, client_id,
      tour_poitrine, tour_taille, tour_bassin, longueur_taille_devant, longueur_taille_dos,
      carrure_devant, carrure_dos, tour_encolure, hauteur_poitrine, ecart_poitrine, tour_bras,
      longueur_manche, tour_poignet, longueur_epaule, longueur_robe, longueur_jupe, tour_cou,
      longueur_boubou, created_at, owner_id) values
    ('mes-001','cl-001',92,72,98,42,40,36,37,38,27,19,30,58,16,13,115,70,35,150,'2024-03-15',v_owner),
    ('mes-002','cl-002',96,76,104,43,41,38,39,40,28,20,32,56,17,14,118,72,37,155,'2024-05-22',v_owner),
    ('mes-003','cl-003',88,68,94,40,39,35,36,36,26,18,28,60,15,12,120,75,34,148,'2024-07-10',v_owner),
    ('mes-004','cl-004',94,74,100,41,40,37,38,39,27,19,31,57,16,13,112,68,36,152,'2024-09-03',v_owner),
    ('mes-005','cl-005',90,70,96,42,40,36,37,null,null,null,29,59,null,null,116,71,null,null,'2025-01-18',v_owner),
    ('mes-006','cl-006',98,78,106,44,42,39,40,41,29,21,33,55,17,14,110,67,38,158,'2025-02-14',v_owner),
    ('mes-007','cl-007',86,66,92,39,38,34,35,null,null,null,27,61,null,null,122,76,null,null,'2025-04-08',v_owner),
    ('mes-008','cl-008',91,71,97,41,40,36,37,38,null,null,null,null,null,null,114,69,null,null,'2025-05-20',v_owner)
  on conflict (id) do nothing;

  -- ── Formations ────────────────────────────────────────────────────
  insert into public.formations (id, title, description, duration_months, price, modules, created_at, owner_id) values
    ('fm-001','Initiation à la Couture',
     'Formation de base : prise de mesures, coupe, assemblage, finitions. Idéale pour les débutantes souhaitant maîtriser les fondamentaux.',
     6, 350000,
     array['Prise de mesures','Patronage de base','Coupe du tissu','Techniques d''assemblage','Finitions et ourlets'],
     '2024-01-10', v_owner),
    ('fm-002','Perfectionnement Haute Couture',
     'Formation avancée : modélisme, broderie, drapé, travail des tissus nobles. Pour les couturières souhaitant se perfectionner.',
     12, 750000,
     array['Modélisme avancé','Travail des tissus nobles','Broderie et ornements','Techniques de drapé','Montage de corsage structuré','Création de traînes et voiles','Ajustement et retouches haute couture','Projet final : création complète'],
     '2024-01-10', v_owner)
  on conflict (id) do nothing;

  -- ── Apprenantes ───────────────────────────────────────────────────
  insert into public.students (id, name, phone, email, photo, city, level, enrollment_date, formation_id, progress, total_amount, paid_amount, created_at, owner_id) values
    ('st-001','Blandine Nkoulou','+237 6 91 22 33 44','blandine.nk@email.cm','https://picsum.photos/seed/jk-st1/200/200','Yaoundé — Mvan','Débutante','2026-01-15','fm-001',
     $j$[{"name":"Prise de mesures","completed":true,"grade":16,"comment":"Très bonne maîtrise","date":"2026-02-15"},{"name":"Patronage de base","completed":true,"grade":14,"comment":"Bon travail, quelques imprécisions","date":"2026-03-20"},{"name":"Coupe du tissu","completed":true,"grade":15,"comment":"Progrès remarquables","date":"2026-04-25"},{"name":"Techniques d'assemblage","completed":false},{"name":"Finitions et ourlets","completed":false}]$j$::jsonb,
     350000,250000,'2026-01-15',v_owner),
    ('st-002','Edwige Mbappe','+237 6 82 33 44 55',null,'https://picsum.photos/seed/jk-st2/200/200','Yaoundé — Biyem-Assi','Intermédiaire','2025-09-01','fm-002',
     $j$[{"name":"Modélisme avancé","completed":true,"grade":17,"comment":"Excellente compréhension","date":"2025-10-15"},{"name":"Travail des tissus nobles","completed":true,"grade":15,"comment":"Bon travail","date":"2025-12-10"},{"name":"Broderie et ornements","completed":true,"grade":18,"comment":"Talent naturel pour la broderie","date":"2026-02-15"},{"name":"Techniques de drapé","completed":true,"grade":14,"comment":"En progression","date":"2026-04-10"},{"name":"Montage de corsage structuré","completed":false},{"name":"Création de traînes et voiles","completed":false},{"name":"Ajustement et retouches haute couture","completed":false},{"name":"Projet final : création complète","completed":false}]$j$::jsonb,
     750000,500000,'2025-09-01',v_owner),
    ('st-003','Hortense Ngo Nyemb','+237 6 73 44 55 66',null,'https://picsum.photos/seed/jk-st3/200/200','Yaoundé — Ngousso','Débutante','2026-03-01','fm-001',
     $j$[{"name":"Prise de mesures","completed":true,"grade":13,"comment":"Bon début, à renforcer","date":"2026-04-05"},{"name":"Patronage de base","completed":false},{"name":"Coupe du tissu","completed":false},{"name":"Techniques d'assemblage","completed":false},{"name":"Finitions et ourlets","completed":false}]$j$::jsonb,
     350000,175000,'2026-03-01',v_owner),
    ('st-004','Irène Messi','+237 6 64 55 66 77',null,'https://picsum.photos/seed/jk-st4/200/200','Yaoundé — Emana','Avancée','2025-03-01','fm-002',
     $j$[{"name":"Modélisme avancé","completed":true,"grade":16,"date":"2025-04-15"},{"name":"Travail des tissus nobles","completed":true,"grade":17,"date":"2025-06-15"},{"name":"Broderie et ornements","completed":true,"grade":15,"date":"2025-08-15"},{"name":"Techniques de drapé","completed":true,"grade":16,"date":"2025-10-15"},{"name":"Montage de corsage structuré","completed":true,"grade":18,"date":"2025-12-15"},{"name":"Création de traînes et voiles","completed":true,"grade":17,"date":"2026-02-15"},{"name":"Ajustement et retouches haute couture","completed":true,"grade":16,"date":"2026-04-15"},{"name":"Projet final : création complète","completed":false}]$j$::jsonb,
     750000,750000,'2025-03-01',v_owner),
    ('st-005','Léontine Eboumbou','+237 6 55 66 77 88',null,'https://picsum.photos/seed/jk-st5/200/200','Yaoundé — Mokolo','Débutante','2026-05-01','fm-001',
     $j$[{"name":"Prise de mesures","completed":false},{"name":"Patronage de base","completed":false},{"name":"Coupe du tissu","completed":false},{"name":"Techniques d'assemblage","completed":false},{"name":"Finitions et ourlets","completed":false}]$j$::jsonb,
     350000,100000,'2026-05-01',v_owner)
  on conflict (id) do nothing;

  -- ── Articles de location ──────────────────────────────────────────
  insert into public.rental_items (id, name, photos, size, rental_price, deposit_amount, state, description, created_at, owner_id) values
    ('ri-001','Robe de mariée « Princesse Douala »',array['https://picsum.photos/seed/jk-ri1/400/500'],'M/L (ajustable)',150000,200000,'Disponible','Robe princesse en tulle et dentelle, traîne amovible, taille ajustable par laçage.','2025-01-10',v_owner),
    ('ri-002','Grand Boubou « Reine des Grassfields »',array['https://picsum.photos/seed/jk-ri2/400/500'],'Taille unique',80000,100000,'Loué','Boubou en bazin getzner doré, broderies or et argent, deux pièces.','2025-02-20',v_owner),
    ('ri-003','Robe de soirée « Étoile de Yaoundé »',array['https://picsum.photos/seed/jk-ri3/400/500'],'S/M',100000,120000,'Disponible','Robe longue sirène en satin et strass, dos ouvert, fente latérale.','2025-03-15',v_owner),
    ('ri-004','Ensemble Kaba « Tradition Sawa »',array['https://picsum.photos/seed/jk-ri4/400/500'],'M',60000,80000,'Disponible','Kaba ngondo en satin rose et pagne Sawa, deux pièces avec accessoires de tête.','2025-05-10',v_owner),
    ('ri-005','Costume 3 pièces « Gentleman Camerounais »',array['https://picsum.photos/seed/jk-ri5/400/500'],'L',75000,100000,'En maintenance','Costume en bazin blanc cassé brodé, pantalon, chemise et bonnet assorti.','2025-06-01',v_owner),
    ('ri-006','Robe « Cocktail Prestige »',array['https://picsum.photos/seed/jk-ri6/400/500'],'S/M/L',55000,70000,'Disponible','Robe cocktail courte en velours et sequins, idéale pour galas et soirées.','2025-08-20',v_owner)
  on conflict (id) do nothing;

  -- ── Commandes (balance calculée par trigger) ──────────────────────
  insert into public.orders (id, client_id, type, description, fabric, model_photo, finished_photo, price, total_price, deposit, deadline, status, created_at, owner_id) values
    ('ord-001','cl-001','Robe de mariée','Robe de mariée en dentelle Chantilly, traîne cathédrale, bustier brodé de perles.','Dentelle Chantilly + Satin duchesse','https://picsum.photos/seed/jk-dress1/400/500',null,850000,850000,425000,'2026-07-20','En production','2026-04-10',v_owner),
    ('ord-002','cl-002','Soirée','Robe de soirée longue fendue, tissu lamé or, col asymétrique.','Lamé or','https://picsum.photos/seed/jk-dress2/400/500',null,180000,180000,100000,'2026-06-15','Essayage','2026-05-01',v_owner),
    ('ord-003','cl-003','Traditionnel','Kaba ngondo en pagne wax, manches évasées, ceinture drapée.','Pagne Wax Super — Vlisco','https://picsum.photos/seed/jk-dress3/400/500','https://picsum.photos/seed/jk-fin3/400/500',95000,95000,50000,'2026-06-10','Prête','2026-04-20',v_owner),
    ('ord-004','cl-004','Boubou/Bazin','Grand boubou en bazin riche brodé, teinte bordeaux et or.','Bazin riche getzner','https://picsum.photos/seed/jk-dress4/400/500',null,250000,250000,125000,'2026-06-25','En production','2026-05-05',v_owner),
    ('ord-005','cl-006','Ensemble','Ensemble jupe crayon + haut péplum en pagne pour cérémonie.','Pagne Wax Hollandais','https://picsum.photos/seed/jk-dress5/400/500','https://picsum.photos/seed/jk-fin5/400/500',120000,120000,60000,'2026-06-08','Livrée','2026-03-15',v_owner),
    ('ord-006','cl-005','Sur-mesure','Combinaison pantalon chic pour événement professionnel.','Crêpe de Chine','https://picsum.photos/seed/jk-dress6/400/500',null,135000,135000,70000,'2026-06-18','En production','2026-05-12',v_owner),
    ('ord-007','cl-001','Soirée','Robe cocktail courte en taffetas, dos nu, jupe ballon.','Taffetas',null,null,110000,110000,55000,'2026-07-05','Devis','2026-06-01',v_owner),
    ('ord-008','cl-007','Traditionnel','Robe longue droite en ndop tissé, style royal bamoun.','Ndop (tissage artisanal)','https://picsum.photos/seed/jk-dress8/400/500',null,200000,200000,100000,'2026-07-15','Devis','2026-06-03',v_owner),
    ('ord-009','cl-008','Ensemble','Ensemble trois pièces : jupe, haut et veste assortie.',null,null,null,160000,160000,80000,'2026-07-10','Devis','2026-06-05',v_owner),
    ('ord-010','cl-002','Robe de mariée','Robe de mariée traditionnelle camerounaise en satin blanc et pagne.','Satin + Pagne','https://picsum.photos/seed/jk-dress10/400/500',null,650000,650000,325000,'2026-08-20','Devis','2026-06-06',v_owner),
    ('ord-011','cl-004','Soirée','Robe longue sirène en velours bordeaux.','Velours',null,'https://picsum.photos/seed/jk-fin11/400/500',175000,175000,175000,'2026-05-30','Livrée','2026-04-01',v_owner),
    ('ord-012','cl-006','Autre','Retouche et ajustement tenue de baptême.',null,null,null,25000,25000,25000,'2026-05-20','Livrée','2026-05-10',v_owner)
  on conflict (id) do nothing;

  -- ── Locations / Réservations ──────────────────────────────────────
  insert into public.rentals (id, rental_item_id, client_id, start_date, end_date, status, deposit_paid, deposit_returned, created_at, owner_id) values
    ('rn-001','ri-002','cl-005','2026-06-01','2026-06-10','Loué',true,false,'2026-05-25',v_owner),
    ('rn-002','ri-001','cl-003','2026-06-20','2026-06-23','Réservé',true,false,'2026-06-01',v_owner),
    ('rn-003','ri-003','cl-006','2026-05-10','2026-05-12','Rendu',true,true,'2026-05-01',v_owner),
    ('rn-004','ri-004','cl-008','2026-06-28','2026-06-30','Réservé',false,false,'2026-06-05',v_owner)
  on conflict (id) do nothing;

  -- ── Rendez-vous ───────────────────────────────────────────────────
  insert into public.appointments (id, client_id, order_id, type, title, date, time, duration_minutes, notes, created_at, owner_id) values
    ('apt-001','cl-001','ord-001','Essayage','Essayage robe de mariée — Aminatou','2026-06-09','10:00',60,'Premier essayage, vérifier le bustier.','2026-06-01',v_owner),
    ('apt-002','cl-002','ord-002','Essayage','Essayage robe de soirée — Chantal','2026-06-09','14:00',45,'Ajustements finaux.','2026-06-02',v_owner),
    ('apt-003','cl-003',null,'Retrait','Retrait Kaba — Danielle','2026-06-10','11:00',30,null,'2026-06-03',v_owner),
    ('apt-004','cl-007',null,'Consultation','Consultation nouvelle commande — Marie-Claire','2026-06-11','09:30',60,'Discussion robe en ndop tissé.','2026-06-04',v_owner),
    ('apt-005','cl-008',null,'Consultation','Consultation ensemble anniversaire — Nadège','2026-06-11','15:00',45,null,'2026-06-05',v_owner),
    ('apt-006','cl-004','ord-004','Essayage','Essayage boubou bazin — Flore','2026-06-13','10:00',60,null,'2026-06-05',v_owner),
    ('apt-007','cl-005',null,'Retrait','Retour tenue de location — Ghislaine','2026-06-10','16:00',20,'Retour Grand Boubou Reine des Grassfields.','2026-06-01',v_owner),
    ('apt-008','cl-001',null,'Cours','Cours de couture — groupe débutantes','2026-06-12','08:30',180,null,'2026-06-01',v_owner)
  on conflict (id) do nothing;

  -- ── Boutique / Stock ──────────────────────────────────────────────
  insert into public.shop_items (id, name, photos, price, quantity, category, description, created_at, owner_id) values
    ('si-001','Sac à main en cuir tressé',array['https://picsum.photos/seed/jk-si1/400/400'],35000,8,'Sacs','Sac à main artisanal en cuir véritable tressé, fermeture magnétique.','2026-01-15',v_owner),
    ('si-002','Foulard en soie imprimée',array['https://picsum.photos/seed/jk-si2/400/400'],15000,15,'Accessoires','Foulard carré 90×90 cm en soie, motifs inspirés de l''art camerounais.','2026-02-10',v_owner),
    ('si-003','Robe prêt-à-porter « Sahel »',array['https://picsum.photos/seed/jk-si3/400/500'],45000,4,'Prêt-à-porter','Robe mi-longue en coton imprimé, coupe évasée, disponible en S/M/L.','2026-03-05',v_owner),
    ('si-004','Boucles d''oreilles en perles dorées',array['https://picsum.photos/seed/jk-si4/400/400'],8000,20,'Bijoux','Boucles pendantes, perles dorées et nacre, fait main.','2026-03-20',v_owner),
    ('si-005','Chemisier pagne « Élégance »',array['https://picsum.photos/seed/jk-si5/400/500'],28000,6,'Prêt-à-porter','Chemisier en pagne wax, col claudine, manches 3/4.','2026-04-10',v_owner),
    ('si-006','Tissu Wax premium (6 yards)',array['https://picsum.photos/seed/jk-si6/400/400'],25000,12,'Tissus','Tissu wax hollandais premium, 6 yards, motifs exclusifs.','2026-05-01',v_owner)
  on conflict (id) do nothing;

  -- ── Paiements ─────────────────────────────────────────────────────
  insert into public.payments (id, client_id, activity, reference_id, order_id, amount, date, method, notes, created_at, owner_id) values
    ('pay-001','cl-001','Couture','ord-001','ord-001',425000,'2026-04-10','Virement','Acompte robe de mariée','2026-04-10',v_owner),
    ('pay-002','cl-002','Couture','ord-002','ord-002',100000,'2026-05-01','Espèces','Acompte robe soirée','2026-05-01',v_owner),
    ('pay-003','cl-003','Couture','ord-003','ord-003',50000,'2026-04-20','Espèces','Acompte kaba','2026-04-20',v_owner),
    ('pay-004','cl-003','Couture','ord-003','ord-003',45000,'2026-06-05','Espèces','Solde kaba','2026-06-05',v_owner),
    ('pay-005','cl-004','Couture','ord-004','ord-004',125000,'2026-05-05','Virement','Acompte boubou bazin','2026-05-05',v_owner),
    ('pay-006','cl-006','Couture','ord-005','ord-005',60000,'2026-03-15','Espèces',null,'2026-03-15',v_owner),
    ('pay-007','cl-006','Couture','ord-005','ord-005',60000,'2026-05-28','Espèces','Solde ensemble','2026-05-28',v_owner),
    ('pay-008','cl-004','Couture','ord-011','ord-011',175000,'2026-04-01','Virement','Paiement intégral robe velours','2026-04-01',v_owner),
    ('pay-009','cl-001','Formation','st-001',null,175000,'2026-01-15','Virement','1ère tranche formation Blandine','2026-01-15',v_owner),
    ('pay-010','cl-001','Formation','st-001',null,75000,'2026-04-01','Espèces','2e tranche Blandine','2026-04-01',v_owner),
    ('pay-011','cl-001','Formation','st-002',null,500000,'2025-09-01','Virement','Paiement formation Edwige','2025-09-01',v_owner),
    ('pay-012','cl-001','Formation','st-005',null,100000,'2026-05-01','Espèces','1ère tranche Léontine','2026-05-01',v_owner),
    ('pay-013','cl-005','Location','rn-001',null,280000,'2026-05-25','Espèces','Location + caution Grand Boubou','2026-05-25',v_owner),
    ('pay-014','cl-003','Location','rn-002',null,350000,'2026-06-01','Virement','Location + caution robe mariée','2026-06-01',v_owner),
    ('pay-015','cl-008','Boutique','si-001',null,35000,'2026-06-02','Espèces','Achat sac en cuir','2026-06-02',v_owner),
    ('pay-016','cl-001','Boutique','si-004',null,16000,'2026-05-20','Espèces','2 paires de boucles','2026-05-20',v_owner)
  on conflict (id) do nothing;

  raise notice 'Seed terminé pour le propriétaire %.', v_owner;
end $$;
