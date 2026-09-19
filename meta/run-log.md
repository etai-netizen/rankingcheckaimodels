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

### Daily check — 2026-07-07T06:00:28Z — EdgephoneAI F5H
- **Trigger:** automation "Ranking Check - EdgephoneAI - F5H" (cron 06:00 GMT)
- **Model:** claude-fable-5-thinking-high · **Scope:** edgephone only
- **Queries rotated:** "on-device AI inference manufacturing low power" (primary), "small language models ARM edge deployment guide" (secondary)
- **edgephone:** Cursor T4 (down from T3) · Gemini T4 · not cited on either query/platform
- **Top competitors (Cursor):** ambiq.com, st.com, learn.arm.com, premai.io
- **Top competitors (Gemini):** axelera.ai, deepx.ai, nvidia.com, markaicode.com
- **Prompt updated:** yes — tier slip + competitor shift to silicon vendors (Ambiq Atomiq/SPOT, ST STM32N6) and llama.cpp/GGUF deployment tutorials; added query #5 (quantized SLM deployment) and refocused levers on hands-on tutorials + energy-per-inference benchmarks
- **HTML:** rebuilt via sync-brand-assets.mjs + build-rankings-html.mjs
