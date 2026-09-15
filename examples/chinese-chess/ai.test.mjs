import { strict as assert } from "node:assert";
import test from "node:test";

import { createGame } from "./game.js";
import { suggestAiMove } from "./ai.js";

test("AI advisor can recommend a legal move", () => {
  const suggestion = suggestAiMove(createGame());
  assert.ok(suggestion);
  assert.equal(suggestion.from.x >= 0 && suggestion.from.x < 9, true);
  assert.equal(suggestion.to.x >= 0 && suggestion.to.x < 9, true);
});
