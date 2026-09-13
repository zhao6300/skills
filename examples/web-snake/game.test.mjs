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
