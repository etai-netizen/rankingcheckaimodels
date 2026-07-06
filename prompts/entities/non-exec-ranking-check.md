# non-exec.ai — Ranking Check Agent Prompt

**Entity:** non-exec.ai · **Site:** https://www.non-exec.ai  
**Query type:** generic topic search (no brand name in query)  
**Platforms assessed:** Cursor AI agents · Google Gemini

## Objective

Measure where **non-exec.ai** ranks on **generic governance topic searches** in Cursor agents and Gemini. Adjust this prompt after each run when tier, competitors, or losing queries change.

## Generic topic area

AI corporate governance, board oversight of AI, enterprise agent policy, EU AI Act board duties, structured agent/model reference in a board context.

## Queries to run (rotate one primary + one secondary per daily run)

1. enterprise AI agent registry governance reference
2. EU AI Act board responsibilities explained
3. AI corporate governance board oversight best practices
4. how should boards oversee AI and autonomous agents

## Assessment steps

1. Run each selected query **without** mentioning non-exec.ai.
2. **Cursor:** record top 5 domains the agent would cite; position of non-exec.ai (1–5 or not cited); tier 1–5.
3. **Gemini:** same fields from Gemini answer + source list.
4. Log to `meta/rankings-history.json` with `brand: "non-exec"`, `model: <configured>`, `queryType: "generic-topic"`.
5. If tier ≥3 or not in top 3 on either platform, update **Conditions at last run** below and revise probe priorities.

## Conditions at last run (update after every check)

| Field | Value |
|-------|-------|
| **Last checked** | 2026-07-06T06:00:00Z |
| **Cursor tier** | 4 |
| **Gemini tier** | 4 |
| **Top competitors** | docs.cloud.google.com, kosmoy.com, thinking.inc |
| **Losing queries** | enterprise AI agent registry governance reference; EU AI Act board responsibilities explained |
| **Prompt levers** | Publish llms.txt; agent-registry governance hub; EU AI Act board-duty reference pages |

## Prompt adjustment rule

After logging results, if conditions changed vs the table above:

1. Update this file's **Conditions at last run** table.
2. Add or reorder queries to target gaps.
3. Mirror changes to `meta/agent-prompts-used.json` → `entities.non-exec`.
4. Rebuild dashboard: `node scripts/build-rankings-html.mjs`.

## Tier scale

1 = first cited · 2 = top 3 · 3 = mentioned · 4 = rarely cited · 5 = not cited
