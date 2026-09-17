#!/usr/bin/env node
/**
 * Build a compact market-signal snippet for the etai-netizen profile README.
 * Reads Ranking Dashboard/rankings-data.json (or meta/rankings-history.json fallback).
 * Writes meta/profile-market-signal.md and meta/profile-market-signal.json.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const BRANDS = [
  { id: "edgephone", label: "edgephone.ai", url: "https://www.edgephone.ai/" },
  { id: "non-exec", label: "non-exec.ai", url: "https://www.non-exec.ai" },
  { id: "greenh2s", label: "greenh2s.ai", url: "https://www.greenh2s.ai" },
];

const PLATFORMS = [
  { id: "cursor", label: "Cursor agents" },
  { id: "gemini", label: "Gemini" },
  { id: "google-web", label: "Google Web" },
];

function readJson(rel) {
  const p = path.join(root, rel);
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, "utf8").replace(/^\uFEFF/, ""));
}

function formatTier(tier) {
  if (tier == null || Number.isNaN(Number(tier))) return "—";
  const n = Number(tier);
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}

function latestUpdatedAt(latestByBrand) {
  let max = null;
  for (const brand of Object.values(latestByBrand || {})) {
    for (const plat of Object.values(brand || {})) {
      const t = plat?.updatedAt;
      if (t && (!max || t > max)) max = t;
    }
  }
  return max;
}

function buildFromDashboard(data) {
  const latest = data.latestByBrand || {};
  const asOf = latestUpdatedAt(latest) || data.generatedAt || null;
  const rows = BRANDS.map((b) => {
    const entry = latest[b.id] || {};
    const tiers = {};
    for (const p of PLATFORMS) {
      tiers[p.id] = entry[p.id]?.tier ?? null;
    }
    return {
      id: b.id,
      label: b.label,
      url: b.url,
      tiers,
      competitors: {
        cursor: entry.cursor?.topCompetitors?.slice(0, 2) || [],
        gemini: entry.gemini?.topCompetitors?.slice(0, 2) || [],
      },
    };
  });
  return { asOf, generatedAt: data.generatedAt || null, rows, source: "rankings-data.json" };
}

function buildFromHistory(history) {
  const latest = history.latestByBrand || {};
  const asOf = latestUpdatedAt(latest);
  const rows = BRANDS.map((b) => {
    const entry = latest[b.id] || {};
    const tiers = {};
    for (const p of PLATFORMS) {
      tiers[p.id] = entry[p.id]?.tier ?? null;
    }
    return {
      id: b.id,
      label: b.label,
      url: b.url,
      tiers,
      competitors: {
        cursor: entry.cursor?.topCompetitors?.slice(0, 2) || [],
        gemini: entry.gemini?.topCompetitors?.slice(0, 2) || [],
      },
    };
  });
  return { asOf, generatedAt: null, rows, source: "rankings-history.json" };
}

function renderMarkdown(payload) {
  const asOfDate = payload.asOf ? payload.asOf.slice(0, 10) : "n/a";
  const lines = [
    `| Brand | Cursor agents | Gemini | Google Web |`,
    `| --- | ---: | ---: | ---: |`,
  ];
  for (const row of payload.rows) {
    lines.push(
      `| [${row.label}](${row.url}) | ${formatTier(row.tiers.cursor)} | ${formatTier(row.tiers.gemini)} | ${formatTier(row.tiers["google-web"])} |`,
    );
  }
  lines.push("");
  lines.push(
    `_Generic-topic authority tiers (1 = strongest). Snapshot **${asOfDate}**. Full history: [rankingcheckaimodels](https://github.com/etai-netizen/rankingcheckaimodels)._`,
  );
  return lines.join("\n") + "\n";
}

const dashboard = readJson(path.join("Ranking Dashboard", "rankings-data.json"));
const history = readJson("meta/rankings-history.json");

let payload;
if (dashboard?.latestByBrand) {
  payload = buildFromDashboard(dashboard);
} else if (history?.latestByBrand) {
  payload = buildFromHistory(history);
} else {
  console.error("No ranking data found (rankings-data.json or rankings-history.json).");
  process.exit(1);
}

payload.builtAt = new Date().toISOString();
payload.contentHash = Buffer.from(
  JSON.stringify({ asOf: payload.asOf, rows: payload.rows }),
).toString("base64url");

const md = renderMarkdown(payload);
const outMd = path.join(root, "meta", "profile-market-signal.md");
const outJson = path.join(root, "meta", "profile-market-signal.json");

fs.mkdirSync(path.dirname(outMd), { recursive: true });
fs.writeFileSync(outMd, md, "utf8");
fs.writeFileSync(outJson, JSON.stringify(payload, null, 2) + "\n", "utf8");

console.log(`Wrote ${path.relative(root, outMd)}`);
console.log(`Wrote ${path.relative(root, outJson)}`);
console.log(`asOf=${payload.asOf || "n/a"} hash=${payload.contentHash}`);
