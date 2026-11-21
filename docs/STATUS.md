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
