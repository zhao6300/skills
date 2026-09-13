# Contributing

This repository is deliberately small. Prefer to deepen an existing skill over adding a new one.

## Keep one job per skill

A skill should answer:

1. What is the exact recurring job?
2. When should it trigger?
3. When should it not trigger?
4. What inputs and outputs are expected?
5. What is unsafe or out of scope?
6. What command, artifact, or observation proves it worked?

## Structure

Use this minimum shape:

```text
<skill-name>/
|-- SKILL.md
|-- agents/openai.yaml
`-- references/<mode>.md
```

Keep `SKILL.md` readable in one pass. Move details to `references/` only when they apply to a
specific mode or operation.

## Quality review

Before submitting:

1. Define a realistic positive case.
2. Define a realistic near-miss case that should not accidentally route here.
3. Define what should be rejected or left unexecuted.
4. Run any relevant structure or executable check.
5. Record observed behavior, not just intent.
6. Do not add `README` files, examples, or resources unless they materially help.
7. Keep changes within a narrow scope.

## Commit style

Use small, focused commits with user-visible intent:

- `feat: add skill name`
- `docs: expand skill authoring gates`
- `refactor: merge redundant skill rules`

Avoid unrelated file moves, style churn, or broad rewrite in the same commit.
