# Implement skill

## Trigger

Run this skill for exactly one slice from `PLAN.md`.

## Objective

Turn the planned slice into reversible source changes with the smallest useful diff.

## Inputs

1. One selected slice and its verification.
2. Existing architecture and project conventions.
3. Local style, lint, type, and format guides.

## Process

1. Re-read the affected code and adjacent callers before editing.
2. State the intended contract in one line.
3. Make the smallest change that contributes to the slice.
4. Use or add a focused example/test when the behavior is not already covered.
5. Run the narrow affected command before broader checks.
6. Remove dead code, temporary logs, and generated build artifacts from the diff.

## Quality checks

- Change the smallest root cause that moves the slice forward.
- Preserve existing naming, logging, state, and data conventions.
- Validate external input at the boundary and keep diagnostics separate from user-safe messages.
- Avoid new dependency, abstraction, config, and state unless the slice needs it.
- Keep discipline native to the stack.

## Verification

```bash
git diff --check
<narrow relevant build/test command>
```

Before marking code complete, inspect:

1. Does it satisfy this slice?
2. Is there any hidden state, race, missing authority check, or accidental public interface?
3. Did you run the narrow failure path, not only the happy path?
4. Is the diff reviewable?

## Done

- The sliced behavior is implemented.
- The relevant narrow verification passes.
- No unrelated refactoring entered the same diff.
- The next planned step is written down.
