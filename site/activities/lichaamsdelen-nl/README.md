# Mijn lichaam · Kijk, schrijf en speel!

Dans **Nederlands — École**, 24 parties du corps pour un débutant de 8 ans.

## Cinq défis par mot, sans de/het

- 👀 **Choisir** le mot néerlandais parmi quatre propositions.
- ✏️ **Écrire** le mot néerlandais seul.
- 🧩 **Reconstruire** le mot avec des lettres.
- 🔁 **Retrouver le français** à partir du néerlandais, par exemple « arm → FR ».
- 🕵️ **Compléter un mot troué**, par exemple « a_m · Bras ».

Les trois premiers défis montrent un schéma illustré et son nom en français, par exemple **Le bras**. Le cercle rouge et la flèche indiquent précisément la partie à nommer. La consigne est le nom français seul ; le moteur affiche le type de défi en néerlandais. Pas de devinette longue, ni de paragraphe à lire. La correction tient en une ligne : « arm = bras. 🌟 ».

Les 72 défis visuels conservent l’image pendant la réponse. Les 48 nouveaux défis de vocabulaire sont autonomes sans image : le moteur peut aussi proposer du memory, des associations, un duel, du vrai/faux ou des lettres manquantes. Le nom français reste suffisant lorsqu’une question visuelle est reprise comme paire textuelle. Les parties de huit questions sont mélangées automatiquement ; plusieurs parties donnent accès aux différents jeux, sans garantie de tous les modes dans une seule partie. Les 120 défis couvrent cinq fois les 24 mots. Les réponses et corrections se concentrent sur le mot seul : aucun article néerlandais à apprendre, choisir, écrire ou assembler à ce stade. Les réponses exactes rapportent les points habituels et chaque session terminée reste enregistrée.

## Illustrations et mots

24 schémas anatomiques originaux, dessinés pour KidQuest, exportés en PNG. Ce sont des illustrations, pas des photographies. Les sources vectorielles sont conservées dans `illustrations-source.json` ; aucun SVG exécutable n’est téléchargé par l’application. Les PNG sont dans `assets/` et sont disponibles hors ligne après téléchargement.

Vocabulaire : voet, teen, knie, been, enkel, heup, haar, hand, vinger, duim, elleboog, rug, borst, arm, schouder, hals, mond, neus, oor, wenkbrauw, tand, voorhoofd, oog, tong. « tong » = la langue dans la bouche ; « tang » = une pince, exclu du jeu. « haar » désigne ici les cheveux, « been » la jambe.

## Version et compatibilité

- Pack `lichaamsdelen-nl` **v3**, catalogue v9. Les 72 IDs publiés sont conservés ; 48 nouveaux IDs `terug` et `gat` ajoutent les défis inverses et les mots troués. Les réponses passent explicitement du nom avec article au mot seul à la demande du parent ; les IDs et historiques restent stables.
- **KidQuest 0.9.1** est requis pour les trois modes avec image. Sur cette version, « Vérifier les mises à jour » suffit pour la v3, sans nouvel installateur. Les anciennes versions 0.9.0 affichent les images mais utilisent seulement le QCM ; elles ignorent le nouveau champ de données facultatif `responseMode`.
- Aucun effacement de SQLite, des points, des sessions ni de la visibilité parentale. Les autres packs photo gardent leur QCM existant.
- Pas de sélection de méthode par l’enfant ; chaque question précise son interaction. Aucun script téléchargé. Les tailles et empreintes SHA-256 sont vérifiées avant installation du pack.
- Le manifeste est régénéré par GitHub Actions après fusion.
