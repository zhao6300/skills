# Agent architecture specialization

Use this reference when an agent workflow is part of the architecture, not just a prompt change.

## Required decisions

1. Which job is delegated to the agent.
2. What interface and context the agent owns.
3. Which tools the agent may invoke.
4. Who owns the session/state.
5. What the output contract is.
6. What the failure and handoff path is.
7. What observations are captured.
8. What the safety/escalation owner is.

## Guidance

- One agent boundary is one **objective + decision + tool set**, not one category of work.
- A tool executing an agent action belongs in a module, not in a prompt.
- Prefer one bounded agent with a clear contract over an all-purpose agent.
- Keep planning, execution, and verification as separate, narrow skills.

## Verification

For an agent architecture, dial one realistic use:

1. One success use.
2. One invalid input.
3. One unauthorized tool use.
4. One failure path.
5. One trace or evidence item.
6. One rollback or compensation path.
7. One review of the prompt and tool schema for prompt injection.
