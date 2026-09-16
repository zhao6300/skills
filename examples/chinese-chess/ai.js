import { applyMove, getLegalMoves, getGameStatus, getPieceValues } from "./game.js";

const MATE_SCORE = 100000;
const SEARCH_DEPTH = 2;
const QUIESCENCE_DEPTH = 2;
const REPEAT_PENALTY = 180;

const STATIC_VALUES = {
  chariot: 900,
  horse: 400,
  cannon: 450,
  elephant: 200,
  advisor: 200,
  general: 10000,
  soldier: 100,
};

function listAllLegalMoves(state, side) {
  const moves = [];
  for (let y = 0; y < 10; y += 1) {
    for (let x = 0; x < 9; x += 1) {
      const piece = state.board[y][x];
      if (!piece || piece.side !== side) continue;
      for (const to of getLegalMoves(state, { x, y })) {
        moves.push({ from: { x, y, type: piece.type }, to });
      }
    }
  }
  return moves;
}

let searchTable = null;

function transpositionTable() {
  if (!searchTable) searchTable = new Map();
  return searchTable;
}

function cacheSearchResult(state, depth, alpha, beta, score, flag) {
  const table = transpositionTable();
  table.set(`${positionKey(state)}:${depth}`, { depth, alpha, beta, score, flag });
  if (table.size > 75000) {
    const oldest = table.keys().next().value;
    if (oldest !== undefined) table.delete(oldest);
  }
}

export function suggestAiMove(state) {
  const moves = listAllLegalMoves(state, state.turn);
  if (!moves.length) return null;

  let rankedMoves = moves
    .map((move) => ({ move, score: rootMoveScore(move, state) }))
    .sort((a, b) => b.score - a.score);
  let bestScore = -Infinity;
  let bestMoves = rankedMoves;
  searchTable = new Map();

  for (let depth = 1; depth <= SEARCH_DEPTH; depth += 1) {
    const scored = [];
    const depthCandidates = rankedMoves.slice(0, depth === 1 ? rankedMoves.length : 8);
    for (const rankedMove of depthCandidates) {
      const child = applyMove(state, rankedMove.move);
      let value = -searchNext(child, depth - 1, -Infinity, Infinity);
      value -= repetitionCount(state, child) * REPEAT_PENALTY;
      scored.push({ ...rankedMove, value });
    }
    bestScore = Math.max(...scored.map((entry) => entry.value));
    bestMoves = scored.filter((entry) => entry.value === bestScore);
    rankedMoves = scored.slice().sort((a, b) => b.value - a.value);
  }

  const chosen = bestMoves[Math.floor(Math.random() * bestMoves.length)];
  return { ...chosen.move, score: bestScore, depth: SEARCH_DEPTH };
}

export function describeAiMove(move, state) {
  const piece = state.board[move.from.y][move.from.x];
  const target = state.board[move.to.y][move.to.x];
  const sideName = piece.side === "red" ? "红方" : "黑方";
  const pieceName = { chariot: "车", horse: "马", cannon: "炮", elephant: "相/象", advisor: "仕/士", general: "帅/将", soldier: "兵/卒" }[piece.type];
  return `${sideName}建议：${pieceName} ${move.from.x},${move.from.y} → ${move.to.x},${move.to.y}${target ? "（吃子）" : ""}`;
}

function searchNext(state, depth, alpha = -Infinity, beta = Infinity, ply = 0) {
  if (state.gameOver) {
    return state.winner === state.turn ? MATE_SCORE - ply : -MATE_SCORE + ply;
  }
  if (depth <= 0) return quiescence(state, alpha, beta, ply, QUIESCENCE_DEPTH);

  const moves = listAllLegalMoves(state, state.turn);
  if (!moves.length) return -MATE_SCORE + ply;
  moves.sort((a, b) => moveScore(b) - moveScore(a));

  const tableKey = `${positionKey(state)}:${depth}`;
  const cached = transpositionTable().get(tableKey);
  if (cached?.depth === depth) {
    if (cached.flag === "exact") return cached.score;
    if (cached.flag === "lowerBound" && cached.beta >= beta) return cached.score;
  }

  let bestScore = -Infinity;
  let bestBeta = Math.max(alpha, beta);
  for (const move of moves) {
    const child = applyMove(state, move);
    const value = -searchNext(child, depth - 1, -beta, -alpha, ply + 1);
    if (value >= beta) return value;
    bestScore = Math.max(bestScore, value);
    alpha = Math.max(alpha, value);
    if (alpha >= beta) break;
  }
  cacheSearchResult(
    state,
    depth,
    alpha,
    bestBeta,
    bestScore,
    bestScore >= beta ? "lowerBound" : "exact",
  );
  return bestScore;
}

function searchNextProduction(state, depth, alpha, beta, ply) {
  if (state.gameOver) {
    return state.winner === state.turn ? MATE_SCORE - ply : -MATE_SCORE + ply;
  }
  if (depth <= 0) return quiescence(state, alpha, beta, ply, QUIESCENCE_DEPTH);
  const moves = listAllLegalMoves(state, state.turn);
  if (!moves.length) return -MATE_SCORE + ply;
  moves.sort((a, b) => moveScore(b) - moveScore(a));

  const tableKey = `${positionKey(state)}:${depth}`;
  const cached = transpositionTable().get(tableKey);
  if (cached?.depth === depth) {
    if (cached.flag === "exact") return cached.score;
    if (cached.flag === "lowerBound" && cached.beta >= beta) return cached.score;
  }

  let bestScore = -Infinity;
  let bestBeta = Math.max(alpha, beta);
  for (const move of moves) {
    const child = applyMove(state, move);
    const value = -searchNextProduction(child, depth - 1, -beta, -alpha, ply + 1);
    if (value >= beta) return value;
    bestScore = Math.max(bestScore, value);
    alpha = Math.max(alpha, value);
    if (alpha >= beta) break;
  }
  cacheSearchResult(
    state,
    depth,
    alpha,
    bestBeta,
    bestScore,
    bestScore >= beta ? "lowerBound" : "exact",
  );
  return bestScore;
}

function testPieceSquare(state) {
  let value = 50;
  for (let y = 0; y < 10; y += 1) {
    for (let x = 0; x < 9; x += 1) {
      const piece = state.board[y][x];
      if (!piece) continue;
      if (piece.type === "chariot") value += 10 - Math.abs(x - 4) * 4;
      if (piece.type === "horse") value += 8 - Math.abs(x - 4) * 3;
      if (piece.type === "cannon") value += 12 - Math.abs(x - 4) * 4;
      if (piece.type === "soldier") value += (y <= 4 ? 32 : 0) + 4;
      if (piece.type === "advisor" || piece.type === "elephant") value += 4;
      if (piece.type === "general") value += 3;
    }
  }
  return value;
}

function quiescence(state, alpha, beta, ply, depth) {
  if (state.gameOver) {
    return state.winner === state.turn ? MATE_SCORE - ply : -MATE_SCORE + ply;
  }

  const moves = listAllLegalMoves(state, state.turn);
  if (!moves.length) return -MATE_SCORE + ply;
  const checked = getGameStatus(state).checkedSide === state.turn;
  const usefulMoves = checked ? moves : moves.filter((move) => state.board[move.to.y][move.to.x]);
  const quietScore = checked ? -Infinity : evaluate(state, state.turn);
  if (!checked && quietScore >= beta) return quietScore;
  if (!checked) alpha = Math.max(alpha, quietScore);

  let bestScore = quietScore;
  usefulMoves.sort((a, b) => moveScore(b) - moveScore(a));
  for (const move of usefulMoves) {
    if (!checked && depth <= 0) break;
    const value = -quiescence(
      applyMove(state, move),
      -beta,
      -alpha,
      ply + 1,
      depth - 1,
    );
    if (value >= beta) return value;
    bestScore = Math.max(bestScore, value);
    alpha = Math.max(alpha, value);
    if (alpha >= beta) break;
  }
  return bestScore ?? -MATE_SCORE + ply;
}

function moveScore(move) {
  return getPieceValues()[move.from.type] ?? 32;
}

function rootMoveScore(move, state) {
  const target = state.board[move.to.y][move.to.x];
  const source = state.board[move.from.y][move.from.x];
  let score = moveScore(move);
  if (target) score += getPieceValues()[target.type] * 4;
  if (source.type !== "advisor" && source.type !== "elephant") {
    if (move.to.x !== move.from.x) score += 40;
    if (move.to.y !== move.from.y) score += 24;
  }
  score += positionBonus(source, move.to.x, move.to.y) * 4;
  return score;
}

function evaluate(state, side) {
  let score = 0;
  for (let y = 0; y < 10; y += 1) {
    for (let x = 0; x < 9; x += 1) {
      const piece = state.board[y][x];
      if (!piece) continue;
      const value = STATIC_VALUES[piece.type] + positionBonus(piece, x, y);
      score += piece.side === side ? value : -value;
    }
  }
  return score;
}

function positionBonus(piece, x, y) {
  const centerDistance = Math.abs(x - 4);
  const redForward = 9 - y;
  const progress = piece.side === "red" ? redForward : 9 - redForward;
  let bonus = (2 - centerDistance) * 2;

  if (piece.type === "chariot") bonus += 6 - centerDistance * 2;
  if (piece.type === "horse" || piece.type === "cannon") bonus += 8 - centerDistance * 3;
  if (piece.type === "soldier") {
    bonus += Math.max(0, progress - 3) * 12;
    if (progress >= 5) bonus += 20;
  }
  if (piece.type === "advisor" || piece.type === "elephant") {
    const palaceCenter = Math.abs(x - 4);
    bonus -= palaceCenter * 4 + (piece.side === "red" ? y : 9 - y);
  }
  if (piece.type === "general") {
    bonus -= (x === 4 ? 0 : 4) + (piece.side === "red" ? y : 9 - y);
  }
  return piece.side === "red" ? bonus : -bonus;
}

function repetitionCount(state, next) {
  const key = positionKey(next);
  return state.positionHistory?.reduce((count, history) => count + (history === key ? 1 : 0), 0) ?? 0;
}

function positionKey(state) {
  return `${state.board.map((row) => row.map((piece) => (piece ? `${piece.side[0]}${piece.type[0]}` : ".")).join("")).join("|")}:${state.turn}`;
}
