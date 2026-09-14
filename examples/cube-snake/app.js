import { createGame, getPhase, getStepDelay, queueDirection, stepGame } from "./game.js";

const boardElement = document.querySelector('[data-role="board"]');
const scoreElement = document.querySelector('[data-role="score"]');
const lengthElement = document.querySelector('[data-role="length"]');
const phaseElement = document.querySelector('[data-role="phase"]');
const statusElement = document.querySelector('[data-role="status"]');
const startButton = document.querySelector('[data-role="start"]');
const pauseButton = document.querySelector('[data-role="pause"]');
const restartButton = document.querySelector('[data-role="restart"]');
const bestElement = document.querySelector('[data-role="best"]');
const orbitInput = document.querySelector("#orbit");
const pitchInput = document.querySelector("#pitch");

const keysToDirections = {
  ArrowLeft: "-x",
  ArrowRight: "+x",
  ArrowUp: "-z",
  ArrowDown: "+z",
  w: "-y",
  s: "+y",
};

let state = createGame();
let mode = "idle";
let animationFrameId = 0;
let lastStepAt = 0;

render();
updateButtons();
updateStatus("按开始或方向键");

startButton.addEventListener("click", startGame);
pauseButton.addEventListener("click", pauseGame);
restartButton.addEventListener("click", restartGame);
orbitInput.addEventListener("input", updateCamera);
pitchInput.addEventListener("input", updateCamera);
window.addEventListener("keydown", handleKeydown);
bindStageDrag();

function handleKeydown(event) {
  if (keysToDirections[event.key]) {
    event.preventDefault();
    setDirection(keysToDirections[event.key]);
    return;
  }

  if (event.key === "p") {
    event.preventDefault();
    pauseGame();
  }
  if (event.key === "r") {
    event.preventDefault();
    restartGame();
  }
}

function setDirection(direction) {
  if (state.gameOver) {
    return;
  }
  if (mode !== "running") {
    startGame();
  }
  state = queueDirection(state, direction);
}

function startGame() {
  if (state.gameOver) {
    state = createGame();
  }
  mode = "running";
  lastStepAt = performance.now();
  if (!animationFrameId) {
    animationFrameId = requestAnimationFrame(tick);
  }
  render();
  updateButtons();
  updateStatus("进行中");
}

function pauseGame() {
  if (mode !== "running" || state.gameOver) {
    return;
  }
  cancelAnimationFrame(animationFrameId);
  animationFrameId = 0;
  mode = "paused";
  render();
  updateButtons();
  updateStatus("已暂停");
}

function restartGame() {
  cancelAnimationFrame(animationFrameId);
  animationFrameId = 0;
  state = createGame();
  mode = "idle";
  lastStepAt = performance.now();
  render();
  updateButtons();
  updateStatus("按开始或方向键");
}

function tick(now) {
  animationFrameId = 0;
  if (mode !== "running") {
    return;
  }
  const stepDelay = getStepDelay(state.phase);
  if (now - lastStepAt < stepDelay) {
    animationFrameId = requestAnimationFrame(tick);
    return;
  }
  lastStepAt = now;
  state = stepGame(state);
  updateBestScore();
  render();
  if (state.gameOver) {
    mode = "over";
    updateButtons();
    updateStatus(`结束 · 得分 ${state.score}`);
    return;
  }
  animationFrameId = requestAnimationFrame(tick);
}

function render() {
  const phase = getPhase(state.phase);
  document.documentElement.style.setProperty("--head", phase.head);
  document.documentElement.style.setProperty("--body", phase.body);
  document.documentElement.style.setProperty("--orb", phase.accent);

  const boardChildren = [];
  if (state.food) {
    const orb = document.createElement("div");
    orb.className = "orb";
    orb.style.setProperty("--x", String(state.food[0]));
    orb.style.setProperty("--y", String(state.food[1]));
    orb.style.setProperty("--z", String(state.food[2]));
    boardChildren.push(orb);
  }

  state.snake.forEach((cell, index) => {
    const element = document.createElement("div");
    element.className = index === 0 ? "cell head" : "cell";
    element.style.setProperty("--x", String(cell[0]));
    element.style.setProperty("--y", String(cell[1]));
    element.style.setProperty("--z", String(cell[2]));
    boardChildren.push(element);
  });

  boardElement.replaceChildren(...boardChildren);
  scoreElement.textContent = String(state.score);
  lengthElement.textContent = String(state.snake.length);
  phaseElement.textContent = phase.name;
}

function updateBestScore() {
  const savedBest = Number(window.localStorage.getItem("cube-snake") ?? 0);
  if (state.score > savedBest) {
    window.localStorage.setItem("cube-snake", String(state.score));
  }
  bestElement.textContent = String(Math.max(savedBest, state.score));
}

function updateButtons() {
  startButton.disabled = mode === "running";
  pauseButton.disabled = mode !== "running";
  restartButton.disabled = mode === "idle" && state.score === 0;
}

function updateCamera() {
  document.documentElement.style.setProperty("--orbit", `${orbitInput.value}deg`);
  document.documentElement.style.setProperty("--pitch", `${pitchInput.value}deg`);
}

function bindStageDrag() {
  const stage = document.querySelector(".stage");
  let drag = null;
  stage.addEventListener("pointerdown", (event) => {
    drag = { x: event.clientX, y: event.clientY, orbit: orbitInput.valueAsNumber, pitch: pitchInput.valueAsNumber };
    stage.setPointerCapture(event.pointerId);
    stage.dataset.dragging = "true";
  });
  stage.addEventListener("pointermove", (event) => {
    if (!drag) {
      return;
    }
    const deltaX = event.clientX - drag.x;
    const deltaY = event.clientY - drag.y;
    orbitInput.value = String(clamp(drag.orbit + deltaX * 0.4, -160, 160));
    pitchInput.value = String(clamp(drag.pitch - deltaY * 0.4, -80, 80));
    updateCamera();
  });
  stage.addEventListener("pointerup", clearDrag);
  stage.addEventListener("pointercancel", clearDrag);

  function clearDrag() {
    drag = null;
    stage.dataset.dragging = "false";
  }
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function updateStatus(text) {
  statusElement.textContent = text;
}
