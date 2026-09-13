# Agent skill scaffold

This directory turns gathered production skill patterns into a repeatable execution loop.

The source rules are mapped below: first as a unified `super-skill`, then as specialized phases and
domain modules. Use the separation to add new behavior once, in the narrowest applicable skill.

## Super skill

`super-skill` is the unified entry point for the repository. It selects the narrowest useful
workflow instead of forcing every task through every specialized stage:

1. **Deliver software** — use the full or reduced seven-phase lifecycle.
2. **Repair or investigate** — reproduce the failure first, then run only the phases needed for a safe fix.
3. **Author a skill** — use the same scope, plan, implementation, and verification loop to create or update an instruction package.

Start there when the request does not name a single phase. Use `super-skill` as the controller, then
apply the phase and module details relevant to the observed risk and blast radius. It is an
integration layer, not a replacement for the more specific skills.

### Depth model

Scale rigor to the change, not to a checklist:

| Change class | Minimum expectations |
| --- | --- |
| Small local edit | One-line contract, focused verification command, and no unrelated diff |
| User-facing feature | Core loop, data/UI failures and permissions, tests, review evidence, rollback |
| Production operation | Deploy/rollback proof, monitoring and alerts, runbook, audit trail, staged rollout |
| New skill package | Focused trigger, discriminating description, executable checks, and routing validation |

### Vendor-derived hard gates

`super-skill` also converts three recurring vendor patterns into cross-stage gates:

| Gate | Intent |
| --- | --- |
| Validation | Prove the selected behavior against a named contract, not just a plausible impression |
| Security | Treat each exposed input, output, storage write, automation step, deployment path, and skill text as a threat surface |
| Evidence | Preserve reproducible scenarios and explicit status values so unproven work cannot read as complete |

### Skill authoring path

When the request is to write, revise, or package a skill:

1. Define the exact recurring job and what should not activate it.
2. Choose the narrowest reusable name and description that can be discovered without attracting unrelated tasks.
3. Keep essential routing and constraints in `SKILL.md`; move mode-specific detail into `references/`.
4. Record inputs, outputs, success criteria, unsafe surface, and runtime/tool dependencies.
5. Add scripts or assets only when they prevent a real repeated failure.
6. Validate structure, run any executable check, and test realistic cases plus near-miss/should-not-trigger cases.
7. Remove placeholders, dead references, and guidance that does not change decisions.

### How to use `super-skill`

Reference `skills/super-skill/SKILL.md` when starting work. Useful prompts:

```text
Use super-skill to implement: <one-sentence goal>
Use super-skill to diagnose: <bug or failure>
Use super-skill to create a skill for: <recurring task>
```

For direct invocation without skill discovery:

```text
Use /workspace/skills/super-skill/SKILL.md to handle: <request>
```

The skill expects:

1. A concrete goal, existing repository context, and constraints.
2. A permission boundary and any unavailable external actions.
3. Whether the result should be a code change, diagnosis, artifact, or new skill package.
4. How to verify completion.

## Ordered skills

| Phase | Skill | Primary output |
| --- | --- | --- |
| 1 | [`spec`](spec/SKILL.md) | `SPEC.md` |
| 2 | [`plan`](plan/SKILL.md) | `PLAN.md`, `ARCHITECTURE.md` |
| 3 | [`implement`](implement/SKILL.md) | smallest working slice |
| 4 | [`test`](test/SKILL.md) | `TEST_PLAN.md`, passing verification |
| 5 | [`review`](review/SKILL.md) | `REVIEW.md`, diff comments |
| 6 | [`verify`](verify/SKILL.md) | `VERIFY.md`, readiness evidence |
| 7 | [`ship`](ship/SKILL.md) | `RELEASE.md`, deploy/rollback path |

## Module skills

When the plan names the target modules, use the specialist skills during phases 2–5:

| Module | Skill | Extra quality focus |
| --- | --- | --- |
| UI / frontend | [`modules/frontend/SKILL.md`](modules/frontend/SKILL.md) | usable states, accessibility, performance, responsive behavior |
| Backend service | [`modules/backend/SKILL.md`](modules/backend/SKILL.md) | contracts, failures, observability, resource safety |
| Data / storage | [`modules/data/SKILL.md`](modules/data/SKILL.md) | schema ownership, migrations, integrity, rollback |
| External API | [`modules/api/SKILL.md`](modules/api/SKILL.md) | versioning, validation, authz, rate limits |
| Operations | [`modules/ops/SKILL.md`](modules/ops/SKILL.md) | deploy, rollback, health, runbooks, alerts |

Module skills do not replace the ordered phase skills; they constrain what a slice must include.

## Execution rules

1. Execute the phases in order unless the user changes scope.
2. Enter the next skill only when the previous skill has its required artifact, command, and recorded result.
3. Keep each skill small enough to finish before committing.
4. Store project documents in a project-local `docs/` directory.
5. Do not treat these templates as a generator; edit files from them, and delete sections that cannot be evidenced.
