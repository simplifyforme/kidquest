# Architecture KidQuest V1

## Architecture en couches

- `src/data/builtin.ts` : 4 packs intégrés et jouables hors ligne.
- `src/types.ts` : contrats Question, ContentPack, Progress, Manifest.
- `src/App.tsx` : UI React, missions, quiz, résultats, paramètres.
- `src/lib/activities.ts` : génère les cartes de missions à partir des packs installés. Les quatre missions initiales restent visibles ; chaque nouveau pack distinct apparaît automatiquement comme une carte, avec des questions filtrées par pack.
- `src/lib/storage.ts` : persistance SQLite (Tauri), localStorage (navigateur).
- `src/lib/updates.ts` : lecture manifest HTTPS, validation SHA-256 et version, téléchargement et installation de packs, futur updater signé.
- `src-tauri` : shell Windows Tauri et plugins.

## Pipeline de question

Choix d'une matière -> filtrage des questions installées -> mélange des questions et réponses -> interaction -> validation côté UI -> transaction persistante de l'essai et des points -> progression.

## Extensions futures

- Extraire l'interface commune `GameRenderer` quand un deuxième moteur sera développé, plutôt que d'inventer une API abstraite inutile avant de l'utiliser.
- Algorithme de répétition espacée par compétence.
- Question écrite au clavier, memory, glisser-déposer, audio.
- Contrôle parental avec PIN local.
- Signature du manifeste des contenus, quota de stockage et téléchargement en staging.

## Limitations connues V1

- Les packs téléchargés n'ont pas encore de signature d'éditeur indépendante (contrôle SHA-256 avec manifeste servi par HTTPS).
- L'updater de l'application doit être activé après la configuration des clés.
- Pas encore de contrôle fin de difficulté, ni de répétition espacée.
- Pas de télémetrie ni de comptes en ligne.

## Moteur d'exercices 0.2.0 — 10 interactions

- \`src/lib/exerciseModes.ts\` : planificateur déterministe par session, compatibilité des modes avec le contenu existant, comparaison de texte (casse/accents/ponctuation), choix des 3 paires de questions pour le jeu de mémoire/association.
- \`src/components/ExercisePlay.tsx\` : dix interfaces indépendantes réutilisant \`Question\`. Le parent garde la transaction SQLite et le score (+10 pour une réponse correcte).
- \`src/App.tsx\` : prépare le plan de 8 questions à chaque partie et laisse le moteur choisir les modes automatiquement. L'enfant ne choisit pas de méthode.
- Modes : QCM 4 réponses, réponse écrite, vrai/faux, duel 2 choix, lettres à remettre en ordre, mots à remettre en ordre, lettres manquantes, association de 3 paires, memory de 3 paires, curseur numérique 0–100.
- Les modes ne sont activés que lorsqu'ils sont pédagogiquement adaptés : le curseur exige une réponse numérique, la banque de mots une réponse de plusieurs mots, et les associations trois réponses distinctes dans le pack. Tous les packs existants peuvent utiliser plusieurs méthodes sans modifier leur JSON.
- Association/memory comptent une tentative et rapportent 10 points si toutes les paires ont été réussies sans erreur ; une erreur entraîne 0 point mais n'empêche pas de finir le jeu. Le suivi SQLite reste compatible.
- Les futures questions téléchargées utilisent automatiquement les mêmes modes. N'ajouter du code que si un nouveau type d'exercice ou un nouveau moteur est requis.

## Nouveau moteur 0.3.0 : leçons animées

- `src/lessons/chessTypes.ts` : contrat `AnimatedLesson` / `ChessScene` (texte + pièces + séquence de déplacements + défi de compréhension). Ces données sont intégrées à la version Windows pour un fonctionnement hors ligne.
- `src/lessons/chessBeginner.ts` : cours de 20 scènes débutant, six types de pièces, prise en diagonale, échec, mat, roque, promotion et pat, avec défis intermédiaires.
- `src/components/AnimatedChessBoard.tsx` : plateau interactif avec coordonnées et animation CSS des pièces, contrôles accessibles au clavier.
- `src/components/AnimatedLessonPlayer.tsx` : lecteur de scènes, lecture vocale système Windows via Web Speech API, surlignage mot par mot si l'API émet les événements `boundary`, replay et vérification des défis par clic sur une case.
- `src/App.tsx` : nouvelle carte de leçon sur l'accueil et enregistrement des défis dans les tentatives SQLite (+10 si réussi au premier essai), sans toucher aux anciennes données.

**Restrictions** : le choix d'une voix masculine et les événements mot par mot dépendent des voix installées et du moteur vocal Windows/WebView2. Aucun service de voix tiers ni serveur n'est requis. Les nouvelles leçons ne sont pas encore distribuées à distance via le manifeste des packs de quiz : le moteur et sa première leçon sont fournis avec le nouvel installateur 0.3.0.

## Version 0.4.0 — Échiquier cartoon 3D avec option 2D

- `src/components/CartoonChessBoard3D.tsx` : rendu Three.js local de l'échiquier et des six types de pièces en volumes cartoon, lumières, ombres, zoom et rotation de caméra à la souris.
- `src/lib/chess3d.ts` : coordonnées communes entre les positions notation échiquéenne et l'espace 3D. Les blancs sont toujours en bas ; h1 est une case claire.
- `src/components/AnimatedLessonPlayer.tsx` : interrupteur 3D / 2D (choix local mémorisé), vues inclinée et du dessus et retour automatique vers 2D en cas d'erreur WebGL. Le moteur de cours, les défis, la narration, les mouvements et le suivi SQLite restent communs.
- Ressources construites à partir de primitives géométriques, **sans modèles 3D externes ni téléchargement réseau**. Three.js est empaqueté dans l'installateur et fonctionnera hors ligne.
- L'interaction caméra 3D utilise la souris/le tactile. Pour la navigation par clavier entre les cases, préférer la vue 2D existante. Éviter d'imposer WebGL pour lancer KidQuest.
- Les leçons animées restent intégrées dans l'installateur ; il n'existe pas encore de mise à jour distante automatique pour les nouvelles leçons.


## Version 0.5.0 — catalogue par catégories et maths en néerlandais

- \`src/lib/catalog.ts\` : quatre catégories affichées sur l'accueil : **Wiskunde**, Français, Nederlands et Échecs. Les packs sont organisés dynamiquement par catégorie (nouvelle métadonnée facultative \`category\`) ou par matière \`subject\`. Les cours animés et exercices sont distincts dans chaque catégorie. Il n'y a plus de liste exhaustive de missions à l'accueil.
- \`src/App.tsx\` : navigation Accueil → Catégorie → Cours/Exercice, retour vers la catégorie, accès « Continuer mon aventure » conservé localement. L'enfant ne choisit pas la méthode de quiz.
- \`src/data/builtin.ts\` : les vingt exercices intégrés de maths (calcul et nombres en lettres) sont entièrement en néerlandais belge. Les identifiants de questions et réponses correctes sont inchangés. Les nombres précédemment en français sont désormais écrits en néerlandais.
- \`site/packs/tables-multiplication-1-10.json\` version 2 : 100 questions de multiplication en néerlandais (IDs et bonnes réponses conservés), distribuées automatiquement via le manifeste GitHub recalculé après fusion. Une compatibilité hors ligne traduit aussi les libellés de l'ancien pack v1 en attendant le téléchargement de la v2.
- \`src/lib/exerciseLocale.ts\` et \`src/components/ExercisePlay.tsx\` : libellés et consignes néerlandais des dix modes, de la validation, de la lecture vocale et des retours dans les quiz de \`math\` et \`numbers\`. Les autres matières restent en français. La voix des questions de maths est définie sur \`nl-BE\`, selon les voix disponibles sur le PC.
- \`ContentPack.category\` et \`ContentPack.locale\` sont des métadonnées **optionnelles** et rétrocompatibles ; validation d'énumération dans \`src/lib/updates.ts\`. Les points et données SQLite ne sont pas migrés ou effacés.


## Version 0.6.0 — suivi des réalisations par activité

- \`src/lib/storage.ts\` crée une nouvelle table \`completed_sessions\` si absente, avec clés id de session, activité, type quiz/leçon, horodatages début/fin, durée, bonnes réponses et total. Les données SQLite antérieures sont conservées.
- \`src/App.tsx\` crée un identifiant de session au lancement de l'activité ; l'enregistrement a lieu **uniquement à la fin**. La rubrique Paramètres affiche l'historique et les cartes catégories le nombre de fois où chaque activité est terminée.
- \`src/components/AnimatedLessonPlayer.tsx\` signale la fin du cours et garde la comptabilisation des défis, sans recréditer les points en cas de retour sur une diapositive déjà validée.
- \`src/lib/activityHistory.ts\` regroupe les données en compte, meilleur score, moyenne et durée minimale, indépendamment des données des packs téléchargés.
- Compatibilité navigateur : localStorage, sans nouvelles API. Persistance Windows : nouvelle table SQL ajoutée, aucun schéma existant changé.
- Les sessions historiques antérieures à la version 0.6.0 ne peuvent pas être reconstituées précisément (pas de durée mesurée). Les anciens scores cumulés restent présents.

## Version 0.7.0 — Jeux HTML intégrés nativement et activités masquables

- `src/games/plantData.ts` et `src/components/PlantPlay.tsx` : intégration de **De plant · Speeltuin** en Natuur (six jeux, 33 défis, ordre des étapes de croissance, réponses écrites et choix, indices français).
- `src/games/verbData.ts` et `src/components/VerbPlay.tsx` : **La chasse aux verbes** en Français (quatre missions et 37 questions, repérage du verbe conjugué, infinitif saisi ou choisi, groupes de conjugaison, aide-mémoire, indices, révision des questions ratées). Le balisage `<mark>` fourni dans les contenus est transformé **en éléments React sûrs**, jamais inséré via `innerHTML`.
- `src/games/dutchNumbers.ts` et `src/components/DutchNumbersPlay.tsx` : **Getallenheld** en Wiskunde, conversion des nombres néerlandais 0–1000 dans les deux sens, quatre niveaux, 5/10/15/20 questions, mélange et nombres difficiles, accents tolérés pour validation, indices, étoiles et reprise des erreurs.
- Ces nouvelles activités sont **embarquées** avec l'exécutable 0.7.0 (pas un téléchargement de scripts HTML). Les trois utilisent le contrat `GameCallbacks` et alimentent `saveAnswer` (réponse juste à la première tentative, sans indice : +10 points) et `saveCompletedSession` (session terminée et durée), sans nouveau schéma de questions JSON ni changement des ID des anciens packs.
- `src/lib/catalog.ts` inclut `kind: "interactive"` et la matière `nature` « Natuur ». Les packs pédagogiques JSON existants restent dynamiques, et les futures catégories facultatives sont validées par `src/lib/updates.ts`.
- `src/lib/storage.ts` ajoute la table `hidden_activities(activity_id PRIMARY KEY)` **sans migration destructive**. `getHiddenActivityIds` et `setActivityVisible` utilisent SQLite sur Windows, localStorage en développement navigateur. `src/lib/activityVisibility.ts` définit : **tout ID absent de la table est visible**. Le filtrage s'applique à l'accueil, aux listes par matière et à « Continuer mon aventure », mais pas aux entrées du panneau Paramètres ni à l'historique.
- Paramètres permet de désactiver/réactiver chaque cours ou exercice via une case à cocher. Les contenus ajoutés ultérieurement, y compris les nouveaux packs téléchargés, sont visibles **par défaut** jusqu'à désactivation manuelle.
