#!/usr/bin/env python3
"""Fetch actual Cursor Cloud Agent costs for Ranking Check automations."""

from __future__ import annotations

import json
import os
import sqlite3
import urllib.error
import urllib.request
from collections import defaultdict
from datetime import datetime, timedelta, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
AGENTS = ROOT / "automations" / "cursor-agents.json"
ACCOUNT = ROOT / "automations" / "account.json"
MODEL_COSTS = ROOT / "automations" / "model-costs.json"
OUT = ROOT / "meta" / "automation-costs.json"
STATE_DB = Path(os.environ.get("APPDATA", "")) / "Cursor" / "User" / "globalStorage" / "state.vscdb"
API_USAGE = "https://api2.cursor.sh/aiserver.v1.DashboardService/GetFilteredUsageEvents"
API_GET_AUTO = "https://api2.cursor.sh/aiserver.v1.AutomationsService/GetAutomation"

MODEL_LABEL = {
    "composer-2.5": "Composer 2.5",
    "composer-2.5-fast": "Composer 2.5",
    "gpt-5.5-high": "GPT-5.5 High",
    "claude-fable-5-thinking-high": "Fable 5 High",
}

_detail_cache: dict[str, dict | None] = {}


def load_json(path: Path, default=None):
    if not path.exists():
        return default
    return json.loads(path.read_text(encoding="utf-8").replace("\ufeff", ""))


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


def api_post(url: str, token: str, body: dict) -> dict:
    req = urllib.request.Request(
        url,
        data=json.dumps(body).encode(),
        headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
        method="POST",
    )
    return json.loads(urllib.request.urlopen(req, timeout=60).read())


def normalize_model(model: str | None) -> str:
    m = (model or "").lower()
    if "composer" in m:
        return "composer-2.5"
    if "gpt-5.5" in m or "5.5-high" in m:
        return "gpt-5.5-high"
    if "fable" in m:
        return "claude-fable-5-thinking-high"
    return model or "unknown"


def ranking_automation_ids() -> dict[str, dict]:
    agents = load_json(AGENTS, {"automations": []})
    out = {}
    for a in agents.get("automations") or []:
        aid = a.get("cursorAutomationId")
        if aid:
            out[aid] = a
    return out


def fetch_automation_detail(token: str, automation_id: str) -> dict | None:
    if automation_id in _detail_cache:
        return _detail_cache[automation_id]
    try:
        data = api_post(API_GET_AUTO, token, {"automationId": automation_id, "id": automation_id})
        outer = data.get("workflow") or data
        inner = outer.get("workflow") or {}
        git = inner.get("gitConfig") or {}
        detail = {
            "name": (outer.get("name") or "").strip(),
            "repo": git.get("repo") or "",
            "model": inner.get("model") or "",
        }
    except Exception:
        detail = None
    _detail_cache[automation_id] = detail
    return detail


def is_ranking_automation(token: str, automation_id: str | None, known: dict[str, dict]) -> bool:
    if not automation_id:
        return False
    if automation_id in known:
        return True
    detail = fetch_automation_detail(token, automation_id)
    if not detail:
        return False
    name = (detail.get("name") or "").lower()
    repo = (detail.get("repo") or "").lower()
    return "ranking check" in name or "rankingcheckaimodels" in repo.replace("_", "").replace("-", "")


def event_cost_usd(ev: dict) -> float:
    if ev.get("chargedCents") is not None:
        return float(ev["chargedCents"]) / 100.0
    token = ev.get("tokenUsage") or {}
    if token.get("totalCents") is not None:
        fee = float(ev.get("cursorTokenFee") or 0)
        return (float(token["totalCents"]) + fee) / 100.0
    return 0.0


def fetch_headless_events(token: str, days: int = 45) -> list[dict]:
    start_ms = int((datetime.now(timezone.utc) - timedelta(days=days)).timestamp() * 1000)
    end_ms = int(datetime.now(timezone.utc).timestamp() * 1000)
    events: list[dict] = []
    page = 1
    while True:
        data = api_post(
            API_USAGE,
            token,
            {"startDate": start_ms, "endDate": end_ms, "page": page, "pageSize": 500},
        )
        batch = data.get("usageEventsDisplay") or data.get("usageEvents") or []
        events.extend(batch)
        total = int(data.get("totalUsageEventsCount") or 0)
        if len(events) >= total or len(batch) < 500:
            break
        page += 1
    return [e for e in events if e.get("isHeadless")]


def group_runs(events: list[dict], gap_minutes: int = 90) -> list[list[dict]]:
    buckets: dict[str, list[dict]] = defaultdict(list)
    for ev in events:
        key = str(ev.get("automationId") or "unknown")
        buckets[key].append(ev)
    groups: list[list[dict]] = []
    for bucket in buckets.values():
        sorted_ev = sorted(bucket, key=lambda e: int(e["timestamp"]))
        current = [sorted_ev[0]]
        for ev in sorted_ev[1:]:
            if int(ev["timestamp"]) - int(current[-1]["timestamp"]) <= gap_minutes * 60 * 1000:
                current.append(ev)
            else:
                groups.append(current)
                current = [ev]
        groups.append(current)
    return groups


def build_sessions(events: list[dict], token: str, known: dict[str, dict]) -> list[dict]:
    sessions = []
    for group in group_runs(events):
        aid = group[0].get("automationId")
        if not is_ranking_automation(token, aid, known):
            continue
        meta = known.get(aid) or {}
        detail = fetch_automation_detail(token, aid) if aid else None
        ts = datetime.fromtimestamp(int(group[0]["timestamp"]) / 1000, tz=timezone.utc)
        model_raw = group[0].get("model") or (detail or {}).get("model") or meta.get("model")
        model_slug = normalize_model(model_raw)
        cost = round(sum(event_cost_usd(ev) for ev in group), 4)
        sessions.append(
            {
                "date": ts.strftime("%Y-%m-%d"),
                "timestamp": ts.strftime("%Y-%m-%dT%H:%M:%SZ"),
                "automationName": (detail or {}).get("name") or meta.get("name"),
                "cursorAutomationId": aid,
                "entityId": meta.get("entityId"),
                "modelSuffix": meta.get("modelSuffix"),
                "modelSlug": model_slug,
                "modelLabel": MODEL_LABEL.get(model_slug) or meta.get("modelDisplayName") or model_slug,
                "costUsd": cost,
                "costSource": "actual",
                "eventCount": len(group),
            }
        )
    return sorted(sessions, key=lambda s: s["timestamp"])


def estimate_cost(model_slug: str, costs_cfg: dict) -> float:
    models = costs_cfg.get("models") or {}
    if model_slug in models:
        return float(models[model_slug].get("estimatedRunCostUsd") or costs_cfg.get("defaultEstimatedRunCostUsd", 0.5))
    return float(costs_cfg.get("defaultEstimatedRunCostUsd", 0.5))


def seed_estimated_sessions(days: int, costs_cfg: dict, known: dict[str, dict]) -> list[dict]:
    """Fill missing days with estimated 9-run schedule when no actual billing yet."""
    agents = list(known.values())
    if not agents:
        return []
    today = datetime.now(timezone.utc).date()
    sessions = []
    for offset in range(days):
        d = today - timedelta(days=offset)
        date_str = d.isoformat()
        for a in agents:
            slug = normalize_model(a.get("model"))
            sessions.append(
                {
                    "date": date_str,
                    "timestamp": f"{date_str}T06:00:00Z",
                    "automationName": a.get("name"),
                    "cursorAutomationId": a.get("cursorAutomationId"),
                    "entityId": a.get("entityId"),
                    "modelSuffix": a.get("modelSuffix"),
                    "modelSlug": slug,
                    "modelLabel": a.get("modelDisplayName") or MODEL_LABEL.get(slug, slug),
                    "costUsd": round(estimate_cost(slug, costs_cfg), 4),
                    "costSource": "estimated",
                    "eventCount": 0,
                }
            )
    return sessions


def aggregate_daily(sessions: list[dict]) -> list[dict]:
    by_date: dict[str, dict] = {}
    for s in sessions:
        d = s["date"]
        if d not in by_date:
            by_date[d] = {"date": d, "totalUsd": 0.0, "runCount": 0, "actualUsd": 0.0, "estimatedUsd": 0.0}
        by_date[d]["totalUsd"] = round(by_date[d]["totalUsd"] + s["costUsd"], 4)
        by_date[d]["runCount"] += 1
        if s.get("costSource") == "actual":
            by_date[d]["actualUsd"] = round(by_date[d]["actualUsd"] + s["costUsd"], 4)
        else:
            by_date[d]["estimatedUsd"] = round(by_date[d]["estimatedUsd"] + s["costUsd"], 4)
    rows = sorted(by_date.values(), key=lambda r: r["date"])
    for r in rows:
        r["totalUsd"] = round(r["totalUsd"], 2)
        r["actualUsd"] = round(r["actualUsd"], 2)
        r["estimatedUsd"] = round(r["estimatedUsd"], 2)
        r["source"] = "actual" if r["estimatedUsd"] == 0 else ("estimated" if r["actualUsd"] == 0 else "mixed")
    return rows


def build_time_series(daily: list[dict], grain: str) -> dict:
    buckets: dict[str, float] = defaultdict(float)
    for row in daily:
        d = row["date"]
        if grain == "month":
            key = d[:7]
        elif grain == "year":
            key = d[:4]
        else:
            key = d
        buckets[key] += row["totalUsd"]
    labels = sorted(buckets.keys())
    data = [round(buckets[k], 2) for k in labels]
    return {"labels": labels, "datasets": [{"label": "Ranking automation cost (USD)", "data": data, "borderColor": "#f59e0b", "backgroundColor": "#f59e0b33", "tension": 0.2, "fill": True}]}


def sync() -> dict:
    account = load_json(ACCOUNT, {})
    costs_cfg = load_json(MODEL_COSTS, {"defaultEstimatedRunCostUsd": 0.5, "models": {}})
    known = ranking_automation_ids()
    token = read_token()
    sessions: list[dict] = []
    source = "estimated"

    if token:
        try:
            raw = fetch_headless_events(token)
            ranking_events = [
                e for e in raw if is_ranking_automation(token, e.get("automationId"), known)
            ]
            sessions = build_sessions(ranking_events, token, known)
            if sessions:
                source = "actual"
        except (urllib.error.HTTPError, OSError) as exc:
            print(f"Cost sync API failed: {exc}")

    if not sessions:
        sessions = seed_estimated_sessions(5, costs_cfg, known)
        source = "estimated"
    else:
        # Merge: keep actuals, fill last 5 calendar days with estimates for missing automations
        actual_dates = {s["date"] for s in sessions}
        today = datetime.now(timezone.utc).date()
        for offset in range(5):
            d = (today - timedelta(days=offset)).isoformat()
            if d in actual_dates:
                continue
            for a in known.values():
                slug = normalize_model(a.get("model"))
                sessions.append(
                    {
                        "date": d,
                        "timestamp": f"{d}T06:00:00Z",
                        "automationName": a.get("name"),
                        "cursorAutomationId": a.get("cursorAutomationId"),
                        "entityId": a.get("entityId"),
                        "modelSuffix": a.get("modelSuffix"),
                        "modelSlug": slug,
                        "modelLabel": a.get("modelDisplayName") or MODEL_LABEL.get(slug, slug),
                        "costUsd": round(estimate_cost(slug, costs_cfg), 4),
                        "costSource": "estimated",
                        "eventCount": 0,
                    }
                )
        if any(s.get("costSource") == "estimated" for s in sessions):
            source = "mixed" if any(s.get("costSource") == "actual" for s in sessions) else "estimated"

    daily = aggregate_daily(sessions)
    last5 = daily[-5:]
    payload = {
        "version": 1,
        "currency": "USD",
        "costSource": source,
        "syncedAt": datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z"),
        "accountEmail": account.get("cursorAccount") or "et@edgephone.ai",
        "runsPerDay": len(known) or 9,
        "scheduleNote": "9 Ranking Check automations · 06:00 GMT daily",
        "dashboardUsage": account.get("dashboardUsage") or "https://cursor.com/dashboard?tab=usage",
        "sessions": sessions,
        "daily": daily,
        "last5Days": last5,
        "charts": {
            "monthly": build_time_series(daily, "month"),
            "yearly": build_time_series(daily, "year"),
        },
        "totals": {
            "last5DaysUsd": round(sum(r["totalUsd"] for r in last5), 2),
            "allTimeUsd": round(sum(r["totalUsd"] for r in daily), 2),
        },
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
    return payload


def main() -> int:
    payload = sync()
    print(
        f"Wrote {OUT.relative_to(ROOT)} · {payload['costSource']} · "
        f"{len(payload['sessions'])} session(s) · last 5d ${payload['totals']['last5DaysUsd']:.2f}"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
