const PIECE_TYPES = ["chariot", "horse", "elephant", "advisor", "general", "cannon", "soldier"];

const PIECE_VALUES = {
  chariot: 90,
  horse: 40,
  elephant: 20,
  advisor: 20,
  general: 900,
  cannon: 45,
  soldier: 10,
};

export function createGame() {
  return {
    board: createInitialBoard(),
    turn: "red",
    moveHistory: [],
    captured: [],
    lastMove: null,
    winner: null,
    gameOver: false,
  };
}

function createInitialBoard() {
  const board = Array.from({ length: 10 }, () => Array.from({ length: 9 }, () => null));
  const backRow = ["chariot", "horse", "elephant", "advisor", "general", "advisor", "elephant", "horse", "chariot"];
  backRow.forEach((type, x) => {
    board[0][x] = piece("red", type);
    board[9][x] = piece("black", type);
  });
  board[2][1] = piece("red", "cannon");
  board[2][7] = piece("red", "cannon");
  board[7][1] = piece("black", "cannon");
  board[7][7] = piece("black", "cannon");
  [0, 2, 4, 6, 8].forEach((x) => {
    board[3][x] = piece("red", "soldier");
    board[6][x] = piece("black", "soldier");
  });
  return board;
}

function piece(side, type) {
  return { side, type };
}

export function getPieceValues() {
  return { ...PIECE_VALUES };
}

export function getPieceTypes() {
  return [...PIECE_TYPES];
}

export function getPieceName(side, type) {
  const names = side === "red"
    ? { chariot: "车", horse: "马", elephant: "相", advisor: "仕", general: "帅", cannon: "炮", soldier: "兵" }
    : { chariot: "车", horse: "马", elephant: "象", advisor: "士", general: "将", cannon: "炮", soldier: "卒" };
  return names[type] ?? type;
}

export function getLegalMoves(state, from) {
  const source = getPiece(state, from?.x, from?.y);
  if (!source || isDestroyed(state, source.side)) return [];
  const nextOpponentColor = source.side === "red" ? "black" : "red";
  return getMoveTargets(state, from).filter((to) => {
    if (!isPointInBounds(state, to.x, to.y)) return false;
    if (getPiece(state, to.x, to.y)?.side === source.side) return false;
    if (source.type === "general" && isGeneralInCheckAfterMove(state, source, from, to)) return false;
    if (source.type !== "general" && isPointNearKing(to, findKing(state, nextOpponentColor))) return false;
    if (source.type === "general" && isPointNearKing(to, findKing(state, nextOpponentColor))) return false;
    return true;
  });
}

function isPointInBounds(state, x, y) {
  return Boolean(state?.board?.[y]?.[x] === null || state?.board?.[y]?.[x]);
}

function getMoveTargets(state, from) {
  const piece = getPiece(state, from.x, from.y);
  if (!piece) return [];
  switch (piece.type) {
    case "chariot":
      return chariotTargets(state, from);
    case "horse":
      return horseTargets(state, from, piece);
    case "elephant":
      return elephantTargets(state, from, piece);
    case "advisor":
      return advisorTargets(state, from, piece);
    case "general":
      return generalTargets(state, from, piece);
    case "cannon":
      return cannonTargets(state, from);
    case "soldier":
      return soldierTargets(state, from, piece);
    default:
      return [];
  }
}

function chariotTargets(state, from) {
  const targets = [];
  const chariot = state.board[from.y][from.x];
  [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => {
    let x = from.x + dx;
    let y = from.y + dy;
    while (isInside(x, y)) {
      targets.push({ x, y });
      if (state.board[y][x]?.side === chariot.side) break;
      if (state.board[y][x]) break;
      x += dx;
      y += dy;
    }
  });
  return targets;
}

function horseTargets(state, from, piece) {
  const targets = [];
  const offsets = [
    { dx: 2, dy: 1, leg: { x: from.x + 1, y: from.y } },
    { dx: -2, dy: 1, leg: { x: from.x - 1, y: from.y } },
    { dx: 1, dy: 2, leg: { x: from.x, y: from.y + 1 } },
    { dx: -1, dy: 2, leg: { x: from.x, y: from.y + 1 } },
    { dx: 2, dy: -1, leg: { x: from.x + 1, y: from.y } },
    { dx: -2, dy: -1, leg: { x: from.x - 1, y: from.y } },
    { dx: 1, dy: -2, leg: { x: from.x, y: from.y - 1 } },
    { dx: -1, dy: -2, leg: { x: from.x, y: from.y - 1 } },
  ];
  offsets.forEach(({ dx, dy, leg }) => {
    const to = { x: from.x + dx, y: from.y + dy };
    if (!isInside(to.x, to.y)) return;
    if (state.board[leg.y]?.[leg.x]) return;
    if (getPiece(state, to.x, to.y)?.side === piece.side) return;
    targets.push(to);
  });
  return targets;
}

function elephantTargets(state, from, piece) {
  const targets = [];
  [[2, 2], [-2, 2], [2, -2], [-2, -2]].forEach(([dx, dy]) => {
    const to = { x: from.x + dx, y: from.y + dy };
    const eye = { x: from.x + Math.sign(dx), y: from.y + Math.sign(dy) };
    if (!isInside(to.x, to.y)) return;
    if (state.board[eye.y]?.[eye.x]) return;
    if (hasCrossedRiver(piece.side, to.y)) return;
    if (getPiece(state, to.x, to.y)?.side === piece.side) return;
    targets.push(to);
  });
  return targets;
}

function advisorTargets(state, from, piece) {
  const targets = [];
  [[1, 1], [-1, 1], [1, -1], [-1, -1]].forEach(([dx, dy]) => {
    const to = { x: from.x + dx, y: from.y + dy };
    if (isInside(to.x, to.y) && isInsidePalace(piece.side, to.x, to.y)
      && getPiece(state, to.x, to.y)?.side !== piece.side) {
      targets.push(to);
    }
  });
  return targets;
}

function generalTargets(state, from, piece) {
  const targets = [];
  [[0, 1], [1, 0], [0, -1], [-1, 0]].forEach(([dx, dy]) => {
    const to = { x: from.x + dx, y: from.y + dy };
    if (isInside(to.x, to.y) && isInsidePalace(piece.side, to.x, to.y)
      && getPiece(state, to.x, to.y)?.side !== piece.side) {
      targets.push(to);
    }
  });
  return targets;
}

function cannonTargets(state, from) {
  const targets = [];
  const screenPiece = getPiece(state, from.x, from.y);
  const cannonColor = screenPiece?.side;
  [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => {
    let screens = 0;
    let x = from.x + dx;
    let y = from.y + dy;
    while (isInside(x, y)) {
      if (state.board[y][x]) {
        if (screens === 1 && state.board[y][x].side !== cannonColor) {
          targets.push({ x, y });
        }
        screens += 1;
      } else if (screens === 1) {
        targets.push({ x, y });
      } else if (screens === 0) {
        targets.push({ x, y });
      }
      x += dx;
      y += dy;
    }
  });
  return targets;
}

function soldierTargets(state, from, piece) {
  const targets = [];
  const forward = piece.side === "red" ? 1 : -1;
  const yAhead = from.y + forward;
  if (isInside(from.x, yAhead) && getPiece(state, from.x, yAhead)?.side !== piece.side) {
    targets.push({ x: from.x, y: yAhead });
  }
  if (hasCrossedRiver(piece.side, from.y)) {
    [-1, 1].forEach((dx) => {
      const x = from.x + dx;
      if (isInside(x, from.y) && getPiece(state, x, from.y)?.side !== piece.side) {
        targets.push({ x, y: from.y });
      }
    });
  }
  return targets;
}

export function applyMove(state, move) {
  const from = move?.from;
  const to = move?.to;
  const piece = getPiece(state, from?.x, from?.y);
  if (!piece) return state;
  const legal = getLegalMoves(state, from).find((candidate) => candidate.x === to?.x && candidate.y === to?.y);
  if (!legal || state.turn !== piece.side) return state;
  const nextBoard = boardWithout(state.board, from.x, from.y);
  const target = getPiece(state, to.x, to.y);
  nextBoard[to.y][to.x] = piece;
  return {
    board: nextBoard,
    turn: piece.side === "red" ? "black" : "red",
    moveHistory: [...state.moveHistory, { from: { x: from.x, y: from.y }, to: { x: to.x, y: to.y } }],
    captured: target ? [...state.captured, target] : state.captured,
    lastMove: { from: { x: from.x, y: from.y }, to: { x: to.x, y: to.y } },
    winner: null,
    gameOver: false,
  };
}

export function getMoveHistory(state) {
  return state.moveHistory ?? [];
}

export function isInside(x, y) {
  return Number.isInteger(x) && Number.isInteger(y) && x >= 0 && x < 9 && y >= 0 && y < 10;
}

function isInsidePalace(side, x, y) {
  return x >= 3 && x <= 5 && (side === "red" ? y <= 2 : y >= 7);
}

function hasCrossedRiver(side, y) {
  return side === "red" ? y >= 5 : y <= 4;
}

function getPiece(state, x, y) {
  if (!isInside(x, y)) return null;
  return state.board[y][x];
}

function boardWithout(board, x, y) {
  return board.map((row, rowY) => rowY === y
    ? row.map((cell, columnX) => columnX === x ? null : cell)
    : row.map((cell) => cell ? { ...cell } : null));
}

function findKing(state, side) {
  for (let y = 0; y < 10; y += 1) {
    for (let x = 0; x < 9; x += 1) {
      const piece = state.board[y][x];
      if (piece?.type === "general" && piece?.side === side) {
        return { x, y };
      }
    }
  }
  return null;
}

function isPointNearKing(point, king) {
  return Boolean(point && king && point.x === king.x && Math.abs(point.y - king.y) === 1);
}

function isGeneralInCheckAfterMove(state, source, from, to) {
  const nextBoard = boardWithout(state.board, from.x, from.y);
  nextBoard[to.y][to.x] = source;
  const next = { board: nextBoard };
  const ownKing = findKing(next, source.side);
  const opponentKing = findKing(next, source.side === "red" ? "black" : "red");
  if (!ownKing || !opponentKing || ownKing.x !== opponentKing.x) return false;
  return hasClearColumnBetween(next, ownKing, opponentKing);
}

function hasClearColumnBetween(state, from, to) {
  const start = Math.min(from.y, to.y) + 1;
  const end = Math.max(from.y, to.y);
  for (let y = start; y < end; y += 1) {
    if (state.board[y][from.x]) return false;
  }
  return true;
}

function isDestroyed(state, side) {
  return !findKing(state, side);
}
