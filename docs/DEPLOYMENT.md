# Publication et installation Windows

## Premier exécutable

1. Déclencher l'action `Windows installer` sur GitHub (ou pousser les modifications).
2. Attendre le job Windows, puis ouvrir ses `Artifacts`.
3. Télécharger `kidquest-windows-installer`.
4. Décompresser et installer le `.exe` NSIS sur Windows 11.

Windows SmartScreen peut avertir si l'application n'a pas de certificat Authenticode de confiance. Le premier build doit être validé sur le PC réel. Les mises à jour Windows de Tauri utilisent une signature séparée de ce certificat.

## Automatisation des packs

Créer un dépôt GitHub Pages public `simplifyforme/kidquest-content` avec `manifest.json` et `packs/*.json`, puis activer Pages. L'URL est déjà présente dans `src/lib/updates.ts`. Un pack téléchargé et valide remplace sa version dans SQLite ; un échec réseau ne bloque pas les contenus locaux.

## Activer les mises à jour Tauri signées

**Non activées dans ce MVP** : ne pas activer sans vérifier l'ensemble de la chaîne de confiance.

1. Générer une paire de clés Ed25519 via `npm run tauri signer generate` (suivre la documentation Tauri 2).
2. Conserver la clé privée et son mot de passe hors du dépôt, dans les Secrets GitHub Actions (`TAURI_SIGNING_PRIVATE_KEY`, `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`).
3. Ajouter la clé publique dans `src-tauri/tauri.conf.json` section `plugins.updater.pubkey` et un endpoint public au format Tauri Updater.
4. Configurer la CI release pour émettre les artefacts signés et le manifeste.
5. Après tests réels, passer `APP_UPDATE_ENABLED` à `true` dans `src/lib/updates.ts`.
6. Tester une mise à jour Windows de bout en bout, y compris l'absence de réseau, les interruptions et le redémarrage.

L'application n'installe **jamais** de code distant non signé à partir de packs de quiz.
