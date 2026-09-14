# Google agent practice notes

These notes capture recurring patterns from Google agent/tooling systems: explicit contracts,
deterministic tool behavior, explicit evaluation, bounded scope, and traceability.

## Google-style agent loop

1. Define what the agent may act on.
2. Provide an output schema that another system can consume.
3. Keep tool behavior deterministic. Hidden tool use is a bug, not a powerup.
4. Separate deployment from evaluation. A successful example is not a production gate.
5. Record the trace as part of the deliverable, not as an afterthought.
6. Keep agent capabilities in a reusable skill or a reusable module, not in a one-off prompt.

## Review guidelines

When reviewing an agent workflow:

1. Is the output contract testable?
2. Is the tool surface minimal?
3. Is there one agent role per contract?
4. Is failure state captured?
5. Is there one rollback or compensation path?
6. Are attributes like trace, owner, and outcome explicit?

## Verification shape

```markdown
| Scenario | Request | Confidence | Evidence | Status |
```

Prefer `PASS`, `FAIL`, `NOT_PROVEN`, `BLOCKED`, `NEEDS-DECISION`. Keep them explicit.
