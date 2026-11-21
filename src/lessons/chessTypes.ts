export type ChessKind = "K" | "Q" | "R" | "B" | "N" | "P";
export type ChessColor = "white" | "black";
export type Square = string;
export type ChessPiece = { id: string; kind: ChessKind; color: ChessColor; square: Square };
export type ChessAction = { pieceId: string; to: Square; note?: string };
export type ChessScene = {
  id: string;
  title: string;
  narration: string;
  tip: string;
  pieces: ChessPiece[];
  actions: ChessAction[];
  highlight?: Square[];
  /** End-of-scene challenge: child chooses a destination square. */
  challenge?: { prompt: string; from: Square; validTargets: Square[]; feedback: string };
};
export type AnimatedLesson = {
  id: string;
  title: string;
  subtitle: string;
  version: number;
  scenes: ChessScene[];
};
export const chessGlyphs: Record<ChessColor,Record<ChessKind,string>> = {
  white:{K:"♔",Q:"♕",R:"♖",B:"♗",N:"♘",P:"♙"},
  black:{K:"♚",Q:"♛",R:"♜",B:"♝",N:"♞",P:"♟"}
};
export const validSquare = (s: string): boolean => /^[a-h][1-8]$/.test(s);
export const coordinates = (s: string): { x: number; y: number } => ({x:s.charCodeAt(0)-97,y:8-Number(s[1])});
export function playActions(initial: ChessPiece[], actions: ChessAction[], upTo=actions.length): ChessPiece[] {
  const result=initial.map(p=>({...p}));
  for(const action of actions.slice(0,upTo)){
    const p=result.find(p=>p.id===action.pieceId);
    if(!p || !validSquare(action.to)) continue;
    const captured=result.findIndex(other=>other.square===action.to && other.color!==p.color);
    if(captured>=0) result.splice(captured,1);
    p.square=action.to;
  }
  return result;
}
export function validateLesson(lesson: AnimatedLesson): boolean {
  if(!lesson.id||lesson.scenes.length===0)return false;
  const ids=new Set<string>();
  for(const scene of lesson.scenes){
    if(ids.has(scene.id)||!scene.title||!scene.narration)return false;
    ids.add(scene.id);
    const pieceIds=new Set(scene.pieces.map(p=>p.id));
    if(pieceIds.size!==scene.pieces.length)return false;
    if(scene.pieces.some(p=>!validSquare(p.square))||new Set(scene.pieces.map(p=>p.square)).size!==scene.pieces.length)return false;
    if(scene.actions.some(a=>!pieceIds.has(a.pieceId)||!validSquare(a.to)))return false;
    if(scene.challenge&&(!validSquare(scene.challenge.from)||!scene.challenge.validTargets.length||scene.challenge.validTargets.some(s=>!validSquare(s))))return false;
  }
  return true;
}
