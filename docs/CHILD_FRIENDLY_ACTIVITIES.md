# Aventures pour un débutant de 8 ans

Les modèles fournis par le parent sont `mijn_lichaam_avontuur.html` et `la_chasse_aux_verbes_aventure.html`. Ils servent de références pédagogiques : les jeux sont réimplémentés en React natif, sans iframe ni exécution de leurs scripts.

## Principes à conserver pour les prochains contenus

- Commencer par découvrir : image, mot, écoute ou une seule petite astuce avec un exemple.
- Donner une action concrète : toucher un mot, choisir, écrire, compléter, assembler ou retourner une carte.
- Garder un défi à l’écran, des boutons lisibles et des consignes courtes ; les explications plus longues appartiennent à la découverte.
- Permettre les nouveaux essais. Après une erreur, donner un indice puis montrer la réponse si nécessaire. Pas de chronomètre ni de vies perdues.
- Faire des manches courtes, renouveler les mélanges et proposer de revoir les difficultés.
- Féliciter les défis résolus ; les points de l’académie restent attribués aux réponses sans erreur ni aide. Enregistrer une seule tentative par défi résolu, une seule session par manche terminée et permettre la reprise après un échec de sauvegarde.
- Conserver les aides françaises pour le néerlandais débutant, lire les mots néerlandais avec `nl-BE` et, pour le corps humain à ce stade, travailler les mots sans de/het. Si l’enfant écrit spontanément un article, le jeu du corps l’ignore.

Les menus des **aventures interactives**, demandés par ces modèles, permettent de choisir une mission ou de découvrir. Les quiz JSON classiques conservent leur planificateur automatique : cette adaptation ne leur ajoute pas de sélecteur de méthode.

## KidQuest 0.10.0

### Corps humain — même ID `lichaamsdelen-nl`

`src/games/bodyAdventure.ts` contient les 24 mots et la fabrication des manches. `src/components/BodyAdventurePlay.tsx` propose Découvrir, Trouver, Écrire, Mot troué, Lettres, Memory et Grand défi. Les manches normales ont huit défis, le grand défi deux questions de chacun des quatre types. Le memory comporte six paires image–mot. Une mauvaise paire rend les deux mots concernés « à revoir » pour le score ; elle n’empêche pas de terminer.

Les 24 PNG sont intégrés au build par Vite, utilisables hors ligne dès l’installation. Les cartes cachées n’exposent ni leur image ni leur mot avant d’être retournées. Les temporisations du memory sont annulées quand on change de jeu. Les jeux d’écriture proposent des indices et la lecture du mot, avec un score sans aide distinct des défis résolus. Les nouvelles manches de révision utilisent de nouveaux identifiants de session.

Le catalogue affiche une seule carte sous l’ID historique : le moteur devient interactif en 0.10.0. Les points, les sessions, le masquage parental et le raccourci legacy `quiz:lichaamsdelen-nl` restent valides. Les 120 questions JSON v3 restent publiées et utilisables par les anciens clients ; aucune question ni donnée n’est supprimée. Le moteur natif possède son vocabulaire embarqué : pour étendre sa liste de mots ou ses interactions, il faut modifier les données natives et reconstruire l’application.

### Verbes — même ID `french-verb-hunt`

Les quatre missions et 37 questions initiales sont conservées, avec leurs clés de suivi. Deux missions supplémentaires (huit formes, huit prédicats) portent le contenu à 53 questions distinctes. Le nouveau Grand défi mélange dix questions couvrant cinq notions, deux par notion. Les autres missions sont mélangées au rejouage ; l’ancien défi final conserve ses séquences liées de trois questions par phrase.

Les mots de la phrase sont directement cliquables pour repérer le verbe. Les cinq astuces se lisent une par une ; les missions sur les formes et le prédicat sont dédiées. Les erreurs, indices, révisions et infinitifs tapés sont conservés. Les accents sont tolérés dans la saisie de l’infinitif. Les prédicats complets (« mange une pomme », « est calme ») sont distingués du verbe seul (« mange », « est ») ; « dort » peut constituer tout le prédicat. Être et avoir restent étudiés comme auxiliaires à part, conformément au cours existant.

## Distribution et vérification

Installer **KidQuest 0.10.0 une fois** pour ces nouveaux moteurs. Le catalogue v10 s’obtient ensuite par « Vérifier les mises à jour ». Un client ancien peut récupérer le titre mais n’acquiert pas les nouveaux moteurs. L’updater binaire signé reste désactivé.

Les tests couvrent les données, les paires, la variété du grand défi, les anciens identifiants, les exclusions parentales, les écritures de score idempotentes et les écrans initiaux rendus côté serveur. Le navigateur de test distant n’accède pas à l’aperçu local : le parcours graphique et l’affichage 13 pouces restent à essayer sur le véritable PC. Le workflow Windows vérifie compilation, tests, packaging et lancement de l’exécutable.
