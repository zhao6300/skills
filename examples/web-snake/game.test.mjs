import test from "node:test";
import assert from "node:assert/strict";
import { createGame, getPhaseWalls, getWallAt, queueDirection, stepGame } from "./game.js";

test("snake advances without eating", () => {
  const game = createGame({
    initialSnake: [[2, 2], [1, 2], [0, 2]],
    initialDirection: "right",
    food: [10, 10],
  });
  const result = stepGame(game);
  assert.equal(result.snake[0][0], 3);
  assert.equal(result.snake[0][1], 2);
  assert.equal(result.score, 0);
  assert.equal(result.gameOver, false);
});

test("snake grows after eating food", () => {
  const game = createGame({
    initialSnake: [[9, 7], [8, 7]],
    initialDirection: "right",
    food: [10, 7],
  });
  const result = stepGame(game);
  assert.equal(result.score, 1);
  assert.equal(result.snake.length, 3);
  assert.equal(result.snake[0][0], 10);
  assert.equal(result.gameOver, false);
});

test("snake dies after hitting the wall", () => {
  const game = createGame({
    initialSnake: [[2, 3], [1, 3]],
    initialDirection: "right",
    food: [10, 10],
  });
  const result = stepGame(game);
  assert.equal(result.gameOver, true);
});

test("snake dies after colliding with its own body", () => {
  const game = createGame({
    initialSnake: [[2, 2], [1, 2], [1, 3], [2, 3]],
    initialDirection: "down",
    food: [10, 10],
  });
  const result = stepGame(game);
  assert.equal(result.gameOver, true);
});

test("five orbs advance the phase and reset the phase tally", () => {
  let game = createGame();
  for (let index = 0; index < 5; index += 1) {
    game = { ...game, food: [8 + index, 7] };
    game = stepGame(game);
    assert.equal(game.gameOver, false);
    assert.equal(game.phase, Math.floor((index + 1) / 5));
    assert.equal(game.foodEaten, index + 1);
  }
  assert.equal(game.phase, 1);
  assert.equal(game.foodEaten, 5);
});

test("the opening orb never lands on a wall", () => {
  const game = createGame();
  assert.equal(getWallAt([8, 7], 0), false);
  assert.equal(getPhaseWalls(0).some((wall) => wall[0] === game.food[0] && wall[1] === game.food[1]), false);
});

test("snake can reverse direction without immediate collision", () => {
  const game = createGame({
    initialSnake: [[2, 2], [1, 2], [0, 2]],
    initialDirection: "right",
    food: [10, 10],
  });
  const result = stepGame({ ...game, direction: "up" });
  assert.equal(result.snake[0][1], 1);
});

test("engine keeps moving without extra input", () => {
  let game = createGame({
    initialDirection: "right",
    food: [10, 7],
  });
  game = queueDirection(game, "right");
  const startHead = game.snake[0];
  for (let index = 0; index < 10; index += 1) {
    game = stepGame(game);
    assert.equal(game.gameOver, false);
  }
  const endHead = game.snake[0];
  assert.equal(endHead[0], (startHead[0] + 10) % game.gridSize);
  assert.equal(endHead[1], startHead[1]);
});

test("every board edge can wrap around without ending the run", () => {
  const cases = [
    { initialSnake: [[14, 7], [13, 7], [12, 7]], initialDirection: "right", expected: [0, 7] },
    { initialSnake: [[0, 7], [1, 7], [2, 7]], initialDirection: "left", expected: [14, 7] },
    { initialSnake: [[7, 14], [7, 13], [7, 12]], initialDirection: "down", expected: [7, 0] },
    { initialSnake: [[7, 0], [7, 1], [7, 2]], initialDirection: "up", expected: [7, 14] },
  ];
  for (const testCase of cases) {
    const game = createGame({ ...testCase, food: [8, 8] });
    const wrapped = stepGame(game);
    assert.deepEqual(wrapped.snake[0], testCase.expected);
    assert.equal(wrapped.gameOver, false);
  }
});
