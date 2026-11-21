import type { AnimatedLesson } from "./chessTypes";

export const chessBeginnerLesson: AnimatedLesson={
 id:"chess-beginner",title:"Les échecs : mes premiers pas",subtitle:"Apprends les six pièces et leurs règles !",version:1,
 scenes:[
  {
   id:"board",title:"Bienvenue sur l'échiquier !",
   narration:"Aux échecs, deux joueurs jouent chacun leur tour. Les blancs commencent. Le but est de mettre le roi adverse en échec et mat. L'échiquier a soixante-quatre cases, claires et foncées.",
   tip:"Regarde : une case claire doit se trouver en bas à droite de chaque joueur.",
   pieces:[{id:"wk",kind:"K",color:"white",square:"e1"},{id:"bk",kind:"K",color:"black",square:"e8"}],
   highlight:["h1","a8"],actions:[]
  },
  {
   id:"pawn",title:"Le pion avance tout droit",
   narration:"Le pion avance d'une case devant lui. Au premier déplacement seulement, il peut aussi avancer de deux cases si le chemin est libre. Il ne peut pas reculer.",
   tip:"Le pion blanc avance vers le haut de l'échiquier.",
   pieces:[{id:"p",kind:"P",color:"white",square:"e2"}],
   actions:[{pieceId:"p",to:"e4",note:"Au premier coup : deux cases"}],highlight:["e3","e4"]
  },
  {
   id:"pawn-capture",title:"Le pion prend en diagonale",
   narration:"Attention ! Le pion avance tout droit, mais pour prendre une pièce ennemie, il se déplace d'une case en diagonale vers l'avant. Il ne capture pas tout droit.",
   tip:"Le pion blanc peut capturer une pièce noire située devant lui en diagonale.",
   pieces:[{id:"p",kind:"P",color:"white",square:"e4"},{id:"bad",kind:"N",color:"black",square:"d5"}],
   actions:[{pieceId:"p",to:"d5",note:"Capture en diagonale"}],highlight:["d5"]
  },
  {
   id:"pawn-test",title:"À toi de jouer : le pion",
   narration:"C'est ton tour ! Le pion blanc est en é quatre. Une pièce noire se trouve en dé cinq. Clique sur la case où le pion peut capturer la pièce ennemie.",
   tip:"Le pion prend en diagonale, pas tout droit.",
   pieces:[{id:"p",kind:"P",color:"white",square:"e4"},{id:"bad",kind:"N",color:"black",square:"d5"}],
   actions:[],challenge:{prompt:"Clique sur la case où le pion capture le cavalier noir.",from:"e4",validTargets:["d5"],feedback:"Bravo ! Le pion capture en diagonale sur d5."}
  },
  {
   id:"rook",title:"La tour : des lignes droites",
   narration:"La tour se déplace horizontalement ou verticalement, d'autant de cases qu'elle veut, si rien ne bloque son chemin. Elle ne se déplace jamais en diagonale.",
   tip:"La tour suit les lignes et les colonnes.",
   pieces:[{id:"r",kind:"R",color:"white",square:"a1"}],
   actions:[{pieceId:"r",to:"a5",note:"Quatre cases vers le haut"},{pieceId:"r",to:"d5",note:"Puis trois cases vers la droite"}],highlight:["a5","d5"]
  },
  {
   id:"rook-test",title:"À toi de jouer : la tour",
   narration:"La tour blanche se trouve sur dé quatre. Clique sur une case qu'elle peut atteindre en ligne droite. Choisis dé sept.",
   tip:"La tour avance en ligne droite, sans tourner.",
   pieces:[{id:"r",kind:"R",color:"white",square:"d4"}],
   actions:[],challenge:{prompt:"Clique sur d7 pour faire monter la tour.",from:"d4",validTargets:["d7"],feedback:"Exact ! La tour peut avancer verticalement."}
  },
  {
   id:"bishop",title:"Le fou : les diagonales",
   narration:"Le fou glisse en diagonale, d'autant de cases qu'il veut si le chemin est libre. Un fou reste toujours sur des cases de la même couleur.",
   tip:"Suis la diagonale : une case en haut et une sur le côté.",
   pieces:[{id:"b",kind:"B",color:"white",square:"c1"}],
   actions:[{pieceId:"b",to:"f4",note:"Trois cases en diagonale"}],highlight:["d2","e3","f4"]
  },
  {
   id:"bishop-test",title:"À toi de jouer : le fou",
   narration:"Le fou blanc se trouve sur cé un. Clique sur la case é trois : le fou avance en diagonale.",
   tip:"Un fou avance en diagonale.",
   pieces:[{id:"b",kind:"B",color:"white",square:"c1"}],
   actions:[],challenge:{prompt:"Clique sur e3 pour déplacer le fou.",from:"c1",validTargets:["e3"],feedback:"Bien joué ! e3 est sur la diagonale de c1."}
  },
  {
   id:"queen",title:"La dame : la plus mobile",
   narration:"La dame combine les mouvements de la tour et du fou. Elle peut avancer en ligne droite ou en diagonale, autant de cases que possible si le chemin est libre.",
   tip:"La dame peut bouger en ligne droite et en diagonale.",
   pieces:[{id:"q",kind:"Q",color:"white",square:"d1"}],
   actions:[{pieceId:"q",to:"d5",note:"Déplacement vertical"},{pieceId:"q",to:"g8",note:"Puis déplacement en diagonale"}],highlight:["d5","g8"]
  },
  {
   id:"queen-test",title:"À toi de jouer : la dame",
   narration:"La dame est sur dé quatre. Clique sur gé sept. C'est un déplacement en diagonale.",
   tip:"La dame peut aussi bouger comme un fou.",
   pieces:[{id:"q",kind:"Q",color:"white",square:"d4"}],
   actions:[],challenge:{prompt:"Déplace la dame de d4 vers g7.",from:"d4",validTargets:["g7"],feedback:"Bravo ! La dame avance aussi en diagonale."}
  },
  {
   id:"knight",title:"Le cavalier : un grand L",
   narration:"Le cavalier saute en forme de L : deux cases dans une direction, puis une case sur le côté. C'est la seule pièce qui peut sauter par-dessus d'autres pièces.",
   tip:"Deux cases puis une sur le côté : dessine un L !",
   pieces:[{id:"n",kind:"N",color:"white",square:"b1"},{id:"p",kind:"P",color:"white",square:"b2"},{id:"p2",kind:"P",color:"white",square:"c2"}],
   actions:[{pieceId:"n",to:"c3",note:"Le cavalier saute par-dessus les pions"}],highlight:["c3"]
  },
  {
   id:"knight-test",title:"À toi de jouer : le cavalier",
   narration:"Le cavalier blanc est sur dé quatre. Clique sur é six. Tu fais deux cases vers le haut et une case vers la droite.",
   tip:"Le cavalier ne glisse pas ; il saute en L.",
   pieces:[{id:"n",kind:"N",color:"white",square:"d4"}],
   actions:[],challenge:{prompt:"Trouve la case e6 pour le cavalier.",from:"d4",validTargets:["e6"],feedback:"Bravo ! d4 vers e6 forme un L."}
  },
  {
   id:"king",title:"Le roi : une case à la fois",
   narration:"Le roi se déplace d'une seule case, dans n'importe quelle direction. Attention ! Il ne peut jamais aller sur une case attaquée par une pièce ennemie.",
   tip:"Le roi est la pièce à protéger absolument.",
   pieces:[{id:"k",kind:"K",color:"white",square:"e1"}],
   actions:[{pieceId:"k",to:"e2",note:"Une case vers le haut"},{pieceId:"k",to:"f3",note:"Une case en diagonale"}],highlight:["e2","f3"]
  },
  {
   id:"king-test",title:"À toi de jouer : le roi",
   narration:"Le roi blanc est sur é quatre. Clique sur f cinq, une seule case en diagonale.",
   tip:"Un pas seulement, et jamais dans une case attaquée !",
   pieces:[{id:"k",kind:"K",color:"white",square:"e4"}],
   actions:[],challenge:{prompt:"Déplace le roi d'une case vers f5.",from:"e4",validTargets:["f5"],feedback:"Très bien ! Le roi avance d'une case en diagonale."}
  },
  {
   id:"check",title:"Échec : le roi est menacé",
   narration:"Quand une pièce ennemie attaque le roi, on dit : échec ! Le joueur doit tout de suite sortir de l'échec, en déplaçant son roi, en capturant la pièce attaquante, ou en bloquant l'attaque si possible.",
   tip:"En échec, tu dois protéger ton roi au prochain coup.",
   pieces:[{id:"k",kind:"K",color:"white",square:"e1"},{id:"r",kind:"R",color:"black",square:"e8"}],
   actions:[{pieceId:"k",to:"f1",note:"Le roi s'éloigne de la colonne attaquée"}],highlight:["e1","f1"]
  },
  {
   id:"mate",title:"Échec et mat : partie terminée",
   narration:"Quand le roi est en échec et qu'aucun coup légal ne permet de le sauver, c'est échec et mat. Le joueur qui a mis le roi adverse échec et mat gagne ! On ne capture jamais le roi.",
   tip:"Le but du jeu est de faire échec et mat, pas de prendre toutes les pièces.",
   pieces:[{id:"wk",kind:"K",color:"white",square:"f6"},{id:"wq",kind:"Q",color:"white",square:"g6"},{id:"bk",kind:"K",color:"black",square:"h8"}],
   actions:[{pieceId:"wq",to:"g7",note:"La dame donne échec et mat"}],highlight:["g7","h8"]
  },
  {
   id:"castle",title:"Le roque : un coup spécial",
   narration:"Le roque sert à mettre le roi à l'abri. Le roi avance de deux cases vers une tour, et cette tour passe de l'autre côté du roi. On ne peut le faire que si le roi et la tour n'ont pas bougé, si les cases entre eux sont libres et si le roi ne traverse aucune case attaquée.",
   tip:"On ne peut pas roquer si le roi est en échec.",
   pieces:[{id:"k",kind:"K",color:"white",square:"e1"},{id:"r",kind:"R",color:"white",square:"h1"}],
   actions:[{pieceId:"k",to:"g1",note:"Le roi avance de deux cases"},{pieceId:"r",to:"f1",note:"La tour passe derrière lui"}],highlight:["f1","g1"]
  },
  {
   id:"promotion",title:"Promotion : le pion se transforme",
   narration:"Quand un pion arrive tout au bout de l'échiquier, il doit être remplacé par une dame, une tour, un fou ou un cavalier de sa couleur. On choisit souvent une dame, mais ce n'est pas obligatoire.",
   tip:"La promotion est possible même si ta dame est déjà sur l'échiquier.",
   pieces:[{id:"p",kind:"P",color:"white",square:"a7"}],
   actions:[{pieceId:"p",to:"a8",note:"Le pion arrive sur la dernière rangée"}],highlight:["a8"]
  },
  {
   id:"rules",title:"Les règles faciles pour jouer",
   narration:"Souviens-toi ! Les blancs commencent. Chaque joueur joue un coup à son tour. On ne passe pas par-dessus les pièces, sauf avec le cavalier. On ne met jamais son propre roi en échec. Si tu n'es pas en échec, mais que tu ne peux jouer aucun coup légal, la partie est nulle : c'est le pat.",
   tip:"Le pat est un match nul. La partie peut aussi se terminer par accord ou d'autres règles de nul.",
   pieces:[{id:"k",kind:"K",color:"white",square:"e1"},{id:"q",kind:"Q",color:"white",square:"d1"},{id:"r",kind:"R",color:"white",square:"a1"},{id:"b",kind:"B",color:"white",square:"c1"},{id:"n",kind:"N",color:"white",square:"b1"},{id:"p",kind:"P",color:"white",square:"e2"}],
   actions:[],highlight:["e1","e2"]
  },
  {
   id:"final",title:"Bravo, petit champion !",
   narration:"Tu connais maintenant le pion, la tour, le fou, la dame, le cavalier et le roi ! Tu sais aussi ce que sont l'échec, l'échec et mat, le roque et la promotion. Pour devenir meilleur, joue souvent et amuse-toi !",
   tip:"Rejoue les démonstrations pour t'entraîner avant ta première vraie partie.",
   pieces:[{id:"k",kind:"K",color:"white",square:"e1"},{id:"q",kind:"Q",color:"white",square:"d1"},{id:"r",kind:"R",color:"white",square:"a1"},{id:"b",kind:"B",color:"white",square:"c1"},{id:"n",kind:"N",color:"white",square:"b1"},{id:"p",kind:"P",color:"white",square:"e2"}],
   actions:[],highlight:[]
  }
 ]
};
