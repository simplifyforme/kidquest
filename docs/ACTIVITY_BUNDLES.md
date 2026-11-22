# Dossiers d'activité autonomes — KidQuest 0.9.0+

Une activité installable est un **dossier indépendant**. Les nouvelles activités pédagogiques basées sur les moteurs existants peuvent être ajoutées ou modifiées sur GitHub sans recompiler l'application.

## Structure GitHub

```text
site/
  activities/
    dieren-nl/
      pack.json                # questions, réponses, catégorie, version
      photo-sources.json       # facultatif : sources CC0 pour des photos
      README.md
      assets/
        kat.jpg
        hond.jpg
        paard.jpg
        koe.jpg
        ...
    une-autre-activite/
      pack.json
      assets/
        illustration.png
        demonstration.gif
        video.mp4
        prononciation.mp3
  catalog.json                # organisation globale des catégories
  manifest.json               # généré automatiquement, ne pas éditer
```

La publication GitHub construit une liste des dossiers installables dans `manifest.activities[]`. Pour chaque dossier, elle publie **l'identifiant, la version, les URL, tailles, types MIME et empreintes SHA-256** des ressources. Le dossier source peut contenir plusieurs formats sans devoir modifier l'application pour chaque nouveau fichier.

Les photos d'animaux du premier pack proviennent de pages Wikimedia Commons déclarées CC0 1.0 dans `photo-sources.json`. Un script les copie dans le dossier `assets/` sur GitHub avant publication du manifeste. Sur le PC de l'enfant, KidQuest ne charge jamais les photos directement depuis Wikimedia : il les télécharge depuis le dépôt GitHub puis les utilise depuis son propre dossier local.

## Contrat `pack.json`

Il garde le contrat `ContentPack` existant : `id`, `version`, `title`, `category`, `locale`, `questions[]`. Chaque question peut désormais référencer un média **du même dossier** :

```json
{
  "id": "animal-nl-kat",
  "subject": "dutch",
  "skill": "dieren",
  "prompt": "Welk dier zie je op de foto?",
  "answers": [
    { "id": "a0", "label": "de kat" },
    { "id": "a1", "label": "de hond" }
  ],
  "correctAnswerId": "a0",
  "explanation": "Dit dier heet de kat.",
  "media": { "type": "image", "file": "kat.jpg", "alt": "Foto van een dier." }
}
```

Types de média acceptés : `image` (jpg, jpeg, png, webp), `gif` (gif animé), `video` (mp4, webm), `audio` (mp3, ogg, wav). Les fichiers doivent porter **un nom simple**, sans slash, chemin absolu ou `..`. Aucun téléchargement de JavaScript, HTML, EXE, DLL ou SVG exécutable n'est autorisé.

## Comment une mise à jour fonctionne

1. Modifier le dossier `site/activities/<id>/`, **augmenter `pack.json.version`** et préserver les anciens IDs de questions.
2. Ajouter la modification au journal `docs/DEVELOPMENT_LOG.md` dans la même Pull Request (règle impérative).
3. GitHub Actions importe si nécessaire les photos CC0 déclarées, calcule tous les SHA-256 et publie un `site/manifest.json` à jour.
4. L'enfant ouvre KidQuest 0.9.0+ et clique sur « Vérifier les mises à jour » (une vérification est aussi lancée au démarrage).
5. L'application vérifie la version et le SHA-256 du fichier `pack.json`, puis **télécharge chaque ressource absente ou différente**, vérifie son empreinte et la sauvegarde localement dans `activities/<id>/assets/`.
6. Le pack de questions n'est activé dans SQLite **qu'après le succès de tous les médias** ; en cas d'échec, l'ancien contenu et les anciens points sont conservés. Les fichiers déjà présents avec le bon SHA-256 ne sont pas téléchargés à nouveau.
7. Après l'installation, la lecture des photos, animations, vidéos et sons fonctionne **hors ligne** grâce aux fichiers locaux. Le même cours reste visible par défaut et peut être masqué depuis Paramètres.

**Dossiers Windows** : dans les données locales de KidQuest, sous `AppLocalData/activities/<id>/assets`. Ces fichiers ne sont pas placés dans `Program Files` et ne sont pas effacés par une mise à jour normale. Le stockage SQLite et les médias sont indépendants, reliés par un identifiant de pack stable.

## Compatibilité et limites

- Les packs antérieurs sous `site/packs/` restent utilisables et distribués par l'ancien manifeste. Les activités intégrées historiques (échecs 3D, jeux de plantes, verbes) restent dans le programme jusqu'à leur migration future vers des moteurs de contenu déclaratifs.
- Un nouveau jeu **basé sur un moteur disponible** (QCM avec photos, quiz de texte, etc.) est installable sans changer le code Windows.
- **Une nouvelle mécanique d'interaction, une nouvelle animation programmée ou un nouveau moteur React/Rust** nécessitent encore une mise à jour binaire de KidQuest. Les vidéos/GIF ne sont que des médias de contenu, pas des plugins exécutables.
- Le manifeste et les médias sont récupérés depuis HTTPS/GitHub ; l'empreinte SHA-256 garantit leur intégrité par rapport au manifeste (pas une signature d'éditeur indépendante).
- Taille maximale par média : 20 Mo. Taille maximale totale des médias d'une activité : 60 Mo. Maximum 80 ressources par activité.
- Les corrections d'une activité existante requièrent d'augmenter le numéro `version` pour être appliquées ; ce processus ne touche jamais à `attempts`, `completed_sessions` ou `hidden_activities`.

## Questions illustrées : écrire et reconstruire (0.9.1)

Le champ facultatif `Question.responseMode` accepte `choice`, `write` ou `letters` **avec un média de type image**. Sans ce champ, les anciens quiz photo restent en QCM. Chaque question choisit son interaction, sans sélecteur pour l’enfant. `QuestionMedia` reste au-dessus de `ExercisePlay`, donc l’image est visible pendant la saisie et le puzzle. Les modes memory et association ne sont pas utilisés pour ces questions : ils n’affichent pas les images des autres cartes.

Un puzzle de lettres avec une réponse trop longue (plus de 15 caractères hors espaces) ou trop courte revient à l’écriture. Les modes inconnus, sans image ou associés à de l’audio/vidéo sont rejetés à la validation. Les anciens clients 0.9.0 ignorent ce champ et restent en QCM. Installer **0.9.1 une fois** pour obtenir la saisie et les lettres illustrées. Le format des médias, les empreintes, les points et les sessions restent inchangés.

`Question.promptLocale?: "fr-BE" | "nl-BE"` permet de lire un repère français avec la voix française tout en conservant l’interface et les réponses en néerlandais. Sans ce champ, le comportement de lecture existant est conservé. Les valeurs inconnues sont rejetées.
