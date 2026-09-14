# Architecture skill

## Use

Use this skill when your change is a new or changed **boundary**, not just implementation
inside one boundary. This covers frontend/state ownership, backend service boundaries,
data ownership, deployment topology, and agent workflows.

Do not use it for product copy, narrow bug fixes, or stylistic-only changes. Those changes
assert within an existing boundary.

## Principle

Architecture earns its place by making the **shape of a change** easy to reason about.
Prefer the smallest boundary that isolates the cross-cutting risk, instead of adding
another generic layer.

## Required definition

For each boundary, record `owner`, `state`, `contract`, `transition`, `failure`, `verification`,
and `rollback`. If a field is unknown, convert it into one concrete experiment rather than
leaving it empty.

```markdown
| Boundary | Owner | State | Contract | Transition | Failure | Verification | Rollback |
```

Keep each row small enough for one focused change.

## Output

Do **not** regenerate an entire architectural document. If `ARCHITECTURE.md` exists,
append one row per new boundary and leave the architecture plan intact.

If the request is narrow, store the conclusion in the commit note, diff description, or
the existing architecture file with the smallest possible note. Architecture that is
not routed to a change is documentation only.

## Scenario specializations

Choose the narrowest applicable reference:

1. [`references/frontend.md`](references/frontend.md) — state/composition/UI ownership.
2. [`references/backend.md`](references/backend.md) — service/worker/data-flow ownership.
3. [`references/data.md`](references/data.md) — model, migration, retention and integrity.
4. [`references/ops.md`](references/ops.md) — deployment, rollback and operational shape.
5. [`references/agents.md`](references/agents.md) — agent boundaries, contracts, observability.

Use one scenario reference per change. If two scenarios are genuinely present, the second
reference should be pulled into the same architecture table rather than opening a second
plan-level skill.

## Verification

Run a targeted check rather than full architecture validation:

```bash
rg -n "Boundary|Owner|State|Contract|Transition|Failure|Verification|Rollback" ARCHITECTURE.md
```

Then inspect the actual diff to confirm:

1. The named boundary is not a nearby module opportunistically reused.
2. The state owner and data change are recognizable.
3. The transition/failure path is specified.
4. A rollback or compensation path is not left as prose.
