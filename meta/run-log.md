# Ranking Monitor — Run Log

Append-only log for Cloud Agent runs on **rankingcheckaimodels**.

---

## 2026-07-06 06:01 GMT — Ranking Check - greenh2sAI - F5H

- **Model:** claude-fable-5-thinking-high · **Entity:** greenh2s.ai only · **Platforms:** Cursor + Google Gemini
- **Queries (rotation):** primary "RFNBO certification green hydrogen requirements", secondary "hydrogen storage port scale deployment options"
- **Result:** Cursor tier 4, Gemini tier 4 (unchanged). greenh2s.ai absent from top-5 citations on both queries and platforms.
- **Competitor shift:** RFNBO query is dominated by regulators/certifiers — energy.ec.europa.eu, eur-lex.europa.eu, english.rvo.nl, tuv.com (CertifHy) — and the port-storage query by research institutions (osti.gov/PNNL, esmap.org, academic reviews), displacing the earlier iea.org/irena.org set.
- **Prompt adjustments:** updated `prompts/entities/greenh2s-ranking-check.md` conditions table (competitors, losing query, levers) and query rotation order; synced `meta/agent-prompts-used.json`; appended `meta/prompt-updates.json`.
- **Dashboard:** `node scripts/sync-brand-assets.mjs` + `node scripts/build-rankings-html.mjs` executed; `Ranking Dashboard/rankings.html` rebuilt.
- **Gap thesis:** greenh2s.ai has no indexed RFNBO-criteria (DR 2023/1184/1185) or port-scale storage comparison content for agents to cite; levers updated accordingly.

---
