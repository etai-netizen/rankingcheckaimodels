#!/usr/bin/env node
/**
 * Generates 4 daily 06:00 GMT Cursor Automation prefills (one per model).
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

const GIT_REPO = agentsData.gitRepo ?? "rankingcheckaimodels";
const GIT_BRANCH = agentsData.gitBranch ?? "main";
const CURSOR_ACCOUNT = agentsData.cursorAccount ?? "et@edgephone.ai";
const MISSION = objectives.mission;
const promptBase = fs.readFileSync(path.join(root, "automations", "PROMPT.md"), "utf8");

const entityPrompts = modelRotation.entities.map((e) => {
  const text = fs.readFileSync(path.join(root, e.promptFile), "utf8");
  return `### ${e.label}\n\n${text}`;
}).join("\n\n---\n\n");

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

function modelMeta(modelId) {
  return modelRotation.models?.find((m) => m.id === modelId) ?? { label: modelId, strength: "Ranking assessment" };
}

function buildPrompt(agent, modelId) {
  const meta = modelMeta(modelId);
  return `${promptBase}

---

## Configured model (this automation)

- **Model:** ${modelId} (${meta.label})
- **Strength:** ${meta.strength}
- **Schedule:** 06:00 GMT daily
- **Entities:** non-exec.ai, edgephone.ai, greenh2s.ai
- **Platforms:** Cursor (this model) + Google Gemini

---

## Entity ranking-check prompts (execute all three)

${entityPrompts}

---

## Acceptance test

Run fails unless: (1) meta/rankings-history.json has new entries for all 3 entities × 2 platforms, (2) entity prompts updated if conditions changed, (3) node scripts/build-rankings-html.mjs executed, (4) git commit on this repo.
`;
}

function buildWorkflow(agent, modelId) {
  return {
    name: agent.name,
    description: `${MISSION} — Daily 06:00 GMT. Model: ${modelId}. All entities + Gemini.`,
    workflow: {
      triggers: [{ cron: { cron: agent.cron || "0 6 * * *" } }],
      actions: [],
      prompts: [buildPrompt(agent, modelId)],
      model: modelId,
      gitConfig: { repo: GIT_REPO, branch: GIT_BRANCH },
      agentOptions: { skipInstall: false },
      memoryEnabled: true,
    },
  };
}

const manifest = [];
for (const agent of listCursorAutomations(root)) {
  const modelId = agent.modelSlug;
  const payload = buildWorkflow(agent, modelId);
  const filename = path.basename(agent.prefillFile.replace(/\//g, path.sep));

  fs.writeFileSync(path.join(outDir, filename), JSON.stringify(payload, null, 2) + "\n");
  fs.writeFileSync(path.join(workflowsDir, filename), JSON.stringify(payload, null, 2) + "\n");

  const base = path.basename(filename, ".json");
  fs.writeFileSync(
    path.join(promptsMdDir, `${base}.md`),
    `# ${payload.name}\n\n**Model:** ${modelId}\n**Cron:** ${agent.cron}\n\n---\n\n${payload.workflow.prompts[0].slice(0, 8000)}…`
  );

  manifest.push({
    file: `automations/prefill/${filename}`,
    name: payload.name,
    schedule: "06:00 GMT daily",
    model: modelId,
    cursorAutomationId: agent.cursorAutomationId,
  });
}

fs.writeFileSync(
  path.join(outDir, "manifest.json"),
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      mission: MISSION,
      schedule: "06:00 GMT daily (4 models)",
      gitRepo: GIT_REPO,
      automations: manifest,
    },
    null,
    2
  ) + "\n"
);

console.log(`Generated ${manifest.length} daily ranking-check prefills (06:00 GMT)`);
manifest.forEach((m) => console.log(`  - ${m.name} → ${m.model}`));
