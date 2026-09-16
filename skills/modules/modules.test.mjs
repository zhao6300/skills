import { strict as assert } from "node:assert";
import test from "node:test";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));

const architectureFiles = [
  "SKILL.md",
  "references/frontend.md",
  "references/backend.md",
  "references/data.md",
  "references/ops.md",
  "references/agents.md",
];

const agentFiles = [
  "SKILL.md",
  "references/openai.md",
  "references/google.md",
];

const evolutionFiles = ["SKILL.md", "references/one-shot-delivery.md"];

const sourceFiles = ["SKILL.md", "references/tech-and-research.md"];

const aiFirstFiles = ["SKILL.md", "references/design.md"];

const read = (root, file) => readFileSync(join(here, root, file), "utf8");

test("architecture skill keeps general and scenario boundaries separate", () => {
  for (const file of architectureFiles) {
    assert.ok(existsSync(join(here, "architecture", file)), file);
  }

  const skill = read("architecture", "SKILL.md");
  assert.match(skill, /## Use/);
  assert.match(skill, /## Required definition/);
  assert.match(skill, /## Output/);
  assert.match(skill, /## Scenario specializations/);
  assert.match(skill, /## Verification/);
  assert.match(skill, /Boundary \| Owner \| State \| Contract \| Transition \| Failure \| Verification \| Rollback/);

  const frontend = read("architecture", "references/frontend.md");
  const backend = read("architecture", "references/backend.md");
  const data = read("architecture", "references/data.md");
  const ops = read("architecture", "references/ops.md");
  const agents = read("architecture", "references/agents.md");
  assert.match(frontend, /state\s+ownership|component owns|UI ownership/i);
  assert.match(backend, /service boundary|domain ownership|workers/i);
  assert.match(data, /data ownership|schema|migration/i);
  assert.match(ops, /deployment|rollback|run environment/i);
  assert.match(agents, /agent|tool|output contract|failure path/i);
});

test("agents skill has contract, tool boundary and reference notes", () => {
  for (const file of agentFiles) {
    assert.ok(existsSync(join(here, "agents", file)), file);
  }

  const skill = read("agents", "SKILL.md");
  assert.match(skill, /Role/);
  assert.match(skill, /Objective/);
  assert.match(skill, /Available tools/);
  assert.match(skill, /State ownership/);
  assert.match(skill, /Output schema/);
  assert.match(skill, /Failure and escalation path/);
  assert.match(skill, /Verification and evidence/);
  assert.match(skill, /prompt-injection/i);
  const openai = read("agents", "references/openai.md");
  const google = read("agents", "references/google.md");
  assert.match(openai, /One agent, one job/);
  assert.match(openai, /One controller loop/);
  assert.match(openai, /One artifact/);
  assert.match(google, /output schema/);
  assert.match(google, /Traceability|trace/);
  assert.match(google, /reusable skill/);
});

test("evolution skill keeps learned rules narrow and verified", () => {
  const skill = read("evolution", "SKILL.md");
  assert.match(skill, /## Use/);
  assert.match(skill, /## Contract/);
  assert.match(skill, /## Evolution loop/);
  assert.match(skill, /## Reuse check/);
  assert.match(skill, /## Verification/);
  assert.match(skill, /## Common failures/);
  assert.match(skill, /If a rule needs more, move the detail/);
  assert.match(skill, /delete any rule now covered by the new rule/);
  assert.match(skill, /do not widen an existing skill merely to justify the new rule/i);

  const oneShot = read("evolution", "references/one-shot-delivery.md");
  assert.match(oneShot, /## Trigger/);
  assert.match(oneShot, /## Pre-lock/);
  assert.match(oneShot, /## Build shape/);
  assert.match(oneShot, /## Verification floor/);
  assert.match(oneShot, /Two viewport widths/);
  assert.match(oneShot, /visual review/);
});

test("source ingestion skill owns adapter contract and source selection", () => {
  for (const file of sourceFiles) {
    assert.ok(existsSync(join(here, "sources", file)), file);
  }

  const skill = read("sources", "SKILL.md");
  assert.match(skill, /## Required definition/);
  assert.match(skill, /## Normalized record contract/);
  assert.match(skill, /## Adapter boundary/);
  assert.match(skill, /## Verification/);
  assert.match(skill, /License and terms/);
  assert.match(skill, /`id` is stable across refreshes/);

  const references = read("sources", "references/tech-and-research.md");
  assert.match(references, /Hacker News/);
  assert.match(references, /arXiv/);
  assert.match(references, /OpenAlex/);
  assert.match(references, /GitHub Search/);
  assert.match(references, /Hugging Face Hub/);
});

test("ai-first skill is a narrow product and architecture gate", () => {
  for (const file of aiFirstFiles) {
    assert.ok(existsSync(join(here, "ai-first", file)), file);
  }

  const skill = read("ai-first", "SKILL.md");
  assert.match(skill, /## Design loop/);
  assert.match(skill, /## Required definition/);
  assert.match(skill, /## Required coverage/);
  assert.match(skill, /ai-first: not applicable/);
  assert.match(skill, /learning loop/i);

  const design = read("ai-first", "references/design.md");
  assert.match(design, /Decision matrix/);
  assert.match(design, /Context/);
  assert.match(design, /Acceptance mode/);
  assert.match(design, /Observability/);
});

test("super skill turns visible-motion evidence into a browser game rule", () => {
  const skill = read("../../skills/super-skill", "SKILL.md");
  assert.match(skill, /rendered or observable output changed over time/i);
  assert.match(skill, /state text alone is not visible evidence/i);
  assert.match(skill, /### AI-first/);
});
