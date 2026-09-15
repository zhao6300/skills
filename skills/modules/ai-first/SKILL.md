---
name: ai-first
description: Design product and architecture changes around an explicit AI path first. Use when a new product, API, data pipeline, agent workflow, or architecture boundary is being designed or extended. Do not use for pure styling or mechanical refactors.
---

# AI-first design skill

## Use

Apply when a product, API, data pipeline, agent workflow, or architecture boundary is
designed or extended. Use to ensure every new product or architecture decision has an
explicit AI path, an explicit AI-assisted path, or a recorded reason no AI is needed.

Do not use this skill for:

- Pure descriptions or media changes with no working result.
- Styling alone unless it changes what AI can present.
- Assertions already covered by specialized skills like `data`, `backend`, `frontend`, or `agents`.

This is a design gate, not a replacement for those skills.

## Required definition

For each new product or architecture slice, fill in one row:

```markdown
| Boundary | User or system decision | AI-first role | Context contract | Model or tool boundary | Verification | Fallback |
| --- | --- | --- | --- | --- | --- | --- |
```

Fix table if needed. Each row must be one testable boundary, not a generic AI idea.

## Design loop

1. Name the decision or action the user/system needs next.
2. Name the context, data, or workflow needed for that decision.
3. Assign one AI-first role:
   - **Primary AI surface** — AI is part of the user-visible core loop.
   - **Automated operations** — AI assists a recurring engineering or operational decision.
   - **Learning asset** — real user/system outcomes improve the model or agent.
   - **Agentic workflow** — an agent owns a narrow task.
   - **Not AI-suitable** — a concrete reason, no vague "AI later".
4. Define the tool and inputs AI can use.
5. Define what AI must not do and who can authorize it.
6. Define the fallback, verification, and evidence.
7. Define how results feed back into the next learning loop.

## Required coverage

### Product

1. Explain how AI changes the user's decision or output, not only the UI.
2. Prefer one AI-assisted core path before adding decorative surfaces.
3. Keep each AI surface narrow enough to be understood and reviewed.
4. Record whether the result is editable, automatic, or recommendation only.
5. Include loading, uncertain result, empty result, failure, permission, and feedback state.

### Architecture

1. Name the owning component and the AI boundary separately.
2. Do not hide a model or agent inside an unrelated module.
3. Define data owners, sources, permissions, retention, and traceability.
4. Define the clean non-AI fallback for risk review.
5. Define update, rollback, and monitoring path.

### Data

1. Define context provenance and who can see it.
2. Record whether data is required, optional, learned, or private.
3. Confirm the model or agent has the permissions it needs.
4. Avoid using model output to silently write state.

### Operations

1. Name trigger, actor, permission, cost, and audit trail.
2. Measure whether AI output gets used and validated.
3. Keep model/provider boundaries domain-specific.
4. Avoid undefined agent loops that can act without review.

## Verification

Before shipping a change:

1. Test at least one success case.
2. Test one invalid or unauthorized case.
3. Test one uncertain or failed AI result.
4. Show the non-AI fallback.
5. Record the generated user story or architecture output.
6. Record model/provider/tool stability checks where applicable.

Do not accept "we will add AI later" without a concrete experiment.

## Release gate

The change can ship when the AI-first table is completed. Then apply the narrower domain
skills. If `ai-first: not applicable` is chosen, include at least one concrete reason.
