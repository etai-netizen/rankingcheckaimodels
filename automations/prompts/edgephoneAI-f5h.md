# Ranking Check - EdgephoneAI - F5H

**Entity:** edgephone · **Model:** claude-fable-5-thinking-high

---

# Daily Ranking Check — Cloud Agent Orchestrator

**Schedule:** 06:00 GMT daily · **Account:** et@edgephone.ai  
**North star:** [`meta/ranking-north-star.md`](meta/ranking-north-star.md)

## Mission

Each run measures **generic topic search rankings** for **non-exec.ai**, **edgephone.ai**, and **greenh2s.ai** in:

1. **Cursor AI agents** (using the configured Cursor model for this automation)
2. **Google Gemini**

Then **adjust entity ranking-check prompts** when conditions changed since the last run, and **rebuild the HTML dashboard** with graphs.

---

## Run steps (mandatory order)

### 1. Load entity prompts

Read each entity's ranking-check prompt:

| Entity | File |
|--------|------|
| non-exec.ai | `prompts/entities/non-exec-ranking-check.md` |
| edgephone.ai | `prompts/entities/edgephone-ranking-check.md` |
| greenh2s.ai | `prompts/entities/greenh2s-ranking-check.md` |

Also read `meta/agent-prompts-used.json` for **conditions at last prompt**.

### 2. Run checks — all three entities

For **each entity**, execute its ranking-check prompt:

- Run **generic topic queries** (no brand names) from the entity prompt
- Assess **Cursor** (as the configured model would cite sources)
- Assess **Google Gemini** (answer + source list)
- Append every result to `meta/rankings-history.json`:

```json
{
  "runId": "ISO-8601",
  "date": "YYYY-MM-DD",
  "slot": "daily-check",
  "model": "<this-automation-model>",
  "brand": "<non-exec|edgephone|greenh2s>",
  "platform": "<cursor|gemini>",
  "queryType": "generic-topic",
  "query": "...",
  "tier": 3,
  "inTop3": false,
  "topCompetitors": ["..."],
  "gapNotes": "..."
}
```

Update `latestByBrand` and `dailySnapshots` in the same file.

### 3. Adjust entity prompts when conditions changed

For each entity, compare new tiers/competitors/losing queries to `meta/agent-prompts-used.json` → `conditionsAtLastPrompt`.

If **any** of these changed: cursor tier, gemini tier, top 3 competitors, or primary losing query:

1. Update the entity's `prompts/entities/*-ranking-check.md` — especially **Conditions at last run** table
2. Update `meta/agent-prompts-used.json` with new conditions and `lastPromptUpdate`
3. Append to `meta/prompt-updates.json`

### 4. Rebuild dashboard

```bash
node scripts/sync-brand-assets.mjs
node scripts/build-rankings-html.mjs
```

### 5. Log and commit

Append run summary to `meta/run-log.md`. Commit this repo.

---

## Models (four daily automations at 06:00 GMT)

| Automation | Model slug |
|------------|------------|
| Ranking Check — Composer 2.5 | `composer-2.5-fast` |
| Ranking Check — GPT-5.5 High | `gpt-5.5-high` |
| Ranking Check — Codex 5.3 High | `gpt-5.3-codex` |
| Ranking Check — Fable 5 High | `claude-fable-5-thinking-high` |

Each automation runs **all three entities** + **Gemini** using its configured model for the Cursor assessment.

---

## HTML outputs (side by side per entity)

The dashboard shows for each entity:

- Logo + objective
- **Agent Prompt Used to Check Ranking** (from `meta/agent-prompts-used.json`)
- Current tiers with **Cursor** and **Gemini** logos
- Ranking trend graphs: **daily** (top), **monthly**, **yearly**

---

## Tier scale

1 = first cited · 2 = top 3 · 3 = mentioned · 4 = rarely cited · 5 = not cited


---

## This automation (single entity — replaces placeholder)

| Field | Value |
|-------|-------|
| **Automation** | Ranking Check - EdgephoneAI - F5H |
| **Entity** | edgephone.ai (https://edgephone.ai) |
| **Cursor model** | claude-fable-5-thinking-high (Fable 5 High) |
| **Schedule** | 06:00 GMT daily |
| **Platforms** | Cursor (this model) + Google Gemini |
| **Brand id** | `edgephone` |

**Scope:** Check **edgephone.ai only** — do not probe the other entities in this run.

---

## Agent prompt used to check ranking (edgephone.ai)

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


---

## Model directive

- **Configured model:** claude-fable-5-thinking-high
- **Listed strength:** Long-form ranking reports and entity prompt tuning
- Use this mod…