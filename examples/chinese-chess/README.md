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

The AI policy is a deterministic alpha-beta search with material and positional evaluation.

Rules implemented by the pure engine include forward-only soldiers, one-screen cannon
captures, blocked horse legs, king safety, flying generals, check, checkmate, and stalemate.
