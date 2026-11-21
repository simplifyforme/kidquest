# KidQuest 🌟

Application éducative Windows 11, **100 % utilisable hors ligne**, pour un enfant débutant en français et néerlandais.

## Contenu de la première version

- Calcul mental (additions, soustractions, multiplications)
- Écriture des nombres (français et néerlandais)
- Français (orthographe et vocabulaire)
- Mission néerlandais « Bonjour les mots ! » (salutations et couleurs)
- Points, série de bonnes réponses et trophées
- Sauvegarde SQLite sous Windows, secours localStorage dans le navigateur
- Packs pédagogiques JSON versionnés, avec contrôle SHA-256 et installation dans SQLite
- Vérification manuelle / automatique des contenus, hors ligne sans blocage
- Préparation des mises à jour signées de l'application via Tauri Updater

## Démarrage pour développement

Node.js 22+ et npm :

```bash
npm install
npm run dev
```

Pour produire une application Windows : installer Rust et les prérequis Tauri 2, puis :

```bash
npm run tauri dev
npm run tauri build
```

Pour obtenir le fichier d'installation sans Rust sur ton PC, utiliser le workflow **Windows installer** dans GitHub Actions (onglet Actions). Les fichiers d'installation se trouvent dans les *Artifacts* du run.

## Installation sur le PC de l'enfant

1. Télécharger l'artefact `kidquest-windows-installer` dans Actions.
2. Extraire l'archive ZIP.
3. Lancer le fichier `.exe` du répertoire `bundle/nsis`.
4. Lancer KidQuest depuis le menu Démarrer. Le premier lot d'exercices est intégré.

Le dépôt est actuellement public. Ne jamais y commiter des secrets de signature, des données privées ou des informations sur l'enfant.

## Mises à jour

Deux circuits **séparés** :

- **Contenu** : le manifeste `https://simplifyforme.github.io/kidquest-content/manifest.json` sera utilisé dès qu'un dépôt de contenus public sera publié. Les nouveaux packs sont enregistrés localement et survivent aux redémarrages.
- **Application** : Tauri Updater est câblé dans le code, mais doit être **activé après génération et configuration d'une paire de clés de signature** et publication d'un manifeste d'updates accessible publiquement. L'installation de l'app depuis les artefacts Actions est déjà possible. Le dépôt privé, si choisi ultérieurement, ne doit pas être utilisé comme endpoint public sans mécanisme de distribution.

Voir [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md), [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md), [docs/CONTENT_PACKS.md](docs/CONTENT_PACKS.md) et [AGENTS.md](AGENTS.md).

## Statut

**MVP développé — compilation Windows/installation réelle à valider dans GitHub Actions.** Le workflow de compilation ne constitue pas une preuve qu'un .exe a déjà été construit.
