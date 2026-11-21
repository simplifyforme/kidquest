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

Le manifeste publié à `https://raw.githubusercontent.com/simplifyforme/kidquest/main/site/manifest.json` aura ce format :

```json
{
  "schemaVersion": 1,
  "packs": [{
    "id": "neerlandais-bonjour",
    "version": 2,
    "url": "https://raw.githubusercontent.com/simplifyforme/kidquest/main/site/packs/neerlandais-bonjour.json",
    "sha256": "HASH_SHA256_DU_FICHIER_JSON"
  }]
}
```

Le SHA-256 doit être calculé sur les **octets exacts** du fichier JSON distribué, pas sur un JSON reformaté. Les packs intégrés en application gardent leurs versions ; une version distante plus élevée remplace le pack correspondant dans le stockage. Les nouvelles questions doivent avoir des identifiants stables. Aucun code téléchargé ne doit être exécuté.

## Catalogue d'organisation sans réinstallation (version 0.8.0+)

**Le fichier source est `site/catalog.json`**. Ne pas le confondre avec les packs `site/packs/*.json` : le catalogue peut déplacer/renommer des activités existantes, mais il ne contient aucune question ni code exécutable.

```json
{
  "schemaVersion": 1,
  "version": 2,
  "categories": [
    {"id":"dutch","title":"Nederlands","emoji":"🇳🇱","subtitle":"Lire, jouer et découvrir","colorClass":"dutch","language":"fr-BE","order":2}
  ],
  "activities": [
    {"id":"plant-playground","category":"dutch","title":"De plant · Speeltuin","subtitle":"Planten en bloemen","emoji":"🌱","order":10}
  ]
}
```

- En pratique, garder les catégories déjà présentes et adapter/ajouter uniquement les entrées souhaitées. IDs de catégorie : minuscules/chiffres/tirets ; les classes de couleur acceptées sont `math`, `french`, `dutch`, `chess` et `nature`. Langues acceptées : `fr-BE`, `nl-BE`.
- **Incrémenter le champ `version` à chaque changement du fichier.** La nouvelle version remplace l'ancienne en SQLite seulement si son numéro est supérieur.
- Fusionner via PR avec entrée datée dans `docs/DEVELOPMENT_LOG.md`. Le workflow `pages.yml` détecte le changement, recalcule l'empreinte SHA-256 du catalogue et publie le nouveau `site/manifest.json` automatiquement.
- L'application 0.8.0+ récupère le catalogue au lancement ou via le bouton de mise à jour ; elle vérifie HTTPS, version, SHA-256 et schéma avant de l'utiliser et conserve la copie locale pour l'usage hors ligne.
- Tous les packs JSON téléchargés, même nouvellement publiés, restent visibles par défaut sauf exclusion explicite depuis Paramètres. Les surcharges d'ID inconnu n'exécutent jamais un nouveau jeu ; nouveaux moteurs React nécessitent encore un nouvel installateur.
