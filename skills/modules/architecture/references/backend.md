# Backend architecture specialization

Use this reference when the change is a **service boundary**, not just one endpoint.

## Required decisions

1. Which domain owns the workflow and the data.
2. What the public contract is.
3. Which other modules can call it.
4. Who holds transactions and compensation.
5. Which queues, workers, jobs or schedulers are involved.
6. What the resilience behavior is under dependency failure.
7. Where observability is recorded.

## Guidance

- Boundary is defined by domain ownership, not by deployment location.
- One service should not own two unrelated permissions.
- A workflow boundary may contain workers, job state, and durable transitions.
- An API boundary may be the route layer, but not the domain owner.
- If a workflow is not independently testable, it is not a boundary yet.
- Prefer one expanded boundary over a new layer when the second layer cannot be state-avoidable.

## Verification

Verify:

1. The boundary's public contract.
2. One success case crossing the boundary.
3. One unauthorized case.
4. One failure path.
5. One retry or compensation case.
6. Where observability will be recorded.
7. One rollback or compensation note.
