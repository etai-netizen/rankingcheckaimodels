# Ranking Monitor — Run Log

Append-only log for Cloud Agent runs on **rankingcheckaimodels**.

---

## 2026-07-06 06:02 UTC — Ranking Check — EdgephoneAI — F5H (`claude-fable-5-thinking-high`)

- **Scope:** edgephone.ai only (single-entity automation).
- **Queries run (generic topic, no brand):** "on-device AI inference manufacturing low power" (primary), "small language models ARM edge deployment guide" (secondary).
- **Results:** Cursor tier **4** (down from 3), Gemini tier **4** (unchanged). edgephone.ai absent from cited sources on both platforms for both queries.
- **Competitor shift:** chip.computer / ai.google.dev / developer.nvidia.com → **ambiq.com, developer.arm.com, analog.com** (low-power silicon vendors and Arm developer portals), with 2026 hardware roundups (kynix.com, iterathon.tech) and quantization tutorials (blog.4geeks.io, premai.io) filling Gemini source lists.
- **Prompt adjusted:** yes — `prompts/entities/edgephone-ranking-check.md` conditions table updated, query rotation reprioritized to the two losing queries plus a new llama.cpp/GGUF deployment query; levers refocused on hands-on deployment guides and energy-per-inference benchmarks. `meta/agent-prompts-used.json` and `meta/prompt-updates.json` updated.
- **Dashboard:** `scripts/sync-brand-assets.mjs` + `scripts/build-rankings-html.mjs` executed; `Ranking Dashboard/rankings.html` and `rankings-data.json` rebuilt.

---
