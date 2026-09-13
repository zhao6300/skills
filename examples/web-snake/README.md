# Web snake reference example

A self-contained browser snake game and a pure Node game engine used to exercise
the `super-skill` frontend overlay.

## Prism phase gameplay

- Every five orbs advances the snake through the next phase.
- Each phase changes color, wall pattern, and step speed.
- The score records progress toward the next phase.

## How to use

- Open `examples/web-snake/index.html` directly, or serve it with:

```bash
              python3 -m http.server 8000 --directory examples/web-snake
              python3 -m http.server 8000 --bind 0.0.0.0 --directory examples/web-snake
```

Controls:

- Arrow keys: move.
- Arrow keys also start from the ready state and resume from pause.
- `P`: pause.
- `R`: restart.
- On mobile use the on-screen arrows.

## Test

```bash
node --test examples/web-snake/*.test.mjs
```
