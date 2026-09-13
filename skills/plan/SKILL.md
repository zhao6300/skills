# Plan skill

## Trigger

Run this skill after `SPEC.md` has a testable core loop.

## Objective

Reduce the working loop into architecture and implementation slices small enough for one reversible diff each.

## Inputs

1. `docs/SPEC.md`.
2. Existing source layout.
3. Runtime, data, security, UI/UX, and deployment constraints.

## Output

Create or update `ARCHITECTURE.md` and `PLAN.md`.

`ARCHITECTURE.md` should contain:

1. Module map and responsibility boundaries.
2. Data model, ownership, identifier strategy, and migration path.
3. Runtime / API flow for the core loop.
4. Frontend user flow, states, and accessibility notes.
5. Backend interface contract, validation, and error behavior.
6. Storage, security, failure modes, observability, and rollback approach.
7. Explicit unknowns and the experiment that will resolve each one.

`PLAN.md` should contain a table:

| Slice | Delivers | Touches | Verification | Risk | Commit |
| --- | --- | --- | --- | --- | --- |
| 01 | Working loop from user action to observable result | ... | ... | ... | ... |

## Quality checks

1. Make the first slice prove user value, not infrastructure alone.
2. Give every slice a real verification path and a reversible exit.
3. Keep boundaries, dependencies, and migrations visible when they can constrain design.
4. Convert unclear choices into explicit experiments or follow-up decisions, not hidden assumptions.

## Verification

```bash
test -f ARCHITECTURE.md && rg -n "Core loop|Slice .*Delivers.*Verification.*Risk.*Commit" PLAN.md
```
Walk every user-visible acceptance criterion in `docs/SPEC.md`.
* It must map to at least one slice before release.
* No slice should combine unrelated backend and UI changes unless that is the smallest testable mechanism.
* State any boundary that is still uncertain and the exact spike/experiment that will resolve it. If late-breaking dependencies appear, re-open planning before implementation rather than making unilateral assumptions.
* Record unresolved planning disagreements as explicit open questions instead of silently choosing an approach.

## Done

- `ARCHITECTURE.md` exists and names the target user, core loop, acceptance criteria, out-of-scope, and risks.
- `PLAN.md` exists and maps architecture and modules.
- Every product acceptance criterion maps to at least one slice.
- Core loop is planned as the first slice.
- Each slice has a concrete verification action and rollback note.
