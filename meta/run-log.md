# Ranking Monitor — Run Log

Append-only log for Cloud Agent runs on **rankingcheckaimodels**.

---

## 2026-07-06 — EdgephoneAI C2.5 (composer-2.5-fast)

**Run ID:** 2026-07-06T06:00:00Z · **Entity:** edgephone.ai only

### Queries probed
- **Primary:** on-device AI inference manufacturing low power
- **Secondary:** small language models ARM edge deployment guide

### Results
| Platform | Primary tier | Secondary tier | In top 3 |
|----------|-------------|----------------|----------|
| Cursor   | 3           | 4              | No       |
| Gemini   | 4           | 4              | No       |

### Top competitors (primary)
developer.nvidia.com, mirantis.com, arm.com, qualcomm.com, flolive.net

### Conditions changed
Yes — top competitors and losing query updated. Tiers unchanged (Cursor T3, Gemini T4).

### Prompt levers added
Manufacturing inference case studies; NVIDIA/Jetson comparison tables; ARM SLM deployment guide.

### Artifacts
- `meta/rankings-history.json` — 4 new run entries + dailySnapshots
- `prompts/entities/edgephone-ranking-check.md` — conditions table updated
- `meta/agent-prompts-used.json` — edgephone conditions refreshed
- `meta/prompt-updates.json` — change logged
- Dashboard rebuilt

---
