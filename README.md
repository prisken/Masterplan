# Master Portfolio Command Center

Local-first command center for portfolio projects and **insurance execution** (PA, MDRT, recruitment).

**Version:** v1.0 local-first · **Data version:** 7

## Setup

```bash
npm install
npm run dev
```

Open http://localhost:5173 (or the URL shown in the terminal).

```bash
npm run build
npm run preview
```

## Where data is stored

All data is saved in your browser **localStorage** under:

`master-portfolio-command-center`

Nothing is sent to a server. No login required.

**Warning:** Clearing browser data for this site will erase your app data.

## Backup and restore

Use **Settings** (`/settings`):

1. **Export JSON backup** — full snapshot (projects, tasks, `advisor` trackers, contacts, etc.)
2. **Import JSON backup** — restore from export
3. **Reset to default** — re-seeds portfolio + Advisor Growth tasks + HKSI + AI prompts

## Pacing date (important)

**Settings → Pacing date** controls what counts as “today” across the app:

- **Live clock** (recommended for daily work) — uses your device date.
- **Fixed pacing date** — simulates a specific day (default **15 May 2026**, `REFERENCE_DATE` in `src/types/index.ts`).

This applies to task timelines (**Today**, **This Week**, **Overdue**, calendar), advisor **warnings / PA–MDRT pace**, contact follow-ups due on the dashboard, and upcoming events. Execution pages show a banner when fixed pacing is active.

## Task → tracker sync (metricKey)

**Advisor** (`/advisor`) includes **PA / MDRT pacing tables** (monthly targets vs your numbers), a **recruitment funnel** chart, and **Master Tasks → Year-end** for a live milestone timeline from tracker data.

**Today** (`/today`) syncs with **Master Tasks**: complete tasks, link Top 3, and use pacing date. **Contacts** uses shared `useEntityCrud`; run `npm test` for unit tests.

Advisor Growth tasks can link to a **metric** (e.g. `pa.distinctInsured`, `mdrt.commission`). When you **complete** the task, the matching field on **/advisor** updates automatically. Milestone tasks use **set** mode; reopening restores the previous value when a snapshot was saved. Edit the link under **Advisor metric link** in the task form.

## App sections

| Section | Path |
|---------|------|
| Execution Dashboard | `/` (tracker numbers + task execution) |
| Advisor / PA·MDRT / Recruitment | `/advisor` |
| Projects | `/projects` |
| Master Tasks | `/tasks` |
| Contacts / CRM | `/contacts` |
| Content Calendar | `/content` |
| Events | `/events` |
| HKSI Study | `/hksi` |
| Finance | `/finance` |
| Digital Assets | `/assets` |
| AI Prompts | `/prompts` |
| Ecosystem Map | `/ecosystem` |
| Today (journal) | `/today` |
| Weekly Review | `/weekly` |
| Monthly Review | `/monthly` |
| Settings | `/settings` |

Deep links:

- Overdue tasks: `/tasks?view=overdue`
- Advisor project tasks: `/tasks?project=advisor-growth-center`

## Default seed data

- 6 projects (5 portfolio + **Advisor Growth Center**)
- ~170 tasks (~124 advisor execution + ~46 portfolio)
- **Advisor trackers** (PA metrics, MDRT production, recruitment funnel) in `advisor` on `AppData`
- 3 HKSI exam trackers (Papers 1, 7, 8)
- 5 AI prompt templates

## Tech stack

- React 19 + TypeScript + Vite
- Tailwind CSS v4
- react-router-dom
- localStorage persistence
