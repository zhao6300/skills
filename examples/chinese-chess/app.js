import { applyMove, createGame, getGameStatus, getLegalMoves, getPieceName, getPieceValues } from "./game.js";
import { describeAiMove, suggestAiMove } from "./ai.js";

const boardElement = document.querySelector('[data-role="board"]');
const statusElement = document.querySelector('[data-role="status"]');
const turnElement = document.querySelector('[data-role="turn"]');
const aiCardElement = document.querySelector('[data-role="ai-card"]');
const applySuggestionButton = document.querySelector('[data-role="apply suggestion"]');
const restartButton = document.querySelector('[data-role="restart"]');
const modeButtons = document.querySelectorAll('[data-mode]');

let state = createGame();
let selectedPoint = null;
let suggestion = null;
let mode = "two-player";

render();

function render(statusMessage) {
  renderBoard();
  suggestion = suggestAiMove(state);
  const gameState = getGameStatus(state);
  const defaultStatus = gameState.gameOver
    ? gameState.winner
      ? `${gameState.winner === "red" ? "红方" : "黑方"}胜利`
      : "双方和棋"
    : gameState.checkedSide
      ? `${gameState.checkedSide === "red" ? "红方" : "黑方"}被将军`
      : "请选择棋子";
  statusElement.textContent = statusMessage && !gameState.gameOver ? statusMessage : defaultStatus;
  turnElement.textContent = state.turn === "red" ? "红方 · 先手" : "黑方 · 后手";
  aiCardElement.textContent = suggestion ? describeAiMove(suggestion, state) : "No suggestion";
  applySuggestionButton.disabled = !suggestion || gameState.gameOver;
  restartButton.textContent = gameState.gameOver ? "查看平局 / 重开" : "重新开始完整对局";
}

function renderBoard() {
  const cells = [];
  for (let y = 0; y < 10; y += 1) {
    for (let x = 0; x < 9; x += 1) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "cell";
      button.dataset.x = String(x);
      button.dataset.y = String(y);
      const piece = state.board[y][x];
      if (piece) {
        const token = document.createElement("div");
        token.className = "token";
        token.dataset.side = piece.side;
        token.textContent = getPieceName(piece.side, piece.type);
        button.dataset.side = piece.side;
        button.dataset.type = piece.type;
        const face = document.createElement("span");
        face.className = "face";
        token.append(face);
        button.appendChild(token);
      }
      if (selectedPoint?.x === x && selectedPoint?.y === y) {
        button.classList.add("selected");
      }
      if (selectedPoint && getLegalMoves(state, selectedPoint).some((to) => to.x === x && to.y === y)) {
        button.classList.add("target");
      }
  button.addEventListener("click", () => handleClick(x, y));
      cells.push(button);
    }
  }
  boardElement.replaceChildren(...cells);
}

function handleClick(x, y) {
  const point = { x, y };
  let statusMessage;
  if (!selectedPoint && state.board[y][x] && state.board[y][x].side !== state.turn) {
    selectedPoint = null;
    statusMessage = "请先选择当前回合棋子";
    render(statusMessage);
    return;
  }
  if (selectedPoint) {
    const legalMoves = getLegalMoves(state, selectedPoint);
    if (legalMoves.some((to) => to.x === x && to.y === y)) {
      state = applyMove(state, { from: selectedPoint, to: point });
      selectedPoint = null;
      statusMessage = "落子完成";
    } else {
      selectedPoint = null;
      statusMessage = "非法走位，请选择棋子或高亮目标。";
    }
  } else if (state.board[y][x]) {
    selectedPoint = point;
    statusMessage = "已选中棋子";
  } else {
    selectedPoint = null;
    statusMessage = "空点，请选择棋子起手。";
  }
  render(statusMessage);
  maybePlayAiMove();
}

applySuggestionButton.addEventListener("click", () => {
  if (!suggestion) return;
  state = applyMove(state, { from: suggestion.from, to: suggestion.to });
  selectedPoint = null;
  render("已采用 AI 建议");
});

modeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (button.dataset.mode === mode) return;
    mode = button.dataset.mode;
    selectedPoint = null;
    updateModeButtons();
    maybePlayAiMove();
    render(mode === "human-ai" ? "AI 对手已启用" : "双人轮流模式");
  });
});

restartButton.addEventListener("click", () => {
  state = createGame();
  selectedPoint = null;
  mode = "two-player";
  updateModeButtons();
  render("已重新开始完整对局");
});

function updateModeButtons() {
  modeButtons.forEach((button) => {
    const active = button.dataset.mode === mode;
    button.classList.toggle("selected", active);
    button.setAttribute("aria-pressed", String(active));
  });
}

function maybePlayAiMove() {
  if (mode !== "human-ai" || state.turn !== "black") return;
  const move = suggestAiMove(state);
  if (!move) return;
  state = applyMove(state, move);
  selectedPoint = null;
  render("AI 已回应");
}
