import { strict as assert } from "node:assert";
import test from "node:test";

import { applyMove, createGame } from "./game.js";
import { suggestAiMove } from "./ai.js";
import { repetitionPenalty, seeScore, threatScore } from "./threat.js";

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

test("AI accepts a shallow casual-game search depth", () => {
  const suggestion = suggestAiMove(createGame(), { depth: 1 });
  assert.ok(suggestion);
  assert.equal(suggestion.depth, 1);
  assert.equal(suggestion.from.x >= 0 && suggestion.from.x < 9, true);
  assert.equal(suggestion.to.x >= 0 && suggestion.to.x < 9, true);
});

test("SEE estimates protected bad exchanges before choosing them", () => {
  const state = createGame();
  state.board = Array.from({ length: 10 }, () => Array.from({ length: 9 }, () => null));
  state.board[0][4] = { side: "black", type: "general" };
  state.board[3][3] = { side: "black", type: "soldier" };
  state.board[3][5] = { side: "red", type: "chariot" };
  state.board[3][6] = { side: "black", type: "soldier" };
  state.board[3][7] = { side: "black", type: "chariot" };
  state.board[5][4] = { side: "black", type: "soldier" };
  state.board[8][4] = { side: "red", type: "general" };
  state.turn = "red";
  state.positionHistory = [];

  const safeCapture = seeScore({ from: { x: 5, y: 3 }, to: { x: 3, y: 3 } }, state);
  const badExchange = seeScore({ from: { x: 5, y: 3 }, to: { x: 6, y: 3 } }, state);
  assert.equal(safeCapture > badExchange, true);
  assert.equal(safeCapture > 0, true);
});

test("threat score rewards mobile material over trapped material", () => {
  const state = createGame();
  const makeState = (placement) => {
    state.board = Array.from({ length: 10 }, () => Array.from({ length: 9 }, () => null));
    state.board[0][4] = { side: "black", type: "general" };
    state.board[8][4] = { side: "red", type: "general" };
    state.board[placement.y][placement.x] = { side: "red", type: "chariot" };
    return { ...state, turn: "red", gameOver: false, winner: null, positionHistory: [] };
  };
  const mobile = threatScore(makeState({ x: 4, y: 5 }), "red");
  const trapped = threatScore(makeState({ x: 0, y: 9 }), "red");
  assert.equal(mobile > trapped, true);
});

test("root scores penalize moves that repeat a prior position", () => {
  const state = createGame();
  state.board = Array.from({ length: 10 }, () => Array.from({ length: 9 }, () => null));
  state.board[0][4] = { side: "black", type: "general" };
  state.board[8][4] = { side: "red", type: "general" };
  state.turn = "red";
  state.positionHistory = [];
  const next = { ...state, turn: "black" };
  const repeatedKey = {
    turn: next.turn,
    board: next.board.map((row) => row.map((piece) => (piece ? `${piece.side[0]}${piece.type[0]}` : ".")).join("")),
  };
  state.positionHistory = [
    `${repeatedKey.turn}:${repeatedKey.board.join("|")}`,
  ];

  assert.equal(repetitionPenalty(state, next), 180);
});
