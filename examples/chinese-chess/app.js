import { applyMove, createGame, getLegalMoves, getPieceName, getPieceValues } from "./game.js";
import { describeAiMove, suggestAiMove } from "./ai.js";

const boardElement = document.querySelector('[data-role="board"]');
const statusElement = document.querySelector('[data-role="status"]');
const turnElement = document.querySelector('[data-role="turn"]');
const aiCardElement = document.querySelector('[data-role="ai-card"]');
const applySuggestionButton = document.querySelector('[data-role="apply suggestion"]');

let state = createGame();
let selectedPoint = null;
let suggestion = null;

render();

function render(statusMessage) {
  renderBoard();
  suggestion = suggestAiMove(state);
  statusElement.textContent = statusMessage ?? "请选择棋子";
  turnElement.textContent = state.turn === "red" ? "红方 · 先手" : "黑方 · 后手";
  aiCardElement.textContent = suggestion ? describeAiMove(suggestion, state) : "No suggestion";
  applySuggestionButton.disabled = !suggestion;
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
}

applySuggestionButton.addEventListener("click", () => {
  if (!suggestion) return;
  state = applyMove(state, { from: suggestion.from, to: suggestion.to });
  selectedPoint = null;
  render("已采用 AI 建议");
});
