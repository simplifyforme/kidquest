# État du MVP — 21 novembre 2026

## Réalisé
- Interface KidQuest Académie ludique React/TypeScript
- Exercices de calcul, nombres en lettres, français et néerlandais débutant
- Points, niveaux, séries et résultats par quiz
- Sauvegarde des tentatives dans SQLite sur Windows 11 ; simulation localStorage dans le navigateur
- Fonctionnement autonome sans connexion pour les packs intégrés
- Téléchargement de packs JSON versionnés via manifeste GitHub public et vérification SHA-256
- Workflow automatique de génération du catalogue avec SHA-256
- Workflow de build Windows NSIS et tests automatisés
- Documentation AGENTS.md pour transfert à un agent IA

## Limites / étapes nécessaires
- Les mises à jour de **l'application elle-même** restent désactivées tant que la paire de clés Tauri Updater, les secrets GitHub et l'endpoint de releases signées ne sont pas mis en place.
- Un essai de l'installateur sur le véritable PC Windows 11 de l'enfant reste nécessaire (WebView2, antivirus, affichage, voix néerlandaise).
- L'app ne possède pas encore de moteurs de jeux supplémentaires ni de contrôle parental.
- Les packs JSON sont validés et hachés, mais la signature autonome du manifeste est une amélioration de sécurité future.
- L'application n'a pas de certificat Windows Authenticode et peut déclencher SmartScreen.

## Installation
Ouvrir l'onglet Actions du dépôt, choisir le dernier run Windows installer réussi, puis télécharger l'artefact kidquest-windows-installer. Décompresser et ouvrir l'exécutable .exe NSIS. La base SQLite est locale et préservée lors des mises à jour normales.

## Correctif 0.1.1 — lancement Windows

- Signalement : installation réussie mais application ne démarre pas sur Windows 10 et 11.
- Cause probable vérifiée dans le code : le plugin Rust Tauri Updater était enregistré dès le démarrage sans `plugins.updater.pubkey`. La configuration manquante peut provoquer un panic dans Tauri.
- Correctif : retirer l'enregistrement du plugin updater tant qu'il n'est pas configuré, en conservant la mise à jour des packs JSON.
- Ne pas réintroduire `.plugin(tauri_plugin_updater::Builder::new().build())` avant d'avoir créé la clé publique, les endpoints et des releases signées.
- Il faudra tester le lancement effectif sur Windows et, si l'application ne démarre toujours pas, collecter un journal de crash.

## Correctif 0.1.2 — missions dynamiques

- Après téléchargement, les exercices étaient bien installés mais les quatre cartes d'accueil étaient codées en dur et les questions des packs étaient mélangées au néerlandais de base.
- Désormais, `src/lib/activities.ts` construit les missions à partir des packs intégrés et téléchargés. Un nouveau pack compatible apparaît comme une **nouvelle carte**, avec sa propre liste de questions, sans nouveau code ni nouvelle installation lors des prochaines publications de packs.
- Pour activer **cette première amélioration du moteur de missions**, il faut installer une fois la version 0.1.2 (les mises à jour binaires automatiques sont encore désactivées). Les points et les packs enregistrés sous SQLite sont conservés.
- Exemple attendu : quatre missions intégrées plus deux missions téléchargées (bonus néerlandais et verbes) = six cartes, 76 questions au total.

## Version 0.2.0 — variété pédagogique

- Dix modes implémentés : QCM, écriture libre, vrai/faux, duel, lettres mélangées, mots mélangés, lettres manquantes, associer 3 paires, memory et curseur numérique.
- Les quatre matières intégrées et tous les packs téléchargés utilisent le même moteur adaptatif ; aucun changement au schéma JSON ni SQLite.
- Le moteur détermine automatiquement le mode en fonction de la réponse et de la session ; l'enfant ne peut pas choisir la méthode.
- Des tests unitaires couvrent les dix modes et la compatibilité avec les quatre cours intégrés.
- L'installation de l'exécutable 0.2.0 reste nécessaire une fois pour accéder aux nouveaux moteurs. Les nouvelles questions continueront à arriver via GitHub sans réinstallation.
- Validation visuelle et essais sur le vrai PC de l'enfant restent nécessaires.

## Version 0.3.0 — cours d'échecs interactif animé

- Nouvelle carte « Les échecs : mes premiers pas », 20 étapes, mouvements animés sur échiquier, explications lues à haute voix et défis où l'enfant clique sur la bonne case.
- Cours utilisable hors ligne après installation, couvrant les 6 types de pièces, le déplacement/capture du pion, l'échec, l'échec et mat, le roque, la promotion et le pat.
- Lecture avec les voix françaises disponibles sur le PC ; la sélection d'une voix masculine est tentée par son nom et **n'est pas garantie**. Le surlignage mot par mot dépend des événements `boundary` de la voix utilisée.
- Les points des défis sont ajoutés via la structure de sauvegarde SQLite existante, sans migration des données ni modification du catalogue des packs de quiz.
- Les nouvelles leçons animées restent à distribuer via des packs versionnés dans une évolution future. La première leçon est embarquée, donc 0.3.0 exige une nouvelle installation.

## Version 0.4.0 — Affichage d'échecs 3D cartoon

- Échiquier 3D stylisé en volume avec les six types de pièces, animations de déplacement et sauts du cavalier, caméra orientable, zoom et vues prédéfinies.
- Leçon d'échecs 0.3.0 réutilisée sans changement pédagogique ; défis et points identiques en 2D et 3D.
- Bouton 3D / 2D, préférence locale et retour automatique à la 2D si WebGL n'est pas disponible.
- Pas de fichiers 3D distants ; les modèles sont construits localement avec Three.js.
- Installation Windows 0.4.0 requise une fois ; les exercices téléchargés et les points restent préservés.


## Version 0.5.0 — accueil par matières et Wiskunde

- L'accueil contient quatre matières au lieu de toutes les activités : Wiskunde, Français, Nederlands et Échecs, chacune avec une page de cours/exercices.
- Un accès « Continuer mon aventure » se souvient du dernier contenu ouvert.
- Tous les exercices intégrés de maths et nombres (20 questions) sont en néerlandais belge, y compris les réponses en toutes lettres, consignes et corrections. Les 100 multiplications du pack distant sont traduites en version 2 et distribuées via GitHub.
- Les dix moteurs d'exercices sont désormais entièrement localisés en néerlandais lorsqu'ils présentent des questions mathématiques. Les matières français, néerlandais et échecs conservent leurs contenus.
- Les packs existants restent compatibles ; les question IDs, les réponses valides et la progression SQLite sont conservés.
- L'installation de KidQuest 0.5.0 est nécessaire pour la nouvelle organisation et l'interface mathématique localisée. La v2 des multiplications est téléchargée automatiquement après publication du manifeste.


## Version 0.6.0 — statistiques d'apprentissage

- Nombre de réalisations affiché pour chaque exercice et leçon dans leur catégorie.
- Paramètres → Historique : chaque contenu a un panneau dépliable avec nombre de sessions, score maximal, moyenne, meilleur temps et liste de toutes les sessions (date, résultat, durée).
- Début/fin mesurés pour chaque partie terminée, sur Windows dans la nouvelle table \`completed_sessions\`. Aucune partie abandonnée n'est comptabilisée.
- Les points et anciennes tentatives ne changent pas ; les sessions antérieures à 0.6.0 n'ont pas de durée calculable et ne sont donc pas artificiellement ajoutées aux nouveaux compteurs.
- Nouveau moteur d'historique compatible avec toutes les matières et les cours d'échecs 2D/3D.

## Version 0.7.0 — Trois activités HTML adaptées et visibilité des cours

- « De plant · Speeltuin » dans la nouvelle matière **Natuur** : 6 mini-jeux, 33 questions sur les plantes, besoins, fonctions, croissance, bulbes et tubercules, écriture et aide français.
- « Getallenheld » dans **Wiskunde** : exercice autonome en néerlandais sur les nombres 0–1000, écriture chiffres/lettres, difficulté configurable, indices, révision des fautes.
- « La chasse aux verbes » dans **Français** : 4 missions et 37 questions avec leçon de grammaire, verbe conjugué, infinitif, groupes, indices et révision.
- Importation via composants React natifs, sans exécution directe des scripts HTML. Les activités sont accessibles hors ligne après installation de KidQuest 0.7.0 et leurs performances sont enregistrées dans l'historique de sessions.
- Paramètres : cases « Visible » / « Masqué » pour **toutes les activités**, y compris les futurs packs JSON. Nouveau contenu toujours visible par défaut ; masquer un contenu ne supprime ni les points ni l'historique.
- Les anciens exercices, leçons 2D/3D, pack IDs et données SQLite sont conservés ; seule une table `hidden_activities` est ajoutée. Nouvelle installation de l'application nécessaire pour les nouveaux moteurs interactifs.

## Version 0.7.1 — Cours sur les plantes dans Nederlands

- « De plant · Speeltuin » apparaît dans **Nederlands**, avec les autres exercices de néerlandais ; suppression de la catégorie Natuur séparée de l'accueil.
- Les jeux, points, anciens scores, durée et choix Visible/Masqué sont conservés, grâce au même identifiant de l'activité.
- Les anciens packs téléchargés ayant la catégorie facultative `nature` restent compatibles : ils sont affichés sous Nederlands.
- Nouvelle installation Windows 0.7.1 requise pour voir le changement d'organisation.

## Version 0.8.0 — Matières et cartes reconfigurables sans réinstallation

- Nouveau `site/catalog.json` : version du catalogue, catégories et métadonnées de présentation par activité (matière, titre, sous-titre, emoji et ordre).
- Mise à jour automatique via le même manifeste GitHub et le même bouton « Vérifier les mises à jour » ; le manifeste inclut désormais le SHA-256 du catalogue, généré automatiquement.
- Cache SQLite `remote_catalog` ajouté sans migration destructive : le dernier catalogue validé reste disponible hors ligne ; les catégories intégrées servent de secours.
- Les activités existantes, leurs IDs, points, historique, sessions et réglages Visible/Masqué sont conservés. Les futurs contenus restent visibles par défaut.
- Cette première activation nécessite l'installation Windows **0.8.0 une fois**. Ensuite les déplacements, titres et ordres de cours passent simplement par la modification du JSON distant, sans nouvel installateur.
- Un nouveau moteur/jeu/animation en React/Three.js/Rust exige toujours un nouvel installateur. L'updater binaire signé reste désactivé.

## Version 0.9.0 — Dossiers indépendants d'activités et quiz d'animaux néerlandais

- Le premier dossier `site/activities/dieren-nl/` contient le pack « Dieren herkennen met foto's », huit questions néerlandaises et les sources photographiques CC0, avec des photos répliquées dans `assets/` par GitHub Actions.
- Les activités futures peuvent conserver leurs propres JPG, PNG, WebP, GIF, MP4, WebM, MP3, OGG et WAV. GitHub publie un manifeste complet des ressources ; KidQuest les télécharge, vérifie SHA-256, installe sous `activities/<id>/assets/` et les affiche hors ligne.
- Les fichiers déjà présents avec un SHA-256 valide sont réutilisés. La sauvegarde du nouveau pack de questions est reportée jusqu'à l'arrivée de tous ses médias.
- Les nouvelles activités sont visibles par défaut, peuvent être masquées depuis Paramètres et utilisent le score/historique des packs existants.
- Une première installation Windows **0.9.0** est nécessaire pour le moteur multimédia ; les nouveaux contenus compatibles et leurs médias s'installent ensuite sans reconstruire l'application. Les anciens packs et jeux intégrés sont conservés.
- Types et tailles sont restreints : pas de script distant, HTML/JS exécutable ni extension arbitraire. Les nouveaux moteurs programmés requièrent toujours un nouvel installateur.

## Version 0.9.1 — Corps humain illustré, écriture et puzzles

- « Mijn lichaam · Kijk, schrijf en speel! » v2 : 24 illustrations ciblées, noms français très courts, 72 défis (QCM, saisie, lettres) dans Nederlands — École.
- Installer 0.9.1 une fois pour conserver l’image pendant l’écriture et les lettres ; la v2 du contenu s’obtient par « Vérifier les mises à jour ». Les anciens 0.9.0 gardent les QCM visuels.
- Les autres quiz photo, points, historiques et préférences restent compatibles. Updater binaire signé toujours désactivé.
