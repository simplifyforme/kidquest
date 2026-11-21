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
