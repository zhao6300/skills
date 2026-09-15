const PIECE_VALUES = {
  chariot: 90,
  horse: 40,
  cannon: 45,
  elephant: 20,
  advisor: 20,
  general: 900,
  soldier: 10,
};

import { getLegalMoves } from "./game.js";

export function suggestAiMove(state) {
  const legalMoves = [];
  for (let x = 0; x < 9; x += 1) {
    for (let y = 0; y < 10; y += 1) {
      const from = { x, y };
      getLegalMoves(state, from).forEach((to) => legalMoves.push({ from, to }));
    }
  }
  if (legalMoves.length === 0) return null;
  return legalMoves.map((move) => ({
    ...move,
    score: getMoveScore(state, move),
  })).sort((a, b) => b.score - a.score)[0];
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

function getPieceValues() {
  return { ...PIECE_VALUES };
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
  return `${piece.side === "red" ? "红方" : "黑方"} AI：${piece.type} 从 (${move.from.x},${move.from.y}) 到 (${move.to.x},${move.to.y})${target ? "，吃子" : ""}。可接受，可放弃。`;
}
