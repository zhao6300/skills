const PIECE_VALUES = {
  chariot: 90,
  horse: 40,
  cannon: 45,
  elephant: 20,
  advisor: 20,
  general: 900,
  soldier: 10,
};

import { applyMove, getLegalMoves, getGameStatus, getPieceValues } from "./game.js";

export function suggestAiMove(state) {
  const moves = listAllLegalMoves(state, state.turn);
  if (!moves.length) return null;
  let bestMove = moves[0];
  let bestScore = -Infinity;
  for (const move of sortMoves(moves)) {
    const value = searchNext(applyMove(state, move), 1, -Infinity, Infinity);
    if (value > bestScore) {
      bestScore = value;
      bestMove = move;
    }
  }
  return { ...bestMove, score: bestScore };
}

function listAllLegalMoves(state, side) {
  const moves = [];
  for (let y = 0; y < 10; y += 1) {
    for (let x = 0; x < 9; x += 1) {
      const piece = state.board[y][x];
      if (!piece || piece.side !== side) continue;
      getLegalMoves(state, { x, y }).forEach(to => moves.push({ from: { x, y, type: piece.type }, to }));
    }
  }
  return moves;
}

function searchNext(state, depth, alpha = -Infinity, beta = Infinity) {
  if (depth === 0) return evaluate(state, state.turn);
  const moves = listAllLegalMoves(state, state.turn);
  if (!moves.length) return getGameStatus(state).winner === state.turn ? MATE_SCORE : -MATE_SCORE;
  if (depth === 1) {
    let bestScore = -Infinity;
    for (const move of sortMoves(moves)) {
      const value = searchNext(applyMove(state, move), 0, alpha, beta);
      if (value >= beta) return beta;
      bestScore = Math.max(bestScore, value);
      alpha = Math.max(alpha, value);
      if (alpha >= beta) break;
    }
    return bestScore;
  }
  let bestScore = -Infinity;
  for (const move of sortMoves(moves)) {
    const value = searchNext(applyMove(state, move), depth - 1, alpha, beta);
    bestScore = Math.max(bestScore, value);
    alpha = Math.max(alpha, value);
    if (alpha >= beta) break;
  }
  return bestScore;
}

function sortMoves(moves) {
  return moves.slice().sort((a, b) => moveOrder(b, 3) - moveOrder(a, 3));
}

function moveOrder(move, depth) {
  return getPieceValues()[move.from.type] * 10 + move.from.y;
}

function evaluate(state, side) {
  const pieces = state.board.flat().filter(Boolean);
  let score = 0;
  for (const piece of pieces) {
    score += piece.side === side ? getPieceValues()[piece.type] : -getPieceValues()[piece.type];
    if (piece.type === "general") score += piece.side === side ? 8 : -8;
  }
  return score;
}

function centerBonus({ x, y }) {
  return 6 - Math.abs(x - 4) + (y <= 2 ? 3 : 0);
}

function forwardBonus(piece, { x, y }) {
  if (piece.type !== "soldier") return 0;
  const progress = piece.side === "red" ? y : 9 - y;
  return Math.max(0, progress - 1) * 2;
}

function isSameColumnAsKing(state, side, { x }) {
  for (let y = 0; y < 10; y += 1) {
    if (state.board[y]?.[x]?.type === "general" && state.board[y][x].side !== side) {
      return true;
    }
  }
  return false;
}

function getMoveScore(state, { from, to }) {
  const piece = state.board[from.y][from.x];
  const target = state.board[to.y][to.x];
  let score = getPieceValues()[piece.type] ?? 0;
  if (target) {
    score += (getPieceValues()[target.type] ?? 0) * 2;
  }
  score += centerBonus(to);
  score += forwardBonus(piece, to);
  if (isSameColumnAsKing(state, piece.side, to)) score += 8;
  if (piece.type === "general" && (to.x !== from.x || to.y !== from.y)) score -= 6;
  return score;
}

export function describeAiMove(move, state) {
  const piece = state.board[move.from.y][move.from.x];
  const target = state.board[move.to.y][move.to.x];
  const sideName = piece.side === "red" ? "红方" : "黑方";
  const pieceNames = { chariot: "车", horse: "马", elephant: piece.side === "red" ? "相" : "象", advisor: piece.side === "red" ? "仕" : "士", general: piece.side === "red" ? "帅" : "将", cannon: "炮", soldier: piece.side === "red" ? "兵" : "卒" };
  const targetCopy = target ? "，可吃子" : "";
  return `${sideName} AI 推荐：${pieceNames[piece.type] ?? piece.type} 从 (${move.from.x},${move.from.y}) 到 (${move.to.x},${move.to.y})${targetCopy}。`;
}
