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
