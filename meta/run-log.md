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

### Daily check — 2026-07-07T06:02:45Z (greenh2s only · Fable 5 High)
- **Trigger:** cron automation "Ranking Check - greenh2sAI - F5H" (06:00 GMT)
- **Model:** claude-fable-5-thinking-high
- **Query type:** generic-topic · queries: "hydrogen storage port scale deployment options" (primary), "green hydrogen offtake agreement compliance standards" (secondary)
- **Platforms:** Cursor agents + Google Gemini (grounded-search source approximation; no Gemini API key in env)

- **greenh2s:** Cursor T4 · Gemini T4 (unchanged) · top competitors: link.springer.com, osti.gov, oxfordenergy.org, h2v.eu
- **Conditions changed:** top competitors shifted from IEA/IRENA/EU policy portals to academic reviews (Springer port-storage review), national labs (PNNL via OSTI), Oxford Energy offtake papers, and H2V knowledge-centre PDFs; losing queries now the storage + offtake pair
- **Prompt updated:** prompts/entities/greenh2s-ranking-check.md, meta/agent-prompts-used.json, meta/prompt-updates.json
- **Gap:** greenh2s.ai content is served as a greenh2s.com subpage (GoDaddy builder) with no standalone technical explainer pages, so agents never cite the .ai domain on generic storage/offtake queries
- **HTML:** rebuilt via build-rankings-html.mjs
