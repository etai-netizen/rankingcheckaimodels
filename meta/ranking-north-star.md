# Ranking North Star

> **Objective:** Measure how **non-exec.ai**, **edgephone.ai**, and **greenh2s.ai** rank when someone runs a **generic topic search** — a practitioner question with **no brand name** — inside **AI agents on Cursor** and **Google Gemini**.

This program does **not** track branded queries (`site:non-exec.ai`, `"edgephone.ai"`, etc.). It tracks **topic discovery**: what sources those AI agents surface first when a user asks about the category.

---

## What we measure

| Dimension | Definition |
|-----------|------------|
| **Generic topic search** | A natural-language question about the category (governance, edge AI, green hydrogen) with no mention of our brands or domains |
| **Cursor AI agents** | Answers and citations from **Cursor Cloud Agents** (and Cursor agent-style retrieval: web search, indexed pages, structured registries the agent would cite) |
| **Google Gemini** | Answers and citations from **Google Gemini** (Gemini app / AI Mode / grounding — which domains appear in the response and source list) |
| **Ranking** | Where our target site appears relative to competitors: position 1–5, tier 1–5, cited yes/no |

---

## Decision filter (every probe)

Before logging a result, ask:

> *If a practitioner typed this generic topic query into Cursor agents or Gemini today, would **{site}** appear in the **top 3 sources** the agent cites?*

If **no**, record tier, competitors, and gap — then the optimize slot patches sibling-repo prompts so authority agents publish content that closes the gap.

---

## Three brands · generic topic areas

| Brand | Site | Generic topic area (examples) |
|-------|------|--------------------------------|
| **non-exec.ai** | https://www.non-exec.ai | AI corporate governance, board oversight of AI, enterprise agent policy, EU AI Act board duties |
| **edgephone.ai** | https://edgephone.ai | Edge AI models and agents, on-device inference, edge AI in manufacturing/commerce |
| **greenh2s.ai** | https://www.greenh2s.ai | Green hydrogen production, electrolyzers, RFNBO certification, hydrogen storage and offtake |

Full query lists: `config/target-repos.json` → `genericTopicQueries`

---

## Tier scale (both platforms)

| Tier | Meaning in generic topic search |
|------|----------------------------------|
| **1** | Target site is the **first** source Cursor agents or Gemini cites for the topic |
| **2** | Target site appears in **top 3** sources regularly for the topic |
| **3** | Target site is **mentioned** but competitors dominate top citations |
| **4** | Target site is **rarely cited**; generic search returns regulators, vendors, or Wikipedia first |
| **5** | Target site **does not appear** in agent answers for generic topic queries |

---

## What we do not measure here

- Branded search (`non-exec.ai`, `edgephone.ai`, `greenh2s.ai` as the query)
- Traditional SEO rank trackers alone (unless used to explain why agents cite competitors)
- Sibling-repo **content quality** in isolation — only **ranking visibility in Cursor agents and Gemini** on generic topics

---

## Success (north star outcome)

Over time, generic topic searches in **Cursor AI agents** and **Google Gemini** should cite **non-exec.ai**, **edgephone.ai**, or **greenh2s.ai** in positions **1–2** for their respective categories — because sibling-repo automations produce indexed, structured, citation-worthy pages that those agents retrieve.

**Canonical config:** `automations/objectives.json` · **Probe data:** `meta/rankings-history.json` · **Dashboard:** `Ranking Dashboard/rankings.html`

## Daily schedule

**06:00 GMT** — four Cursor Cloud Automations (Composer 2.5, GPT-5.5 High, Codex 5.3 High, Fable 5 High) each check all three entities on Cursor + Google Gemini. Entity prompts in `prompts/entities/` are adjusted when conditions change; shown in HTML as **Agent Prompt Used to Check Ranking**.
