import { createGame, getPhase, getPhaseWalls, queueDirection, stepGame } from "./game.js";

const canvas = document.querySelector('[data-role="board"]');
const context = canvas.getContext("2d");
const scoreElement = document.querySelector('[data-role="score"]');
const statusElement = document.querySelector('[data-role="status"]');
const startButton = document.querySelector('[data-action="start"]');
const pauseButton = document.querySelector('[data-action="pause"]');
const restartButton = document.querySelector('[data-action="restart"]');
const directionButtons = document.querySelectorAll("[data-direction]");

let state = createGame();
let mode = "idle";
let timerId = 0;
let pointerStart = null;

const keyMap = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
  w: "up",
  s: "down",
  a: "left",
  d: "right",
};

function render() {
  const cellSize = canvas.width / state.gridSize;
  const phase = getPhase(state.phase);
  context.fillStyle = "#08131f";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.strokeStyle = "#13223a";
  context.lineWidth = 1;
  for (let index = 0; index <= state.gridSize; index += 1) {
    const offset = Math.round(index * cellSize);
    context.beginPath();
    context.moveTo(offset, 0);
    context.lineTo(offset, canvas.height);
    context.moveTo(0, offset);
    context.lineTo(canvas.width, offset);
    context.stroke();
  }

  if (state.food) {
    const pulse = 0.3 + 0.08 * Math.sin(Date.now() / 160);
    context.save();
    context.shadowColor = phase.accent;
    context.shadowBlur = 16;
    context.fillStyle = phase.core;
    drawCell(state.food, cellSize, pulse);
    context.restore();
  }

  getPhaseWalls(state.phase).forEach((wall) => {
    context.fillStyle = `${phase.wall}cc`;
    drawBlock(wall, cellSize, 0.68);
    context.fillStyle = `${phase.accent}18`;
    drawBlock(wall, cellSize, 0.88);
  });

  drawSnake(cellSize, phase);
}

function drawCell([x, y], cellSize, radiusFactor) {
  const radius = cellSize * radiusFactor;
  context.beginPath();
  context.arc(x * cellSize + cellSize / 2, y * cellSize + cellSize / 2, radius, 0, Math.PI * 2);
  context.fill();
}

function drawSnake(cellSize, phase) {
  if (state.snake.length === 0) {
    return;
  }

  const center = ([x, y]) => [x * cellSize + cellSize / 2, y * cellSize + cellSize / 2];
  const start = center(state.snake[0]);

  context.save();
  context.lineCap = "round";
  context.lineJoin = "round";
  const end = center(state.snake[state.snake.length - 1]);
  const bodyGradient = context.createLinearGradient(
    start[0],
    start[1],
    end[0],
    end[1],
  );
  bodyGradient.addColorStop(0, phase.head);
  bodyGradient.addColorStop(1, phase.body);
  context.strokeStyle = bodyGradient;
  context.lineWidth = cellSize * 0.58;
  context.beginPath();
  context.moveTo(start[0], start[1]);
  for (let index = 1; index < state.snake.length; index += 1) {
    const point = center(state.snake[index]);
    context.lineTo(point[0], point[1]);
  }
  context.stroke();
  context.strokeStyle = "rgba(255, 255, 255, 0.14)";
  context.lineWidth = cellSize * 0.18;
  context.stroke();

  drawSnakeHead(center(state.snake[0]), cellSize, phase);
  context.restore();
}

function drawSnakeHead([x, y], cellSize, phase) {
  const radius = cellSize * 0.33;
  const direction = state.direction;
  const headCenter = [
    x,
    y,
  ];
  const angle = direction === "up"
    ? Math.PI / 2
    : direction === "down"
      ? -Math.PI / 2
      : direction === "left"
        ? 0
        : Math.PI;
  const eyeAngle = angle + Math.PI * 0.42;
  const eyeDistance = radius * 0.48;
  const eyeRadius = cellSize * 0.085;

  context.save();
  context.beginPath();
  context.arc(headCenter[0], headCenter[1], radius, 0, Math.PI * 2);
  context.fillStyle = phase.head;
  context.fill();

  for (const mirror of [1, -1]) {
    const eyeX = headCenter[0] + Math.cos(eyeAngle * mirror) * eyeDistance;
    const eyeY = headCenter[1] + Math.sin(eyeAngle * mirror) * eyeDistance;
    context.beginPath();
    context.arc(eyeX, eyeY, eyeRadius, 0, Math.PI * 2);
    context.fillStyle = "#012";
    context.fill();
    context.beginPath();
    context.arc(
      eyeX + eyeRadius * 0.3,
      eyeY - eyeRadius * 0.3,
      eyeRadius * 0.35,
      0,
      Math.PI * 2,
    );
    context.fillStyle = "#dbe7ff";
    context.fill();
  }
  context.restore();
}

function drawBlock([x, y], cellSize, radiusFactor) {
  context.beginPath();
  context.roundRect(
    x * cellSize + cellSize * (1 - radiusFactor) / 2,
    y * cellSize + cellSize * (1 - radiusFactor) / 2,
    cellSize * radiusFactor,
    cellSize * radiusFactor,
    cellSize * 0.16,
  );
  context.fill();
}

function updateStatus(text) {
  statusElement.textContent = text;
}

function updateControls() {
  pauseButton.disabled = mode !== "running";
  startButton.disabled = mode === "running";
  restartButton.disabled = mode === "idle";
}

function updateScore() {
  const phaseName = getPhase(state.phase).name;
  const phaseStep = (state.foodEaten % 5) + 1;
  scoreElement.textContent = `${state.score} · ${phaseName} ${phaseStep}/5`;
}

function getStepDelay(phase) {
  return 165 - phase * 18;
}

function startGame() {
  if (mode === "running") {
    return;
  }
  mode = "running";
  updateStatus("Running");
  updateControls();
  timerId = setTimeout(() => {
    state = stepGame(state);
    if (state.gameOver) {
      endGame();
      return;
    }
    render();
    updateScore();
    startGame();
  }, getStepDelay(state.phase));
}

function pauseGame() {
  if (mode !== "running") {
    return;
  }
  clearTimeout(timerId);
  mode = "paused";
  updateStatus(`Paused · ${phaseName(state)}`);
  updateControls();
}

function endGame() {
  clearTimeout(timerId);
  mode = "game-over";
  render();
  updateStatus(`Weaved through ${state.phase} barriers · final score ${state.score}`);
  updateControls();
}

function restartGame() {
  clearTimeout(timerId);
  timerId = 0;
  state = createGame();
  mode = "idle";
  render();
  updateScore();
  updateStatus(`Ready · ${phaseName(state)}`);
  updateControls();
}

function setDirection(direction) {
  if (mode === "game-over") {
    return;
  }
  if (mode === "idle" || mode === "paused") {
    startGame();
  }
  state = queueDirection(state, direction);
}

function phaseName(value) {
  const phase = getPhase(value.phase);
  return `${phase.name} ${(value.foodEaten % 5) + 1}/5`;
}

function handleGesture(event) {
  if (!pointerStart) {
    return;
  }
  const deltaX = event.clientX - pointerStart.x;
  const deltaY = event.clientY - pointerStart.y;
  const threshold = 18;
  if (Math.abs(deltaX) < threshold && Math.abs(deltaY) < threshold) {
    return;
  }
  const direction = Math.abs(deltaX) > Math.abs(deltaY)
    ? (deltaX > 0 ? "right" : "left")
    : (deltaY > 0 ? "down" : "up");
  event.preventDefault();
  setDirection(direction);
}

function handleKey(event) {
  const direction = keyMap[event.key];
  if (direction) {
    event.preventDefault();
    setDirection(direction);
  }
  if (event.key === "p") {
    event.preventDefault();
    pauseGame();
  }
  if (event.key === "r") {
    event.preventDefault();
    restartGame();
  }
  if (event.key === " ") {
    event.preventDefault();
    if (mode === "running") {
      pauseGame();
    } else if (mode === "idle") {
      startGame();
    }
  }
  if (event.key === "Enter") {
    event.preventDefault();
    startGame();
  }
}

function initialize() {
  canvas.width = state.gridSize * 32;
  canvas.height = state.gridSize * 32;
  startButton.addEventListener("click", startGame);
  pauseButton.addEventListener("click", pauseGame);
  restartButton.addEventListener("click", restartGame);
  directionButtons.forEach((button) => {
    button.addEventListener("click", () => setDirection(button.dataset.direction));
  });
  canvas.style.touchAction = "none";
  canvas.addEventListener("pointerdown", (event) => {
    pointerStart = { x: event.clientX, y: event.clientY };
  });
  canvas.addEventListener("pointerup", handleGesture);
  canvas.addEventListener("pointercancel", () => {
    pointerStart = null;
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      pauseGame();
    }
  });
  document.addEventListener("keydown", handleKey);
  render();
  updateStatus(`Ready · ${phaseName(state)}`);
  updateControls();
}

initialize();
