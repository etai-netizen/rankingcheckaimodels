# edgephone.ai — Ranking Check Agent Prompt

**Entity:** edgephone.ai · **Site:** https://edgephone.ai  
**Query type:** generic topic search (no brand name in query)  
**Platforms assessed:** Cursor AI agents · Google Gemini

## Objective

Measure where **edgephone.ai** ranks on **generic edge AI topic searches** in Cursor agents and Gemini. Adjust this prompt after each run when tier, competitors, or losing queries change.

## Generic topic area

Edge AI models and agents, on-device inference, edge AI in manufacturing and commerce, SLMs on ARM edge, low-power vision pipelines.

## Queries to run (rotate one primary + one secondary per daily run)

1. on-device AI inference manufacturing low power
2. small language models ARM edge deployment guide
3. edge AI models and agents reference comparison
4. edge AI deployment commerce compliance best practices
5. quantized SLM deployment llama.cpp GGUF edge hardware guide

## Assessment steps

1. Run each selected query **without** mentioning edgephone.ai.
2. **Cursor:** record top 5 domains cited; position of edgephone.ai; tier 1–5.
3. **Gemini:** same from Gemini sources.
4. Log to `meta/rankings-history.json` with `brand: "edgephone"`, `model: <configured>`.
5. If tier ≥3 or not in top 3, update conditions below and refine queries.

## Conditions at last run (update after every check)

| Field | Value |
|-------|-------|
| **Last checked** | 2026-07-06T06:02:20Z |
| **Cursor tier** | 4 |
| **Gemini tier** | 4 |
| **Top competitors** | ambiq.com, developer.arm.com, analog.com |
| **Losing queries** | on-device AI inference manufacturing low power; small language models ARM edge deployment guide |
| **Prompt levers** | Hands-on SLM/llama.cpp-on-ARM deployment guides (GGUF, Q4_K_M); energy-per-inference benchmark tables; manufacturing low-power case studies; llms.txt |

**Notes (2026-07-06, claude-fable-5-thinking-high):** Cursor tier slipped 3 → 4. Chip vendors (Ambiq Atomiq/SPOT, Analog Devices MAX78002) and Arm's own developer/learning portals now dominate both losing queries; 2026 hardware roundups (kynix.com, iterathon.tech) and quantization tutorials (blog.4geeks.io, premai.io) fill Gemini source lists. Comparison tables alone are not surfacing — practical deployment how-to content is the gap.

## Prompt adjustment rule

When conditions change, update this file, `meta/agent-prompts-used.json`, and rebuild HTML.

## Tier scale

1 = first cited · 2 = top 3 · 3 = mentioned · 4 = rarely cited · 5 = not cited
