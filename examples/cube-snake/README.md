# Cube Snake

This example is a self-contained 3D snake game, played inside a translucent cube. It is used to practice a shared
premium aesthetic and interaction checklist with the `super-skill` workflow.

## Decision

| Area | Applied rule |
| --- | --- |
| UI | Dark, restrained base, a single glowing header accent per phase, and verbose contrast in score/help text |
| Motion | One reversible transition per control and one short body movement per cell step; no decorative bounce |
| Interaction | A primary `Start` action, disabled controls when not applicable, keyboard traps avoided, and visible focus states |
| Game loop | Pause, restart, loss detection, phase-accent shifts, and win edge case |
| Visual | A clean cube, soft grid, subtle light, and impact-free UI |

## Gameplay

- Standard snake behavior translated into a 3D grid.
- The snake can move on six axis directions.
- `Arrow Left/Right` drive X, `Arrow Up/Down` drive Z, `W`/`S` drive Y.
- `P` pauses, `R` restarts.
- Each five orbs changes the phase accent and speed.
- High score is stored locally when the browser allows.

## Verification

Run the focused tests:

```bash
node --test examples/cube-snake/*.test.mjs
```

Run with a server:

```bash
python3 -m http.server 8001 --directory examples/cube-snake
```

Open `http://127.0.0.1:8001`.

Headless check:

```bash
python3 -m http.server 8001 --directory examples/cube-snake &
/root/.cache/browser/chrome-headless-shell-126/chrome-headless-shell-linux64/chrome-headless-shell \\
  --headless --disable-gpu --no-sandbox --hide-scrollbars \\
  --screenshot=/tmp/cube-snake.png --window-size=1200,800 http://127.0.0.1:8001
```
