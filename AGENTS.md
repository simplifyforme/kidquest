# KidQuest — Consignes aux futurs agents IA

## RÈGLE PRIORITAIRE — journal de développement obligatoire pour CHAQUE modification

**Avant toute intervention, lire `docs/DEVELOPMENT_LOG.md` en entier**, puis `docs/ARCHITECTURE.md`, `docs/STATUS.md`, les fichiers concernés et les PR/commits récents.

**Pour chaque changement (fonctionnalité, correction, nouveau pack JSON, interface, SQL, test, workflow ou documentation), ajouter une NOUVELLE entrée datée à la FIN du journal `docs/DEVELOPMENT_LOG.md` dans la MÊME branche et la MÊME Pull Request.** Cette entrée précise : besoin, modifications, fichiers, décisions techniques, compatibilité, tests réellement exécutés, liens de traçabilité et limites. Même un changement mineur doit avoir son entrée. **Ne jamais effacer, réécrire, écraser, résumer ni remplacer les entrées antérieures** : préserver tout l'historique.

Le workflow `.github/workflows/require-development-log.yml` **vérifie automatiquement** que chaque PR modifie ce fichier et ajoute une nouvelle entrée sans changer l'historique précédent. **Ne fusionner aucune PR qui échoue à ce contrôle.**

**Exception :** la régénération automatique du seul `site/manifest.json` par GitHub Actions après fusion est documentée dans l'entrée du pack correspondant, sans entrée séparée pour le commit du bot.

Les détails complets et le modèle d'entrée sont dans **[`docs/DEVELOPMENT_LOG.md`](docs/DEVELOPMENT_LOG.md)**.

---

Tu travailles sur une application Windows 11 Tauri 2 / React 19 / TypeScript en français, **offline-first**, pour un enfant d'environ 8 ans.

## Quand annoncer qu’une demande est terminée

Pour toute demande qui modifie KidQuest, suivre la pull request jusqu’à sa fusion dans `main`. Si GitHub permet la fusion automatique et que les contrôles applicables sont requis, l’activer sur la PR. Sinon, fusionner après réussite des contrôles et des validations applicables. En cas d’échec de la CI, corriger le problème et vérifier la nouvelle exécution. Si un blocage subsiste, indiquer précisément ce qui reste en attente.

Pour un pack ou une modification du catalogue, attendre aussi le workflow de publication après fusion et vérifier le résultat sur le manifeste public que KidQuest télécharge. Pour un pack multimédia, vérifier que les médias référencés sont accessibles. Annoncer la fin uniquement après ces vérifications.

## Architecture obligatoire
- Les questions et leurs corrections sont indépendantes des vues.
- Les contenus téléchargés sont des JSON **de données**, jamais du JavaScript exécutable.
- Les identifiants de questions restent stables pour préserver le suivi.
- La progression est persistante dans SQLite via `src/lib/storage.ts`; en navigateur seulement, localStorage sert de simulation.
- Ne jamais exiger de connexion Internet pour afficher les questions intégrées.
- Chaque mise à jour de pack vérifie SHA-256, version et schéma ; des signatures de manifeste sont une amélioration de sécurité prévue.
- Ne pas casser les données utilisateur à la mise à jour ; les migrations de schéma doivent être explicites.
- Pas d'identifiant de l'enfant ni de collecte de données personnelles.

## Commandes
- `npm install`
- `npm run build`
- `npm test`
- `npm run tauri build` (Windows + Rust/Tauri SDK)

## Développement
- Nouvelle matière/activité : adapter `src/types.ts`, `src/data/builtin.ts` et `src/App.tsx`.
- Nouveau pack : respecter `docs/CONTENT_PACKS.md`.
- Nouvelle interface de jeu : réutiliser `Question`, `saveAnswer`, et l'attribution +10 points sur réponse exacte.
- Définir les tests avant de modifier le format des packs.
- Préserver accessibilité clavier, gros boutons, et messages encourageants.
- Favoriser les Pull Requests et les tests CI avant fusion sur main.
- Ne jamais ajouter de clés de signature aux sources ou logs.

## Coordination multi-agents — obligatoire avant chaque modification

Le dépôt GitHub **fait foi**, jamais la copie locale, un précédent chat ou une ancienne description du projet.

1. Avant de proposer ou écrire du code, lire la branche `main` actuelle, `AGENTS.md`, `docs/ARCHITECTURE.md`, `docs/STATUS.md`, et les fichiers concernés.
2. Inspecter les derniers commits, les Pull Requests ouvertes et les branches en cours. Identifier les modifications d'autres agents qui touchent aux mêmes fichiers ou interfaces.
3. Faire une comparaison entre la version de travail et `origin/main` (par exemple `git fetch origin && git log --oneline -10 origin/main && git diff origin/main...HEAD`). Ne jamais supposer que le dépôt est resté dans l'état où on l'a laissé.
4. Créer une branche dédiée depuis `main` à jour (`feat/*`, `fix/*`, `docs/*`). Ne pas écrire directement sur `main` ; travailler avec une Pull Request. Ne jamais forcer un push, ni écraser ou réinitialiser les changements d'un autre agent.
5. Si les contrats, le schéma SQLite, la logique de points, les packs ou le mécanisme de mise à jour ont changé, examiner les impacts et adapter le plan avant de coder. Préserver autant que possible la rétrocompatibilité et les données existantes.
6. Avant de fusionner, synchroniser à nouveau avec `main`, résoudre les conflits en comprenant les deux changements, lancer `npm run build`, `npm test` et vérifier la CI Windows. Confirmer les résultats réels, sans les inventer.
7. Mettre à jour la documentation si une fonctionnalité, une interface, un workflow ou une limitation change. Expliquer dans la PR ce qui a changé, pourquoi, les tests effectués et les points restant ouverts.
8. Ne jamais modifier ou déployer silencieusement une release déjà publiée sur le PC enfant. Ne jamais effacer SQLite ni les packs téléchargés lors d'une mise à jour.

En cas de modifications simultanées, éviter les conflits : travailler dans des fichiers distincts si possible ; sinon coordonner via les Pull Requests et adapter le code à l'état GitHub le plus récent.

## Architecture à respecter lors des extensions

- Ajouter des **questions uniquement** ? Ajouter ou versionner un pack JSON dans `site/packs/` ; le workflow `.github/workflows/pages.yml` régénère `site/manifest.json` sur `main`. L'application lit `https://raw.githubusercontent.com/simplifyforme/kidquest/main/site/manifest.json`.
- Ajouter un **moteur de jeu ou une nouvelle fonctionnalité native** ? Modifier l'application, compiler un nouvel installateur et conserver les contrats de progression existants.
- Mises à jour de l'application via Tauri Updater : **encore désactivées**, ne pas prétendre qu'elles fonctionnent tant que les clés, la signature et la release publique ne sont pas configurées et testées.
- Garder l'interface « Académie ludique », adaptée à un enfant de 8 ans, et l'expérience entièrement utilisable hors ligne pour les packs installés.

## Ajout de missions dynamiques (à partir de 0.1.2)

- Les missions visibles sont maintenant générées par `src/lib/activities.ts` à partir des packs chargés de SQLite et des packs intégrés.
- **Un nouveau pack JSON** avec un `id` distinct et des questions de type existant crée une nouvelle carte **sans reconstruire l'application**. `title` devient le titre de la carte, et les questions sont filtrées par `packId` et matière.
- Ne pas revenir à un tableau figé de quatre cartes, ni mélanger le contenu d'un nouveau pack avec la mission de base par défaut.
- Un nouveau **moteur** de jeu interactif ou une nouvelle matière non prise en charge nécessite toujours une version de l'application.

## Moteur de réponses multimodal (version 0.2.0)

- Respecter les dix modes définis dans \`src/lib/exerciseModes.ts\` et leur rendu dans \`src/components/ExercisePlay.tsx\`.
- Les modes sont attribués **automatiquement** par \`planModes\`, jamais choisis par l'enfant. Préserver la variété d'une session à l'autre.
- Les questions JSON existantes restent compatibles. Pour une nouvelle interaction, implémenter son rendu, sa condition d'éligibilité et ses tests ; ne pas imposer de nouveaux champs obligatoires aux packs existants.
- Les réponses libres sont comparées après normalisation Unicode (casse, accents, ponctuation). Ne pas modifier silencieusement le contenu attendu d'une question.
- Garder une seule tentative et une seule écriture SQLite par défi ; les puzzles de 3 paires ne comptent qu'une seule tentative et 10 points uniquement si tous les appariements réussissent sans erreur.
- Chaque mode doit être utilisable au clavier, sans dépendre d'un serveur et avec retour visuel explicite.

## Moteur de leçons animées (à partir de 0.3.0)

- `src/lessons/chessTypes.ts` définit le schéma typé d'une leçon animée et les mouvements de pièces sur un plateau de 8×8. `src/lessons/chessBeginner.ts` est un premier cours complet autonome, sans réseau.
- `src/components/AnimatedChessBoard.tsx` affiche le plateau avec mouvement CSS fluide, coordonnées et cases cliquables. `src/components/AnimatedLessonPlayer.tsx` gère les scènes, la narration et les défis.
- Les diapositives, objets et actions sont **des données**. Réutiliser le modèle `AnimatedLesson` pour de futurs cours (mathématiques, formes, horloge) en construisant de nouveaux moteurs visuels sans modifier les exercices existants.
- La synthèse vocale utilise le moteur local du système via Web Speech API, si disponible ; privilégier une voix française masculine si Windows en fournit une. Ne jamais annoncer qu'une voix masculine ou des événements de synchronisation mot par mot sont garantis sur tous les PC.
- Les `speechSynthesis.onboundary` permettent le surlignage d'un mot à la fois quand le moteur les fournit. L'enfant peut rejouer la narration et les mouvements. Les tentatives d'exercices sont persistées dans la même table SQLite existante, **sans migration destructrice**.
- Pour ajouter des leçons téléchargeables à distance à l'avenir : introduire un manifeste versionné et un validateur de schéma strict, sans code arbitraire dans les packs ; ne pas prétendre que cela est déjà disponible en 0.3.0.

## Rendu 3D de l'échiquier (0.4.0)

- Réutiliser les données `ChessScene`, `ChessPiece` et les actions du cours existant. Ne pas dupliquer la validation pédagogique ou la sauvegarde des points entre les vues 2D et 3D.
- Le rendu cartoon Three.js se trouve dans `src/components/CartoonChessBoard3D.tsx`. Les coordonnées du plateau et leur orientation sont définies dans `src/lib/chess3d.ts` et vérifiées par tests (a1 foncée, h1 claire, blancs en bas).
- Le moteur 3D doit permettre les clics sur les cases des défis et ne doit pas bloquer le fonctionnement de KidQuest si le PC ne prend pas WebGL en charge. L'interface doit proposer le mode 2D et mémoriser le choix localement.
- Utiliser uniquement des primitives/modèles locaux intégrés ; aucun chargement d'assets 3D ou scripts arbitraires depuis Internet. Ne pas casser l'usage hors ligne ni le stockage SQLite existant.
- Les cours d'échecs sont pédagogiques, pas un moteur de partie d'échecs complète : la validation de coup pour le jeu libre nécessite un moteur de règles dédié dans une future version.


## Organisation des matières et maths NL (à partir de 0.5.0)

- \`src/lib/catalog.ts\` est la source de vérité pour le catalogue des quatre matières : Wiskunde, Français, Nederlands, Échecs. L'accueil ne doit jamais revenir à une liste de toutes les cartes exercices ; chaque nouveau pack est automatiquement rangé par métadonnée facultative \`category\` ou par matière.
- Les champs optionnels \`ContentPack.category\` (\`math\`, \`french\`, \`dutch\`, \`chess\`) et \`ContentPack.locale\` (\`nl-BE\`, \`fr-BE\`) doivent rester rétrocompatibles avec tous les JSON déjà installés. Ne pas renommer les IDs ni écraser les données SQLite.
- Tous les exercices Wiskunde (\`subject=math\` et \`subject=numbers\`) et leurs interfaces/consignes doivent être en **néerlandais belge**, voix \`nl-BE\`. Le français et les autres matières restent inchangés. Traduire les réponses en toutes lettres avec leurs choix distracteurs, sans changer la bonne réponse logique.
- Les dix modes de quiz utilisent \`src/lib/exerciseLocale.ts\` pour la traduction : éviter d'ajouter des textes français en dur dans le rendu maths. Toute nouvelle catégorie peut être ajoutée via le tableau \`CATEGORIES\` sans recoder les cartes.
- Les missions de calcul et nombres en lettres intégrées sont versionnées en 2 ; le pack téléchargé \`tables-multiplication-1-10\` est versionné en 2. Le workflow GitHub \`pages.yml\` reconstruit le manifeste et ses SHA-256 après merge sur \`main\`.


## Historique des activités terminées — version 0.6.0

- Nouvelle table SQLite append-only \`completed_sessions\` (création idempotente, aucune suppression de données), alternative localStorage pour tests navigateur. Définition \`CompletedSession\` dans \`src/types.ts\`; opérations \`getCompletedSessions\` et \`saveCompletedSession\` dans \`src/lib/storage.ts\`.
- Une session = une leçon ou un quiz **terminé**, identifié par un UUID unique, avec \`activityId\`, type, début, fin, durée en secondes, bonnes réponses et total. Les abandons ne sont pas comptés.
- \`src/lib/activityHistory.ts\` calcule le nombre de réalisations, les scores et temps. Les compteurs apparaissent dans le catalogue, les tentatives détaillées dans Paramètres avec date, score et durée.
- Ne **jamais** déduire une durée historique à partir des \`attempts\` des versions 0.1–0.5 : ces enregistrements n'ont pas d'heure de début de partie. Les scores et durées de session commencent à partir de 0.6.0 ; les anciens points et tentatives demeurent inchangés.
- Lors du passage des diapositives en arrière, un défi d'échecs ne doit pas octroyer des points une seconde fois. Préserver la logique d'enregistrement unique et éviter les doublons lors d'un double clic sur « Terminer ».

## Version 0.7.0 — Importation des activités HTML et visibilité parentale

- Les trois activités inspirées des HTML fournis par l'utilisateur sont **réimplémentées en composants React**, sans exécution des scripts HTML ni iframe : `src/components/PlantPlay.tsx`, `VerbPlay.tsx`, `DutchNumbersPlay.tsx`. Leurs contenus originaux, déroulement et corrections sont dans `src/games/plantData.ts`, `verbData.ts`, `dutchNumbers.ts`. **Conserver leurs mécanismes originaux**, notamment l'ordre de croissance et la saisie des mots, le repérage des verbes/indices/révision, la génération de nombres/orthographe/indices/reprise des erreurs.
- Les catégories sont pilotées par `src/lib/catalog.ts` ; `nature` / Natuur a été ajoutée et les nouvelles activités sont dans **Natuur**, **Wiskunde** et **Français**. Tout nouveau pack ou cours compatible apparaît par défaut automatiquement.
- Les préférences parentales sont des **exclusions d'affichage**, jamais une liste blanche. `src/lib/storage.ts` stocke uniquement les IDs masqués dans une table additive `hidden_activities` (localStorage dans le navigateur), `src/lib/activityVisibility.ts` filtre les cartes et « Continuer mon aventure » ; **l'absence de préférence signifie visible**, même pour un contenu ajouté des mois plus tard. Ne pas effacer les exclusions après mises à jour.
- Les activités masquées restent présentes dans Paramètres, réactivables sans supprimer les points ni l'historique. Les sessions des jeux importés utilisent les mêmes `saveAnswer` (+10 sans erreur/indice) et `saveCompletedSession` (nombre de réussites, durée) que les moteurs précédents ; ne pas compter les parties abandonnées.
- Toujours ajouter une nouvelle entrée à **`docs/DEVELOPMENT_LOG.md`** à chaque modification, en respectant la règle append-only.

## Catégories après 0.7.1 — plantes dans Nederlands

- Il n'existe que **quatre matières** : Wiskunde, Français, Nederlands et Échecs. « De plant · Speeltuin » (ID `plant-playground`) est un **jeu de Nederlands**, non une catégorie Natuur distincte.
- La valeur legacy `category: "nature"` des anciens packs téléchargés doit être mappée vers Nederlands pour éviter de les perdre. Ne pas supprimer ni réinitialiser les préférences de masquage liées à l'ID ni leurs historiques.

## Version 0.8.0 — Catalogue pédagogique distant sans réinstallation

- Le catalogue de **présentation** est dans `site/catalog.json` : `schemaVersion: 1`, `version` entier strictement croissant, `categories[]` (matières) et `activities[]` (surcharges d'affichage par ID stable). **Une fois KidQuest 0.8.0 installé**, les changements des matières, intitulés, descriptions, icônes et ordre de cartes passent par ce fichier sans reconstruire l'application.
- `scripts/generate-manifest.mjs` recalcule le SHA-256 exact de `site/catalog.json` et publie `catalog` (version, URL, hash) dans `site/manifest.json`, en plus des packs de questions. `.github/workflows/pages.yml` réagit aux changements de `site/catalog.json` et régénère **automatiquement** le manifeste après merge. Ne jamais éditer `site/manifest.json` à la main.
- **Pour déplacer ou renommer une activité :** modifier uniquement la bonne entrée `activities[]`, **augmenter `version`**, ajouter une entrée dans `docs/DEVELOPMENT_LOG.md` dans la même Pull Request, puis fusionner après validation. Patienter le temps de la publication du manifeste. L'enfant clique sur « Vérifier les mises à jour » ou relance KidQuest pour récupérer la configuration.
- **Pour ajouter/renommer une matière :** utiliser `categories[]`, avec ID stable, titre, sous-titre, emoji, classe de couleur connue et langue. L'ordre est déterminé par `order`. Un ID d'activité inexistant dans les packs/composants installés ne déclenche **aucun** nouveau moteur : le catalogue ne contient que des **données**.
- `src/lib/catalogConfig.ts` valide strictement la structure et les tailles de métadonnées. `src/lib/updates.ts` compare le SHA-256 publié et la version, puis sauvegarde la configuration dans la table SQLite additive `remote_catalog` par `src/lib/storage.ts`. Si Internet manque, conserver la dernière configuration validée, ou les catégories intégrées si aucune copie n'existe.
- Les identifiants de cours, `hidden_activities`, les points, `attempts` et `completed_sessions` restent inchangés. Les activités neuves restent **visibles par défaut** jusqu'au masquage parental.
- **Ne jamais prétendre qu'un nouveau moteur de jeu ou une nouvelle animation exécutable peut arriver par catalogue JSON** : l'ajout de code React/Rust/Three.js nécessite toujours un nouvel installateur tant que Tauri Updater signé n'est pas activé.

## Version 0.9.0 — Chaque nouvelle activité possède son propre dossier de médias

- **Lire `docs/ACTIVITY_BUNDLES.md` avant de créer une activité.** Le chemin standard des nouvelles activités téléchargeables est `site/activities/<id>/pack.json`, avec les ressources facultatives `site/activities/<id>/assets/*`. Les formats autorisés sont JPG/PNG/WebP/GIF/MP4/WebM/MP3/OGG/WAV. Les noms de fichiers et IDs doivent être stables.
- Le workflow `pages.yml` répertorie chaque dossier et calcule les SHA-256 des questions et médias via `scripts/generate-manifest.mjs`. Le workflow Windows vérifie ce processus. **Ne jamais modifier `site/manifest.json` à la main**.
- `src/lib/updates.ts` télécharge `manifest.activities[]` indépendamment des packs historiques et du catalogue, valide les empreintes, télécharge uniquement les médias manquants/altérés, et **active le pack après la réception de tous les fichiers**. Ne pas écraser une ancienne version en cas d'erreur réseau.
- Les nouveaux médias sont enregistrés par les commandes Rust sécurisées de `src-tauri/src/lib.rs` dans le dossier Windows de données locales `activities/<id>/assets/` ; `src/components/QuestionMedia.tsx` lit les images/GIF/vidéos/audio **hors ligne** via des URL `blob:`. Ne pas ajouter d'exécution de code distant, chemin `../`, SVG non filtré ni script HTML.
- Le premier exemple est `site/activities/dieren-nl` : huit photographies animalières CC0, et huit questions néerlandaises `subject: "dutch"`. Les références et licences sont consignées dans `photo-sources.json`, les photographies sont copiées et publiées dans `assets/` par le workflow.
- **Augmenter la version** de `pack.json` pour modifier les questions ou les fichiers ; préserver les IDs de questions et le statut Visible/Masqué. Tout nouveau contenu est visible par défaut. Pour un nouveau moteur interactif React/Rust, une mise à jour de l'application reste nécessaire.
- Toute modification d'activité ou de schéma doit être documentée dans la même PR en ajoutant à la fin de `docs/DEVELOPMENT_LOG.md` une entrée datée, sans toucher aux entrées précédentes.
