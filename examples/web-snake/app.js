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

const keyMap = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
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

  state.snake.forEach((cell, index) => {
    context.fillStyle = index === 0 ? phase.head : phase.body;
    drawCell(cell, cellSize, 1);
    if (index === 0) {
      context.fillStyle = "#012";
      drawCell(cell, cellSize, 0.05);
    } else if (index % 4 === 0) {
      context.fillStyle = phase.accent;
      drawCell(cell, cellSize, 0.39);
    }
  });
}

function drawCell([x, y], cellSize, radiusFactor) {
  const radius = cellSize * radiusFactor;
  context.beginPath();
  context.arc(x * cellSize + cellSize / 2, y * cellSize + cellSize / 2, radius, 0, Math.PI * 2);
  context.fill();
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
  clearInterval(timerId);
  mode = "paused";
  updateStatus(`Paused · ${phaseName(state)}`);
  updateControls();
}

function endGame() {
  clearInterval(timerId);
  mode = "game-over";
  render();
  updateStatus(`Weaved through ${state.phase} barriers · final score ${state.score}`);
  updateControls();
}

function restartGame() {
  clearInterval(timerId);
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
  state = queueDirection(state, direction);
}

function phaseName(value) {
  const phase = getPhase(value.phase);
  return `${phase.name} ${(value.foodEaten % 5) + 1}/5`;
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
  document.addEventListener("keydown", handleKey);
  render();
  updateStatus(`Ready · ${phaseName(state)}`);
  updateControls();
}

initialize();
