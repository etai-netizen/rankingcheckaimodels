#!/usr/bin/env node
import fs from "fs";
import path from "path";

export function listCursorAutomations(root) {
  const file = path.join(root, "automations", "cursor-agents.json");
  const data = JSON.parse(fs.readFileSync(file, "utf8").replace(/^\uFEFF/, ""));
  return (data.automations || []).map((a) => ({
    name: a.name,
    status: a.status,
    slot: a.slot,
    utcHour: a.utcHour,
    dayParity: a.dayParity,
    modelSlug: a.model,
    modelDisplayName: a.modelDisplayName,
    cron: a.cron,
    cursorAutomationId: a.cursorAutomationId,
    prefillFile: a.prefillFile,
  }));
}
