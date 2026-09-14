# Agents skill

## Use

Use this skill when you are defining, designing, upgrading, or evaluating an **autonomous
agent or multi-agent workflow**.

Do not use it for ordinary CLI scripts, UI code, or backend code that does not delegate decisions.
Use [`modules/architecture`](../architecture/SKILL.md) to own the shape of the boundaries when
the system as a whole changes.

## Contract before code

For each agent, state:

1. Role.
2. Objective.
3. Available tools.
4. State ownership.
5. Context contract.
6. Output schema.
7. Failure and escalation path.
8. Verification and evidence.

An agent without role, objective and boundary is not a production artifact. It is a prompt.

## Required guarantees

1. One **single decision owner**. An ambiguity in ownership is a bug.
2. Tools are explicit. Hidden tools are reviewable only as unsafe side-effects.
3. State is written to an explicit place. No agent state in session memory alone
   unless you are intentionally building a short-lived tool.
4. Input validation happens before the agent chooses a tool.
5. Each unsafe tool has a narrow purpose and a bounded right to act.
6. Output is a schema or a structured consequence, not prose alone.
7. Every user-visible or stateful operation has a trace that a human can inspect.

## Traceability

When a project tracks agent state, keep at least these fields:

```markdown
| Agent | Role | Tool | State | Contract | Verification | Failure owner |
```

Do not replace an artifact with narration. The table is the architectural contract,
not a copy-paste checkbox.

## Failure and safety

1. Treat input, tools, and state as a threat surface.
2. Prefer deny-by-default when a tool is not approved.
3. Avoid implementing many tools "just in case".
4. State can be lost through shell or file writes; keep file boundaries explicit.
5. Prefer a single safe failure path to many clever error messages.
6. Approval flows are explicit, not implicit contextual hints.

## Verification method

1. One realistic success use.
2. One unauthorized action.
3. One malformed or unsafe input.
4. One failure path.
5. One trace for the agent's state and handoff result.
6. One evidence item for the actual tool use.
7. One scan for prompt-injection attempts.

## Reference notes

Read [`references/openai.md`](references/openai.md) and/or [`references/google.md`](references/google.md)
when you need a shared vocabulary for making agent output reviewable. Use them as reusable
patterns, not as turnkey implementations.
