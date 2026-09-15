# Chinese chess AI-first design

## Product goal

Make a playable Chinese chess board where AI is in the core loop: it chooses a
defensible next move and explains the material/risk理由 in one line. The human
can accept or reject the suggestion.

## AI-first matrix

| Boundary | User decision | AI-first role | Context contract | Model/tool boundary | Verification | Fallback |
| --- | --- | --- | --- | --- | --- | --- |
| Move generation | Which move does AI recommend? | Primary AI surface | 9x10 board, turn, legal moves | deterministic local policy | fixture and browser click | manual move still allowed |
| Risk coach | Why should user trust/bypass move? | Learning or feedback loop | last user and AI suggestions | no external model | UI state and fixture | hidden card when advice unreliable |
| Rules | Is the move legal? | Not AI-suitable | code owned by engine | no model | unit test | deny move and keep state |

## States

1. Idle / fresh board.
2. Piece selected.
3. Legal target selected and move applied.
4. Illegal target rejected.
5. Capture applied.
6. AI suggestion displayed.
7. AI suggestion rejected, one line visible.
8. Game finished.

## Acceptance

1. A legal move moves one piece and updates `turn`.
2. A capture removes the target piece.
3. Illegal move preserves state and shows a concrete error.
4. AI can produce a legal suggestion without external network.
5. The suggestion disclosure is clearly marked and can be bypassed.
6. Headless browser proves the click loop and no horizontal overflow.

## Out of scope

Checkmate generation, timed tournament play, network opponent, and opening book.

## Recommendation contract

AI output is only a recommendation. It either gets an explicit accept action or a direct
human move. AI cannot bypass the engine, and the fallback is deterministic: show no
suggestion until a legal move exists. `lastMove` is the current learning signal, but no
external model or network is needed in this local example.
