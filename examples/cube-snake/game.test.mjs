import { strict as assert } from "node:assert";
import test from "node:test";
import {
  createGame,
  getPhase,
  queueDirection,
  stepGame,
} from "./game.js";

function random([values]) {
  let index = 0;
  return () => values[index++ % values.length];
}

test("moves the head, removes the tail, and keeps the loop reversible", () => {
  const state = createGame({
    gridSize: 9,
    initialSnake: [[4, 4, 4], [4, 4, 3], [4, 4, 2]],
    initialDirection: "+z",
    food: [8, 8, 8],
  });

  const stepped = stepGame(state);

  assert.equal(stepped.snake[0][2], 5);
  assert.equal(stepped.snake.length, 3);
  assert.equal(stepped.score, 0);
  assert.deepEqual(stepped.snake, [[4, 4, 5], [4, 4, 4], [4, 4, 3]]);
});

test("wraps around every cube face without leaving the grid", () => {
  const state = createGame({
    gridSize: 9,
    initialSnake: [[0, 4, 4], [1, 4, 4], [2, 4, 4]],
    initialDirection: "-x",
    food: [8, 8, 8],
  });

  const stepped = stepGame(state);

  assert.equal(stepped.snake[0][0], 8);
  assert.equal(stepped.gameOver, false);
});

test("ends the run when the head enters its own body", () => {
  const state = createGame({
    gridSize: 9,
    initialSnake: [[4, 4, 4], [4, 4, 5], [4, 4, 6]],
    initialDirection: "+z",
    food: [8, 8, 8],
  });

  const stepped = stepGame(state);

  assert.equal(stepped.gameOver, true);
  assert.equal(stepped.score, 0);
});

test("queues valid turns and rejects immediate reversal", () => {
  const state = createGame({
    gridSize: 9,
    initialDirection: "+z",
  });

  const forward = queueDirection(state, "+z");
  const reversal = queueDirection(state, "-z");
  const turn = queueDirection(state, "+x");

  assert.deepEqual(forward.pendingDirections, []);
  assert.deepEqual(reversal.pendingDirections, []);
  assert.deepEqual(turn.pendingDirections, ["+x"]);
  assert.equal(turn.direction, "+z");
});

test("eating increases score and advances the phase every five orbs", () => {
  const state = createGame({
    gridSize: 9,
    initialSnake: [[0, 0, 0], [0, 1, 0]],
    initialDirection: "+z",
    food: [0, 0, 1],
  });

  state.foodEaten = 4;
  state.score = 4;
  const stepped = stepGame(state);

  assert.equal(stepped.score, 5);
  assert.equal(stepped.foodEaten, 5);
  assert.equal(stepped.phase, 1);
  assert.equal(getPhase(stepped.phase).name, "Solar");
});

test("spawnFood avoids occupied space and returns null when full", () => {
  const points = [];
  for (let x = 0; x < 9; x += 1) {
    for (let y = 0; y < 9; y += 1) {
      for (let z = 0; z < 9; z += 1) {
        points.push([x, y, z]);
      }
    }
  }
  const fullyOccupied = createGame({
    gridSize: 9,
    initialSnake: points,
    initialDirection: "+z",
    randomInt: random([[0.4]]),
  });
  assert.equal(fullyOccupied.food, null);

  const emptyCube = createGame({
    gridSize: 9,
    initialSnake: [],
    randomInt: random([[0.5]]),
  });
  assert.deepEqual(emptyCube.food, [4, 4, 4]);
});
