# Docs index

This directory holds the working research behind the skills. It is not the skill execution
entry point; use [`../skills/super-skill/SKILL.md`](../skills/super-skill/SKILL.md) for that.

## Skill-system design

| Document | Purpose |
| --- | --- |
| [`next_skill_patterns.md`](next_skill_patterns.md) | Condensed agent-skill patterns from high-signal repositories. |
| [`domain_skill_research.md`](domain_skill_research.md) | Domain-specific skill scan for frontend, backend, data, performance, and observability. |
| [`high_star_skill_research.md`](high_star_skill_research.md) | Common behavior and anti-patterns in widely used skill repositories. |
| [`vendor_skill_sources.md`](vendor_skill_sources.md) | Map of vendor/source patterns and where they are integrated. |

## Production and operations

| Document | Purpose |
| --- | --- |
| [`production_readiness.md`](production_readiness.md) | From idea to launch: the production pipeline and readiness gates. |
| [`product_quality_prompt.md`](product_quality_prompt.md) | A reusable prompt for turning an idea into a high-quality deliverable. |
| [`overnight_product_master_prompt.md`](overnight_product_master_prompt.md) | A long-running, multi-phase product execution prompt. |
| [`codex_overnight_testing.md`](codex_overnight_testing.md) | A playbook for overnight testing and task decomposition. |

## Reading strategy

1. Start with [`../skills/README.md`](../skills/README.md) for the active skill system.
2. Use [`next_skill_patterns.md`](next_skill_patterns.md) when designing a new skill.
3. Use [`vendor_skill_sources.md`](vendor_skill_sources.md) when adding behavior from an external repository.
4. Use [`production_readiness.md`](production_readiness.md) before calling work ready for launch.

Do not turn docs into executable behavior unless a pattern is explicitly reflected in a skill.
