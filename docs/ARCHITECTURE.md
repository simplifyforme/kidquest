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
