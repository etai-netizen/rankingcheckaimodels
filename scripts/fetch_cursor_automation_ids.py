#!/usr/bin/env python3
"""List Ranking Check automations on Cursor and optionally write IDs to cursor-agents.json."""
from __future__ import annotations

import json
import os
import sqlite3
import sys
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
STATE_DB = Path(os.environ.get("APPDATA", "")) / "Cursor" / "User" / "globalStorage" / "state.vscdb"
API = "https://api2.cursor.sh/aiserver.v1.AutomationsService/ListAutomations"
AGENTS = ROOT / "automations" / "cursor-agents.json"


def token() -> str:
    row = sqlite3.connect(str(STATE_DB)).execute(
        "SELECT value FROM ItemTable WHERE key='cursorAuth/accessToken'"
    ).fetchone()
    if not row or not row[0]:
        raise SystemExit("Sign into Cursor as et@edgephone.ai")
    val = row[0]
    return val.decode("utf-8") if isinstance(val, bytes) else val


def main() -> int:
    req = urllib.request.Request(
        API,
        data=json.dumps({"includeDisabled": True}).encode(),
        headers={"Authorization": f"Bearer {token()}", "Content-Type": "application/json"},
        method="POST",
    )
    data = json.loads(urllib.request.urlopen(req, timeout=60).read())
    ranking = []
    for item in data.get("workflows") or []:
        outer = item.get("workflow") or item
        name = (outer.get("name") or "").strip()
        if "ranking check" not in name.lower():
            continue
        aid = outer.get("automationId") or outer.get("id")
        ranking.append({"name": name, "automationId": aid})
    for row in sorted(ranking, key=lambda x: x["name"]):
        print(f"{row['name']}\t{row['automationId']}")
    if "--write" in sys.argv and AGENTS.exists():
        agents = json.loads(AGENTS.read_text(encoding="utf-8"))
        by_name = {(a["name"] or "").strip().lower(): a for a in agents.get("automations", [])}
        for row in ranking:
            key = row["name"].strip().lower()
            for aname, entry in by_name.items():
                if aname == key or aname in key or key in aname:
                    entry["cursorAutomationId"] = row["automationId"]
                    entry["status"] = "Active"
                    break
        AGENTS.write_text(json.dumps(agents, indent=2) + "\n", encoding="utf-8")
        print(f"\nWrote IDs to {AGENTS.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
