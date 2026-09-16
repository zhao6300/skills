import { strict as assert } from "node:assert";
import test from "node:test";

import { applyMove, createGame, getGameStatus, getLegalMoves, getMoveHistory, getRepetition } from "./game.js";

test("new game creates two balanced armies and marks the current turn", () => {
  const state = createGame();
  const pieces = state.board.flat();
  assert.equal(state.turn, "red");
  assert.equal(pieces.filter((piece) => piece?.side === "red").length, 16);
  assert.equal(pieces.filter((piece) => piece?.side === "black").length, 16);
  assert.equal(pieces.filter((piece) => piece?.type === "general").length, 2);
  assert.equal(getMoveHistory(state).length, 0);
});

test("basic move rules update the board and turn", () => {
  const next = applyMove(createGame(), { from: { x: 0, y: 9 }, to: { x: 0, y: 8 } });
  assert.equal(pointAt(next.board, 0, 9), null);
  assert.equal(pointAt(next.board, 0, 8).type, "chariot");
  assert.equal(next.turn, "black");
  assert.equal(getMoveHistory(next).length, 1);
});

test("chariot cannot jump over or land on its own color", () => {
  const illegal = applyMove(createGame(), { from: { x: 1, y: 9 }, to: { x: 2, y: 8 } });
  const legal = applyMove(createGame(), { from: { x: 0, y: 9 }, to: { x: 0, y: 8 } });
  assert.deepEqual(illegal, createGame());
  assert.equal(getMoveHistory(legal).length, 1);
});

test("horse is blocked by a piece on its diagonal step", () => {
  const darkCorner = applyMove(createGame(), { from: { x: 1, y: 9 }, to: { x: 2, y: 7 } });
  assert.equal(pointAt(darkCorner.board, 2, 7).type, "horse");
});

test("elephant cannot cross the river", () => {
  const legal = getLegalMoves(createGame(), { x: 2, y: 9 });
  assert.equal(legal.some(({ y }) => y <= 4), false);
  assert.equal(legal.some(({ y }) => y >= 5), true);
});

test("illegal move preserves turn and board", () => {
  const state = createGame();
  const next = applyMove(state, { from: { x: 1, y: 9 }, to: { x: 2, y: 8 } });
  assert.equal(next.turn, "red");
  assert.equal(pointAt(next.board, 0, 9).type, "chariot");
  assert.equal(getMoveHistory(next).length, 0);
});

function pointAt(board, x, y) {
  return board[y]?.[x];
}

test("soldiers advance toward the opposite river and never retreat", () => {
  const state = createGame();
  const redMoves = getLegalMoves(state, { x: 0, y: 6 });
  const blackMoves = getLegalMoves(state, { x: 0, y: 3 });
  assert.deepEqual(redMoves, [{ x: 0, y: 5 }]);
  assert.deepEqual(blackMoves, [{ x: 0, y: 4 }]);
  const redBoard = state.board.map(row => row.map(() => null));
  redBoard[4][0] = { side: "red", type: "soldier" };
  redBoard[9][4] = { side: "red", type: "general" };
  redBoard[0][4] = { side: "black", type: "general" };
  redBoard[5][0] = { side: "red", type: "chariot" };
  redBoard[5][4] = { side: "red", type: "chariot" };
  const moves = getLegalMoves({ ...state, board: redBoard }, { x: 0, y: 4 });
  assert.deepEqual(moves, [{ x: 0, y: 3 }, { x: 1, y: 4 }]);
});

test("cannon requires exactly one screen before capturing", () => {
  const state = createGame();
  const board = state.board.map(row => row.map(() => null));
  board[9][0] = { side: "red", type: "general" };
  board[0][0] = { side: "black", type: "general" };
  board[5][0] = { side: "red", type: "chariot" };
  board[7][4] = { side: "red", type: "cannon" };
  board[4][4] = { side: "red", type: "soldier" };
  board[0][4] = { side: "black", type: "chariot" };
  const moves = getLegalMoves({ ...state, board }, { x: 4, y: 7 });
  assert.equal(moves.some(move => move.y === 0), true);
  const noScreen = moves.some(move => move.y >= 1 && move.y <= 3);
  assert.equal(noScreen, false);
});

test("kings cannot expose each other on an open file", () => {
  const state = createGame();
  const board = state.board.map(row => row.map(() => null));
  board[0][4] = { side: "black", type: "general" };
  board[1][4] = { side: "black", type: "advisor" };
  board[9][4] = { side: "red", type: "general" };
  const exposed = { ...state, board };
  assert.deepEqual(getLegalMoves(exposed, { x: 4, y: 1 }), []);
  assert.equal(getGameStatus(exposed).checkedSide, null);
});

test("a checked opponent with no safe response is checkmated", () => {
  const state = createGame();
  const board = state.board.map(row => row.map(() => null));
  board[0][4] = { side: "black", type: "general" };
  board[1][4] = { side: "black", type: "advisor" };
  board[2][3] = { side: "red", type: "horse" };
  board[0][0] = { side: "red", type: "chariot" };
  board[0][8] = { side: "red", type: "chariot" };
  board[3][3] = { side: "red", type: "chariot" };
  board[3][5] = { side: "red", type: "chariot" };
  board[4][3] = { side: "red", type: "chariot" };
  board[4][5] = { side: "red", type: "chariot" };
  board[5][3] = { side: "red", type: "chariot" };
  board[5][5] = { side: "red", type: "chariot" };
  board[9][4] = { side: "red", type: "general" };
  const checked = { ...state, board, turn: "black" };
  const legalMoves = [];
  for (let x = 0; x < 9; x += 1) {
    const piece = checked.board[0][x];
    if (piece?.side === "black") legalMoves.push(...getLegalMoves(checked, { x, y: 0 }));
  }
  for (let x = 0; x < 9; x += 1) {
    const piece = checked.board[1][x];
    if (piece?.side === "black") legalMoves.push(...getLegalMoves(checked, { x, y: 1 }));
  }
  assert.deepEqual(legalMoves, []);
  assert.equal(getGameStatus(checked).checkedSide, "black");
});

test("a state with no legal move ends the game by stalemate when reached", () => {
  const state = createGame();
  const board = state.board.map(row => row.map(() => null));
  board[0][4] = { side: "black", type: "general" };
  board[1][4] = { side: "black", type: "advisor" };
  board[1][3] = { side: "red", type: "soldier" };
  board[1][5] = { side: "red", type: "soldier" };
  board[3][3] = { side: "red", type: "chariot" };
  board[3][5] = { side: "red", type: "chariot" };
  board[9][4] = { side: "red", type: "general" };
  const next = applyMove({ ...state, board }, { from: { x: 3, y: 3 }, to: { x: 3, y: 2 } });
  assert.equal(next.gameOver, true);
  assert.equal(next.winner, "red");
  assert.equal(getGameStatus(next).checkedSide, null);
});

test("three identical position fingerprints become draw evidence", () => {
  const state = createGame();
  const next = applyMove(state, { from: { x: 0, y: 9 }, to: { x: 0, y: 8 } });
  const currentKey = next.positionHistory.at(-1);
  assert.equal(getRepetition(next), 1);
  assert.equal(next.gameOver, false);
  const repeated = { ...next, positionHistory: [currentKey, currentKey, currentKey] };
  assert.equal(getRepetition(repeated), 3);
});

function withBoard(state, placement) {
  const board = state.board.map(row => row.map(() => null));
  board[placement.y][placement.x] = placement.piece;
  return { ...state, board };
}
