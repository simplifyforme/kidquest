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

### 2026-11-21 — 0.7.0 — Ajustements des tests lors de l'import HTML
- **Type :** correction et tests.
- **Pourquoi :** la première CI a fait ressortir un espace résiduel après ponctuation lors de la vérification d’un infinitif, ainsi qu’une attente de test ne reflétant pas l’accent du mot `honderdéén` généré par le HTML source.
- **Changements :** normalisation de l’infinitif en supprimant les espaces après la ponctuation finale ; attente de test alignée sur la conversion néerlandaise originale de 101, sans changer la règle pédagogique du HTML.
- **Fichiers principaux :** `src/games/verbData.ts`, `src/games/importedGames.test.ts`.
- **Données et compatibilité :** aucun effet sur le stockage, les points ou le catalogue ; préservation des formes écrites du HTML d'origine.
- **Validation :** première CI : TypeScript réussi, deux tests en échec. Nouvelle CI à confirmer après correctif.
- **Traçabilité :** même PR d'importation `feat/import-html-lessons-visibility-0-7`.

### 2026-11-21 — 0.7.1 — Le cours Natuur est déplacé dans Nederlands
- **Type :** correction d'organisation des matières.
- **Pourquoi :** l'utilisateur demande que les exercices « De plant · Speeltuin » en néerlandais fassent partie de la matière Nederlands, au lieu d'une catégorie Natuur indépendante.
- **Changements :** suppression de la carte de matière Natuur sur l'accueil, rattachement du jeu « De plant · Speeltuin » à Nederlands, texte du bouton retour « Terug naar Nederlands », rétablissement de quatre catégories principales et adaptation des tests.
- **Fichiers principaux :** `src/lib/catalog.ts`, `src/lib/catalog.test.ts`, `src/games/importedGames.test.ts`, `src/components/PlantPlay.tsx`, `src/App.tsx`, `package.json`, `src-tauri/Cargo.toml`, `src-tauri/tauri.conf.json`.
- **Décisions techniques :** le jeu conserve son identifiant permanent `plant-playground` pour préserver les réglages Visible/Masqué et l'historique. Les anciens packs téléchargés contenant `category: "nature"` sont redirigés vers Nederlands par le catalogue, sans changement destructif du schéma JSON ni de SQLite. La catégorie de pack héritée reste acceptée lors de la validation.
- **Données et compatibilité :** aucun changement des questions des plantes, des points, des résultats et des durées. Installation Windows 0.7.1 nécessaire pour voir l'organisation modifiée.
- **Validation :** tests unitaires et compilation Windows GitHub Actions à vérifier dans la PR ; ajout d'un test couvrant les packs historiques `category: "nature"`.
- **Traçabilité :** branche `fix/plant-under-nederlands-0-7-1`, Pull Request à ouvrir.
- **Suite / points ouverts :** valider l'affichage sur le PC 13 pouces ; aucune nouvelle logique pédagogique requise.

### 2026-11-21 — 0.7.1 — Correction de condition UI après retrait de Natuur
- **Type :** correction de compilation.
- **Pourquoi :** la CI TypeScript a révélé une ancienne condition `categoryId==="nature"` dans la carte des ateliers interactifs, devenue impossible après suppression de cette catégorie.
- **Changements :** suppression du test sur l'ancien ID de catégorie ; le jeu de plantes se trouve toujours sous Nederlands et le compteur reste disponible.
- **Fichiers principaux :** `src/App.tsx`.
- **Données et compatibilité :** aucun impact SQLite, identifiants, visibilité ou résultats.
- **Validation :** premier contrôle TypeScript en échec (`TS2367`), nouvelle exécution CI nécessaire.
- **Traçabilité :** PR #17.

### 2026-11-21 — 0.8.0 — Organisation du catalogue modifiable à distance sans réinstallation
- **Type :** fonctionnalité / infrastructure de diffusion / contrat JSON / stockage.
- **Pourquoi :** déplacer « De plant · Speeltuin » de Natuur vers Nederlands nécessitait jusqu'ici un nouvel installateur uniquement parce que les matières et les intitulés étaient codés en dur dans React. Les futures modifications de présentation ne doivent plus exiger de reconstruire l'application.
- **Changements :** création de `site/catalog.json` (version 1, catégories, titres, descriptions, icônes et ordre d'affichage), validation des seules métadonnées sûres dans `src/lib/catalogConfig.ts`, surcharges optionnelles dans `src/lib/catalog.ts`, adoption des catégories dynamiques dans `src/App.tsx`, téléchargement du catalogue comme ressource **distincte et vérifiée** dans `src/lib/updates.ts`. Le même bouton « Vérifier les mises à jour » et la vérification au lancement récupèrent les nouvelles organisations, sans redémarrage après téléchargement. La publication du manifeste ajoute un descripteur `catalog` version/URL/SHA-256.
- **Fichiers principaux :** `site/catalog.json`, `scripts/generate-manifest.mjs`, `.github/workflows/pages.yml`, `src/lib/catalogConfig.ts`, `src/lib/catalogConfig.test.ts`, `src/lib/catalog.ts`, `src/lib/storage.ts`, `src/lib/updates.ts`, `src/types.ts`, `src/App.tsx`, fichiers version 0.8.0.
- **Décisions techniques :** extension **rétrocompatible** du manifeste JSON existant avec un champ facultatif `catalog`, calcul automatique SHA-256 sur les octets du JSON, vérification HTTPS + hash + taille ≤64 Ko + schéma + version croissante, stockage de la dernière copie valide dans une table SQLite additive `remote_catalog`. En cas d'échec du réseau ou JSON invalide, l'application conserve la configuration déjà vérifiée ou ses valeurs intégrées. Les packs d'exercices restent vérifiés et installés indépendamment du catalogue ; la liste des moteurs d'exercices exécutables reste intégrée au binaire.
- **Données et compatibilité :** aucun changement des IDs de cours/pack, des points, des sessions historiques ni des préférences `hidden_activities`. Les activités futures restent **visibles par défaut**. L'application 0.7.1 et précédentes ignorent le nouveau catalogue : il faut installer **0.8.0 une fois**, puis les changements de catégories/titres/ordre/icônes sont distribués via le JSON sans nouvelle installation.
- **Validation :** nouveaux tests de schéma sûr, ajout de catégorie, déplacement/renommage de cours et gestion des IDs inconnus, plus les tests existants. Compilation TypeScript, Vitest, génération du manifeste, installateur Windows et test de démarrage par GitHub Actions à contrôler avant fusion.
- **Traçabilité :** branche `feat/remote-catalog-config-0-8`, PR #18. Le manifeste `site/manifest.json` sera régénéré automatiquement après fusion par `pages.yml` : son commit automatique ne nécessite pas une entrée supplémentaire.
- **Limites / prochaines étapes :** l'empreinte SHA-256 est vérifiée par rapport au manifeste GitHub, lequel n'a pas encore de signature cryptographique propre. Les ajouts de code React/Rust/Three.js ou d'un nouveau type de moteur nécessitent toujours un nouvel installateur et la mise à jour binaire signée est encore désactivée. Pour toute nouvelle modification de `site/catalog.json`, augmenter `version` et ajouter une nouvelle entrée datée à ce journal.

### 2026-11-21 — 0.9.0 — Téléchargement des dossiers multimédias par activité
- **Type :** architecture de contenu / mise à jour / prise en charge des médias / stockage local.
- **Pourquoi :** le parent veut un dossier propre à chaque nouveau cours ou exercice, capable d'embarquer ses photos, GIF, vidéos et fichiers audio, téléchargé lors des mises à jour du contenu sans réinstaller à chaque fois l'application.
- **Changements :** standard `site/activities/<id>/pack.json` avec `assets/`, extension rétrocompatible `manifest.activities[]` (version, URL, empreintes SHA-256, tailles, types MIME), ajout facultatif de `Question.media`. L'application télécharge les fichiers de chaque activité, contrôle tous les SHA-256, évite de retélécharger les ressources déjà identiques, et n'active le nouveau `pack.json` qu'après le succès de tous ses médias. Les fichiers sont rangés sur Windows dans `AppLocalData/activities/<id>/assets/` par trois commandes Rust limitées au dossier d'activité. Une vue React affiche photos, GIF, vidéos et audio hors ligne depuis les fichiers locaux, avec adaptation aux PC 13 pouces.
- **Fichiers principaux :** `src/types.ts`, `src/lib/activityAssets.ts`, `src/components/QuestionMedia.tsx`, `src/lib/updates.ts`, `src/lib/exerciseModes.ts`, `src/App.tsx`, `src/styles.css`, `src-tauri/src/lib.rs`, `src-tauri/tauri.conf.json`, `scripts/generate-manifest.mjs`, `.github/workflows/pages.yml`, `.github/workflows/windows.yml`, `docs/ACTIVITY_BUNDLES.md`.
- **Décisions techniques :** aucun plugin d'accès système général : les commandes Rust vérifient l'ID, le nom et l'extension, puis écrivent exclusivement sous les données locales KidQuest. Aucun script HTML/JS ou exécutable téléchargé. Les médias ne sont jamais lus directement depuis le Web pendant le jeu ; ils sont hachés et copiés localement au préalable. Premier moteur photo : QCM compatible, empêchant que le planificateur de modes ne cache l'image dans un mode de lettres/memory.
- **Données et compatibilité :** anciens packs `site/packs/`, packs intégrés, anciens ID, points, historique, durée et réglages Visible/Masqué sont préservés. Le nouveau support de médias nécessite d'installer KidQuest 0.9.0 une seule fois ; les activités suivantes utilisant ses moteurs sont distribuées via GitHub sans nouvel EXE. Les nouveaux moteurs programmés nécessitent toujours un nouvel installateur.
- **Validation :** contrôles unitaires des contrats médias et du pack néerlandais, TypeScript, tests GitHub Actions, compilation Windows et démarrage à vérifier dans la Pull Request.
- **Traçabilité :** branche `feat/activity-bundles-media-0-9`, PR à ouvrir ; les photos binaires et le manifeste sont préparés puis publiés automatiquement après fusion par `pages.yml`.
- **Suite / points ouverts :** adapter progressivement les anciennes activités embarquées au format dossier lorsque leur moteur peut charger des données distantes. Les droits d'auteur doivent être vérifiés pour chaque nouveau fichier ; ne pas télécharger arbitrairement des médias non autorisés.

### 2026-11-21 — Contenu 0.9.0 — « Dieren herkennen met foto's », quiz néerlandais avec photos
- **Type :** contenu / images pédagogiques / localisation.
- **Pourquoi :** apprendre à reconnaître et nommer huit animaux en néerlandais grâce à leurs photographies, en conservant une expérience locale et la progression KidQuest.
- **Changements :** nouveau dossier `site/activities/dieren-nl/` contenant le pack de huit questions et réponses néerlandaises (kat, hond, paard, koe, konijn, olifant, schaap, leeuw), un inventaire de photographies CC0 Wikimedia Commons, une description pédagogique et des fichiers `assets/*.jpg` répliqués au moment de la publication GitHub. Le catalogue dynamique regroupe ce contenu dans **Nederlands** et le rend visible par défaut, avec possibilité de le masquer dans Paramètres.
- **Fichiers principaux :** `site/activities/dieren-nl/pack.json`, `site/activities/dieren-nl/photo-sources.json`, `site/activities/dieren-nl/README.md`, `scripts/sync-activity-media.mjs`, `site/catalog.json`, `src/lib/activityAssets.test.ts`.
- **Décisions techniques :** images documentées sous licence CC0 1.0, hébergées avec l'activité après copie depuis leurs sources Wikimedia Commons. Les questions utilisent un média par animal et quatre choix : l'image est obligatoire et reste disponible hors ligne. Les IDs des questions sont permanents.
- **Données et compatibilité :** nouveau pack `dieren-nl` version 1, sans migration SQLite ni perte d'historique ; première installation automatique une fois le manifeste multimédia publié et KidQuest 0.9.0 installé. Les versions antérieures ignorent le nouveau champ `activities`.
- **Validation :** huit questions, choix corrects et sécurité des références multimédias vérifiés par tests ; compilation Windows à confirmer.
- **Traçabilité :** même PR que l'architecture 0.9.0.

### 2026-11-21 — 0.9.0 — Ajustement TypeScript après première validation CI des médias
- **Type :** correction / validation.
- **Pourquoi :** le premier workflow Windows a téléchargé correctement les huit photographies CC0, généré le manifeste des dossiers, puis TypeScript a détecté que le champ facultatif `bytes` n'était pas encore affiné comme nombre lors de la vérification de taille.
- **Changements :** vérification explicite `typeof a.bytes === "number"` avant les bornes dans `src/lib/activityAssets.ts`.
- **Fichiers principaux :** `src/lib/activityAssets.ts`.
- **Données et compatibilité :** aucune migration ; mêmes images, SHA, formats et limites.
- **Validation :** téléchargement de huit photos et génération du manifeste réussis ; première compilation TypeScript en échec (`TS18048`) corrigée ; nouveau workflow à contrôler.
- **Traçabilité :** PR #19, workflow initial `44950765180`.

### 2026-11-21 — 0.9.0 — Dossiers d’activités sans fichiers multimédias
- **Type :** correction de robustesse du pipeline.
- **Pourquoi :** certains exercices ne contiennent que des questions et n'ont donc pas nécessairement de dossier `assets/`.
- **Changements :** le générateur du manifeste traite un dossier `assets/` absent comme une liste vide, sans bloquer la publication des activités uniquement textuelles.
- **Fichiers principaux :** `scripts/generate-manifest.mjs`.
- **Données et compatibilité :** aucun impact sur les anciens packs, les données SQLite ni le pack photographique.
- **Validation :** nouvelle CI Windows à confirmer après cette correction.
- **Traçabilité :** PR #19.

### 2026-11-21 — 0.9.0 — Localisation complète du nouveau quiz animalier néerlandais
- **Type :** adaptation de l'interface pédagogique.
- **Pourquoi :** les questions et réponses du pack « Dieren » étaient déjà en néerlandais, mais certains libellés génériques de navigation et de résultats demeuraient français lorsque la matière n'était pas Wiskunde.
- **Changements :** l'interface des quiz utilise maintenant la langue `nl-BE` indiquée par le pack pour les titres de questions, points, feedback, boutons et résultats ; le retour mène à Nederlands pour ce pack.
- **Fichiers principaux :** `src/App.tsx`.
- **Données et compatibilité :** aucune modification des questions ni du stockage ; les autres activités en français restent inchangées.
- **Validation :** nouvelle compilation TypeScript et tests Windows à confirmer.
- **Traçabilité :** PR #19.

### 2026-11-21 — 0.9.0 — Adaptation des tests au nouveau catalogue version 2
- **Type :** maintenance des tests de régression.
- **Pourquoi :** le catalogue GitHub passe de la version 1 à la version 2 afin d'ajouter le pack Dieren ; deux tests datant de 0.8.0 comparaient encore le numéro figé 1 et échouaient alors que la nouvelle structure était valide.
- **Changements :** nouvelle valeur attendue dans le test du catalogue, et comparaison contre `publishedCatalog.version` dans le test SHA-256 pour prendre en charge les futures versions.
- **Fichiers principaux :** `src/lib/catalogConfig.test.ts`, `src/lib/catalogDownload.test.ts`.
- **Données et compatibilité :** aucune modification des données ni du moteur de mise à jour.
- **Validation :** deuxième CI : génération média et build TypeScript réussis, 52 tests sur 54 validés, deux échecs de numérotation détectés et corrigés ; nouveau workflow à confirmer.
- **Traçabilité :** PR #19, workflow `44950982832`.

### 2026-11-22 — Contenu uniquement — Groenten en fruit herkennen
- **Type :** contenu pédagogique.
- **Pourquoi :** apprendre à reconnaître et à nommer les fruits et légumes en néerlandais belge.
- **Changements :** huit QCM illustrés, avec quatre fruits et quatre légumes au sens culinaire. Chaque réponse indique le nom avec son article.
- **Fichiers principaux :** `site/activities/groenten-fruit-nl/pack.json`, `README.md` et `assets/*.jpg` dans le dossier de l’activité.
- **Décisions techniques :** huit images générées pour KidQuest avec OpenAI ImageGen, recadrées et livrées en JPEG. Le moteur de quiz photo classe l’activité dans Nederlands à partir du pack.
- **Données et compatibilité :** pack v1 avec identifiants stables, téléchargeable sur KidQuest 0.9.0 et utilisable hors ligne après installation du contenu.
- **Validation :** compilation et 54 tests réussis en local. Génération du manifeste, correspondance des huit JPEG et empreintes SHA-256 vérifiées localement.
- **Traçabilité :** branche `feat/groenten-en-fruit-nl`. Le workflow de publication reconstruit le manifeste après fusion.
- **Suite :** vérifier la CI et le téléchargement dans KidQuest sur Windows.

### 2026-11-22 — Documentation — Vérification avant clôture d’une demande
- **Type :** documentation du processus de livraison.
- **Pourquoi :** un nouveau quiz peut être prêt sur sa branche alors que KidQuest ne peut le télécharger qu’après fusion et publication.
- **Changements :** les consignes exigent de vérifier la fusion dans `main` avant d’annoncer la fin. Pour les mises à jour de contenu, elles exigent aussi de vérifier le manifeste public et l’accès aux médias du nouveau pack.
- **Fichiers principaux :** `AGENTS.md` et `docs/DEVELOPMENT_LOG.md`.
- **Décisions techniques :** utiliser la fusion automatique si elle est disponible avec les contrôles requis, sinon fusionner après validation.
- **Données et compatibilité :** modification documentaire, aucune mise à jour de KidQuest nécessaire.
- **Validation :** `git diff --check` en local et contrôle GitHub du journal avant fusion.
- **Traçabilité :** branche `docs/verification-avant-cloture`.

### 2026-11-22 — Catalogue — Icônes reconnaissables par activité
- **Type :** présentation et documentation.
- **Pourquoi :** plusieurs cartes de Nederlands affichaient le même drapeau, rendu sous forme des lettres NL sur le PC Windows, et certaines icônes évoquaient peu le sujet.
- **Changements :** catalogue version 3 avec un pictogramme propre à chacune des 13 activités existantes et une bulle de dialogue pour la matière Nederlands. Les consignes ajoutent des critères de choix et de lisibilité pour les futures cartes.
- **Fichiers principaux :** `site/catalog.json`, `AGENTS.md`, `src/lib/catalogConfig.test.ts`.
- **Données et compatibilité :** le catalogue utilise le champ emoji existant et conserve les ID d’activité, les médias et la progression. La mise à jour du catalogue suffit.
- **Validation :** test de couverture des icônes sur l’ensemble des activités, compilation, tests et génération du manifeste.
- **Traçabilité :** branche `feat/activity-icons`. Le manifeste sera régénéré par GitHub après fusion.
- **Suite :** vérifier le rendu sur le PC Windows cible.

### 2026-11-21 — Contenu uniquement — Kleurenheld, apprendre les couleurs en néerlandais
- **Type :** contenu pédagogique / médias locaux.
- **Pourquoi :** ajouter un exercice pour apprendre les couleurs en néerlandais à un enfant d’environ 8 ans.
- **Changements :** 22 questions : 11 pastilles à reconnaître et 11 traductions français → néerlandais pour rood, blauw, geel, groen, oranje, paars, roze, bruin, zwart, wit et grijs. Corrections bilingues, consignes courtes en nl-BE, modes compatibles automatiquement variés pour le vocabulaire et image toujours visible pour les QCM visuels. Nouvelle carte 🎨 dans Nederlands, catalogue version 4.
- **Fichiers principaux :** `site/activities/kleuren-nl/pack.json`, `site/activities/kleuren-nl/README.md`, `site/activities/kleuren-nl/assets/*.png`, `site/catalog.json`, `src/lib/colorsPack.test.ts`, `src/lib/catalogConfig.test.ts`.
- **Décisions techniques :** réutiliser les moteurs existants, sans code applicatif supplémentaire. Pastilles PNG dessinées avec Pillow spécialement pour KidQuest, sans source tierce ni texte révélant la réponse ; contour sombre pour le blanc. Les noms des couleurs s’emploient ici seuls sans article.
- **Données et compatibilité :** pack `kleuren-nl` version 1 avec IDs permanents. KidQuest 0.9.0+ : « Vérifier les mises à jour » suffit, utilisation hors ligne après téléchargement. Aucun changement de SQLite, des points, des sessions ou des préférences. Chaque partie existante tire huit questions.
- **Validation :** `npm run build`, `npm test` (57 tests réussis), `node scripts/generate-manifest.mjs` réussis ; contrôle visuel des 11 PNG et `git diff --check`. Tests du schéma, du classement, de l’icône, du maintien de l’image et des modes textuels. CI Windows et journal à vérifier sur la PR avant fusion.
- **Traçabilité :** branche `feat/kleuren-nl`. Le workflow `pages.yml` régénère le manifeste après fusion ; son commit automatique est couvert par cette entrée.
- **Suite / points ouverts :** vérifier publication et empreintes publiques après fusion, puis rendu réel sur Windows. La reconnaissance visuelle dépend de la perception des couleurs et de l’écran ; les questions de vocabulaire restent indépendantes de leur perception.

### 2026-11-21 — Contenu uniquement — Repères français pour les couleurs
- **Type :** ajustement pédagogique et compatibilité des modes.
- **Pourquoi :** les modes d’association existants peuvent réutiliser les consignes d’autres questions du pack sans leur image. Une consigne identique « Quelle couleur ? » serait ambiguë dans ce contexte.
- **Changements :** chaque consigne visuelle précise la couleur en français, sans fournir la réponse néerlandaise ; elle reste résoluble lorsqu’elle est reprise dans une association textuelle. Le nom néerlandais reste à retrouver.
- **Fichiers principaux :** `site/activities/kleuren-nl/pack.json`, `site/activities/kleuren-nl/README.md`, `src/lib/colorsPack.test.ts`.
- **Décisions techniques :** rendre les données compatibles avec les moteurs présents au lieu de changer le programme Windows ; version 1 conservée car ce pack est encore inédit et non fusionné.
- **Données et compatibilité :** mêmes IDs et médias, aucune modification de stockage, pas de nouvel installateur.
- **Validation :** compilation, 57 tests et génération du manifeste réussis après ajustement ; test de présence du repère français. Nouvelle CI requise sur la PR.
- **Traçabilité :** PR #23 ; manifeste généré par Actions après fusion.
- **Limites :** les pastilles sont accompagnées d’un indice français pour favoriser l’apprentissage.

### 2026-11-22 — Catalogue — Français et Nederlands : École / Autre
- **Type :** organisation pédagogique / présentation.
- **Pourquoi :** séparer les activités scolaires et complémentaires pour chacune des deux langues.
- **Changements :** catalogue version 5 : Français — École, Français — Autre, Nederlands — École, Nederlands — Autre. La chasse aux verbes, les verbes néerlandais et les plantes sont dans École ; Mots malins et le vocabulaire général (salutations, débutant, animaux, fruits/légumes, couleurs) sont dans Autre. Wiskunde et Échecs sont conservés.
- **Fichiers principaux :** `site/catalog.json`, `src/lib/catalogConfig.test.ts`, `src/lib/catalogDownload.test.ts`, `src/lib/colorsPack.test.ts`, `docs/CONTENT_PACKS.md`.
- **Décisions techniques :** réutilisation des catégories distantes existantes sans nouveau moteur ni schéma. IDs historiques `french` et `dutch` conservés pour École ; ajout de `french-other` et `dutch-other`. Les nouvelles activités doivent préciser leur classement dans le catalogue. Correction du test de version invalide pour utiliser une version différente du catalogue publié plutôt que le nombre fixe 5.
- **Données et compatibilité :** aucun changement des packs, questions, IDs d’activité, points, historique ou préférences de visibilité. Catalogue hors ligne après téléchargement ; « Vérifier les mises à jour » suffit sur KidQuest 0.8.0+ (0.9.0+ pour les médias). Aucun nouvel installateur requis.
- **Validation :** `npm run build`, `npm test` (58 tests), `node scripts/generate-manifest.mjs`, `git diff --check` réussis en local. Test du classement de toutes les activités de langue, conservation des IDs et données des quiz, et présence de contenu dans les six catégories. CI Windows et contrôle du journal à vérifier avant fusion.
- **Traçabilité :** branche `feat/language-school-other`. Le workflow `pages.yml` régénère le manifeste après fusion ; son commit automatique est couvert par cette entrée.
- **Suite / points ouverts :** vérifier la fusion et le catalogue version 5 avec son SHA-256 dans le manifeste public.

### 2026-11-22 — Contenu uniquement — Mijn lichaam, 24 parties du corps en néerlandais
- **Type :** contenu pédagogique / vocabulaire scolaire.
- **Pourquoi :** préparer des exercices sur les 24 parties du corps demandées dans Nederlands — École.
- **Changements :** nouvelle activité « Mijn lichaam · Ken jij de lichaamsdelen? », 48 questions : 24 traductions français → néerlandais et 24 devinettes de localisation ou de fonction en nl-BE. Chaque réponse demande le nom avec de/het, chaque correction donne la traduction française et un repère néerlandais. Tous les mots demandés sont couverts ; « tang » est interprété comme « tong » (langue dans la bouche). Catalogue version 6, catégorie scolaire `dutch`, icône 🧍.
- **Fichiers principaux :** `site/activities/lichaamsdelen-nl/pack.json`, `site/activities/lichaamsdelen-nl/README.md`, `site/catalog.json`, `src/lib/bodyPartsPack.test.ts`, `src/lib/catalogConfig.test.ts`.
- **Décisions techniques :** pack de données indépendant sans médias, basé sur les modes existants (saisie, lettres, lettres manquantes, QCM, associations, memory, etc.). Questions autonomes compatibles avec les modes textuels ; distracteurs proches pour les confusions anatomiques courantes. Aucun nouveau moteur ou changement de contrat.
- **Données et compatibilité :** nouveau pack `lichaamsdelen-nl` version 1 avec 48 IDs permanents ; anciens packs, points, historique et visibilité inchangés. KidQuest 0.9.0+ : « Vérifier les mises à jour » suffit, puis usage hors ligne. Aucun nouvel installateur.
- **Validation :** `npm run build`, `npm test` (61 tests), `node scripts/generate-manifest.mjs` et `git diff --check` réussis en local. Tests du schéma, des 24 mots et articles, des deux familles de questions, des 48 IDs uniques, des corrections, des choix distincts, de la saisie et des modes compatibles, du classement scolaire et des icônes. CI Windows et contrôle append-only à vérifier sur la PR avant fusion.
- **Traçabilité :** branche `feat/lichaamsdelen-nl`. Le workflow `pages.yml` génère le manifeste et ses SHA-256 après fusion ; son commit automatique est couvert par cette entrée.
- **Limites / suite :** huit questions tirées par partie par le moteur existant ; plusieurs parties sont nécessaires pour explorer le vocabulaire, sans garantie de couverture complète en une seule session. Lecture vocale selon les voix Windows installées. Vérifier fusion et publication effective du pack et du catalogue.

### 2026-11-22 — Contenu uniquement — Les détectives de la phrase, débutant 8 ans
- **Type :** contenu pédagogique / français scolaire.
- **Pourquoi :** ajouter un autre exercice ludique sur l’infinitif, le verbe conjugué et le prédicat pour un enfant débutant de 8 ans.
- **Changements :** nouvelle carte 🕵️ dans Français — École, catalogue version 7 ; 32 défis sur huit phrases courtes et familières, avec quatre familles : trouver le verbe conjugué, retrouver l’infinitif, repérer le prédicat complet et classer les formes. Rappels autonomes dans les consignes, astuce « il faut… », corrections simples, exemples de prédicat réduit au verbe et de verbe d’état (« Le chien est petit »).
- **Fichiers principaux :** `site/activities/verbe-predicat-fr/pack.json`, `site/activities/verbe-predicat-fr/README.md`, `site/catalog.json`, `src/lib/frenchPredicatePack.test.ts`, `src/lib/catalogConfig.test.ts`.
- **Décisions techniques :** réutiliser les modes de quiz existants, sans nouveau moteur ni média. Les phrases ne comportent qu’un verbe au présent, sans négation ni complément de phrase facultatif ; le prédicat conserve les compléments du verbe et l’attribut du sujet. Les consignes se suffisent à elles-mêmes pour les associations et memory.
- **Données et compatibilité :** pack `verbe-predicat-fr` version 1, 32 IDs permanents ; La chasse aux verbes reste inchangée. Aucune migration de SQLite, des points, sessions ou exclusions. « Vérifier les mises à jour » suffit sur KidQuest 0.9.0+, puis usage hors ligne, sans nouvel installateur.
- **Validation :** `npm run build`, `npm test` (64 tests réussis), `node scripts/generate-manifest.mjs` et `git diff --check` réussis. Tests des trois notions, réponses et distracteurs normalisés, état et attribut, prédicats à un mot, autonomie et longueur des consignes, modes compatibles et classement scolaire. CI Windows et journal à vérifier avant fusion.
- **Traçabilité :** branche `feat/verbe-predicat-debutant`. Le workflow `pages.yml` génère le manifeste après fusion ; son commit automatique est couvert par cette entrée.
- **Limites / suite :** huit questions mélangées par partie ; ni ordre progressif ni couverture complète des notions garantis en une session. Vérifier fusion et publication effective du pack et du catalogue.
