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

### Daily check — 2026-07-07T06:01:42Z
- **Automation:** Ranking Check - greenh2sAI - G5.5H
- **Entity:** greenh2s.ai only
- **Query:** RFNBO certification green hydrogen requirements
- **Platforms:** Cursor agents (gpt-5.5-high) + Google Gemini
- **Result:** Cursor T5 · Gemini T5 · top competitors: rvo.nl, certifhy.eu, energy.ec.europa.eu
- **Prompt update:** conditions changed; greenh2s prompt and agent metadata updated
- **HTML:** rebuilt via build-rankings-html.mjs
