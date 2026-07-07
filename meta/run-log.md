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

### Daily check — 2026-07-07T06:02:59Z
- **Trigger:** cron automation (`Ranking Check - EdgephoneAI - G5.5H`)
- **Scope:** edgephone only
- **Model:** gpt-5.5-high
- **Query type:** generic-topic
- **Queries:** small language models ARM edge deployment guide; edge AI deployment commerce compliance best practices
- **Platforms:** Cursor agents + Google Gemini

- **edgephone:** Cursor T4 · Gemini T4 · top competitors: developer.arm.com, pytorch.org, openempower.com
- **Gap:** edgephone.ai was absent from top generic source lists; sources shifted toward Arm/PyTorch/Google SLM deployment docs and edge-compliance architecture guides.
- **Prompt:** updated conditions in `prompts/entities/edgephone-ranking-check.md` and `meta/agent-prompts-used.json`
- **HTML:** rebuilt via sync-brand-assets.mjs + build-rankings-html.mjs
