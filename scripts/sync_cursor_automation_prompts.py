#!/usr/bin/env python3
"""Push rankingcheckaimodels automation prompts to Cursor (et@edgephone.ai session)."""

from __future__ import annotations

import json
import os
import sqlite3
import sys
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MANIFEST = ROOT / "automations" / "prefill" / "manifest.json"
STATE_DB = Path(os.environ.get("APPDATA", "")) / "Cursor" / "User" / "globalStorage" / "state.vscdb"
API_BASE = "https://api2.cursor.sh/aiserver.v1.AutomationsService"
MARKER = "ranking check"

MODEL_API = {
    "composer-2.5-fast": "composer-2.5-fast",
    "gpt-5.5-high": "gpt-5.5-high",
    "gpt-5.3-codex": "gpt-5.3-codex",
    "claude-fable-5-thinking-high": "claude-fable-5-thinking-high",
}


def read_token() -> str:
    if not STATE_DB.exists():
        raise SystemExit("Sign into Cursor as et@edgephone.ai first")
    row = sqlite3.connect(str(STATE_DB)).execute(
        "SELECT value FROM ItemTable WHERE key='cursorAuth/accessToken'"
    ).fetchone()
    if not row or not row[0]:
        raise SystemExit("No cursorAuth/accessToken")
    val = row[0]
    return val.decode("utf-8") if isinstance(val, bytes) else val


def api(method: str, token: str, body: dict) -> dict:
    req = urllib.request.Request(
        f"{API_BASE}/{method}",
        data=json.dumps(body).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
            "Accept": "application/json",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=120) as resp:
            raw = resp.read().decode("utf-8")
            return json.loads(raw) if raw else {}
    except urllib.error.HTTPError as exc:
        raise SystemExit(f"{method} HTTP {exc.code}: {exc.read(800).decode()}") from exc


def normalize_name(name: str) -> str:
    return " ".join((name or "").lower().split())


def prompt_text(prefill: dict) -> str:
    prompts = prefill.get("workflow", {}).get("prompts") or []
    first = prompts[0]
    return first if isinstance(first, str) else (first.get("prompt") or "")


def normalize_git(git: dict | None) -> dict:
    git = dict(git or {})
    repo = git.get("repo") or "etai-netizen/rankingcheckaimodels"
    if not repo.startswith("http"):
        repo = f"https://github.com/{repo.replace('https://github.com/', '')}"
    return {"repo": repo, "branch": git.get("branch") or "main"}


def build_update(prefill: dict, automation_id: str) -> dict:
    wf = prefill["workflow"]
    slug = wf.get("model") or ""
    return {
        "automation_id": automation_id,
        "name": prefill.get("name", "").strip(),
        "enabled": True,
        "description": prefill.get("description"),
        "workflow": {
            "prompts": [{"prompt": prompt_text(prefill)}],
            "model": MODEL_API.get(slug, slug),
            "triggers": wf.get("triggers") or [],
            "git_config": normalize_git(wf.get("gitConfig")),
            "memory_enabled": bool(wf.get("memoryEnabled", True)),
        },
    }


def list_ranking_automations(token: str) -> list[dict]:
    data = api("ListAutomations", token, {"includeDisabled": True})
    rows = []
    for item in data.get("workflows") or []:
        outer = item.get("workflow") or item
        name = (outer.get("name") or "").strip()
        if MARKER not in normalize_name(name):
            continue
        aid = outer.get("automationId") or outer.get("id")
        if aid:
            rows.append({"automationId": aid, "name": name})
    return rows


def match_prefill(name: str, items: list[dict]) -> dict | None:
    n = normalize_name(name)
    for item in items:
        if normalize_name(item["name"]) == n:
            return item
    for item in items:
        mn = normalize_name(item["name"])
        if mn in n or n in mn:
            return item
    return None


def main() -> int:
    dry_run = "--dry-run" in sys.argv
    if not MANIFEST.exists():
        raise SystemExit("Run: node scripts/generate-prefills.mjs")

    token = read_token()
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    items = manifest.get("automations") or []
    remote = list_ranking_automations(token)

    if not remote:
        print("No 'Authority Ranking' automations found on Cursor account.")
        print("Import workflows from automations/workflows/ first, then re-run.")
        print("\nAvailable automations on account:")
        data = api("ListAutomations", token, {"includeDisabled": True})
        for item in data.get("workflows") or []:
            outer = item.get("workflow") or item
            print(f"  - {outer.get('name')}")
        return 1

    updated = 0
    for row in remote:
        item = match_prefill(row["name"], items)
        if not item:
            print(f"  SKIP (no prefill): {row['name']}")
            continue
        prefill_path = ROOT.joinpath(*item["file"].split("/"))
        prefill = json.loads(prefill_path.read_text(encoding="utf-8"))
        body = build_update(prefill, row["automationId"])
        print(f"  Update: {row['name']} ({len(body['workflow']['prompts'][0]['prompt'])} chars)")
        if dry_run:
            updated += 1
            continue
        api("UpdateAutomation", token, body)
        updated += 1

    print(f"\nDone: {updated}/{len(remote)} ranking automations synced (dry_run={dry_run})")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
