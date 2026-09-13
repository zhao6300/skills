---
name: super-skill
description: Consolidated skill for turning a request into a scoped, verified, reversible deliverable, including creating or updating an engineering skill.
---

# Super skill

Use one decision loop for product changes, service changes, operational changes, and skill authoring. Choose the narrowest mode first; don't run every phase when a request is only a diagnosis, small edit, or skill update.

## Mode selection

1. **Deliver software.** For app, interface, data, automation, or service work, use the lifecycle mode.
2. **Author a skill.** For a reusable instruction package, use skill-authoring mode.
3. **Repair or investigate.** For a concrete failure or question, first find the reproduction / evidence, then expand only the lifecycle phases needed by the fix.
4. **Nested skill.** When existing specialized skills already match the subject, use their relevant rules and keep this skill as the controlling loop.

## Universal loop

| Stage | Required result | Minimum evidence |
| --- | --- | --- |
| Scope | Target user, core loop, acceptance criteria, out-of-scope, and risk list | Sentences or `docs/SPEC.md` when the request is substantial |
| Plan | Boundaries and smallest useful reversible slices, each with verification and rollback | Table or notes; first slice delivers value, not setup only |
| Implement | Root-cause change with existing conventions and minimal surface | Narrow diff, affected-code inspection, and one focused test or scenario |
| Test | Happy path, invalid input, permission boundary, failure path, and regressions | Exact commands or manual scenarios with status |
| Review | Product, correctness, security, UX, operations, and maintainability audit | Evidence table; blockers must be resolved |
| Verify | Built and observed system behavior plus recovery | Commands, smoke / observability evidence, and one rollback or compensation proof when relevant |
| Ship | versioned, observable, reversible release notes and operational handoff | Deploy command, rollback command, monitoring, post-release checks, and follow-ups |

Adapt the depth to blast radius: a small local edit may need a note plus the actual test command; a user-facing or production change needs the full loop.

## Vendor-derived hard gates

Three cross-cutting gates determine whether the selected mode may close. They are not extra phases to run after the work; design and execute with them during the applicable stages. When a gate is not applicable, record why rather than silently skipping it.

### Validation

Prove that the behavior matches the contract, not that the model/reviewer believes the work looks reasonable.

1. Name the expected input, invariant, state transition, or produced skill.
2. Use the narrowest deterministic check first: schema, typecheck, unit, contract, lint, formatter, or sandboxed dry run.
3. Add an integration or behavior check when the change crosses a boundary or updates persistent state.
4. Cover at least one happy path and one realistic failure/permission/race/idempotency boundary.
5. Distinguish acceptance tests from smoke tests, lint, formatting, and security scans.
6. If a test is impossible or impractical, record the substitute evidence and exact reason.
7. For interactive or time-dependent behavior, capture a multi-step reproduction timeline before and after the fix, not only one final screenshot.

Minimum validation record:

```markdown
| Contract | Command/scenario | Expected | Observed | Status |
| --- | --- | --- | --- | --- |
| ... | `...` | ... | ... | pass/fail/targeted/needs-decision |
```

### Security

Treat every newly exposed input, output, storage write, automation step, deployment path, or skill text as a threat surface.

1. Identify trust boundaries and ask who can trigger or influence the action.
2. Validate and normalize all external input; encode or constrain output.
3. Enforce authorization at the object and tenant/article/resource level, not only at login or route decoration.
4. Keep credentials and secrets outside the change; do not log sensitive values, tokens, raw identifiers, internal policies, or stack traces to users.
5. Rate-limit or reduce blast radius for public, recursive, expensive, destructive, or externally influenced operations.
6. Review dependencies, generated files, shell invocations, URLs, file paths, plugin/tool metadata, network egress, and unknown skill content before executing or promoting them.
7. Prefer allowlists, staged rollout, least privilege, offline parsing, and recorded audit events over unverifiable trust claims.

Minimum security record:

```markdown
| Threat | Control | Verification | Status |
| --- | --- | --- | --- |
| unauthorized access | resource policy | test/manual scenario | pass/fail/targeted/needs-decision |
```

### Evidence

Evidence is the unit of handoff. A claim is incomplete until another engineer or agent can reproduce it or follow the recorded alternative.

1. Capture what changed, why, the command/scenario, expected result, actual result, tool/observer source, and owner when follow-up remains.
2. Distinguish these statuses: `pass`, `fail`, `targeted`, `needs-decision`; never convert unproven work into `pass`.
3. Include source context, tool version, environment limits, PII/redaction, and exact artifact type when they affect reproducibility.
4. Preserve shell output, fixture, screenshot, screenshot description, metrics, logs, JSON report, or diff reference only when it materially supports the claim.
5. If anything remains open, label it as follow-up, residual risk, or explicit owner, not as a hidden blocker.
6. Re-record evidence after any relevant post-hoc change; don't reuse stale output as proof of a newer state.

Minimum evidence record:

```markdown
| Target | Change/claim | Scenario | Expected | Observed | Status | Artifact/reason |
| --- | --- | --- | --- | --- | --- | --- |
| ... | ... | ... | ... | ... | ... | ... |
```

## Domain overlays

Apply the overlays that match the change, not all overlays on every task.

### Frontend / UI

- Define routes and components as purposeful states before layout.
- Cover default, loading, empty, error with recovery, permission denied, long action, and relevant degraded modes.
- Keep labels understandable to the target user, one primary action per core screen, and destructive actions explicit.
- For interactive browser deliverables, prove the core loop works with keyboard-only input.
- Do not require pointer clicks to reach the interactive loop; if a phase or demo starts on keyboard input, implement it explicitly.
- Provide keyboard reachability, visible focus, accessible names for icon-only controls, sufficient contrast, semantics, and mobile-feasible flows.
- Test the smallest keyboard walkthrough, the narrowest supported viewport, a network failure and retry, and Web Vitals where the tooling supports them.
- For a browser game or interactive demo, run at least one headless-browser path that proves state, visible feedback, and the primary control path (touch, pointer, or keyboard).
- For interactive browser deliverables, keep engine/state separate from DOM rendering so deterministic tests prove movement, collision, scoring, and restart behavior without launching a browser.
- When no browser runner is available, record browser-only checks as `targeted` and pair them with pure-logic tests plus direct UI evidence.
- Treat “this does not work” or “it only happens once” as evidence gaps that must be reproduced before patching; first run an actual headless interaction, not only unit checks.
- For interactive loops, verify a time series after start/resume and over the boundary conditions idle / paused / game-over / hidden tab, not just the first step.
- Prefer one animation-frame loop or one interval for recurring browser work. Avoid nested timers that can miss a pending step.
- Keep edge-case behavior explicit (wrap, fail, retry), and pair each renderer change with a pure engine test.

### Backend

- Type the operation boundary: inputs, outputs, status codes, resource-level authorization, and state transitions.
- Use timeouts, bounded retries, idempotency, transactions or explicit compensation for multi-write paths.
- Distinguish user-safe responses from internal diagnostics; no silent inconsistent partial state.
- Expose request volume, errors, duration, request ID, business events, and dependency-health signals.
- Verify success, invalid input, unauthorized resource, dependency failure, duplicate action, persisted result, and observed metric.

### API

- Freeze a documented contract: resource, request/response schemas, errors, retry behavior, pagination, auth, rate limit, and idempotency.
- Validate type, length, enum, relationship, and permission at the boundary; return stable error codes and avoid leaking model or storage internals.
- Enforce tenant and object ownership on lookup, update, and delete—not only on route access.
- Keep one source of truth for schema, server, client, and tests; record versioning and upgrade guidance.
- Verify success, invalid input, missing/expired credential, unauthorized/cross-tenant access, not found, and rate limit.

### Data / storage

- Name entity owner, identity strategy, required and optional fields, relationships, retention, deletion, backup, access control, and lifecycle.
- Prefer durable constraints over application-only checks; wrap multi-step invariants in transactions.
- Use idempotency or a unique guard for repeatable writes and prevent orphaning on ownership changes.
- Review index, lock, and migration impact; separate migration data changes from behavior changes when compatibility matters.
- Run migration up and down, duplicate write, invalid write, missing-owner decision, backup/retention, and rollback checks; an empty-table success is not a full proof.

### Operations

- Define trigger, permissions and audit trail, runtime dependencies, timeout and retry, success, partial failure, rollback action, and escalation owner for every operational step.
- Prefer a repeatable artifact or native deployment endpoint over ad hoc shell work.
- Keep a canonical runbook plus a concise emergency mode with UI, API, CLI, or dashboard rollback availability.
- Alerting needs symptom, impact, first diagnostic command, mitigation, rollback, owner, and next action; deduplicate related alerts.
- Fail over / roll back in staging or show equivalent controlled evidence, with release ID, config/version, actor, and outcome.

## Review gates

Never mark a change complete while any blocker remains:

1. The implemented behavior matches the selected scope, not a new desire.
2. Contracts, ownership, state transitions, resources, transactions, and failure paths are correct.
3. Inputs are validated, output is encoded, secrets remain outside source, and each sensitive action and object is authorized.
4. Public or expensive paths have rate and quota limits. Secure logs do not leak credentials, secrets, tokens, raw personal identifiers, or implementation internals.
5. Loading, empty, error, retry, denied, long-running, keyboard, focus, and mobile journeys remain usable.
6. Names explain the domain; tests are behavior-led rather than coupled to private details; dependencies have a concrete reason.
7. Rollback or compensation is real, commands are recorded, and evidence exists in files, logs, metrics, screenshots, or terminal output.

## Skill authoring mode

Use the same loop to create or update a skill, but the deliverable is the skill package itself.

### Scope

1. Determine the exact recurring job. If the request is vague, infer the closest useful scope instead of trying to cover everything.
2. Describe when it should and should not activate.
3. Name the expected inputs, commands/asset outputs, verification, and harmful or out-of-scope mutations.

### Design

1. Name it in lowercase letters, digits, or hyphens; prefer a short action-oriented name under 64 characters and folder name matching skill name.
2. Make `description` both discoverable and discriminating: distinguish from likely adjacent skills, without long capability lists.
3. Keep only decisions that change behavior, not generic coding advice or policy already enforced elsewhere.
4. If there are distinct modes, put shared logic in `SKILL.md` and substantial mode-specific procedures in `references/`, loaded only when relevant.
5. Add a script, asset, or reference only when it saves real repetition or prevents a documented failure.
6. Preserve explicit invocation policy unless the user asks otherwise; authorize immediately before actual external mutation.

### Define the trigger and contract

For a reusable skill, write a one-line trigger and contract before broader content:

```markdown
name: ...
description: ... Use when ... Do not use when ...
```

Then define:

1. Inputs and their acceptable shapes.
2. Output or side-effect contract.
3. Tool/runtime requirements.
4. What counts as success.
5. What should not trigger the skill.

If the request is ambiguous enough that the wrong trigger would be plausible, ask one concrete clarifying question rather than expanding the description to absorb every nearby interpretation.

### Draft

For a new skill package:

```text
example-skill/
|-- SKILL.md
|-- agents/openai.yaml
`-- references/<mode>.md
```

Write instructions from trigger, inputs, output, commands, safety boundaries, verification, and completion condition. Include only examples that materially resolve choices. Remove placeholders and unfinished text. For an update, inspect callers and preserve unrelated metadata and valid local exceptions.

### Test and iterate a skill

Treat the drafted skill as a change to be proven, not a document to be blessed.

1. Draft 3–6 realistic prompts: obvious cases, near-miss cases where another skill might win, and cases that should not trigger the skill.
2. For each case, predict the expected action, artifact, safe output, or refusal before running it.
3. Run the skill against the test prompt or the applicable bundled script/reference, in isolation where possible.
4. Record what was actually produced, not what you intended; use `pass`, `fail`, `targeted`, or `needs-decision`.
5. If the failure repeats across cases, move the recurring helper into a script/reference rather than writing a new workaround each time.
6. Revise instruction, reference, or description—not the test set—to fix a failure. Re-run enough cases to prove the change, then run the original failing case again.
7. Stop when the user says “good enough”, when two successive meaningful cases show no new improvement, or when the skill has a recorded follow-up with an owner.
8. When the same complaint or correction appears twice, convert its root cause into a short skill rule with a repeatable command, expected artifact, and stopping condition.

### Validate a skill

1. Run frontmatter and structure validation when a validator is available.
2. Run any bundled script on a sample or temp workspace.
3. Dry-run the skill against a realistic adjacent case and a likely misrouting case.
4. Check the default phrase would select the right skill and not obvious near-neighbors.
5. Confirm instructions preserve user intent and permissions, and that every command has a safety boundary and stopping condition.
6. Re-read all files touched and remove dead references, duplicated guidance, and redundant resources.

## Done

- Every selected stage has a stated result and evidence.
- No user-visible criterion, domain rule, blocker, unknown, or fallback exists without an explicit record and follow-up.
- The final handoff can be executed by another engineer or agent without gaining hidden knowledge.
