import { strict as assert } from "node:assert";
import test from "node:test";

import { applyMove, createGame } from "./game.js";
import { suggestAiMove } from "./ai.js";

test("AI advisor does not stall by replaying a king shuffle", () => {
  const suggestion = suggestAiMove(createGame());
  const source = createGame().board[suggestion.from.y][suggestion.from.x];
  assert.notEqual(suggestion.from.x, 4);
  assert.notEqual(source.type, "general");
});

test("AI progresses through game states without repeating a prior turn snapshot", () => {
  let state = createGame();
  const seen = new Set();
  for (let moveIndex = 0; moveIndex < 20; moveIndex += 1) {
    const suggestion = suggestAiMove(state);
    assert.ok(suggestion);
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
