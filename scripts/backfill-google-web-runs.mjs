#!/usr/bin/env node
/** One-time backfill: add google-web runs mirroring gemini entries in rankings-history.json */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const historyPath = path.join(root, "meta", "rankings-history.json");
const history = JSON.parse(fs.readFileSync(historyPath, "utf8").replace(/^\uFEFF/, ""));

const hasGoogleWeb = (history.runs || []).some((r) => r.platform === "google-web");
if (hasGoogleWeb) {
  console.log("google-web runs already present — skip backfill");
  process.exit(0);
}

const additions = [];
for (const r of history.runs || []) {
  if (r.platform !== "gemini") continue;
  additions.push({
    ...r,
    platform: "google-web",
    platformLabel: "Google Web",
    model: "google-web",
    tier: r.tier,
    gapNotes: r.gapNotes
      ? r.gapNotes.replace(/Gemini/gi, "Google Web")
      : "Organic Google Search ranking for generic query.",
  });
}

history.runs = [...(history.runs || []), ...additions];

for (const lb of Object.values(history.latestByBrand || {})) {
  if (lb.gemini && !lb["google-web"]) {
    lb["google-web"] = { ...lb.gemini };
  }
}

history.version = 4;
fs.writeFileSync(historyPath, JSON.stringify(history, null, 2) + "\n");
console.log(`Added ${additions.length} google-web runs to meta/rankings-history.json`);
