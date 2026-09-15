# Design reference

Use this reference when turning an AI-first idea into an inspectable product or architecture.

## Decision matrix

| Dimension | Required decision | Minimum evidence |
| --- | --- | --- |
| Product core | Which user decision changes? | user story, prompt/route, or flow outcome |
| Architecture | Which component owns the AI boundary? | UI -> service -> data/model/tool contract |
| Context | What data is made available? | data sources, retention, permission answer |
| Reasoning | Which steps stay deterministic? | code-path versus reasoning path decision |
| Acceptance mode | How does the human accept, reject, or bypass AI output? | recommendation-only, explicit submit, or manual path |
| Verification | Which tests prove the result? | fixture, acceptance test, manual trace, or runbook |
| Failure | What happens if output is uncertain? | fallback, retry, human-in-loop, or safe refusal |
| Learning | What signals feed the next iteration? | feedback event, eval, or user/system metric |
| Observability | Which fields are recorded? | inputs, model/tool, decision outcome, status |

## Architecture reuse

Use AI-first as a lens when creating boundaries:

1. Name each component once.
2. Assign ownership to data, model, agent, and UI separately.
3. Do not let a model claim ownership over data definitions.
4. Do not turn all interactive surfaces into agents.
5. Preserve human review for destructive or irreversible actions.

## Prompt/template reuse

For product or architecture artifacts, keep a stable three-block schema:

1. **Intent block** — what the user or system is trying to do.
2. **Context block** — what data is available and why.
3. **Action block** — the expected result, constraints, and safety path.

Reusing these blocks keeps AI behavior auditable across examples.
