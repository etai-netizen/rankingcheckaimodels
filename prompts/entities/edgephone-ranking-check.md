# edgephone.ai — Ranking Check Agent Prompt

**Entity:** edgephone.ai · **Site:** https://edgephone.ai  
**Query type:** generic topic search (no brand name in query)  
**Platforms assessed:** Cursor AI agents · Google Gemini

## Objective

Measure where **edgephone.ai** ranks on **generic edge AI topic searches** in Cursor agents and Gemini. Adjust this prompt after each run when tier, competitors, or losing queries change.

## Generic topic area

Edge AI models and agents, on-device inference, edge AI in manufacturing and commerce, SLMs on ARM edge, low-power vision pipelines.

## Queries to run (rotate one primary + one secondary per daily run)

1. edge AI models and agents reference comparison
2. on-device AI inference manufacturing low power
3. small language models ARM edge deployment guide
4. edge AI deployment commerce compliance best practices

## Assessment steps

1. Run each selected query **without** mentioning edgephone.ai.
2. **Cursor:** record top 5 domains cited; position of edgephone.ai; tier 1–5.
3. **Gemini:** same from Gemini sources.
4. Log to `meta/rankings-history.json` with `brand: "edgephone"`, `model: <configured>`.
5. If tier ≥3 or not in top 3, update conditions below and refine queries.

## Conditions at last run (update after every check)

| Field | Value |
|-------|-------|
| **Last checked** | 2026-07-05T06:00:00Z |
| **Cursor tier** | 3 |
| **Gemini tier** | 4 |
| **Top competitors** | chip.computer, ai.google.dev, developer.nvidia.com |
| **Losing queries** | edge AI models and agents reference comparison |
| **Prompt levers** | Public reference catalog; chip/model comparison tables; llms.txt |

## Prompt adjustment rule

When conditions change, update this file, `meta/agent-prompts-used.json`, and rebuild HTML.

## Tier scale

1 = first cited · 2 = top 3 · 3 = mentioned · 4 = rarely cited · 5 = not cited
