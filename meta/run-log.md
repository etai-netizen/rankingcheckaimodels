# Ranking Monitor — Run Log

Append-only log for Cloud Agent runs on **rankingcheckaimodels**.

---

### Live check — 2026-07-05T10:40:09Z
- **Trigger:** manual run (`python scripts/run-ranking-check-now.py`)
- **Query type:** generic-topic
- **Platforms:** Cursor agents + Google Gemini

- **non-exec:** Cursor T4 · Gemini T4 · top competitors: nist.gov, iso.org, sec.gov
- **edgephone:** Cursor T3 · Gemini T4 · top competitors: chip.computer, ai.google.dev, developer.nvidia.com
- **greenh2s:** Cursor T4 · Gemini T4 · top competitors: iea.org, irena.org, hydrogen.europa.eu
- **HTML:** rebuilt via build-rankings-html.mjs

### Live check — 2026-07-05T10:41:23Z
- **Trigger:** manual run (`python scripts/run-ranking-check-now.py`)
- **Query type:** generic-topic
- **Platforms:** Cursor agents + Google Gemini

- **non-exec:** Cursor T4 · Gemini T4 · top competitors: nist.gov, iso.org, sec.gov
- **edgephone:** Cursor T3 · Gemini T4 · top competitors: chip.computer, ai.google.dev, developer.nvidia.com
- **greenh2s:** Cursor T4 · Gemini T4 · top competitors: iea.org, irena.org, hydrogen.europa.eu
- **HTML:** rebuilt via build-rankings-html.mjs

### Daily check — greenh2sAI C2.5 — 2026-07-07T06:00:00Z

- **Trigger:** cron (`Ranking Check - greenh2sAI - C2.5`) · **Model:** composer-2.5-fast
- **Entity:** greenh2s.ai only · **Query type:** generic-topic
- **Platforms:** Cursor (Composer 2.5) + Google Gemini

**Run ID:** 2026-07-07T06:00:00Z · **Entity:** greenh2s.ai only

**Queries:** Primary — hydrogen storage port scale deployment options; secondary — green hydrogen offtake agreement compliance standards (primary logged).

| Platform | Tier | In top 3 | Top competitors |
|----------|------|----------|-----------------|
| Cursor | 4 | No | link.springer.com, osti.gov, mdpi.com |
| Gemini | 4 | No | iea.org, irena.org, hydrogen.europa.eu |

**Conditions changed:** Yes — top competitors and losing query updated; prompt levers refocused on port-scale hydrogen storage hub.

**Actions:** Updated `prompts/entities/greenh2s-ranking-check.md`, `meta/agent-prompts-used.json`, `meta/prompt-updates.json`; rebuilt dashboard.
