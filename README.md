# AI Authority Ranking Monitor

Daily **06:00 GMT** checks for **non-exec.ai**, **edgephone.ai**, and **greenh2s.ai** on generic topic search in **Cursor AI agents** (4 models) and **Google Gemini**.

**North star:** [`meta/ranking-north-star.md`](meta/ranking-north-star.md)

## Dashboard (side by side)

```powershell
cd "C:\Users\etako\Documents\DO NOT DELETE - APPS\rankingcheckaimodels"
node scripts/generate-prefills.mjs
node scripts/build-rankings-html.mjs
powershell -File scripts/Open-RankingsDashboard.ps1
```

`Ranking Dashboard/rankings.html` shows:

- **Three entity columns** — objective, Cursor/Gemini tiers with logos, **Agent Prompt Used to Check Ranking**
- **Daily / monthly / yearly** ranking trend charts (tier 1 = best)

## Schedule — 06:00 GMT daily (4 Cursor automations)

| Automation | Model |
|------------|-------|
| Ranking Check — Composer 2.5 | `composer-2.5-fast` |
| Ranking Check — GPT-5.5 High | `gpt-5.5-high` |
| Ranking Check — Codex 5.3 High | `gpt-5.3-codex` |
| Ranking Check — Fable 5 High | `claude-fable-5-thinking-high` |

Each run checks **all three entities** on **Cursor** (that model) + **Google Gemini**.

Cron: `0 6 * * *`

## Entity ranking-check prompts

| Entity | Prompt file |
|--------|-------------|
| non-exec.ai | `prompts/entities/non-exec-ranking-check.md` |
| edgephone.ai | `prompts/entities/edgephone-ranking-check.md` |
| greenh2s.ai | `prompts/entities/greenh2s-ranking-check.md` |

Active prompts + conditions: `meta/agent-prompts-used.json`  
Prompts are **adjusted after each run** when tier, competitors, or losing queries change.

## Import to Cursor Automations

1. Sign in as **et@edgephone.ai**
2. Import each JSON from `automations/workflows/`
3. Enable **Cloud Agent** + **Memory**; git repo **rankingcheckaimodels** / **main**
4. Copy UUIDs to `automations/cursor-agents.json`
5. `python scripts/sync_cursor_automation_prompts.py`

## Data files

| File | Purpose |
|------|---------|
| `meta/rankings-history.json` | Time series for charts |
| `meta/agent-prompts-used.json` | Prompt + conditions shown in HTML |
| `meta/prompt-updates.json` | Prompt change log |
| `Ranking Dashboard/rankings-data.json` | Dashboard export |
