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

spawnSync(process.execPath, [path.join(root, "scripts", "sync-brand-assets.mjs")], { stdio: "inherit" });
spawnSync(process.execPath, [path.join(root, "scripts", "backfill-google-web-runs.mjs")], { stdio: "inherit" });
spawnSync("python", [path.join(root, "scripts", "sync-ranking-automation-costs.py")], {
  cwd: root,
  stdio: "inherit",
});

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
const AGENT_SERIES = (modelRotation.assessedAgents || []).map((a) => ({
  id: a.id,
  label: a.label,
  logo: a.logo,
  logoFallback: a.logoFallback,
  color: a.color,
  platform: a.platform,
}));

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

function normalizeModelId(model) {
  if (!model || model === "live-check-now" || model === "google-web") return null;
  const m = String(model).toLowerCase();
  if (m.includes("composer")) return "composer-2.5";
  if (m.includes("gpt-5.5")) return "gpt-5.5-high";
  if (m.includes("fable") || m.includes("claude-fable")) return "claude-fable-5-thinking-high";
  if (m.includes("codex")) return "gpt-5.3-codex";
  return model;
}

function runSeriesKey(r) {
  if (r.platform === "google-web") return "google-web";
  if (r.platform === "gemini") return "gemini";
  if (r.platform === "cursor") {
    const id = normalizeModelId(r.model);
    return id && AGENT_SERIES.some((s) => s.id === id) ? id : null;
  }
  return null;
}

function periodKey(dateStr, grain) {
  const d = new Date(dateStr + (dateStr.length === 10 ? "T12:00:00Z" : ""));
  if (grain === "day") return d.toISOString().slice(0, 10);
  if (grain === "month") return d.toISOString().slice(0, 7);
  return String(d.getUTCFullYear());
}

function buildEntityTimeSeries(grain, limit) {
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
      data: keys.map((k) => avgTier(buckets.get(k)?.[id] || [])),
      borderColor: ENTITY_COLORS[id],
      backgroundColor: ENTITY_COLORS[id] + "33",
      tension: 0.25,
      spanGaps: true,
    };
  });
  return { labels: keys, datasets };
}

function buildAgentTimeSeries(grain, limit, brandId = null) {
  const buckets = new Map();
  for (const r of runs) {
    const sk = runSeriesKey(r);
    if (!sk) continue;
    const date = r.date || (r.runId || "").slice(0, 10);
    if (!date || !r.brand || !r.tier) continue;
    if (brandId && r.brand !== brandId) continue;
    const key = periodKey(date, grain);
    if (!buckets.has(key)) buckets.set(key, {});
    const b = buckets.get(key);
    if (!b[sk]) b[sk] = [];
    b[sk].push(r);
  }
  const keys = [...buckets.keys()].sort().slice(-limit);
  const datasets = AGENT_SERIES.map((agent) => ({
    id: agent.id,
    label: agent.label,
    logo: agent.logo,
    logoFallback: agent.logoFallback,
    data: keys.map((k) => avgTier(buckets.get(k)?.[agent.id] || [])),
    borderColor: agent.color,
    backgroundColor: agent.color + "33",
    tension: 0.25,
    spanGaps: true,
  }));
  return { labels: keys, datasets };
}

const charts = {
  byEntity: {
    daily: buildEntityTimeSeries("day", 30),
    monthly: buildEntityTimeSeries("month", 12),
    yearly: buildEntityTimeSeries("year", 10),
  },
  byAgent: {
    daily: buildAgentTimeSeries("day", 30),
    monthly: buildAgentTimeSeries("month", 12),
    yearly: buildAgentTimeSeries("year", 10),
  },
  byAgentPerEntity: Object.fromEntries(
    ENTITY_ORDER.map((id) => [
      id,
      {
        daily: buildAgentTimeSeries("day", 30, id),
        monthly: buildAgentTimeSeries("month", 12, id),
        yearly: buildAgentTimeSeries("year", 10, id),
      },
    ])
  ),
};

function tierClass(t) {
  if (t == null || t === "—") return "";
  if (t <= 2) return "tier-good";
  if (t === 3) return "tier-mid";
  return "tier-bad";
}

function latestAgentTier(brandId, agentId) {
  const agent = AGENT_SERIES.find((a) => a.id === agentId);
  if (!agent) return "—";
  const matching = runs.filter((r) => {
    if (r.brand !== brandId) return false;
    return runSeriesKey(r) === agentId;
  });
  if (matching.length) return matching[matching.length - 1].tier;
  const lb = history.latestByBrand?.[brandId];
  if (agent.platform === "google-web" && lb?.["google-web"]?.tier != null) return lb["google-web"].tier;
  if (agent.platform === "gemini" && lb?.gemini?.tier != null) return lb.gemini.tier;
  if (agent.platform === "cursor" && lb?.cursor?.tier != null) return lb.cursor.tier;
  return "—";
}

function entityObjective(id) {
  return objectives.siblingPrograms?.find((p) => p.id === id)?.genericTopicArea || "";
}

function agentTierCell(agent) {
  const logo = agent.logoFallback
    ? `<img src="${agent.logo}" alt="${escapeHtml(agent.label)}" class="agent-logo" onerror="this.onerror=null;this.src='${agent.logoFallback}'" />`
    : `<img src="${agent.logo}" alt="${escapeHtml(agent.label)}" class="agent-logo" />`;
  return `
        <div class="agent-tier ${tierClass(latestAgentTier("__BRAND__", agent.id))}" data-agent="${agent.id}">
          ${logo}
          <span class="agent-name">${escapeHtml(agent.label)}</span>
          <span class="tier-badge">Tier __TIER__</span>
        </div>`;
}

function entityColumns() {
  return ENTITY_ORDER.map((id) => {
    const meta = agentPromptsUsed.entities?.[id] || {};
    const brand = targetRepos.brands?.find((b) => b.id === id) || {};
    const promptText = readPromptText(meta.promptFile || brand.promptFile || "");
    const cond = meta.conditionsAtLastPrompt || {};
    const logo = modelRotation.entities?.find((e) => e.id === id)?.logo || `brand/entity-${id}.png`;
    const cursorAgents = AGENT_SERIES.filter((a) => a.platform === "cursor");
    const webAgents = AGENT_SERIES.filter((a) => a.platform !== "cursor");

    const cursorCells = cursorAgents
      .map((a) =>
        agentTierCell(a)
          .replace("__BRAND__", id)
          .replace("__TIER__", String(latestAgentTier(id, a.id)))
      )
      .join("\n");
    const webCells = webAgents
      .map((a) =>
        agentTierCell(a)
          .replace("__BRAND__", id)
          .replace("__TIER__", String(latestAgentTier(id, a.id)))
      )
      .join("\n");

    return `
    <section class="entity-panel" data-entity="${id}">
      <header class="entity-header">
        <img class="entity-logo" src="${logo}" alt="${escapeHtml(meta.label || id)}" onerror="this.classList.add('logo-missing')" />
        <div>
          <h2><a href="${brand.site || meta.site || "#"}" target="_blank" rel="noopener">${escapeHtml(meta.label || id)}</a></h2>
          <p class="entity-objective">${escapeHtml(entityObjective(id))}</p>
        </div>
      </header>

      <h3 class="prompt-heading">Latest tier by agent model</h3>
      <div class="agent-tier-grid cursor-models">${cursorCells}</div>
      <div class="agent-tier-grid web-agents">${webCells}</div>

      <h3 class="prompt-heading">Agent Prompt Used to Check Ranking</h3>
      <p class="prompt-meta">Last updated: ${escapeHtml((meta.lastPromptUpdate || "").slice(0, 19))} · Cursor T${cond.cursorTier ?? "?"}, Google Web T${cond.googleWebTier ?? cond.geminiTier ?? "?"}, Gemini T${cond.geminiTier ?? "?"}</p>
      <pre class="agent-prompt-box">${escapeHtml(promptText)}</pre>
    </section>`;
  }).join("\n");
}

function modelBadges() {
  const cursorModels = modelRotation.models || [];
  const webModels = AGENT_SERIES.filter((a) => a.platform !== "cursor");
  return [...cursorModels, ...webModels]
    .map((m) => {
      const logo = m.logo || AGENT_SERIES.find((a) => a.id === m.id)?.logo;
      const label = m.label || AGENT_SERIES.find((a) => a.id === m.id)?.label;
      return `<span class="model-badge"><img src="${logo}" alt="" class="model-logo" onerror="this.style.display='none'" /><span>${escapeHtml(label)}</span></span>`;
    })
    .join("");
}

function legendHtml(datasets) {
  return datasets
    .map(
      (ds) =>
        `<span class="legend-item"><img src="${ds.logo}" alt="" class="legend-logo" onerror="this.style.opacity='0.3'" /><span class="legend-swatch" style="background:${ds.borderColor}"></span><span>${escapeHtml(ds.label)}</span></span>`
    )
    .join("");
}

function agentLegendBlocks() {
  return legendHtml(charts.byAgent.daily.datasets);
}

function formatUsd(n) {
  return `$${Number(n ?? 0).toFixed(2)}`;
}

function costPanelHtml(costs) {
  if (!costs) {
    return `<aside class="cost-panel"><h2 class="cost-panel-title">Cursor run cost</h2><p class="cost-panel-sub">No cost data yet</p></aside>`;
  }
  const last5 = costs.last5Days || [];
  const total = costs.totals?.last5DaysUsd ?? 0;
  const tag = costs.costSource || "estimated";
  const rows = last5
    .map(
      (r) =>
        `<tr><td>${escapeHtml(r.date)}</td><td>${formatUsd(r.totalUsd)}</td><td>${r.runCount}</td><td class="cost-src">${escapeHtml(r.source || tag)}</td></tr>`
    )
    .join("");
  return `<aside class="cost-panel">
      <h2 class="cost-panel-title">Cursor run cost</h2>
      <p class="cost-panel-sub">Past 5 days · ${costs.runsPerDay ?? 9} ranking automations/day · 06:00 GMT</p>
      <table class="cost-table"><thead><tr><th>Date</th><th>Cost</th><th>Runs</th><th>Src</th></tr></thead><tbody>${rows}</tbody></table>
      <p class="cost-total">5-day total: <strong>${formatUsd(total)}</strong> <span class="cost-tag cost-tag-${escapeHtml(tag)}">${escapeHtml(tag)}</span></p>
      <p class="cost-link"><a href="${escapeHtml(costs.dashboardUsage || "#")}" target="_blank" rel="noopener">Cursor usage dashboard</a></p>
    </aside>`;
}

function methodologyNoteHtml() {
  const ns = objectives.northStar || {};
  const agents = (modelRotation.assessedAgents || [])
    .map((a) => escapeHtml(a.label))
    .join(", ");
  const filter = escapeHtml(
    ns.decisionFilter ||
      "Would {site} appear in the top 3 sources when a practitioner runs this generic topic query?"
  );
  return `<section class="methodology-note" aria-labelledby="methodology-heading">
      <p>This repo measures <strong>generic topic search ranking</strong> — not branded queries. Each probe simulates what a practitioner would see if they asked a category question with <strong>no brand names</strong> in Cursor agents, Google Web, or Google Gemini.</p>
      <p><strong>Probe flow (this repo):</strong></p>
      <ul>
        <li>Load the entity ranking-check prompt from <code>prompts/entities/*-ranking-check.md</code> (shown in each column below).</li>
        <li>Run one primary + one secondary generic query from that prompt — e.g. governance, edge AI, or green hydrogen topics from <code>config/target-repos.json</code>.</li>
        <li>For each agent, record the top 5 competitor domains cited and where the target site would rank.</li>
        <li>Append results to <code>meta/rankings-history.json</code> with brand, platform, model, tier, and competitors.</li>
        <li>If tier, competitors, or losing queries changed vs <code>meta/agent-prompts-used.json</code>, update the entity prompt and rebuild this dashboard.</li>
      </ul>
      <p><strong>Agents assessed per entity:</strong> ${agents}. Cursor uses three Cloud Agent models (9 automations at 06:00 GMT = 3 entities × 3 models). Each model is logged separately so agent charts compare models.</p>
      <p><strong>Tier assignment (lower = better ranking):</strong></p>
      <table class="tier-table">
        <thead><tr><th>Tier</th><th>Meaning</th></tr></thead>
        <tbody>
          <tr><td><strong>1</strong></td><td>Target site is the <strong>first</strong> source cited</td></tr>
          <tr><td><strong>2</strong></td><td>Target site appears in the <strong>top 3</strong> sources</td></tr>
          <tr><td><strong>3</strong></td><td>Target site is mentioned but competitors dominate</td></tr>
          <tr><td><strong>4</strong></td><td>Target site is rarely cited (regulators, vendors, Wikipedia lead)</td></tr>
          <tr><td><strong>5</strong></td><td>Target site does not appear in agent answers</td></tr>
        </tbody>
      </table>
      <p><strong>Decision filter (every probe):</strong> ${filter.replace("{site}", "the target site")}</p>
      <p><strong>Chart calculation:</strong> Trend graphs plot the <strong>average tier</strong> per entity or per agent model for each day, month, or year from probe history. Entity panels show the <strong>latest tier per agent</strong>. North star: move each brand toward tier 1–2 on generic topic search over time.</p>
      <p><strong>Excluded:</strong> Branded queries, <code>site:</code> searches, SEO rank trackers without an agent citation check, or content quality scored in isolation.</p>
    </section>`;
}

function automationStatusHtml() {
  const cfg =
    readJson("meta/cursor-automation-status.json") ||
    readJson("automations/account.json") ||
    {};
  const account = escapeHtml(cfg.account || objectives.cursorAccount || "et@edgephone.ai");
  const url = escapeHtml(cfg.automationsUrl || cfg.dashboardAutomations || "https://cursor.com/automations");
  const status = cfg.status === "active" ? "active" : "inactive-high-cost";
  const opts = cfg.statusOptions || {
    active: "Active",
    "inactive-high-cost": "Currently Inactive Due to High Cost",
  };
  const activeSel = status === "active" ? " selected" : "";
  const inactiveSel = status === "inactive-high-cost" ? " selected" : "";
  const note = escapeHtml(
    cfg.statusNote ||
      `Cursor Cloud Agent schedule on ${account}. Toggle automations at cursor.com/automations.`
  );
  return `<div class="automation-status-row">
      <span class="automation-status-label">Schedule</span>
      <select class="status-select status-${escapeHtml(status)}" id="automationScheduleStatus" data-default-status="${escapeHtml(status)}" aria-label="Cursor automation schedule status">
        <option value="inactive-high-cost"${inactiveSel}>${escapeHtml(opts["inactive-high-cost"] || "Currently Inactive Due to High Cost")}</option>
        <option value="active"${activeSel}>${escapeHtml(opts.active || "Active")}</option>
      </select>
    </div>
    <p class="automation-account-note" id="automationAccountNote">Account: <strong>${account}</strong> · ${note}</p>`;
}

const automationCosts = readJson("meta/automation-costs.json") || null;
const automationStatusCfg = readJson("meta/cursor-automation-status.json") || {};
const automationsUrl =
  automationStatusCfg.automationsUrl ||
  readJson("automations/account.json")?.dashboardAutomations ||
  "https://cursor.com/automations";
const dashboard = {
  generatedAt: new Date().toISOString(),
  schedule: objectives.schedule,
  mission: objectives.mission,
  charts,
  costCharts: automationCosts?.charts ?? { monthly: { labels: [], datasets: [] }, yearly: { labels: [], datasets: [] } },
  automationCosts: automationCosts
    ? {
        costSource: automationCosts.costSource,
        last5Days: automationCosts.last5Days,
        totals: automationCosts.totals,
        syncedAt: automationCosts.syncedAt,
      }
    : null,
  agentSeries: AGENT_SERIES,
  entities: ENTITY_ORDER,
  runs: runs.slice(-80),
  agentPromptsUsed,
  latestByBrand: history.latestByBrand,
};

fs.writeFileSync(outJson, JSON.stringify(dashboard, null, 2) + "\n");

let html = fs.readFileSync(templatePath, "utf8");
html = html
  .replace("{{GENERATED_AT}}", dashboard.generatedAt.replace("T", " ").replace(/\.\d{3}Z$/, " UTC"))
  .replace(/\{\{GENERATED_AT_ISO\}\}/g, dashboard.generatedAt)
  .replace("{{SCHEDULE}}", objectives.schedule || "06:00 GMT daily")
  .replace("{{MISSION}}", objectives.mission)
  .replace(/\{\{AUTOMATIONS_URL\}\}/g, automationsUrl)
  .replace("{{AUTOMATION_STATUS_CONTROL}}", automationStatusHtml())
  .replace("{{METHODOLOGY_NOTE}}", methodologyNoteHtml())
  .replace("{{ENTITY_COLUMNS}}", entityColumns())
  .replace("{{MODEL_BADGES}}", modelBadges())
  .replace("{{AGENT_LEGEND}}", agentLegendBlocks())
  .replace("{{COST_PANEL}}", costPanelHtml(automationCosts))
  .replace("{{CHART_DATA_JSON}}", JSON.stringify(charts))
  .replace("{{COST_CHART_DATA_JSON}}", JSON.stringify(automationCosts?.charts ?? { monthly: { labels: [], datasets: [] }, yearly: { labels: [], datasets: [] } }));

fs.writeFileSync(outHtml, html);
console.log(`Wrote ${outHtml}`);
