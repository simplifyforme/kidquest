# Packs pédagogiques

La structure `ContentPack` contient `id`, `version`, `title`, `questions[]`.

Exemple :

```json
{
  "id": "neerlandais-bonjour",
  "version": 2,
  "title": "Bonjour en néerlandais",
  "questions": [{
    "id": "nl-bonjour-01",
    "subject": "dutch",
    "skill": "salutations",
    "prompt": "Que signifie « Hallo » ?",
    "answers": [
      {"id":"a","label":"Salut"},
      {"id":"b","label":"Merci"}
    ],
    "correctAnswerId": "a",
    "explanation": "Hallo signifie Salut.",
    "emoji": "👋"
  }]
}
```

Le manifeste publié à `https://simplifyforme.github.io/kidquest-content/manifest.json` aura ce format :

```json
{
  "schemaVersion": 1,
  "packs": [{
    "id": "neerlandais-bonjour",
    "version": 2,
    "url": "https://simplifyforme.github.io/kidquest-content/packs/neerlandais-bonjour.json",
    "sha256": "HASH_SHA256_DU_FICHIER_JSON"
  }]
}
```

Le SHA-256 doit être calculé sur les **octets exacts** du fichier JSON distribué, pas sur un JSON reformaté. Les packs intégrés en application gardent leurs versions ; une version distante plus élevée remplace le pack correspondant dans le stockage. Les nouvelles questions doivent avoir des identifiants stables. Aucun code téléchargé ne doit être exécuté.
