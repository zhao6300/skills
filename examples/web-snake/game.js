const directions = {
  up: [0, -1],
  down: [0, 1],
  left: [-1, 0],
  right: [1, 0],
};

export const PHASES = [
  { name: "Seed", body: "#22c55e", head: "#34d399", core: "#4ade80", wall: "#166534", accent: "#a3e635" },
  { name: "Tide", body: "#22d3ee", head: "#67e8f9", core: "#facc15", wall: "#155e75", accent: "#818cf8" },
  { name: "Ember", body: "#fb7185", head: "#fda4af", core: "#fbbf24", wall: "#7f1d1d", accent: "#f97316" },
  { name: "Void", body: "#a855f7", head: "#d8b4fe", core: "#f43f5e", wall: "#4c1d95", accent: "#38bdf8" },
];

const PHASE_WALLS = [
  [[3, 3], [4, 3], [5, 3], [3, 4], [5, 4]],
  [[9, 5], [10, 5], [9, 6], [10, 6], [11, 5]],
  [[3, 10], [4, 10], [5, 10], [6, 10], [7, 10], [9, 10], [10, 10], [11, 10], [12, 10]],
  [[2, 2], [2, 12], [12, 2], [12, 12], [6, 5], [8, 5], [6, 9], [8, 9]],
];

export function createGame({
  gridSize = 15,
  initialSnake = [[7, 7], [6, 7], [5, 7]],
  initialDirection = "right",
  food = null,
  randomInt = Math.random,
} = {}) {
  const snake = initialSnake.map((cell) => [cell[0], cell[1]]);
  const resolvedFood = food ? [food[0], food[1]] : spawnFood({ gridSize, snake, randomInt });

  return {
    gridSize,
    phase: 0,
    snake,
    direction: initialDirection,
    pendingDirections: [],
    score: 0,
    foodEaten: 0,
    gameOver: false,
    food: resolvedFood,
    randomInt,
  };
}

export function queueDirection(state, direction) {
  if (!directions[direction]) {
    return state;
  }
  if (state.direction === opposite(direction)) {
    return state;
  }
  const nextPendingDirections = [...state.pendingDirections, direction];
  return { ...state, pendingDirections: nextPendingDirections.slice(-2) };
}

export function stepGame(state) {
  if (state.gameOver) {
    return state;
  }
  const direction = state.pendingDirections.length > 0
    ? state.pendingDirections[0]
    : state.direction;
  const move = directions[direction];
  if (!move) {
    return state;
  }

  const head = state.snake[0];
  const nextHead = [head[0] + move[0], head[1] + move[1]];
  const nextHeadOnBoard = isOutside(state.gridSize, nextHead)
    ? wrapAround(state.gridSize, nextHead)
    : nextHead;
  const blockedWall = getWallAt(nextHeadOnBoard, state.phase);
  if (containsCell(state.snake, nextHeadOnBoard) || blockedWall) {
    return { ...state, gameOver: true };
  }


  const ateFood = state.food[0] === nextHeadOnBoard[0] && state.food[1] === nextHeadOnBoard[1];
  const nextSnake = ateFood
    ? [nextHeadOnBoard, ...state.snake]
    : [nextHeadOnBoard, ...state.snake.slice(0, -1)];
  const nextFoodEaten = ateFood ? state.foodEaten + 1 : state.foodEaten;
  const nextPhase = ateFood && nextFoodEaten % 5 === 0
    ? (state.phase + 1) % PHASES.length
    : state.phase;
  const nextFood = ateFood
    ? spawnFood({ gridSize: state.gridSize, snake: nextSnake, walls: PHASE_WALLS[nextPhase], randomInt: state.randomInt })
    : state.food;

  return {
    ...state,
    snake: nextSnake,
    phase: nextPhase,
    foodEaten: nextFoodEaten,
    direction,
    pendingDirections: state.pendingDirections.length > 0
      ? state.pendingDirections.slice(1)
      : state.pendingDirections,
    score: ateFood ? state.score + 1 : state.score,
    food: nextFood,
  };
}

export function getWallAt(cell, phase) {
  return PHASE_WALLS[phase]?.some((wall) => wall[0] === cell[0] && wall[1] === cell[1]) ?? false;
}

export function getPhaseWalls(phase) {
  return PHASE_WALLS[phase] ?? [];
}

export function getPhase(index) {
  return PHASES[index % PHASES.length];
}

function wrapAround(gridSize, [x, y]) {
  return [
    (x + gridSize) % gridSize,
    (y + gridSize) % gridSize,
  ];
}

function spawnFood({ gridSize, snake, walls = [], randomInt }) {
  const occupiedCells = new Set(snake.map((cell) => `${cell[0]},${cell[1]}`));
  walls.forEach((wall) => occupiedCells.add(`${wall[0]},${wall[1]}`));
  const freeCells = [];
  for (let y = 0; y < gridSize; y += 1) {
    for (let x = 0; x < gridSize; x += 1) {
      const key = `${x},${y}`;
      if (!occupiedCells.has(key)) {
        freeCells.push([x, y]);
      }
    }
  }
  if (freeCells.length === 0) {
    return null;
  }
  return freeCells[Math.floor(randomInt() * freeCells.length)];
}

function isOutside(gridSize, [x, y]) {
  return x < 0 || y < 0 || x >= gridSize || y >= gridSize;
}

function containsCell(cells, [x, y]) {
  return cells.some((cell) => cell[0] === x && cell[1] === y);
}

function opposite(direction) {
  return direction === "up" ? "down" : direction === "down" ? "up" : direction === "left" ? "right" : "left";
}
