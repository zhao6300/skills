| Contract | Command/scenario | Expected | Observed | Status |
| --- | --- | --- | --- | --- |
| Board validates a legal move | `node --test examples/chinese-chess/game.test.mjs` | legal move updates state; illegal move stays unchanged | 12/12 passing | pass |
| AI changes turn without a repeat | `node --test examples/chinese-chess/game.test.mjs` | 20-turn AI vs AI produces a fresh snapshot each turn | 12/12 passing | pass |
| AI progression and temporal coverage | `node --test examples/chinese-chess/ai.test.mjs` | bounded opening, forced mate, no repeat, and legal suggestion | 4/4 passing | pass |
| Browser accepts suggestion | `node --test examples/chinese-chess/browser.test.mjs` | board has 90 cells and turn changes to Black | 3/3 passing | pass |
| Complete game and restart | `browser can restart and complete an AI-vs-AI game` | full initial state reaches `胜利` or `和棋`, then restarts to 32 pieces | 3/3 passing | pass |
