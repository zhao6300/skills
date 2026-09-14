# Evolution skill

## Use

Use this skill when one existing skill keeps needing to absorb the same correction
or lesson more than once. Turn that repeated correction into one narrow, reusable rule
inside this skill.

Do not use this skill for broad rewrites, unrelated ideas, style-only rules, or a new
workflow that has not repeated.

## Contract

For every learned rule record:

1. Trigger: the repeated situation.
2. Rule: one imperative sentence.
3. Verification: a targeted command, artifact, or an explicit expected failure.
4. Boundary: when this rule should and should not apply.

Keep each rule to at most four lines of prose. If a rule needs more, move the detail
into a narrow `references/<scenario>.md` file.

```markdown
| Trigger | Rule | Verification | Scope |
| --- | --- | --- | --- |
```

## Evolution loop

1. Identify the repeated failure, not the symptom.
2. Ask what single decision prevents the same error next time.
3. Write that decision as an imperative rule.
4. Find the smallest check, command, or artifact that can prove the rule.
5. If the rule is context-specific, create a narrow reference file instead of growing
   `SKILL.md`.
6. delete any rule now covered by the new rule.
7. do not widen an existing skill merely to justify the new rule.

## Reuse check

Before adding a rule, search related skills:

```bash
rg -n "Rule:|Use when|Do not use|Verification" skills/modules
```

If the same invariant already exists, reference it instead of duplicating it.
Do not move a rule into `SKILL.md` just because it is longer to read.

## Verification

Run:

```bash
node --test skills/modules/modules.test.mjs
```

Also run the narrow validating command for the changed skill itself.

## Done

- The rule is one sentence.
- The surrounding prose is shorter than the original conversation.
- At least one check or artifact proves it.
- Any other skill that would have duplicated the rule now references this skill.
- The skill remains small enough for one operator or agent to read in one pass.

## Common failures

1. Adding a rule before finding its concrete repeated failure.
2. Naming failure mode no one can reproduce.
3. Adding prose that duplicates the new rule.
4. Using narrative instead of a decision.
5. Turning a test artifact into an unnecessary skill.
