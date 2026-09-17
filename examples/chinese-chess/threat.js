import { getLegalMoves, getPieceValues } from "./game.js";

const THREAT_MOBILITY = 1;
const THREAT_CAPTURE = 6;

export function buildThreatMap(state, side) {
  const threats = new Map();

  for (let y = 0; y < 10; y += 1) {
    for (let x = 0; x < 9; x += 1) {
      const piece = state.board[y][x];
      if (!piece || piece.side !== side) continue;

      for (const move of getLegalMoves(state, { x, y })) {
        const target = state.board[move.y]?.[move.x];
        const isCapture = Boolean(target && target.side !== piece.side);
        const targetValue = isCapture ? getPieceValues()[target.type] ?? 0 : 0;
        const threatValue = isCapture ? THREAT_CAPTURE + targetValue : THREAT_MOBILITY;

        threats.set(
          `${move.x},${move.y}`,
          (threats.get(`${move.x},${move.y}`) ?? 0) + threatValue,
        );
      }
    }
  }

  return threats;
}

export function serializeNextPosition(next) {
  return `${next.turn}:${next.board.map((row) => row.map((piece) => (piece ? `${piece.side[0]}${piece.type[0]}` : ".")).join("")).join("|")}`;
}

export function threatScore(state, side) {
  let score = 0;
  for (const threatValue of buildThreatMap(state, side).values()) score += threatValue;
  return score;
}

export function seeScore(move, state) {
  const attacker = state.board[move.from.y]?.[move.from.x];
  const target = state.board[move.to.y]?.[move.to.x];
  const attackerValue = getPieceValues()[attacker?.type] ?? 0;
  const targetValue = getPieceValues()[target?.type] ?? 0;
  if (!target) return 0;

  const boardAfter = state.board.map((row) => [...row]);
  boardAfter[move.from.y][move.from.x] = null;
  boardAfter[move.to.y][move.to.x] = { ...attacker };
  const threats = buildThreatMap({ board: boardAfter, turn: target.side }, target.side);
  const threatValue = threats.get(`${move.to.x},${move.to.y}`) ?? 0;
  return targetValue - (threatValue ? attackerValue : 0);
}

export function repetitionPenalty(state, next) {
  const nextKey = serializeNextPosition(next);
  const priorHistory = state.positionHistory ?? [];
  return priorHistory.some((key) => key === nextKey) ? 180 : 0;
}
