const DIRECTIONS = {
  "+x": [1, 0, 0],
  "-x": [-1, 0, 0],
  "+y": [0, 1, 0],
  "-y": [0, -1, 0],
  "+z": [0, 0, 1],
  "-z": [0, 0, -1],
};

const OPPOSITE = {
  "+x": "-x",
  "-x": "+x",
  "+y": "-y",
  "-y": "+y",
  "+z": "-z",
  "-z": "+z",
};

export const PHASES = [
  { name: "Prism", head: "#7de9ff", body: "#2563eb", accent: "#4ade80" },
  { name: "Solar", head: "#ffe0aa", body: "#f97316", accent: "#f472b6" },
  { name: "Abyss", head: "#cdb9fe", body: "#8b5cf6", accent: "#22d3ee" },
];

export function createGame({
  gridSize = 5,
  initialSnake = [[2, 2, 2], [2, 2, 1], [2, 2, 0], [2, 2, 4], [2, 2, 3]],
  initialDirection = "+z",
  food = null,
  randomInt = Math.random,
} = {}) {
  const snake = initialSnake.map((cell) => [cell[0], cell[1], cell[2]]);
  const resolvedFood = food
    ? [food[0], food[1], food[2]]
    : spawnFood({ gridSize, points: snake, randomInt });

  return {
    gridSize,
    snake,
    direction: initialDirection,
    pendingDirections: [],
    food: resolvedFood,
    score: 0,
    foodEaten: 0,
    phase: 0,
    gameOver: false,
    win: false,
    randomInt,
  };
}

export function queueDirection(state, direction) {
  if (!DIRECTIONS[direction]) {
    return state;
  }
  const activeDirection = state.pendingDirections.length > 0
    ? state.pendingDirections[state.pendingDirections.length - 1]
    : state.direction;
  if (direction === activeDirection || direction === OPPOSITE[activeDirection]) {
    return state;
  }

  return {
    ...state,
    pendingDirections: [...state.pendingDirections, direction].slice(-2),
  };
}

export function stepGame(state) {
  if (state.gameOver) {
    return state;
  }

  const direction = state.pendingDirections.length > 0
    ? state.pendingDirections[0]
    : state.direction;
  const move = DIRECTIONS[direction];
  if (!move) {
    return state;
  }

  const head = state.snake[0];
  const nextPoint = [
    head[0] + move[0],
    head[1] + move[1],
    head[2] + move[2],
  ];
  const nextPointOnCube = wrapAround(state.gridSize, nextPoint);
  const ateFood = samePoint(nextPointOnCube, state.food);
  const blocked = containsPoint(
    state.snake,
    nextPointOnCube,
    ateFood ? state.snake.length : state.snake.length - 1,
  );
  if (blocked) {
    return { ...state, gameOver: true };
  }

  const nextSnake = ateFood
    ? [nextPointOnCube, ...state.snake]
    : [nextPointOnCube, ...state.snake.slice(0, -1)];
  const nextFoodEaten = ateFood ? state.foodEaten + 1 : state.foodEaten;
  const nextPhase = ateFood && nextFoodEaten % 5 === 0
    ? (state.phase + 1) % PHASES.length
    : state.phase;
  const nextFood = ateFood
    ? spawnFood({
      gridSize: state.gridSize,
      points: nextSnake,
      randomInt: state.randomInt,
    })
    : state.food;

  return {
    ...state,
    snake: nextSnake,
    foodEaten: nextFoodEaten,
    phase: nextPhase,
    direction,
    pendingDirections: state.pendingDirections.slice(1),
    score: ateFood ? state.score + 1 : state.score,
    food: nextFood,
    gameOver: nextFood === null,
    win: nextFood === null,
  };
}

export function getPhase(index) {
  return PHASES[index % PHASES.length];
}

export function getStepDelay(phase) {
  return 220 - phase * 26;
}

export function spawnFood({ gridSize, points = [], randomInt = Math.random }) {
  const occupied = new Set(points.map((cell) =>
    `${cell[0]},${cell[1]},${cell[2]}`,
  ));
  const freeCells = [];
  for (let x = 0; x < gridSize; x += 1) {
    for (let y = 0; y < gridSize; y += 1) {
      for (let z = 0; z < gridSize; z += 1) {
        const key = `${x},${y},${z}`;
        if (!occupied.has(key)) {
          freeCells.push([x, y, z]);
        }
      }
    }
  }
  if (freeCells.length === 0) {
    return null;
  }
  return freeCells[Math.floor(randomInt() * freeCells.length)];
}

function wrapAround(gridSize, [x, y, z]) {
  return [
    (x + gridSize) % gridSize,
    (y + gridSize) % gridSize,
    (z + gridSize) % gridSize,
  ];
}

function containsPoint(cells, target, limit = cells.length) {
  for (let index = 0; index < limit; index += 1) {
    const [x, y, z] = cells[index];
    if (x === target[0] && y === target[1] && z === target[2]) {
      return true;
    }
  }
  return false;
}

function samePoint([ax, ay, az], [bx, by, bz]) {
  return ax === bx && ay === by && az === bz;
}
