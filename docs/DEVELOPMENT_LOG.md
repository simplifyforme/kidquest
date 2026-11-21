# KidQuest — Méthode de développement et journal permanent

> **DOCUMENT OBLIGATOIRE POUR TOUS LES AGENTS IA ET DÉVELOPPEURS.**
>
> À lire **avant** toute intervention et à enrichir **dans la même Pull Request que chaque changement**.
> Ce document centralise la méthode de travail et le **journal chronologique cumulatif** de KidQuest.
> Ne jamais supprimer ni réécrire une ancienne entrée : ajouter une nouvelle entrée à la fin du journal.
> En cas d'erreur historique, ajouter une entrée corrective datée plutôt que de modifier discrètement le passé.

## 1. Point de départ pour un nouvel agent IA

Le dépôt `simplifyforme/kidquest`, branche `main`, est l'unique source de vérité. Une conversation passée, une copie locale ou un résumé peuvent être périmés.

**Ordre de lecture obligatoire :**

1. `AGENTS.md` (règles impératives de coordination et de sécurité).
2. **Ce fichier** `docs/DEVELOPMENT_LOG.md` : méthode et historique.
3. `docs/ARCHITECTURE.md` : organisation technique et contrats.
4. `docs/STATUS.md` : état et limitations connues.
5. `docs/CONTENT_PACKS.md` et `docs/DEPLOYMENT.md` si le changement touche les contenus ou la diffusion.
6. Les fichiers de code concernés, les **derniers commits**, les **Pull Requests ouvertes** et les workflows Actions.

**Objectif du projet :** plateforme éducative Windows pour un enfant, en mode hors ligne, que l'on peut enrichir régulièrement en cours, animations et exercices. Les données de progression de l'enfant doivent être préservées.

**Technologies actuelles (version 0.6.0, 2026-11-21) :** Tauri 2 / Rust, React 19, TypeScript, Vite, SQLite (`@tauri-apps/plugin-sql`), Three.js pour les échecs 3D, Vitest, GitHub Actions, catalogue JSON sur GitHub.

## 2. Architecture à comprendre avant de coder

| Partie | Fichiers de référence | Responsabilité |
|---|---|---|
| Accueil et navigation | `src/App.tsx`, `src/lib/catalog.ts` | Accueil → catégorie → cours ou exercice ; dernière activité |
| Matières et packs | `src/data/builtin.ts`, `src/lib/activities.ts`, `src/types.ts` | Questions intégrées, activités dynamiques, contrats de données |
| Dix méthodes d'exercice | `src/lib/exerciseModes.ts`, `src/components/ExercisePlay.tsx` | Attribution automatique du mode compatible ; réponses et validation |
| Langues | `src/lib/exerciseLocale.ts` | Consignes des modes en français ou en néerlandais belge |
| Leçons animées | `src/lessons/chessBeginner.ts`, `src/lessons/chessTypes.ts`, `src/components/AnimatedLessonPlayer.tsx` | Scènes, voix, surlignage de mots, mini-défis |
| Échecs 2D et 3D | `src/components/AnimatedChessBoard.tsx`, `src/components/CartoonChessBoard3D.tsx`, `src/lib/chess3d.ts` | Deux vues d'une même leçon ; retour 2D si WebGL manque |
| Points et historique | `src/lib/storage.ts`, `src/lib/activityHistory.ts` | SQLite local, tentatives, sessions terminées, scores, durées |
| Téléchargements pédagogiques | `src/lib/updates.ts`, `site/packs/`, `scripts/generate-manifest.mjs` | Catalogue versionné, SHA-256, installation locale |
| Publication | `.github/workflows/windows.yml`, `.github/workflows/pages.yml` | Compilation de l'installateur Windows et publication du manifeste |

### Règles fonctionnelles non négociables

- **Hors ligne d'abord :** cours et exercices installés doivent fonctionner sans Internet, sans compte ni télémétrie.
- **Pas de perte de progression :** ne pas supprimer/vider la base SQLite ; migrations additives et compatibles. Ne pas modifier les IDs de questions déjà publiés.
- **Deux circuits de mise à jour distincts :** les nouveaux packs JSON compatibles se publient via GitHub et se téléchargent sans réinstaller ; un nouveau moteur natif/React nécessite actuellement **un nouvel installateur**. La mise à jour binaire signée automatique est toujours désactivée.
- **Packs JSON = données uniquement :** ne jamais télécharger/exécuter de scripts tiers. Toujours valider schéma, version et SHA-256. Le manifeste est généré par le workflow : **ne pas l'éditer à la main**.
- **Matières actuelles :** Wiskunde, Français, Nederlands, Échecs. Les exercices de `math` et `numbers` sont entièrement en **néerlandais belge** (contenu, consignes, voix `nl-BE` si disponible).
- **Expérience enfant :** gros boutons, retour clair, clavier quand possible, diversité des exercices choisie automatiquement, langage encourageant.
- **Échecs :** le cours est pédagogique, ce n'est pas encore un moteur de parties avec validation exhaustive des règles. La voix masculine et le surlignage synchronisé dépendent des voix Windows/WebView2 installées.
- **Sessions :** seules les activités terminées sont comptées dans le suivi ajouté en 0.6.0 ; les anciens résultats gardent leurs points, sans durées historiques inventées.
- **Secrets :** aucune clé, donnée personnelle, nom ou identifiant d'enfant dans GitHub.

## 3. Méthode de développement OBLIGATOIRE — à répéter à chaque changement

**A. Avant toute modification**
1. Recharger `main` et vérifier les derniers commits/PRs/Actions. Lire `AGENTS.md`, ce journal et les contrats concernés.
2. Décrire le besoin, les composants impactés, le comportement attendu, les cas limites, les impacts sur les données et sur les packs existants.
3. Créer une nouvelle branche à partir de `main` à jour : `feat/...`, `fix/...`, `docs/...`. Éviter les collisions avec le travail d'autres agents.

**B. Pendant le développement**
4. Modifier seulement les fichiers nécessaires ; conserver les interfaces publiques et la compatibilité des sauvegardes. Si changement de format JSON, prévoir une version de pack supérieure. Si schéma SQL, migration additive non destructive.
5. Ajouter ou adapter les tests ciblés, y compris cas de régression, langues et hors ligne. Pour les vues animées, prévoir un fallback accessible.
6. **Dans la même branche**, ajouter **à la fin de la section 5** une nouvelle entrée de journal : date, version si applicable, résumé, fichiers, décision technique, rétrocompatibilité, tests, liens de PR et/ou Actions, limites. **Ne pas remplacer le journal par un résumé**.
7. Si un changement comporte plusieurs fonctionnalités indépendantes, créer une entrée par changement significatif, même si elles partagent une PR. Pour une correction mineure, une entrée concise suffit.

**C. Avant de fusionner**
8. Comparer de nouveau `main`, résoudre les conflits sans écraser les commits d'autres agents.
9. Exécuter `npm run build`, `npm test`, et vérifier le workflow Windows (installateur + smoke test) lorsqu'une release est concernée. Pour une modification purement documentaire, les tests de code peuvent être notés « non nécessaires ».
10. Ouvrir une Pull Request en expliquant **quoi / pourquoi / comment / tests / risque / installation nécessaire** et pointer l'entrée du journal.
11. **Bloquer la fusion si `docs/DEVELOPMENT_LOG.md` n'est pas présent dans la PR.** Le workflow `require-development-log.yml` vérifie ce point. Un changement sans nouvelle entrée est une violation des règles, même si tous les tests passent.
12. Fusionner uniquement après tests et revue/validation nécessaires. Mettre à jour le statut « vérifié » dans le journal si la CI a été contrôlée **avant fusion** ; ne jamais inventer un résultat.
13. Après fusion, vérifier les workflows de `main`, la publication du manifeste si un pack change, et donner au propriétaire la version et le lien du build réellement disponible.

**D. Exceptions et synchronisation**
- Les commits **automatiques** `chore(content): regenerate verified pack manifest` générés après fusion par `.github/workflows/pages.yml` n'ont pas de PR manuelle. **Documenter dans l'entrée du changement de pack** que ce manifeste sera régénéré automatiquement ; ne pas créer une entrée de journal simplement parce que le bot a mis à jour un hash.
- Si le journal reçoit une mise à jour parallèle, **fusionner les deux entrées et les conserver**. Ne jamais en supprimer une pour résoudre un conflit.
- Chaque agent doit commencer sa réponse technique en prenant la version actuelle du dépôt comme référence, pas un état imaginaire.

## 4. Format obligatoire pour chaque nouvelle entrée

Ajouter en fin de section **5. Journal des changements**, en conservant les entrées plus anciennes :

```md
### AAAA-MM-JJ — [Version ou « contenu uniquement »] — [Titre court]
- **Type :** fonctionnalité / correction / contenu / infrastructure / documentation.
- **Pourquoi :** problème ou besoin concret.
- **Changements :** comportements ajoutés, modifiés ou supprimés.
- **Fichiers principaux :** `chemin/fichier`, ...
- **Décisions techniques :** pourquoi cette implémentation, dépendances, limites.
- **Données et compatibilité :** SQLite, IDs, packs, hors ligne, réinstallation requise ou non.
- **Validation :** tests effectivement exécutés, CI réussie/échouée/en cours/non requise.
- **Traçabilité :** PR #N, commit SHA si connu, workflow Actions si connu.
- **Suite / points ouverts :** ...
```

> **La date de la nouvelle entrée doit être celle de la modification, pas la date de rédaction du document initial.**
> Le journal ci-dessous reconstitue seulement les étapes **vérifiables dans les commits et docs historiques** de `main`, pas chaque décision de travail non enregistrée. Git reste la source de vérité pour les changements détaillés ligne par ligne.

## 5. Journal des changements — append-only

### 2026-11-21 — 0.1.1 — Correction du démarrage Windows
- **Type :** correction.
- **Pourquoi :** application installée mais ne démarrait pas sur certains PC Windows.
- **Changements :** retrait de l'enregistrement du plugin Updater Tauri insuffisamment configuré au démarrage ; mises à jour JSON préservées.
- **Fichiers principaux :** `src-tauri/src/lib.rs`, configuration Tauri.
- **Compatibilité :** updater binaire automatique reste désactivé ; application hors ligne préservée.
- **Traçabilité :** commit `0b8d560c0b`. Voir `docs/STATUS.md`.

### 2026-11-21 — Contenu uniquement — Exercices des verbes néerlandais
- **Type :** contenu.
- **Changements :** ajout d'un pack d'environ 30 questions sur les verbes néerlandais débutants, distribué par catalogue JSON versionné.
- **Fichiers principaux :** `site/packs/neerlandais-verbes-a1.json`, manifeste généré par Actions.
- **Compatibilité :** pas de nouvel installateur requis lorsque le moteur de packs est déjà présent.
- **Traçabilité :** commit `3d65b86396` et régénération `7cf299d162`.

### 2026-11-21 — 0.1.2 — Activités téléchargées affichées dynamiquement
- **Type :** fonctionnalité/correction.
- **Pourquoi :** les nouveaux packs étaient installés mais n'apparaissaient pas parmi les quatre missions figées.
- **Changements :** génération automatique des missions depuis les packs disponibles et séparation de leurs questions.
- **Fichiers principaux :** `src/lib/activities.ts`, `src/App.tsx`.
- **Compatibilité :** nouveau binaire requis pour activer ce moteur ; packs téléchargés utilisables ensuite sans réinstallation.
- **Traçabilité :** commit `deee35cb96`.

### 2026-11-21 — Contenu uniquement — Tables de multiplication 1 à 10
- **Type :** contenu.
- **Changements :** 100 questions (1×1 à 10×10), pack versionné, réponses et IDs stables.
- **Fichiers principaux :** `site/packs/tables-multiplication-1-10.json`, manifeste généré par Actions.
- **Compatibilité :** pack téléchargé automatiquement par une application compatible.
- **Traçabilité :** commit `29f43a3bf8`, régénération `43a128254f`.

### 2026-11-21 — 0.2.0 — Dix méthodes d'exercices adaptatives
- **Type :** fonctionnalité pédagogique.
- **Changements :** QCM, réponse écrite, vrai/faux, duel, lettres, mots, lettres manquantes, associations, memory, réglette numérique. Le système sélectionne le mode compatible sans donner le choix à l'enfant.
- **Fichiers principaux :** `src/lib/exerciseModes.ts`, `src/components/ExercisePlay.tsx`, tests.
- **Compatibilité :** mêmes packs et base SQLite, nouvel installateur pour activer le moteur.
- **Traçabilité :** commit `284df00436`.

### 2026-11-21 — 0.3.0 — Première leçon animée d'échecs
- **Type :** cours/moteur pédagogique.
- **Changements :** leçon débutante en plusieurs scènes expliquant les six pièces, leurs mouvements, les principales règles, des animations de plateau et des défis ; lecture vocale Windows/WebView2 avec surlignage par limites de mots quand disponible.
- **Fichiers principaux :** `src/lessons/chessBeginner.ts`, `src/lessons/chessTypes.ts`, `src/components/AnimatedLessonPlayer.tsx`, `src/components/AnimatedChessBoard.tsx`.
- **Compatibilité :** hors ligne après installation ; voix masculine et précision du surlignage non garanties sur chaque machine.
- **Traçabilité :** commit `81dcaaf449`.

### 2026-11-21 — 0.4.0 — Échiquier 3D cartoon et mode 2D
- **Type :** interface/animation.
- **Changements :** rendu Three.js de pièces en volume, caméra orientable/zoomable, mouvement animé, option 2D et repli si WebGL absent.
- **Fichiers principaux :** `src/components/CartoonChessBoard3D.tsx`, `src/lib/chess3d.ts`, `src/components/AnimatedLessonPlayer.tsx`.
- **Compatibilité :** leçons et points identiques en 2D/3D, nouveaux assets intégrés dans l'exécutable.
- **Traçabilité :** commit `73d58444ea`.

### 2026-11-21 — 0.5.0 — Catalogue par matières et Wiskunde en néerlandais
- **Type :** organisation/contenu/localisation.
- **Changements :** accueil limité aux catégories Wiskunde, Français, Nederlands, Échecs ; exercices par catégorie ; mathématiques et nombres intégrés traduits en néerlandais belge, ainsi que les 100 multiplications (pack v2) et les consignes des dix modes.
- **Fichiers principaux :** `src/lib/catalog.ts`, `src/lib/exerciseLocale.ts`, `src/data/builtin.ts`, `site/packs/tables-multiplication-1-10.json`, `src/App.tsx`.
- **Compatibilité :** IDs de questions et scores conservés ; nouveau binaire pour l'accueil ; nouveau pack JSON par téléchargement automatique.
- **Traçabilité :** commit `b782572754`, manifeste régénéré par `3a011df2ff`.

### 2026-11-21 — 0.6.0 — Historique des sessions, scores et temps
- **Type :** suivi pédagogique/persistance.
- **Changements :** compteur d'activités terminées dans chaque catégorie ; panneau Paramètres affichant les dates, scores, durées, meilleure performance et moyenne de chaque cours/quiz. Empêche de recompter certains défis de leçon en revenant en arrière.
- **Fichiers principaux :** `src/lib/storage.ts`, `src/lib/activityHistory.ts`, `src/App.tsx`, `src/components/AnimatedLessonPlayer.tsx`.
- **Données et compatibilité :** création additive de la table `completed_sessions`, pas de réinitialisation des points ; durées antérieures à 0.6.0 non connues. Abandons non comptabilisés.
- **Traçabilité :** commit `2d90d68461`.

### 2026-11-21 — Documentation et gouvernance — Journal obligatoire pour tous les futurs changements
- **Type :** documentation/qualité/coordination multi-agents.
- **Pourquoi :** rendre la méthode de développement explicite et conserver un historique cumulatif lisible par tout agent IA travaillant sur le projet.
- **Changements :** création du présent guide permanent et récapitulatif vérifiable des évolutions 0.1.1–0.6.0 ; `AGENTS.md` impose une entrée par changement ; `README.md` pointe vers le guide ; contrôle CI des Pull Requests pour empêcher l'oubli du fichier.
- **Fichiers principaux :** `docs/DEVELOPMENT_LOG.md`, `AGENTS.md`, `README.md`, `.github/workflows/require-development-log.yml`.
- **Données et compatibilité :** aucun impact sur SQLite, les packs, l'installateur, ni sur les points. Pas de nouvelle installation nécessaire.
- **Validation :** modification documentaire, vérification GitHub du workflow de contrôle à confirmer après création de la PR.
- **Traçabilité :** branche `docs/mandatory-development-log`, [PR #14](https://github.com/simplifyforme/kidquest/pull/14).
- **Suite :** chaque agent doit ajouter **une nouvelle entrée à la fin de ce journal** dans **chaque** PR future ; ne jamais supprimer les entrées existantes.

### 2026-11-21 — 0.6.1 — Accueil compact et quiz adaptés aux PC 13 pouces
- **Type :** correction visuelle et ergonomie responsive.
- **Pourquoi :** le bandeau violet « Prêt pour une nouvelle aventure ? » occupait environ 350 px à l'écran ; sur les PC portables de 13 pouces, notamment en 1366×768, les jeux de type associations et memory nécessitaient beaucoup trop de défilement pour voir les réponses.
- **Changements :** réduction de la hauteur minimale de l'accueil de 297 à 168 px, diminution des espacements verticaux et de la mascotte ; adaptation du titre, des badges et des marges. Compactage des écrans quiz : navigation, progression, image de question, carte, réponse, association de 3 paires, memory, duel, saisie, réglette, feedback et bouton « suivant ». Règles spécifiques aux fenêtres dont la hauteur est inférieure ou égale à 850 px, et ajustements aux largeurs de 1050, 700 et 590 px.
- **Fichiers principaux :** `src/styles.css`, `src/App.tsx` (libellé de version), `package.json`, `src-tauri/Cargo.toml`, `src-tauri/tauri.conf.json`.
- **Décisions techniques :** correction CSS responsive sans modification du moteur de questions ; conserver les textes entiers et les choix cliquables ; aucun conteneur à hauteur fixe qui couperait les propositions, ni scroll imbriqué imposé ; conserver la vue mobile en une colonne pour les réponses.
- **Données et compatibilité :** aucun changement du contenu JSON, des questions, des points ou de SQLite ; installation Windows 0.6.1 nécessaire pour voir la nouvelle interface. Les packs hors ligne existants restent compatibles.
- **Validation :** vérifications TypeScript, tests unitaires et compilation Windows via CI de la Pull Request, puis essai visuel sur un écran 13 pouces/1366×768 à confirmer sur le PC de l'enfant.
- **Traçabilité :** branche `fix/compact-13inch-responsive-0-6-1`, PR ajoutée à l'ouverture.
- **Suite / points ouverts :** valider sur l'appareil cible la lisibilité des propositions longues et le comportement avec les paramètres d'agrandissement Windows.

### 2026-11-21 — 0.7.0 — Trois nouvelles activités fidèles aux HTML fournis
- **Type :** fonctionnalité / contenus / nouveaux moteurs pédagogiques.
- **Pourquoi :** intégrer trois exercices pédagogiques existants sans les réduire au QCM générique ; conserver la logique originale de chaque HTML (y compris les réponses à écrire, les indices, l’ordre des étapes et la révision des erreurs).
- **Changements :** ajout natif de « De plant · Speeltuin » dans la nouvelle matière **Natuur** (six mini-jeux, 33 défis : parties, besoins, fonctions, étapes ordonnées, bol/knol, rédaction) ; « Getallenheld » dans **Wiskunde** (0–1000, quatre difficultés, 5–20 questions, deux sens de conversion, mélange, indices, étoiles cumulées, révision des erreurs) ; « La chasse aux verbes » dans **Français** (quatre missions, 37 questions, leçon, formes conjuguées/infinitifs/groupes, indices et révision). Les questions, consignes et réponses proviennent des HTML transmis par l’utilisateur, non de nouvelles questions inventées.
- **Fichiers principaux :** `src/games/plantData.ts`, `src/games/verbData.ts`, `src/games/dutchNumbers.ts`, `src/components/PlantPlay.tsx`, `src/components/VerbPlay.tsx`, `src/components/DutchNumbersPlay.tsx`, `src/components/gameTypes.ts`, `src/lib/catalog.ts`, `src/App.tsx`, `src/styles.css`, `src/games/importedGames.test.ts`.
- **Décisions techniques :** conversion des fichiers HTML en données TypeScript et composants React sécurisés, sans exécuter des scripts HTML ni insérer des fragments via `innerHTML` ; conservation du choix interne des six jeux de plantes, des quatre missions de verbes et des réglages des nombres. Les balises de mots surlignés sont converties en éléments React. Le score KidQuest crédite +10 points par question résolue sans erreur ni indice, tout en conservant les étoiles propres au jeu des nombres. Chaque mini-partie terminée produit une session horodatée dans l'historique.
- **Données et compatibilité :** aucune suppression des données de progression ; les nouveaux jeux utilisent la table d'essais existante et `completed_sessions`. Ajout de `nature` comme catégorie optionnelle reconnue par les packs JSON, sans changer les contenus publiés. Les jeux sont embarqués : installation Windows 0.7.0 nécessaire, jouables hors ligne ensuite.
- **Validation :** tests unitaires du contenu (six jeux/33 défis, quatre missions/37 questions, nombres 0–1000, réponses en lettres et cas limites), validation TypeScript et build Windows GitHub Actions à confirmer.
- **Traçabilité :** branche `feat/import-html-lessons-visibility-0-7`, PR à créer.
- **Suite / points ouverts :** contrôle visuel sur le PC de l'enfant et éventuelles animations pédagogiques complémentaires.

### 2026-11-21 — 0.7.0 — Visibilité configurable de tous les cours et exercices, visible par défaut
- **Type :** configuration / stockage / gestion parentale.
- **Pourquoi :** permettre au parent de masquer une activité individuelle depuis Paramètres, tout en rendant **chaque nouvelle activité automatiquement visible** au moment de son installation.
- **Changements :** affichage de toutes les activités dans Paramètres, regroupées par matière, avec cases « Visible / Masqué ». Un cours masqué disparaît des pages enfant (catégorie et « Continuer mon aventure ») mais demeure listé dans les réglages et l'historique ; il peut être réactivé à tout moment. Les nouveaux packs JSON et nouveaux jeux n'ont besoin d'aucune activation.
- **Fichiers principaux :** `src/lib/storage.ts`, `src/lib/activityVisibility.ts`, `src/lib/catalog.ts`, `src/App.tsx`, `src/styles.css`, `src/games/importedGames.test.ts`, `src/lib/catalog.test.ts`.
- **Décisions techniques :** modèle **opt-out** : on stocke uniquement les identifiants explicitement masqués, jamais la liste des activités visibles. Une absence d'identifiant signifie « visible » à perpétuité, même pour une activité future inconnue. Table additive SQLite `hidden_activities(activity_id PRIMARY KEY)` et alternative localStorage en navigateur, sans compte ni serveur.
- **Données et compatibilité :** aucune réinitialisation des points, scores ni anciens réglages. Les identifiants des packs restent inchangés. Les préférences de masquage sont persistantes même après une réinstallation normale, via la base SQLite locale.
- **Validation :** tests de filtrage et « visible par défaut » pour une activité future fictive, build Windows et CI de la Pull Request à confirmer.
- **Traçabilité :** même branche et même PR que l'importation des jeux.
- **Suite / points ouverts :** une authentification PIN du panneau parent pourrait être ajoutée ultérieurement ; aucune protection par PIN n'est revendiquée dans cette version.
