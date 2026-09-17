# Chinese chess fun-loop research and rollout

## Scope

The goal is to make the Chinese chess example feel closer to a short-session
casual game without weakening tournament rules, fairness, or the user's control.
This is a design note, not a request to copy a card game's reward economy.

## Primary sources

| Candidate | Concrete signal | Why it matters to this example |
| --- | --- | --- |
| [`xqbase/xqwlight`](https://github.com/xqbase/xqwlight/tree/master/JavaScript) | `board.js` includes win/loss/draw/capture/check sound handling, animated moves, thinking feedback, last-move insulation, and illegal-move feedback. `search.js` uses `searchMain(depth, millis)` and adds bounded root randomness. | Old UI work remains useful: fun comes from fast, honest feedback plus bounded pace, not from random rules. |
| [`official-pikafish/Pikafish`](https://github.com/official-pikafish/Pikafish) | Foreword and rulebook separate a strong engine from GUI responsibility and standardize king mating, stalemate, repetition, and the 120-ply natural-limit draw. | Keep board legality, result ownership, and draw/repetition evidence in the pure engine; fun layers must not override them. |
| Current example | The engine already separates move legality, AI advice, and UI; browser tests play a full AI-vs-AI game and verify terminal state. | The next slice can add cadence and feedback without replacing `game.js` or making the AI opaque. |

## Transferable pattern, not a copy

Happy DDL works because the next visible goal is always obvious, progress arrives in
small rewards, and each round has a natural stopping point. Xiangqi can borrow the
session shape without borrowing random card draws or monetized power-ups:

1. **One turn and one target.** Show who acts, what the immediate objective is,
   and whether the last move changed that objective.
2. **Short session.** Use a bounded blitz/rush slice instead of asking a new
   beginner to commit to a full 90-point tournament game.
3. **Reward deterministic mastery.** Reward legal captures, successful defenses,
   forced mates, and completion of puzzles. Do not reward rule-breaking. 
4. **Visible education.** Slight explanation of why a move is risky, safe, check,
   or guaranteed mate. Fundamentals matter more than hidden difficulty.
5. **Honest juice.** Sound, animation, and focus changes may celebrate moves;
   they may not alter state.
6. **AI as assistant, not executor.** AI can rank, explain, or suggest, but the
   user must click to apply the suggestion unless the mode explicitly says AI-vs-AI.

## Design principle

Put every "fun" effect in a separate UI/interaction layer:

1. `game.js` owns legality, captures, check, checkmate, stalemate, repetition, and result.
2. `ai.js` owns bounded recommendation and explanation.
3. UI owns the short-session objective, celebration, theme, help, and mode switch.
4. Any storage is a single local session artifact with an explicit reset path.

## Candidate fun loops

| Loop | Session shape | Progress signal | Verification |
| --- | --- | --- | --- |
| 3-move rush | Player/AI only; three-mate threats; 10-20 seconds per move if clocked | number of solved puzzles | deterministic puzzle fixture plus browser click-through |
| Weak-defender vs AI | Red starts with a legal extra soldier; AI plays standard defense | whether red maintains material advantage | unit check on selected starting state |
| Score book | Capture, check, and checkmate count in local session state | one line of progress | browser DOM count and reset check |
| Blitz | 15/20-second turn clock, no extra rules | whether moves happen in time | unit clock and browser timer reproduction |
| Revenge challenge | Replay losses against same preserved opening | local progress and no external identity | snapshot test and state reset |

## Do not build first

Avoid these until the basic short-session loop is proven:

1. Monetization, skins economy, account systems, or online matchmaking.
2. Rule-changing power-ups that abandon chess.
3. Unverifiable "AI-style" dialogue replacing deterministic move explanation.
4. A second chess engine diverging from `game.js`.
5. A new board surface unrelated to urgent user value.

## First implementation slice

Build one small slice so users can see evidence quickly:

1. Add a mode row with `严肃棋局` and [`欢乐快局` or `教学挑战`].
2. In fun mode, preserve legal rules but show:
   - capture/check/combo state count in one panel;
   - one-line explanation of the last move;
   - explicit `AI 只是建议` label;
   - restart and state-clear button.
3. Add a small puzzle hand with deterministic winning replies if we must skip full game.
4. Verify by unit tests plus browser:
   - correct state count after capture and check;
   - legal move clicks still create one legal state;
   - state resets cleanly;
   - no rule override path.

## Success criteria

| Gate | Evidence |
| --- | --- |
| Bareplay still works | existing `game.test.mjs` plus `browser.test.mjs` |
| Fun mode does not bypass AI | mode toggle plus suggestion-disabled assertion |
| Check/capture feedback | unit keyboard + browser count |
| Session reset | browser reset count and token count |
| No random rule bypass | source review plus state tests |

## Rollout

1. Ship one mode with clean feedback.
2. Inspect whether users click AI suggestion more often than move by hand.
3. Only add clocks if a mode has been exercised headlessly.
4. Only add persistence if there is a name and a snapshot schema version.
5. Only add more modes if the first mode is genuinely fun in manual test.
