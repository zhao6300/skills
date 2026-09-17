# AI Chinese Chess

An AI-first web example: the board engine owns legality, the AI policy explains a
one-line move suggestion, and the user can accept or ignore it. The UI also exposes
restart, shows checkmate, stalemate, and threefold-repetition results, and the headless
test plays a complete AI-vs-AI game from the initial board to a terminal state.

## Commands

```bash
python3 -m http.server 8000 --directory examples/chinese-chess
```

Then open <http://localhost:8000>.

Checks:

```bash
node --test examples/chinese-chess/game.test.mjs
node --test examples/chinese-chess/ai.test.mjs
node --test examples/chinese-chess/browser.test.mjs
```

The last file includes a `browser can restart and complete an AI-vs-AI game` case. It
restarts once, plays from the full initial arrangement until `胜利` or `和棋`, verifies
the suggestion action is disabled at the end, then restarts again.

## Design

`ARCHITECTURE.md` separates rule ownership from AI recommending, and `DESIGN.md` states
that AI can only suggest; the user must take an action. That preserves an AI-first loop
without an opaque agent.

The AI policy uses iterative deepening, alpha-beta pruning, a bounded transposition
table with a best-move slot, MVV-LVA move ordering, killer/history ordering, and a
quiescence check for exchanges. Capture ordering now includes a conservative one-ply
SEE (static exchange evaluation), quiet evaluation includes a bounded threat-mobility
score, and root search subtracts a penalty for moves that recreate an earlier position.
These are the common, portable techniques demonstrated
by the public `wukong-xiangqi` reference;
it deliberately remains a bounded browser policy rather than replacing it with a heavy
NNUE engine. That fixes the earlier smart-sounding but backward-negative local search
and prevents a game from collapsing into a four-position loop.

Rules implemented by the pure engine include forward-only soldiers, one-screen cannon
captures, blocked horse legs, king safety, flying generals, check, checkmate, stalemate,
and the conditional threefold-repetition draw.
