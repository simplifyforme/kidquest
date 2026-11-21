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
