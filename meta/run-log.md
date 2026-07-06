# Ranking Monitor — Run Log

Append-only log for Cloud Agent runs on **rankingcheckaimodels**.

---

## 2026-07-06 — NonExecAI C2.5 (composer-2.5-fast)

**Run ID:** 2026-07-06T06:00:00Z · **Slot:** daily-check · **Entity:** non-exec.ai only

### Queries probed
- Primary: enterprise AI agent registry governance reference
- Secondary: EU AI Act board responsibilities explained

### Results
| Platform | Tier | In top 3 | Top competitors |
|----------|------|----------|-----------------|
| Cursor | 4 | No | docs.cloud.google.com, prefactor.tech, kosmoy.com |
| Gemini | 4 | No | docs.cloud.google.com, kosmoy.com, thinking.inc |

non-exec.ai not cited on either query. Vendor agent-registry docs and director-liability explainers dominate.

### Prompt adjustments
- Reordered queries to prioritize losing probes (registry + EU AI Act board duties)
- Updated conditions table, `agent-prompts-used.json`, and `prompt-updates.json`
- Prompt levers: agent-registry governance hub; EU AI Act board-duty reference pages

### Artifacts
- `meta/rankings-history.json` — 4 new run entries + dailySnapshots
- Dashboard rebuilt via `node scripts/build-rankings-html.mjs`

---
