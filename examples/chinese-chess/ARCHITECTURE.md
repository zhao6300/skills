# Chinese chess architecture

| Boundary | Owner | State | Contract | Transition | Failure | Verification | Rollback |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Board engine | pure `game.js` | 9x10 grid, turn, check, winner | `from`, `to`, legal `move` | apply move or reject with no mutation; mark checkmate or stalemate | keep state and report reason | `game.test.mjs` | reload initial state |
| AI policy | pure `ai.js` and `threat.js` | bounded search memory: TT, killers, history | board -> legal move + score + one-line explanation | iterative alpha-beta with TT/MVV-LVA move ordering, one-ply SEE, bounded threat mobility, and root repetition suppression; recommend but do not move unless accepted | return `null` and hide card; rules remain engine-owned | `ai.test.mjs` | hide suggestion |
| UI | `app.js` and index | selected point, AI suggestion | DOM board and controls | render from engine state, accept only explicit suggestion click | show error and preserve state | browser `click` / `evaluate` walkthrough | reload initial state |

The game state also keeps a `positionHistory` fingerprint. This gives the engine enough
evidence to identify threefold repetition and gives the browser test a full AI-vs-AI
game that stops at a terminal state instead of cycling.

Persistence upgrades must be limited to one transactional snapshot. If any dependency
is missing, the game stays on the version with its existing `positionHistory`
and `historyLength` rather than silently writing a partially migrated record.
