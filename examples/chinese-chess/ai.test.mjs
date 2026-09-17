import { strict as assert } from "node:assert";
import test from "node:test";

import { applyMove, createGame } from "./game.js";
import { suggestAiMove } from "./ai.js";

test("AI advisor does not stall by replaying a king shuffle", () => {
  const suggestion = suggestAiMove(createGame());
  const source = createGame().board[suggestion.from.y][suggestion.from.x];
  const to = createGame().board[suggestion.to.y][suggestion.to.x];
  assert.notEqual(source.type, "general");
  assert.notEqual(to?.side, source.side);
});

test("AI finds an immediate forced checkmate", () => {
  const state = createGame();
  state.board = Array.from({ length: 10 }, () => Array.from({ length: 9 }, () => null));
  state.board[0][4] = { side: "black", type: "general" };
  state.board[0][5] = { side: "red", type: "chariot" };
  state.board[8][4] = { side: "red", type: "chariot" };
  state.board[9][0] = { side: "red", type: "general" };
  state.turn = "red";
  state.positionHistory = [];
  const suggestion = suggestAiMove(state);
  const completed = applyMove(state, suggestion);
  assert.equal(completed.gameOver, true);
  assert.equal(completed.winner, "red");
});

test("AI progresses through game states without repeating a prior turn snapshot", () => {
  let state = createGame();
  const seen = new Set();
  for (let moveIndex = 0; moveIndex < 20; moveIndex += 1) {
    const suggestion = suggestAiMove(state);
    if (!suggestion) {
      assert.equal(state.gameOver && state.winner !== null, true);
      break;
    }
    state = applyMove(state, suggestion);
    const positionKey = `${state.turn}:${JSON.stringify(state.board)}`;
    assert.equal(seen.has(positionKey), false, `repeated position at move ${moveIndex + 1}`);
    seen.add(positionKey);
  }
});

test("AI advisor can recommend a legal move", () => {
  const suggestion = suggestAiMove(createGame());
  assert.ok(suggestion);
  assert.equal(suggestion.from.x >= 0 && suggestion.from.x < 9, true);
  assert.equal(suggestion.to.x >= 0 && suggestion.to.x < 9, true);
});
