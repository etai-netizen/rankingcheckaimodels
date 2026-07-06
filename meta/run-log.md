# Ranking Monitor — Run Log

Append-only log for Cloud Agent runs on **rankingcheckaimodels**.

---

## 2026-07-06 06:00 GMT — Ranking Check — NonExecAI — Fable 5 High

- **Model:** claude-fable-5-thinking-high · **Entity:** non-exec.ai only · **Platforms:** Cursor + Gemini
- **Queries:** `enterprise AI agent registry governance reference` (primary), `EU AI Act board responsibilities explained` (secondary) — 4 results appended to `meta/rankings-history.json`
- **Result:** Tier 4 on both platforms for both queries; non-exec.ai not cited in any top-5 source list. Gemini assessed via Google search-grounding proxy (no Gemini API key in environment).
- **Condition change detected:** top competitors shifted from regulators (nist.gov, iso.org, eu.ai) to commercial agent-registry vendors and niche EU AI Act explainers (kosmoy.com, collibra.com, thinking.inc, compelframework.org). Primary losing query is now the agent-registry query.
- **Prompt adjusted:** `prompts/entities/non-exec-ranking-check.md` conditions table + query rotation updated; mirrored to `meta/agent-prompts-used.json`; change logged in `meta/prompt-updates.json`.
- **Gap evidence:** https://www.non-exec.ai/llms.txt returns 404 (verified this run) — llms.txt lever remains open.
- **Dashboard:** rebuilt via `sync-brand-assets.mjs` + `build-rankings-html.mjs`; `dailySnapshots` section added to rankings history.
