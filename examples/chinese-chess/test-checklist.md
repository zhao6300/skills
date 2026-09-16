| Contract | Command/scenario | Expected | Observed | Status |
| --- | --- | --- | --- | --- |
| Board validates a legal move | `node --test examples/chinese-chess/game.test.mjs` | legal move updates state; illegal move stays unchanged | 11/11 passing | pass |
| AI suggests a legal move | `node --test examples/chinese-chess/ai.test.mjs` | suggestion has valid `from` and `to` points | 1/1 passing | pass |
| Browser accepts suggestion | `node --test examples/chinese-chess/browser.test.mjs` | board has 90 cells and turn changes to Black | 3/3 passing | pass |
