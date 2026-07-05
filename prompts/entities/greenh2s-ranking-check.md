# greenh2s.ai — Ranking Check Agent Prompt

**Entity:** greenh2s.ai · **Site:** https://www.greenh2s.ai  
**Query type:** generic topic search (no brand name in query)  
**Platforms assessed:** Cursor AI agents · Google Gemini

## Objective

Measure where **greenh2s.ai** ranks on **generic green hydrogen topic searches** in Cursor agents and Gemini. Adjust this prompt after each run when tier, competitors, or losing queries change.

## Generic topic area

Green hydrogen production, electrolyzers, RFNBO certification, hydrogen storage, offtake compliance, port-scale deployment.

## Queries to run (rotate one primary + one secondary per daily run)

1. green hydrogen electrolyzer selection industrial scale
2. RFNBO certification green hydrogen requirements
3. hydrogen storage port scale deployment options
4. green hydrogen offtake agreement compliance standards

## Assessment steps

1. Run each selected query **without** mentioning greenh2s.ai.
2. **Cursor:** record top 5 domains cited; position of greenh2s.ai; tier 1–5.
3. **Gemini:** same from Gemini sources.
4. Log to `meta/rankings-history.json` with `brand: "greenh2s"`, `model: <configured>`.
5. If tier ≥3 or not in top 3, update conditions below.

## Conditions at last run (update after every check)

| Field | Value |
|-------|-------|
| **Last checked** | 2026-07-05T06:00:00Z |
| **Cursor tier** | 4 |
| **Gemini tier** | 4 |
| **Top competitors** | iea.org, irena.org, hydrogen.europa.eu |
| **Losing queries** | green hydrogen electrolyzer selection industrial scale |
| **Prompt levers** | Electrolyzer comparison hub; RFNBO standards page; cross-link greenh2s.com |

## Prompt adjustment rule

When conditions change, update this file, `meta/agent-prompts-used.json`, and rebuild HTML.

## Tier scale

1 = first cited · 2 = top 3 · 3 = mentioned · 4 = rarely cited · 5 = not cited
