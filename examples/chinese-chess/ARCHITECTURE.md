# Chinese chess architecture

| Boundary | Owner | State | Contract | Transition | Failure | Verification | Rollback |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Board engine | pure `game.js` | 9x10 grid, turn, check, winner | `from`, `to`, legal `move` | apply move or reject with no mutation; mark checkmate or stalemate | keep state and report reason | `game.test.mjs` | reload initial state |
| AI policy | pure `ai.js` | deterministic alpha-beta search context | board -> legal move + score + one-line explanation | score one move through alpha-beta; recommend but do not move unless accepted | return `null` and hide card; rules remain engine-owned | `ai.test.mjs` | hide suggestion |
| UI | `app.js` and index | selected point, AI suggestion | DOM board and controls | render from engine state, accept only explicit suggestion click | show error and preserve state | browser `click` / `evaluate` walkthrough | reload initial state |

The game state also keeps a `positionHistory` fingerprint and a monotonic action id.
These fields prevent a chess AI from cycling and ensure a restart, load, or late AI
response cannot commit to the另一个 epoch.

Persistence upgrades must be limited to one transactional snapshot. If any dependency
is missing, the game stays on the version with its existing `positionHistory`
and `historyLength` rather than silently writing a partially migrated record.
