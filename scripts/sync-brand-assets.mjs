#!/usr/bin/env node
/** Copy entity and agent logos into Ranking Dashboard/brand */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const appsRoot = path.resolve(root, "..");
const brandDir = path.join(root, "Ranking Dashboard", "brand");

const copies = [
  [path.join(appsRoot, "neai_agency_agents", "neai", "Public", "Non-exec favicon.png"), "entity-non-exec.png"],
  [path.join(appsRoot, "edgephone_agency_agents", "edgephone", "Public", "favicon.png"), "entity-edgephone.png"],
  [path.join(appsRoot, "greenh2sai_agency_agents", "greenh2sai", "Public", "favicon.png"), "entity-greenh2s.png"],
  [path.join(appsRoot, "aimodelpromptedgephone", "EdgePhoneAI Cost Cycling", "brand", "agent-openai.svg"), "agent-openai.svg"],
  [path.join(appsRoot, "aimodelpromptedgephone", "EdgePhoneAI Cost Cycling", "brand", "agent-anthropic.svg"), "agent-anthropic.svg"],
];

fs.mkdirSync(brandDir, { recursive: true });

let copied = 0;
for (const [src, destName] of copies) {
  if (!fs.existsSync(src)) continue;
  fs.copyFileSync(src, path.join(brandDir, destName));
  copied++;
}

const cursorSrc = path.join(appsRoot, "aimodelpromptedgephone", "EdgePhoneAI Cost Cycling", "brand", "agent-cursor.png");
if (fs.existsSync(cursorSrc)) {
  fs.copyFileSync(cursorSrc, path.join(brandDir, "agent-cursor.png"));
  copied++;
} else {
  fs.writeFileSync(
    path.join(brandDir, "agent-cursor.svg"),
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="6" fill="#1a1a1a"/><path d="M7 8h10v2H7V8zm0 4h7v2H7v-2z" fill="#fff"/></svg>`
  );
  copied++;
}

if (!fs.existsSync(path.join(brandDir, "agent-gemini.svg"))) {
  fs.writeFileSync(
    path.join(brandDir, "agent-gemini.svg"),
    `<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>Google Gemini</title><path fill="#4285F4" d="M12 2L2 7l10 5 10-5-10-5z"/><path fill="#34A853" d="M2 17l10 5 10-5M2 12l10 5 10-5"/></svg>`
  );
  copied++;
}

if (!fs.existsSync(path.join(brandDir, "entity-greenh2s.png"))) {
  fs.writeFileSync(
    path.join(brandDir, "entity-greenh2s.svg"),
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" rx="10" fill="#10b981"/><text x="24" y="30" text-anchor="middle" fill="#fff" font-family="system-ui,sans-serif" font-size="14" font-weight="700">H2</text></svg>`
  );
  copied++;
}

console.log(`Synced ${copied} brand asset(s) to Ranking Dashboard/brand/`);
