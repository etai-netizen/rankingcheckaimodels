#!/usr/bin/env node
/**
 * Build Ranking Dashboard with side-by-side entities, agent prompts, logos, and day/month/year charts.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { spawnSync } from "child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const templatePath = path.join(root, "Ranking Dashboard", "rankings.template.html");
const outHtml = path.join(root, "Ranking Dashboard", "rankings.html");
const outJson = path.join(root, "Ranking Dashboard", "rankings-data.json");
const brandDir = path.join(root, "Ranking Dashboard", "brand");

spawnSync(process.execPath, [path.join(root, "scripts", "sync-brand-assets.mjs")], { stdio: "inherit" });

const objectives = JSON.parse(fs.readFileSync(path.join(root, "automations", "objectives.json"), "utf8").replace(/^\uFEFF/, ""));
const targetRepos = JSON.parse(fs.readFileSync(path.join(root, "config", "target-repos.json"), "utf8").replace(/^\uFEFF/, ""));
const modelRotation = JSON.parse(fs.readFileSync(path.join(root, "automations", "model-rotation.json"), "utf8").replace(/^\uFEFF/, ""));

function readJson(rel) {
  const p = path.join(root, rel);
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, "utf8").replace(/^\uFEFF/, ""));
}

const history = readJson("meta/rankings-history.json") || { runs: [], latestByBrand: {} };
const agentPromptsUsed = readJson("meta/agent-prompts-used.json") || { entities: {} };
const runs = history.runs || [];

const ENTITY_COLORS = { "non-exec": "#6366f1", edgephone: "#8b5cf6", greenh2s: "#10b981" };
const ENTITY_ORDER = ["non-exec", "edgephone", "greenh2s"];

function escapeHtml(s) {
  return String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function readPromptText(rel) {
  const p = path.join(root, rel);
  return fs.existsSync(p) ? fs.readFileSync(p, "utf8") : "";
}

function avgTier(items) {
  if (!items.length) return null;
  return Math.round((items.reduce((a, r) => a + r.tier, 0) / items.length) * 10) / 10;
}

function periodKey(dateStr, grain) {
  const d = new Date(dateStr + (dateStr.length === 10 ? "T12:00:00Z" : ""));
  if (grain === "day") return d.toISOString().slice(0, 10);
  if (grain === "month") return d.toISOString().slice(0, 7);
  return String(d.getUTCFullYear());
}

function buildTimeSeries(grain, limit) {
  const buckets = new Map();
  for (const r of runs) {
    const date = r.date || (r.runId || "").slice(0, 10);
    if (!date || !r.brand || !r.tier) continue;
    const key = periodKey(date, grain);
    if (!buckets.has(key)) buckets.set(key, {});
    const b = buckets.get(key);
    if (!b[r.brand]) b[r.brand] = [];
    b[r.brand].push(r);
  }
  const keys = [...buckets.keys()].sort().slice(-limit);
  const datasets = ENTITY_ORDER.map((id) => {
    const label = agentPromptsUsed.entities?.[id]?.label || id;
    return {
      label,
      data: keys.map((k) => {
        const items = buckets.get(k)?.[id] || [];
        return avgTier(items);
      }),
      borderColor: ENTITY_COLORS[id],
      backgroundColor: ENTITY_COLORS[id] + "33",
      tension: 0.25,
      spanGaps: true,
    };
  });
  return { labels: keys, datasets };
}

const charts = {
  daily: buildTimeSeries("day", 30),
  monthly: buildTimeSeries("month", 12),
  yearly: buildTimeSeries("year", 10),
};

function tierClass(t) {
  if (t == null || t === "—") return "";
  if (t <= 2) return "tier-good";
  if (t === 3) return "tier-mid";
  return "tier-bad";
}

function latestTier(brandId, platform) {
  const lb = history.latestByBrand?.[brandId]?.[platform];
  return lb?.tier ?? "—";
}

function entityObjective(id) {
  return objectives.siblingPrograms?.find((p) => p.id === id)?.genericTopicArea || "";
}

function entityColumns() {
  return ENTITY_ORDER.map((id) => {
    const meta = agentPromptsUsed.entities?.[id] || {};
    const brand = targetRepos.brands?.find((b) => b.id === id) || {};
    const promptText = readPromptText(meta.promptFile || brand.promptFile || "");
    const cond = meta.conditionsAtLastPrompt || {};
    const logo = modelRotation.entities?.find((e) => e.id === id)?.logo || `brand/entity-${id}.png`;
    const cursorTier = latestTier(id, "cursor");
    const geminiTier = latestTier(id, "gemini");

    return `
    <section class="entity-panel" data-entity="${id}">
      <header class="entity-header">
        <img class="entity-logo" src="${logo}" alt="${escapeHtml(meta.label || id)}" onerror="this.classList.add('logo-missing')" />
        <div>
          <h2><a href="${brand.site || meta.site || "#"}" target="_blank" rel="noopener">${escapeHtml(meta.label || id)}</a></h2>
          <p class="entity-objective">${escapeHtml(entityObjective(id))}</p>
        </div>
      </header>

      <div class="agent-tier-row">
        <div class="agent-tier ${tierClass(cursorTier)}">
          <img src="brand/agent-cursor.png" alt="Cursor" class="agent-logo" onerror="this.src='brand/agent-cursor.svg'" />
          <span class="agent-name">Cursor agents</span>
          <span class="tier-badge">Tier ${cursorTier}</span>
        </div>
        <div class="agent-tier ${tierClass(geminiTier)}">
          <img src="brand/agent-gemini.svg" alt="Gemini" class="agent-logo" />
          <span class="agent-name">Google Gemini</span>
          <span class="tier-badge">Tier ${geminiTier}</span>
        </div>
      </div>

      <h3 class="prompt-heading">Agent Prompt Used to Check Ranking</h3>
      <p class="prompt-meta">Last updated: ${escapeHtml((meta.lastPromptUpdate || "").slice(0, 19))} · Conditions: Cursor T${cond.cursorTier ?? "?"}, Gemini T${cond.geminiTier ?? "?"}</p>
      <pre class="agent-prompt-box">${escapeHtml(promptText)}</pre>
    </section>`;
  }).join("\n");
}

function modelBadges() {
  return (modelRotation.models || [])
    .map(
      (m) =>
        `<span class="model-badge"><img src="${m.logo}" alt="" class="model-logo" onerror="this.style.display='none'" /><span>${escapeHtml(m.label)}</span></span>`
    )
    .join("");
}

const dashboard = {
  generatedAt: new Date().toISOString(),
  schedule: objectives.schedule,
  mission: objectives.mission,
  charts,
  entities: ENTITY_ORDER,
  runs: runs.slice(-50),
  agentPromptsUsed,
  latestByBrand: history.latestByBrand,
};

fs.writeFileSync(outJson, JSON.stringify(dashboard, null, 2) + "\n");

let html = fs.readFileSync(templatePath, "utf8");
html = html
  .replace("{{GENERATED_AT}}", dashboard.generatedAt.replace("T", " ").replace(/\.\d{3}Z$/, " UTC"))
  .replace("{{SCHEDULE}}", objectives.schedule || "06:00 GMT daily")
  .replace("{{MISSION}}", objectives.mission)
  .replace("{{ENTITY_COLUMNS}}", entityColumns())
  .replace("{{MODEL_BADGES}}", modelBadges())
  .replace("{{CHART_DATA_JSON}}", JSON.stringify(charts));

fs.writeFileSync(outHtml, html);
console.log(`Wrote ${outHtml}`);
