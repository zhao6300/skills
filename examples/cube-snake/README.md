# Cube Snake

This example is a self-contained 3D snake game, played inside a translucent cube. It is used to practice a shared
premium aesthetic and interaction checklist with the `super-skill` workflow.

## Decision

| Area | Applied rule |
| --- | --- |
| UI | Dark, restrained base, a single glowing header accent per phase, and verbose contrast in score/help text |
| Motion | One reversible transition per control and one short body movement per cell step; no decorative bounce |
| Interaction | A primary `Start` action, visible six-axis key labels, disabled controls when not applicable, keyboard traps avoided, and visible focus states |
| Game loop | Pause, restart, loss detection, phase-accent shifts, and win edge case |
| Visual | A clean cube, soft grid, subtle light, and impact-free UI |

## Gameplay

- Standard snake behavior translated into a compact `5 × 5 × 5` grid.
- The snake can move on six axis directions; large connected segments keep the shape readable.
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

The focused browser check can now run without a manually started server:

```bash
node --test examples/cube-snake/browser.test.mjs
```

### Headless interaction walkthrough

Use Chrome/Playwright locally:

```bash
python3 -m http.server 8001 --directory examples/cube-snake &
```

Then press:

1. `ArrowRight` — the status should become `进行中`.
2. `Pause` — the status should become `已暂停`.
3. `Restart` — the status should return to `按开始或方向键`.
4. `ArrowUp` again — the game should resume.

Headless check:

```bash
python3 -m http.server 8001 --directory examples/cube-snake &
/root/.cache/browser/chrome-headless-shell-126/chrome-headless-shell-linux64/chrome-headless-shell \\
  --headless --disable-gpu --no-sandbox --hide-scrollbars \\
  --screenshot=/tmp/cube-snake.png --window-size=1200,800 http://127.0.0.1:8001
```
