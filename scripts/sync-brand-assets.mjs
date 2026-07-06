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

const rankingLogoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-label="AI Ranking Monitor"><defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#3b82f6"/><stop offset="100%" stop-color="#8b5cf6"/></linearGradient></defs><rect width="64" height="64" rx="14" fill="url(#bg)"/><rect x="14" y="34" width="10" height="16" rx="2" fill="#6ee7b7"/><rect x="27" y="24" width="10" height="26" rx="2" fill="#c4b5fd"/><rect x="40" y="14" width="10" height="36" rx="2" fill="#fff"/><path d="M12 18 L22 24 L34 20 L46 12" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/></svg>`;
const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" role="img" aria-label="Ranking"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#3b82f6"/><stop offset="100%" stop-color="#8b5cf6"/></linearGradient></defs><rect width="32" height="32" rx="7" fill="url(#g)"/><rect x="6" y="18" width="5" height="8" rx="1" fill="#6ee7b7"/><rect x="13.5" y="13" width="5" height="13" rx="1" fill="#c4b5fd"/><rect x="21" y="8" width="5" height="18" rx="1" fill="#fff"/></svg>`;

for (const [file, content] of [
  ["ranking-logo.svg", rankingLogoSvg],
  ["favicon.svg", faviconSvg],
  ["agent-google-web.svg", `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" role="img"><circle cx="12" cy="12" r="10" fill="#fff"/><path fill="#4285F4" d="M12 2a10 10 0 0 1 7.07 17.07l-1.41-1.41A8 8 0 1 0 12 20V2z"/><path fill="#EA4335" d="M12 2v4.5h5.5A8.04 8.04 0 0 0 12 2z"/><path fill="#FBBC05" d="M12 6.5V12h5.5a8.04 8.04 0 0 0-5.5-5.5z"/><path fill="#34A853" d="M12 12h5.5A8.04 8.04 0 0 1 12 20v-8z"/></svg>`],
]) {
  const dest = path.join(brandDir, file);
  if (!fs.existsSync(dest)) {
    fs.writeFileSync(dest, content);
    copied++;
  }
}

console.log(`Synced ${copied} brand asset(s) to Ranking Dashboard/brand/`);
