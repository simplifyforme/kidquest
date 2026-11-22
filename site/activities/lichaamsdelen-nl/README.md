# Mijn lichaam · Kijk, schrijf en speel!

Dans **Nederlands — École**, 24 parties du corps pour un débutant de 8 ans.

## Trois défis visuels par mot

- 👀 **Choisir** le mot néerlandais parmi quatre propositions.
- ✏️ **Écrire** le mot néerlandais avec de/het.
- 🧩 **Reconstruire** le mot avec des lettres.

Chaque question montre un schéma illustré et son nom en français, par exemple **Le bras**. Le cercle rouge et la flèche indiquent précisément la partie à nommer. La consigne est le nom français seul ; le moteur affiche le type de défi en néerlandais. Pas de devinette longue, ni de paragraphe à lire. La correction tient en une ligne : « de arm = le bras. 🌟 ».

Les trois défis conservent l’image pendant la réponse. Les parties de huit questions sont mélangées automatiquement. Les 72 défis couvrent trois fois les 24 mots ; une partie ne garantit pas de rencontrer toutes les notions. Les articles sont appris avec le nom. Les réponses exactes rapportent les points habituels et chaque session terminée reste enregistrée.

## Illustrations et mots

24 schémas anatomiques originaux, dessinés pour KidQuest, exportés en PNG. Ce sont des illustrations, pas des photographies. Les sources vectorielles sont conservées dans `illustrations-source.json` ; aucun SVG exécutable n’est téléchargé par l’application. Les PNG sont dans `assets/` et sont disponibles hors ligne après téléchargement.

Vocabulaire : voet, teen, knie, been, enkel, heup, haar, hand, vinger, duim, elleboog, rug, borst, arm, schouder, hals, mond, neus, oor, wenkbrauw, tand, voorhoofd, oog, tong. « tong » = la langue dans la bouche ; « tang » = une pince, exclu du jeu. « haar » désigne ici les cheveux, « been » la jambe.

## Version et compatibilité

- Pack `lichaamsdelen-nl` **v2**, catalogue v8. Les 48 IDs publiés sont conservés ; 24 nouveaux IDs `lichaamsdelen-nl-bouw-*` ajoutent les puzzles.
- **KidQuest 0.9.1** est requis pour les trois modes avec image. Installer cette version une fois, puis cliquer sur « Vérifier les mises à jour ». Les anciennes versions 0.9.0 affichent les images mais utilisent seulement le QCM ; elles ignorent le nouveau champ de données facultatif `responseMode`.
- Aucun effacement de SQLite, des points, des sessions ni de la visibilité parentale. Les autres packs photo gardent leur QCM existant.
- Pas de sélection de méthode par l’enfant ; chaque question précise son interaction. Aucun script téléchargé. Les tailles et empreintes SHA-256 sont vérifiées avant installation du pack.
- Le manifeste est régénéré par GitHub Actions après fusion.
