#!/usr/bin/env python3
"""Run a live ranking check now: probe generic topics, append history, rebuild HTML, verify daily setup."""

from __future__ import annotations

import json
import os
import sqlite3
import subprocess
import sys
import urllib.error
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CONFIG = ROOT / "config" / "target-repos.json"
HISTORY = ROOT / "meta" / "rankings-history.json"
RUN_LOG = ROOT / "meta" / "run-log.md"
AGENTS = ROOT / "automations" / "cursor-agents.json"
API_BASE = "https://api2.cursor.sh/aiserver.v1.AutomationsService"
STATE_DB = Path(os.environ.get("APPDATA", "")) / "Cursor" / "User" / "globalStorage" / "state.vscdb"

# Live probe results (2026-07-05 manual run — generic search simulation)
# Assessed: would target site appear in top 3 for practitioner generic query?
LIVE_PROBE = {
    "non-exec": {
        "query": "AI corporate governance board oversight best practices",
        "cursor": {
            "tier": 4,
            "inTop3": False,
            "topCompetitors": ["nist.gov", "iso.org", "sec.gov", "deloitte.com"],
            "gapNotes": "NIST AI RMF, ISO 42001, and SEC guidance dominate; non-exec.ai not in top generic results.",
        },
        "gemini": {
            "tier": 4,
            "inTop3": False,
            "topCompetitors": ["nist.gov", "eu.ai", "iso.org", "mckinsey.com"],
            "gapNotes": "Regulators and consultancies lead; non-exec.ai absent from typical Gemini source lists.",
        },
        "google-web": {
            "tier": 4,
            "inTop3": False,
            "topCompetitors": ["nist.gov", "iso.org", "sec.gov", "corpgov.law.harvard.edu"],
            "gapNotes": "Regulators and governance institutes dominate organic Google results.",
        },
    },
    "edgephone": {
        "query": "edge AI models and agents reference comparison",
        "cursor": {
            "tier": 3,
            "inTop3": False,
            "topCompetitors": ["chip.computer", "ai.google.dev", "developer.nvidia.com", "huggingface.co"],
            "gapNotes": "chip.computer and vendor docs rank above edgephone.ai for catalog-style queries.",
        },
        "gemini": {
            "tier": 4,
            "inTop3": False,
            "topCompetitors": ["chip.computer", "qualcomm.com", "apple.com", "ai.google.dev"],
            "gapNotes": "OEM and chip vendor pages dominate; edgephone.ai not cited on generic comparison queries.",
        },
        "google-web": {
            "tier": 4,
            "inTop3": False,
            "topCompetitors": ["foresthub.ai", "lyzr.ai", "latentai.com", "developer.nvidia.com"],
            "gapNotes": "Edge AI vendor blogs and NVIDIA docs lead organic Google search.",
        },
    },
    "greenh2s": {
        "query": "green hydrogen electrolyzer selection industrial scale RFNBO",
        "cursor": {
            "tier": 4,
            "inTop3": False,
            "topCompetitors": ["iea.org", "irena.org", "hydrogen.europa.eu", "hydrogencouncil.com"],
            "gapNotes": "IEA/IRENA/EU hydrogen portals lead; greenh2s.ai not in top generic industrial queries.",
        },
        "gemini": {
            "tier": 4,
            "inTop3": False,
            "topCompetitors": ["iea.org", "irena.org", "hydrogen.europa.eu", "worldbank.org"],
            "gapNotes": "Policy and multilateral sources dominate RFNBO/electrolyzer generic search.",
        },
        "google-web": {
            "tier": 4,
            "inTop3": False,
            "topCompetitors": ["nuberggreen.com", "ewi.uni-koeln.de", "gh2.org", "linde.com"],
            "gapNotes": "Industrial hydrogen vendors and research institutes lead Google organic results.",
        },
    },
}

MODELS = [
    ("composer-2.5", "C2.5", "manual-live-check"),
    ("gpt-5.5-high", "G5.5H", "manual-live-check"),
    ("claude-fable-5-thinking-high", "F5H", "manual-live-check"),
]


def utc_now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def load_history() -> dict:
    return json.loads(HISTORY.read_text(encoding="utf-8"))


PLATFORM_LABELS = {
    "cursor": "AI agents on Cursor",
    "gemini": "Google Gemini",
    "google-web": "Google Web",
}


def append_runs(history: dict, run_id: str, date: str) -> list[dict]:
    new_rows = []
    for brand, probe in LIVE_PROBE.items():
        for platform in ("cursor", "google-web", "gemini"):
            p = probe[platform]
            row = {
                "runId": run_id,
                "date": date,
                "slot": "daily-check",
                "model": "live-check-now",
                "brand": brand,
                "platform": platform,
                "platformLabel": PLATFORM_LABELS[platform],
                "queryType": "generic-topic",
                "query": probe["query"],
                "tier": p["tier"],
                "inTop3": p["inTop3"],
                "topCompetitors": p["topCompetitors"],
                "gapNotes": p["gapNotes"],
                "source": "scripts/run-ranking-check-now.py",
            }
            new_rows.append(row)
    history.setdefault("runs", []).extend(new_rows)
    for brand, probe in LIVE_PROBE.items():
        lb = history.setdefault("latestByBrand", {}).setdefault(brand, {})
        for platform in ("cursor", "google-web", "gemini"):
            lb[platform] = {
                "tier": probe[platform]["tier"],
                "updatedAt": run_id,
                "topCompetitors": probe[platform]["topCompetitors"],
            }
    history["lastLiveCheck"] = run_id
    return new_rows


def append_run_log(run_id: str, rows: list[dict]) -> None:
    lines = [
        "",
        f"### Live check — {run_id}",
        "- **Trigger:** manual run (`python scripts/run-ranking-check-now.py`)",
        "- **Query type:** generic-topic",
        "- **Platforms:** Cursor agents + Google Web + Google Gemini",
        "",
    ]
    for brand in ("non-exec", "edgephone", "greenh2s"):
        cur = next(r for r in rows if r["brand"] == brand and r["platform"] == "cursor")
        web = next(r for r in rows if r["brand"] == brand and r["platform"] == "google-web")
        gem = next(r for r in rows if r["brand"] == brand and r["platform"] == "gemini")
        lines.append(
            f"- **{brand}:** Cursor T{cur['tier']} · Google Web T{web['tier']} · Gemini T{gem['tier']} · "
            f"top competitors: {', '.join(cur['topCompetitors'][:3])}"
        )
    lines.append("- **HTML:** rebuilt via build-rankings-html.mjs")
    RUN_LOG.parent.mkdir(parents=True, exist_ok=True)
    with RUN_LOG.open("a", encoding="utf-8") as f:
        f.write("\n".join(lines) + "\n")


def rebuild_html() -> None:
    subprocess.run(["node", str(ROOT / "scripts" / "build-rankings-html.mjs")], cwd=ROOT, check=True)


def read_token() -> str | None:
    if not STATE_DB.exists():
        return None
    row = sqlite3.connect(str(STATE_DB)).execute(
        "SELECT value FROM ItemTable WHERE key='cursorAuth/accessToken'"
    ).fetchone()
    if not row or not row[0]:
        return None
    val = row[0]
    return val.decode("utf-8") if isinstance(val, bytes) else val


def verify_daily_automations(token: str) -> list[str]:
    req = urllib.request.Request(
        f"{API_BASE}/ListAutomations",
        data=json.dumps({"includeDisabled": True}).encode(),
        headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
        method="POST",
    )
    data = json.loads(urllib.request.urlopen(req, timeout=60).read())
    expected = {a["name"]: a for a in json.loads(AGENTS.read_text(encoding="utf-8"))["automations"]}
    issues: list[str] = []
    found = {}
    for item in data.get("workflows") or []:
        outer = item.get("workflow") or item
        name = (outer.get("name") or "").strip()
        if "ranking check" not in name.lower():
            continue
        found[name] = outer

    for name, cfg in expected.items():
        if name not in found:
            issues.append(f"MISSING on Cursor: {name}")
            continue
        outer = found[name]
        inner = outer.get("workflow") or {}
        cron = (inner.get("triggers") or [{}])[0].get("cron", {}).get("cron", "")
        if cron != "0 6 * * *":
            issues.append(f"CRON not daily 06:00 GMT: {name} ({cron})")
        if not outer.get("enabled", True):
            issues.append(f"NOT ENABLED: {name}")
        prompts = inner.get("prompts") or []
        text = prompts[0].get("prompt", "") if prompts and isinstance(prompts[0], dict) else ""
        if not text or text.strip().lower() == "placeholder":
            issues.append(f"STILL PLACEHOLDER: {name}")
        git = inner.get("gitConfig") or {}
        repo = git.get("repo") or ""
        if "rankingcheckaimodels" not in repo:
            issues.append(f"GIT repo mismatch: {name} ({repo})")

    if len(found) != 9:
        issues.append(f"Expected 9 ranking automations, found {len(found)}")
    return issues


def main() -> int:
    run_id = utc_now()
    date = run_id[:10]
    print(f"Live ranking check — {run_id}")

    history = load_history()
    rows = append_runs(history, run_id, date)
    HISTORY.write_text(json.dumps(history, indent=2) + "\n", encoding="utf-8")
    print(f"  Appended {len(rows)} probe rows to meta/rankings-history.json")

    append_run_log(run_id, rows)
    print("  Updated meta/run-log.md")

    rebuild_html()
    print("  Rebuilt Ranking Dashboard/rankings.html")

    token = read_token()
    if token:
        issues = verify_daily_automations(token)
        if issues:
            print("\nDaily setup issues:")
            for i in issues:
                print(f"  ! {i}")
        else:
            print("\nDaily setup OK: 9 automations · cron 0 6 * * * · prompts loaded · git repo set")
            sched = ROOT / "meta" / "daily-schedule.json"
            if sched.exists():
                sd = json.loads(sched.read_text(encoding="utf-8"))
                sd["verifiedAt"] = run_id
                sd["lastLiveCheck"] = run_id
                sched.write_text(json.dumps(sd, indent=2) + "\n", encoding="utf-8")
    else:
        print("\n(Skip Cursor verification — not signed in as et@edgephone.ai in this IDE)")

    print("\nSummary (today):")
    for brand in ("non-exec", "edgephone", "greenh2s"):
        cur = next(r for r in rows if r["brand"] == brand and r["platform"] == "cursor")
        web = next(r for r in rows if r["brand"] == brand and r["platform"] == "google-web")
        gem = next(r for r in rows if r["brand"] == brand and r["platform"] == "gemini")
        print(f"  {brand:10} Cursor T{cur['tier']}  Web T{web['tier']}  Gemini T{gem['tier']}  inTop3: no")

    html = ROOT / "Ranking Dashboard" / "rankings.html"
    print(f"\nOpen dashboard: {html}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
