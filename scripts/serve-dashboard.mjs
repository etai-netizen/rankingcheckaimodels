#!/usr/bin/env node
/**
 * Local dashboard server — syncs from Cursor/git on start and on /api/sync, then serves fresh HTML.
 */
import http from "http";
import fs from "fs";
import path from "path";
import { spawnSync } from "child_process";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const dashDir = path.join(root, "Ranking Dashboard");
const statusFile = path.join(root, "meta", "cursor-automation-status.json");
const PORT = 8787;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
};

function runSync() {
  const r = spawnSync(
    "powershell",
    [
      "-NoProfile",
      "-ExecutionPolicy",
      "Bypass",
      "-File",
      path.join(root, "scripts", "Sync-RankingsOnLogin.ps1"),
      "-SyncOnly",
      "-Quiet",
    ],
    { cwd: root, stdio: "inherit" }
  );
  return r.status === 0;
}

function readGeneratedAt() {
  try {
    const data = JSON.parse(fs.readFileSync(path.join(dashDir, "rankings-data.json"), "utf8"));
    return data.generatedAt || null;
  } catch {
    return null;
  }
}

function readAutomationStatus() {
  try {
    return JSON.parse(fs.readFileSync(statusFile, "utf8"));
  } catch {
    return { status: "inactive-high-cost", account: "et@edgephone.ai" };
  }
}

function writeAutomationStatus(status) {
  const cfg = readAutomationStatus();
  cfg.status = status === "active" ? "active" : "inactive-high-cost";
  cfg.updatedAt = new Date().toISOString().slice(0, 10);
  fs.writeFileSync(statusFile, JSON.stringify(cfg, null, 2) + "\n");
  return cfg;
}

runSync();

const server = http.createServer((req, res) => {
  const url = new URL(req.url || "/", `http://127.0.0.1:${PORT}`);

  if (url.pathname === "/api/sync") {
    runSync();
    res.writeHead(200, {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    });
    res.end(JSON.stringify({ ok: true, generatedAt: readGeneratedAt() }));
    return;
  }

  if (url.pathname === "/api/automation-status") {
    if (req.method === "POST") {
      let body = "";
      req.on("data", (chunk) => {
        body += chunk;
      });
      req.on("end", () => {
        try {
          const parsed = JSON.parse(body || "{}");
          const cfg = writeAutomationStatus(parsed.status);
          res.writeHead(200, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
          res.end(JSON.stringify({ ok: true, status: cfg.status }));
        } catch {
          res.writeHead(400);
          res.end("Bad request");
        }
      });
      return;
    }
    const cfg = readAutomationStatus();
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
    res.end(JSON.stringify({ ok: true, status: cfg.status, account: cfg.account }));
    return;
  }

  if (url.pathname === "/health") {
    res.writeHead(200, { "Content-Type": "application/json", "Cache-Control": "no-store" });
    res.end(JSON.stringify({ ok: true, generatedAt: readGeneratedAt() }));
    return;
  }

  let rel = decodeURIComponent(url.pathname).replace(/^\//, "") || "rankings.html";
  if (rel.includes("..")) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  const file = path.join(dashDir, rel);
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) {
    res.writeHead(404);
    res.end("Not found");
    return;
  }

  res.writeHead(200, {
    "Content-Type": MIME[path.extname(file)] || "application/octet-stream",
    "Cache-Control": "no-store",
  });
  res.end(fs.readFileSync(file));
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`Ranking dashboard (synced): http://127.0.0.1:${PORT}/rankings.html`);
});
