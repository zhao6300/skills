import { strict as assert } from "node:assert";
import test from "node:test";

import { applyMove, createGame, getLegalMoves, getMoveHistory } from "./game.js";

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
  const next = applyMove(createGame(), { from: { x: 0, y: 0 }, to: { x: 0, y: 1 } });
  assert.equal(pointAt(next.board, 0, 0), null);
  assert.equal(pointAt(next.board, 0, 1).type, "chariot");
  assert.equal(next.turn, "black");
  assert.equal(getMoveHistory(next).length, 1);
});

test("chariot cannot jump over or land on its own color", () => {
  const illegal = applyMove(createGame(), { from: { x: 1, y: 0 }, to: { x: 2, y: 1 } });
  const legal = applyMove(createGame(), { from: { x: 0, y: 0 }, to: { x: 0, y: 1 } });
  assert.deepEqual(illegal, createGame());
  assert.equal(getMoveHistory(legal).length, 1);
});

test("horse is blocked by a piece on its diagonal step", () => {
  const darkCorner = applyMove(createGame(), { from: { x: 1, y: 0 }, to: { x: 2, y: 2 } });
  assert.equal(pointAt(darkCorner.board, 2, 2).type, "horse");
});

test("elephant cannot cross the river", () => {
  const legal = getLegalMoves(createGame(), { x: 2, y: 0 });
  assert.equal(legal.some(({ y }) => y <= 4), true);
  assert.equal(legal.some(({ y }) => y >= 5), false);
});

test("illegal move preserves turn and board", () => {
  const state = createGame();
  const next = applyMove(state, { from: { x: 1, y: 0 }, to: { x: 2, y: 1 } });
  assert.equal(next.turn, "red");
  assert.equal(pointAt(next.board, 0, 0).type, "chariot");
  assert.equal(getMoveHistory(next).length, 0);
});

function pointAt(board, x, y) {
  return board[y]?.[x];
}
