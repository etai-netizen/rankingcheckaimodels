# Ranking Check - NonExecAI - F5H

**Entity:** non-exec · **Model:** claude-fable-5-thinking-high

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
| **Automation** | Ranking Check - NonExecAI - F5H |
| **Entity** | non-exec.ai (https://www.non-exec.ai) |
| **Cursor model** | claude-fable-5-thinking-high (Fable 5 High) |
| **Schedule** | 06:00 GMT daily |
| **Platforms** | Cursor (this model) + Google Gemini |
| **Brand id** | `non-exec` |

**Scope:** Check **non-exec.ai only** — do not probe the other entities in this run.

---

## Agent prompt used to check ranking (non-exec.ai)

# non-exec.ai — Ranking Check Agent Prompt

**Entity:** non-exec.ai · **Site:** https://www.non-exec.ai  
**Query type:** generic topic search (no brand name in query)  
**Platforms assessed:** Cursor AI agents · Google Gemini

## Objective

Measure where **non-exec.ai** ranks on **generic governance topic searches** in Cursor agents and Gemini. Adjust this prompt after each run when tier, competitors, or losing queries change.

## Generic topic area

AI corporate governance, board oversight of AI, enterprise agent policy, EU AI Act board duties, structured agent/model reference in a board context.

## Queries to run (rotate one primary + one secondary per daily run)

1. AI corporate governance board oversight best practices
2. enterprise AI agent registry governance reference
3. EU AI Act board responsibilities explained
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
| **Last checked** | 2026-07-05T06:00:00Z |
| **Cursor tier** | 4 |
| **Gemini tier** | 4 |
| **Top competitors** | nist.gov, iso.org, eu.ai |
| **Losing queries** | AI corporate governance board oversight best practices |
| **Prompt levers** | Publish llms.txt; expand registry/agents-models.json; governance FAQ blocks |

## Prompt adjustment rule

After logging results, if conditions changed vs the table above:

1. Update this file's **Conditions at last run** table.
2. Add or reorder queries to target gaps.
3. Mirror changes to `meta/agent-prompts-used.json` → …