# One-shot delivery

## Trigger

Use this when a product-level deliverable should be accepted after the first pass, rather
than after several visual, gameplay, or UX correction rounds.

Do not use it for exploratory prototypes or a narrow bug fix that has an existing owner.

## Pre-lock

1. Name the one user outcome, one core action, and one success state.
2. Freeze the visual language before implementation: base surface, accent, typography,
   spacing, iconography, interaction feedback, and two target viewport widths.
3. Record states that must look intentional: default, selected/active, progress, empty,
   error, blocked, and finished.
4. Write a testable acceptance table before producing the first polished screen.

## Build shape

- Put rules, state transitions, and rendering in separate owners.
- Keep one deterministic source of truth for state.
- Build the real browser interaction first; do not rely on status text as visual proof.
- Build one primary action per core viewport and defer secondary actions until it passes.
- Keep the first pass complete but plain enough to verify, then keep the visual pass
  within the already frozen system.

## Verification floor

Before handoff, prove:

1. A real browser walkthrough of the core loop.
2. Two viewport widths with no unexpected overflow. A 350–420px portrait check is a good
   default even when desktop is the primary screen.
3. Selected, active, error, blocked, and completed states.
4. One failure or invalid-input path.
5. A visual review across the pages, not a single component screenshot.
6. A rollback path: the last accepted commit or a clearly recoverable state.

## Rejection rule

Treat a deliverable as unfinished when any of these are true:

1. The happy path works only in a simplified or fake layer.
2. A screenshot proves assets but not interaction.
3. State text proves logic but not the rendered layout.
4. A user action has no clear output, feedback, or failure path.
5. Visual polish exists in one fragment but not across the primary structure.
6. The core outcome cannot be reached from the visible interface.

## Evolution note

When a one-shot deliverable still needs several correction rounds, add the missing check
to this reference instead of copying the incident into another skill.

## Temporal game and race hardening

Use this addendum for chess, board games, turn-based games, and other deliverables where
state advances over multiple rounds.

Define the loop before adding UI polish:

1. Record board, turn, phase, clock, repetition counter, and schema revision in one
   immutable game snapshot.
2. Give every human, AI, and control action a monotonic action id so a late async update
   cannot move a later turn.
3. Verify a full multi-round path or an explicit threefold-repetition draw, not just one
   legal move at a fixed position.
4. Treat a user restart as an async action with its own id and one legal-move verification
   after commit.
5. Rebuild state from a single data-owner contract on schema or persistence migration.
6. If an AI reply is delayed or returns invalid, show a bounded thinking state and keep the
   current player waiting for the same epoch.

Use the same temporal details for a chess AI:

1. Score the immediate move, then iterative deepening and alpha-beta pruning.
2. Cache equivalent positions in a transposition table bounded by size.
3. Prefer captures with MVV-LVA ordering, then a quiescence check for moves that
   continue the same exchange.
4. Treat a position reached three times as a draw plus a decisive check loss.
5. Extract the AI-versus-AI check into a multi-round progress test, not a one-off bugfix.
