# Data architecture specialization

Use this reference when the change is to **data ownership or persistence order**, not just one field.

## Required decisions

1. Who owns the entity and its identifiers.
2. Who owns the lifecycle and retention.
3. Which schema or storage shape is canonical.
4. What the transitions are.
5. What the consistency boundary is.
6. Whether a migration is additive, destructive, or reversible.
7. Where integrity is enforced.

## Guidance

- Prefer a data owner. If two owners appear, choose one, then expose the other through a view or API.
- Avoid "future-proof" fields that only enlarge uncertainty.
- Prefer an inferable, least-surprise migration over a speculative model.
- If you cannot explain how a failure or retry restores consistency, simplify the model.
- Treat every store as a lifecycle, not a passive field.

## Verification

For data changes:

1. Schema up.
2. Schema down.
3. Duplicate-write condition.
4. Invalid write condition.
5. Integrity check.
6. Constraint expectation.
7. One realistic transition path.
8. Rollback path.
