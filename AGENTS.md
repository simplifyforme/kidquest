# KidQuest — Consignes aux futurs agents IA

Tu travailles sur une application Windows 11 Tauri 2 / React 19 / TypeScript en français, **offline-first**, pour un enfant d'environ 8 ans.

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
