# AI Authority Ranking Monitor

Daily **06:00 GMT** checks for **non-exec.ai**, **edgephone.ai**, and **greenh2s.ai** on generic topic search in **Cursor AI agents** (4 models) and **Google Gemini**.

**North star:** [`meta/ranking-north-star.md`](meta/ranking-north-star.md)

## Dashboard (side by side)

**Automatic on Cursor login:** opening this project runs `.cursor/hooks.json` → `sessionStart`, which pulls overnight Cloud Agent commits and rebuilds HTML.

**Automatic when opening the dashboard:** use `Ranking Dashboard/Open Dashboard.cmd` (recommended) — syncs from git, rebuilds HTML, opens `http://127.0.0.1:8787/rankings.html`. The page calls `/api/sync` on load and reloads if new Cursor data arrived.

```powershell
cd "C:\Users\etako\Documents\DO NOT DELETE - APPS\rankingcheckaimodels"
powershell -File scripts/Open-RankingsDashboard.ps1
```

Or double-click **`Ranking Dashboard/Open Dashboard.cmd`**.

If you open `rankings.html` directly (file://), a banner prompts you to use `Open Dashboard.cmd` for a live sync.

`Ranking Dashboard/rankings.html` shows:

- **Three entity columns** — objective, Cursor/Gemini tiers with logos, **Agent Prompt Used to Check Ranking**
- **Daily / monthly / yearly** ranking trend charts (tier 1 = best)

## Schedule — 06:00 GMT daily (9 Cursor automations)

**3 models per entity** (Codex removed — 3 runs each, not 4):

| Entity | C2.5 | G5.5H | F5H |
|--------|------|-------|-----|
| greenh2s.ai | Composer 2.5 | GPT-5.5 High | Fable 5 High |
| edgephone.ai | Composer 2.5 | GPT-5.5 High | Fable 5 High |
| non-exec.ai | Composer 2.5 | GPT-5.5 High | Fable 5 High |

Cursor automation names: `Ranking Check - {Entity} - {suffix}` (e.g. `Ranking Check - NonExecAI - C2.5`)

Sync prompts to Cursor (signed in as **et@edgephone.ai**):

```powershell
node scripts/generate-prefills.mjs
python scripts/sync_cursor_automation_prompts.py
```

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
