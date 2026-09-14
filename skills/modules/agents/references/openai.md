# OpenAI agent practice notes

These notes summarize OpenAI-grade agent platform patterns, not direct API details. Keep the
skills portable and tool-agnostic. If you need a specific SDK call, prefer a narrow implementation
over a broad prompt-level rule.

## Core pattern

1. **One agent, one job.** Avoid single agents that mix planning, execution, and verification.
2. **One controller loop.** The super-skill in this repository is the loop; the agent should
   not recreate it.
3. **One tool boundary.** Prefer explicit tool declarations over broad tools.
4. **One decision from one agent.** If the model is unsure, report `needs-decision`.
5. **One artifact.** Prefer one well-defined output over a pile of text.
6. **One trace.** The output should be evidence, not a prose narrative.

## Skill-to-output contract

For each agent run:

| Plan | Execute | Verify | Evidence |
| --- | --- | --- | --- |
| chosen plan | concrete tool call | testable condition | artifact/result |

## Statuses

Use these values so another agent or engineer can understand the run:

1. `completed`
2. `blocked`
3. `needs-decision`
4. `failed`

Avoid "done" without an artifact.

## Required output shape

```markdown
| Scope | Tool call | Evidence | Status | Next step |
```

Keep each row to one actionable step.
