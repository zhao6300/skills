# AI Chinese Chess

An AI-first web example: the board engine owns legality, the AI policy explains a
one-line move suggestion, and the user can accept or ignore it.

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

## Design

`ARCHITECTURE.md` separates rule ownership from AI recommending, and `DESIGN.md` states
that AI can only suggest; the user must take an action. That preserves an AI-first loop
without an opaque agent.

The AI policy uses iterative deepening, alpha-beta pruning, a bounded transposition
table, MVV-LVA move ordering, a quiescence check for exchanges, and a position-history
penalty. That fixes the earlier smart-sounding but backward-negative local search and
prevents a game from collapsing into a four-position loop.

Rules implemented by the pure engine include forward-only soldiers, one-screen cannon
captures, blocked horse legs, king safety, flying generals, check, checkmate, stalemate,
and the conditional threefold-repetition draw.
