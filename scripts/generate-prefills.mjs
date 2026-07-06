#!/usr/bin/env node
/**
 * Generates 9 daily 06:00 GMT Cursor Automation prefills (3 entities × 3 models).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { listCursorAutomations } from "./cursor-agents-util.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const objectives = JSON.parse(fs.readFileSync(path.join(root, "automations", "objectives.json"), "utf8"));
const modelRotation = JSON.parse(fs.readFileSync(path.join(root, "automations", "model-rotation.json"), "utf8"));
const agentsData = JSON.parse(fs.readFileSync(path.join(root, "automations", "cursor-agents.json"), "utf8"));
const orchestrator = fs.readFileSync(path.join(root, "automations", "PROMPT.md"), "utf8");

const GIT_REPO = agentsData.gitRepo ?? "etai-netizen/rankingcheckaimodels";
const GIT_BRANCH = agentsData.gitBranch ?? "main";
const MISSION = objectives.mission;

const entityById = Object.fromEntries((modelRotation.entities || []).map((e) => [e.id, e]));
const modelBySuffix = Object.fromEntries((modelRotation.models || []).map((m) => [m.suffix, m]));

const outDir = path.join(root, "automations", "prefill");
const workflowsDir = path.join(root, "automations", "workflows");
const promptsMdDir = path.join(root, "automations", "prompts");

for (const dir of [outDir, workflowsDir, promptsMdDir]) {
  fs.mkdirSync(dir, { recursive: true });
  if (dir === outDir) {
    for (const f of fs.readdirSync(dir)) {
      if (f.endsWith(".json") && f !== "manifest.json") fs.unlinkSync(path.join(dir, f));
    }
  }
}

function loadEntityPrompt(entityId) {
  const entity = entityById[entityId];
  if (!entity) throw new Error(`Unknown entity: ${entityId}`);
  return fs.readFileSync(path.join(root, entity.promptFile), "utf8");
}

function buildPrompt(agent) {
  const entity = entityById[agent.entityId];
  const model = modelBySuffix[agent.modelSuffix] ?? { label: agent.modelDisplayName, strength: "Ranking assessment" };
  const entityPrompt = loadEntityPrompt(agent.entityId);

  return `${orchestrator}

---

## This automation (single entity — replaces placeholder)

| Field | Value |
|-------|-------|
| **Automation** | ${agent.name} |
| **Entity** | ${entity.label} (${entity.site}) |
| **Cursor model** | ${agent.model} (${model.label}) |
| **Schedule** | 06:00 GMT daily |
| **Platforms** | Cursor (this model) + Google Gemini |
| **Brand id** | \`${agent.entityId}\` |

**Scope:** Check **${entity.label} only** — do not probe the other entities in this run.

---

## Agent prompt used to check ranking (${entity.label})

${entityPrompt}

---

## Model directive

- **Configured model:** ${agent.model}
- **Listed strength:** ${model.strength}
- Use this model's perspective for the Cursor-side assessment of generic topic queries.

---

## Acceptance test

Run fails unless:
1. \`meta/rankings-history.json\` has new entries for **${agent.entityId}** on **cursor** and **gemini**
2. \`prompts/entities/${path.basename(entity.promptFile)}\` and \`meta/agent-prompts-used.json\` updated if conditions changed
3. \`node scripts/build-rankings-html.mjs\` executed
4. Git commit: \`ranking: ${agent.cursorName} ${agent.modelSuffix} — summary\`
`;
}

function buildWorkflow(agent) {
  const entity = entityById[agent.entityId];
  return {
    name: agent.name,
    description: `${MISSION} — ${entity.label} · ${agent.modelDisplayName} · 06:00 GMT daily`,
    workflow: {
      triggers: [{ cron: { cron: agent.cron || "0 6 * * *" } }],
      actions: [],
      prompts: [buildPrompt(agent)],
      model: agent.model,
      gitConfig: { repo: GIT_REPO, branch: GIT_BRANCH },
      agentOptions: { skipInstall: false },
      memoryEnabled: true,
    },
  };
}

const manifest = [];
for (const agent of listCursorAutomations(root)) {
  const payload = buildWorkflow(agent);
  const filename = path.basename(agent.prefillFile.replace(/\//g, path.sep));

  fs.writeFileSync(path.join(outDir, filename), JSON.stringify(payload, null, 2) + "\n");
  fs.writeFileSync(path.join(workflowsDir, filename), JSON.stringify(payload, null, 2) + "\n");

  const base = path.basename(filename, ".json");
  fs.writeFileSync(
    path.join(promptsMdDir, `${base}.md`),
    `# ${payload.name}\n\n**Entity:** ${agent.entityId} · **Model:** ${agent.model}\n\n---\n\n${payload.workflow.prompts[0].slice(0, 6000)}…`
  );

  manifest.push({
    file: `automations/prefill/${filename}`,
    name: agent.name,
    entityId: agent.entityId,
    model: agent.model,
    modelSuffix: agent.modelSuffix,
    cursorAutomationId: agent.cursorAutomationId,
  });
}

fs.writeFileSync(
  path.join(outDir, "manifest.json"),
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      mission: MISSION,
      schedule: "06:00 GMT daily — 9 automations (3 entities × 3 models)",
      gitRepo: GIT_REPO,
      automations: manifest,
    },
    null,
    2
  ) + "\n"
);

console.log(`Generated ${manifest.length} entity ranking-check prefills`);
manifest.forEach((m) => console.log(`  - ${m.name} → ${m.model}`));
