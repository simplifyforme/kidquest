import type { ChessPiece, ChessScene, Square } from "../lessons/chessTypes";
import { chessGlyphs, coordinates, validSquare } from "../lessons/chessTypes";

export default function AnimatedChessBoard({
  pieces, scene, selected, onSquare
}: {
  pieces: ChessPiece[];
  scene: ChessScene;
  selected?: Square | null;
  onSquare?: (square: Square) => void;
}) {
  const letters = "abcdefgh";
  return <div className="chess-board-wrap">
    <div className="chess-board" aria-label="Échiquier animé avec cases de a1 à h8">
      {Array.from({length:64},(_,i)=>{
        const file=i%8,rank=8-Math.floor(i/8),square=letters[file]+rank;
        const marked=scene.highlight?.includes(square) || selected===square;
        const isTarget=scene.challenge?.validTargets.includes(square);
        return <button type="button" key={square} className={"chess-square "+(((file+rank)%2===1)?"chess-dark":"chess-light")+
          (marked?" chess-mark":"")+(isTarget&&selected?" chess-target":"")} 
          onClick={()=>onSquare?.(square)} disabled={!onSquare}
          aria-label={"Case "+square}
          style={{left:(file*12.5)+"%",top:((8-rank)*12.5)+"%"}}>
          {file===0&&<small className="chess-rank">{rank}</small>}
          {rank===1&&<small className="chess-file">{letters[file]}</small>}
        </button>;
      })}
      {pieces.filter(p=>validSquare(p.square)).map(piece=>{
        const {x,y}=coordinates(piece.square);
        return <div key={piece.id}
          className={"chess-piece chess-piece-"+piece.color}
          style={{left:(x*12.5)+"%",top:(y*12.5)+"%"}} aria-label={(piece.color==="white"?"Blanc ":"Noir ")+piece.kind+" sur "+piece.square}>
          <span>{chessGlyphs[piece.color][piece.kind]}</span>
        </div>;
      })}
    </div>
  </div>;
}
