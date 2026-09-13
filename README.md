# zhao6300/skills

This repository turns production engineering patterns into reusable skills for an agent. The
`skills/` directory is the deliverable; `docs/` is the research and readiness context behind it.

## Start here

1. Read [`skills/super-skill/SKILL.md`](skills/super-skill/SKILL.md) for the unified workflow entry point.
2. Read [`skills/README.md`](skills/README.md) for the phase and module skill catalog.
3. Read [`docs/README.md`](docs/README.md) if you need the research or production-readiness context.

## How to use the skills

The smallest useful request is usually enough:

```text
Use super-skill to implement: <one-sentence goal>
Use super-skill to diagnose: <bug or failure>
Use super-skill to create a skill for: <recurring task>
```

When skill discovery is unavailable, give the direct path:

```text
Use /skills/super-skill/SKILL.md to handle: <request>
```

The super-skill then chooses the narrowest applicable mode, applies the relevant domain overlays,
and requires `validation`, `security`, and `evidence` before done.

## Repository layout

```text
README.md                  Repository entry point
AGENTS.md                  Agent-specific working notes
skills/README.md           Skill catalog and execution rules
skills/super-skill/        Unified lifecycle, mode selector, domain overlays, hard gates
skills/spec/               Freeze the smallest valuable loop
skills/plan/               Map requirements to reversible slices
skills/implement/          Produce one focused change
skills/test/               Prove behavior with repeatable checks
skills/review/             Audit intent, correctness, security, UX, maintainability
skills/verify/             Collect launch and operational evidence
skills/ship/               Versioned, observable, reversible release path
skills/modules/            Frontend/backend/API/data/ops overlays
docs/                      Research, decisions, readiness patterns
```

## Add a skill

Only add a skill when there is a concrete repeated job and a way to prove completion.

1. Define what triggers the skill and what should not trigger it.
2. State the inputs, outputs, unsafe boundaries, runtime/tool assumptions, and completion evidence.
3. Put routing and broad behavior in `SKILL.md`; move mode-specific detail into `references/`.
4. Add a script, asset, or example only when it prevents a repeating failure.
5. Validate frontmatter, executable checks, realistic cases, and near-miss / should-not-trigger cases before commit.

## Further reading

- [`skills/README.md`](skills/README.md) — catalog, ordered phases, module overlays, hard gates.
- [`docs/README.md`](docs/README.md) — index of research and production-readiness notes.
- [`CONTRIBUTING.md`](CONTRIBUTING.md) — contribution and review expectations.
- [`AGENTS.md`](AGENTS.md) — how agents should operate on this repository.
