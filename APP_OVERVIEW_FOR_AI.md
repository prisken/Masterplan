# App Overview

This document describes the **Master Portfolio Command Center** codebase so another assistant can orient quickly. Facts below are drawn from the repository as of the last inspection; if something is not evident in code, it is marked **unclear from code**.

---

## 1. What this app is

**Purpose (plain English):** A **local-first browser app** that acts as a personal “command center” for multiple portfolio projects (revenue, authority, community, credibility, impact) plus **insurance-advisor execution** tracking (PA, MDRT, recruitment). It combines:

- **Projects** and **master tasks** (deadlines, priorities, status, optional metric links to advisor numbers).
- **CRM-style contacts**, **content pipeline**, **events**, **finance ledger**, **HKSI study** artifacts, **digital assets**, and **AI prompt** library.
- **Daily / weekly / monthly** planning and review surfaces that increasingly tie to **linked tasks** and derived summaries.

**Main user workflow:** Configure pacing date → work from **Dashboard** and **Today** → maintain **Master Tasks** and entity pages (contacts, content, etc.) → log **DailyEntry** with optional linked tasks and notes → **Weekly** / **Monthly** reviews (reflection + scoreboard + task activity + next-period focus lists).

**Problem solved:** Single place to see execution health, advisor targets vs actuals, task urgency, and review cadence **without a backend**—everything persists in `localStorage`.

---

## 2. Tech stack

| Area | Choice |
|------|--------|
| **Framework** | React 19 |
| **Language** | TypeScript (~5.8) |
| **Build tool** | Vite 6 |
| **Styling** | Tailwind CSS v4 via `@tailwindcss/vite`; design tokens in `src/index.css` (`@theme`: category colors, surface, border) |
| **Routing** | `react-router-dom` v7 (`BrowserRouter`, `Routes`, `Route`) |
| **State management** | React **Context** + `useState` / `useMemo` / `useCallback`; **no** Redux/Zustand. Global app state: `AppDataProvider` + `useAppData()`. |
| **Persistence** | `localStorage` JSON under key `master-portfolio-command-center` (`STORAGE_KEY` in `src/types/index.ts`) |
| **Tests** | Vitest |
| **Deployment (documented)** | Vercel: `vercel.json` sets `buildCommand`, `outputDirectory: dist`, SPA rewrites to `/index.html` (see repo `README.md`) |

**Important dependencies:** `react`, `react-dom`, `react-router-dom`, `vite`, `@vitejs/plugin-react`, `tailwindcss`, `@tailwindcss/vite`, `typescript`, `vitest`.

---

## 3. Folder structure

| Path | Role |
|------|------|
| `src/App.tsx` | Providers, router, route table |
| `src/main.tsx` | React root, imports `index.css` |
| `src/index.css` | Tailwind v4 entry + `@theme` tokens |
| `src/types/index.ts` | **Single primary type hub**: entities, `AppData`, constants (`DATA_VERSION`, `STORAGE_KEY`, defaults like `DEFAULT_WEEKLY_SCOREBOARD`) |
| `src/context/` | `AppDataContext.tsx` (load/save loop), `ToastContext.tsx` |
| `src/services/` | `storage.ts` (load/normalize/save/import/export/reset), `dataMigrations.ts` (daily/weekly/monthly/task merges) |
| `src/data/` | `seedData.ts` (`createDefaultData`), `advisorGrowthTasks.ts`, `defaultPrompts.ts` |
| `src/pages/` | One file per major route / screen |
| `src/components/layout/` | `Layout`, `Sidebar`, `MobileNav`, `Header`, `PacingDateBanner` |
| `src/components/ui/` | Shared primitives: `Card`, `Button`-style classes, `FormField`, `ModalForm`, `ConfirmDialog`, `FilterBar`, etc. |
| `src/components/tasks/` | Task list, form, calendar, milestones |
| `src/components/today/` | Daily cockpit: `LinkedTasksSection`, `LinkedTaskCard`, `TaskPickerModal`, `TaskWorkLogEditor`, `TodayTasksPanel` |
| `src/components/reviews/` | `ReviewFlowBanner`, `ReviewCompletenessIndicator`, `ScoreboardFields` |
| `src/components/advisor/` | PA / MDRT / recruitment panels and tables |
| `src/components/dashboard/` | Dashboard widgets |
| `src/components/*/` | Feature-scoped form field components (contacts, content, events, finance, assets, prompts, projects) |
| `src/utils/` | Dates, tasks, metrics, dashboard stats, review helpers, IDs, `cn()` |
| `src/hooks/` | `useEntityCrud`, `usePacingDate`, `useDebouncedAdvisor` |
| `src/constants/` | Options lists, advisor targets, HKSI options, task modules |
| `src/config/navigation.ts` | Sidebar nav items (paths, labels) |
| `vercel.json` | Production build + SPA fallback |

---

## 4. Routing / pages

All routes live in `src/App.tsx`. Unknown paths redirect to `/`.

| File | Path | Purpose | Key components | Data read | Data written | Notable actions |
|------|------|---------|----------------|------------|--------------|-----------------|
| `Dashboard.tsx` | `/` | Execution overview: advisor warnings, goals strip, task stats, portfolio strip, daily priority | `WarningBanners`, `ExecutionGoalsStrip`, `ExecutionStatGrid`, `PortfolioOverviewStrip`, `DailyPriorityPanel`, `PacingDateBanner` | Full `AppData` (read-only) | None | Links to advisor / tasks |
| `ProjectsPage.tsx` | `/projects` | CRUD projects | `ProjectFormFields`, modals, `PageActions` | `projects` | `projects` | Add/edit/delete projects |
| `ProjectDetailPage.tsx` | `/projects/:id` | Read-only project hub: task counts, linked contacts | `ProgressBar`, `Badge` | `projects`, `tasks`, `contacts` for that `id` | None | Navigate back to list |
| `TasksPage.tsx` | `/tasks` | Master task list, filters, views, calendar, year-end | `TaskListItem`, `TaskFormFields`, `CalendarMonthView`, `FilterBar`, `ModalForm` | `tasks`, `projects`, `settings` (pacing), `advisor` (metrics) | `tasks` | Create/edit/delete/duplicate tasks; metric apply on save/complete (`taskMetrics.ts`) |
| `AdvisorPage.tsx` | `/advisor`, `/pa`, `/mdrt` | PA, MDRT, recruitment trackers (same page; `/pa` `/mdrt` scroll to section) | `PaTrackerPanel`, `MdrtTrackerPanel`, `RecruitmentTrackerPanel`, `WarningBanners` | `advisor`, tasks (warnings) | `advisor` (debounced) | Edit counters, recruitment funnel |
| `ContactsPage.tsx` | `/contacts` | Contact CRM | `ContactFormFields`, `useEntityCrud` | `contacts` | `contacts` | CRUD contacts |
| `ContentPage.tsx` | `/content` | Content pipeline | `ContentFormFields` | `content`, `projects` | `content` | CRUD content items |
| `EventsPage.tsx` | `/events` | Events | `EventFormFields` | `events`, `projects` | `events` | CRUD events |
| `FinancePage.tsx` | `/finance` | Finance ledger | `FinanceFormFields` | `finance`, `projects` | `finance` | CRUD finance rows |
| `HksiPage.tsx` | `/hksi` | HKSI exams, study logs, wrong-answer bank | (page-local forms + tabs) | `hksiExams`, `studyLogs`, `wrongAnswers` | Same arrays | Merge/save exams; CRUD logs/wrong answers |
| `AssetsPage.tsx` | `/assets` | Digital assets | `AssetFormFields` | `digitalAssets`, `projects` | `digitalAssets` | CRUD assets |
| `PromptsPage.tsx` | `/prompts` | AI prompts library | `PromptFormFields` | `aiPrompts`, `projects` | `aiPrompts` | CRUD prompts |
| `EcosystemPage.tsx` | `/ecosystem` | Static narrative map of engines/projects | `Card` | None | None | Informational only |
| `TodayPage.tsx` | `/today` | Daily cockpit: linked tasks, work log, journal groups, close day, carry to tomorrow | `LinkedTasksSection`, `LinkedTaskCard`, `TaskPickerModal`, `TodayTasksPanel`, `ReviewFlowBanner`, `ReviewCompletenessIndicator` | `dailyEntries`, `tasks`, `projects`, `settings` | `dailyEntries`, `tasks` (status/notes/deadline via actions) | Pick date, link tasks, daily vs permanent notes, save day, close day, carry forward |
| `WeeklyReviewPage.tsx` | `/weekly` | Weekly reflection + scoreboard + task activity + next week focus IDs | `ScoreboardFields`, `TaskPickerModal`, `ReviewFlowBanner` | `weeklyReviews`, `dailyEntries`, `tasks` | `weeklyReviews` | Pull from daily, save, focus task list |
| `MonthlyReviewPage.tsx` | `/monthly` | Monthly reflection + monthly task/project summary + next month focus | `TaskPickerModal`, `ReviewFlowBanner` | `monthlyReviews`, `dailyEntries`, `weeklyReviews`, `tasks` | `monthlyReviews` | Pull summaries, pull weekly excerpts, plan next month tasks |
| `SettingsPage.tsx` | `/settings` | Pacing clock, export/import JSON, reset | `PacingSettingsCard`, `ConfirmDialog` | Full `AppData` | `settings`, full replace on import/reset | Backup/restore/reset |

---

## 5. Data model

Primary definitions: **`src/types/index.ts`**. Optional fields are marked **`?`** in TypeScript.

### `AppData`

Root persisted object.

| Field | Purpose |
|-------|---------|
| `version` | Numeric schema marker; **`DATA_VERSION` is 11** (bumped when shape evolves). Saved again on every load via `normalizeData`. |
| `settings` | `AppSettings` |
| `projects`, `tasks`, `contacts`, `content`, `events`, `finance`, `hksiExams`, `studyLogs`, `wrongAnswers`, `dailyEntries`, `weeklyReviews`, `monthlyReviews`, `digitalAssets`, `aiPrompts` | Arrays (or exam merge logic for HKSI) |
| `advisor` | `AdvisorExecutionState` |

Relationships: Tasks and most entities reference **`projectId`**. Reviews are **not** nested under projects; they are global lists keyed by date/month/week id.

### `Task`

| Field | Purpose | Optional? |
|-------|---------|-----------|
| `id`, `title` | Identity and display name | `title` primary; `taskName?` deprecated |
| `projectId`, `module`, `area` | Project + grouping (`TaskArea` includes Website, Sales, Insurance, Recruitment, etc.) | — |
| `priority` | `P0`–`P3` | — |
| `status` | `TaskStatus` | — |
| `deadline` | ISO date string (may be empty) | — |
| `owner`, `dependency`, `successMetric` | Planning metadata | — |
| `progressPercentage` | 0–100 | — |
| `timeNeeded`, `energyLevel`, `impact` | Planning | — |
| `track` | Advisor widget grouping (`pa`, `mdrt`, `recruitment`, …) | `''` allowed |
| `metricKey`, `metricMode`, `metricValue`, `metricSnapshot?` | Completing task can update advisor metrics | `metricSnapshot` optional |
| `today`, `thisWeek` | Flags used by Tasks “today/week” views and suggestions | — |
| `notes` | **Permanent** task notes | — |
| `createdAt`, `updatedAt`, `completedAt` | Timestamps; completion date used in range helpers | `completedAt` may be empty until done |

Relationships: **`projectId` → Project**; optional **metricKey → advisor fields** via `taskMetrics.ts`.

### `DailyEntry`

One row per calendar **`date`** (typically `YYYY-MM-DD`).

| Field | Purpose | Optional in type |
|-------|---------|-------------------|
| `id`, `date` | Keys | — |
| `linkedTaskIds` | Master task IDs planned for that day | — (always array; may be empty) |
| `dailyWorkLogNote?` | Whole-day journal / work log (not per-task) | Yes |
| `dailyTaskNotes?` | Array of `DailyTaskNote` — **day-scoped** work log per task | Yes |
| `dailyTaskIntent?` | Array of `DailyTaskIntent` (`aim_today` / `optional` / `blocked` / `carry_forward`) | Yes |
| `todayTop3Tasks` … `firstTaskTomorrow` | Legacy / structured journal strings (top 3 can sync from linked tasks on save) | Text fields required strings (may be `''`) |

**`DailyTaskNote`:** `taskId` plus optional `note`, `progressNote`, `whatDidToday`, `outcome`, `blocker`, `nextStep`, `timeSpentMinutes`.

**`DailyTaskIntent`:** `taskId` + `intent`.

Relationships: **`linkedTaskIds` → Task**; notes/intents keyed by **`taskId`**.

### `WeeklyReview`

| Field | Purpose |
|-------|---------|
| `id`, `weekStartDate` | Identity; week anchor (Monday ISO string expected in UI) |
| `whatWorked` … `top5ActionsNextWeek` | Reflection strings |
| `scoreboard` | `WeeklyScoreboard` (numeric targets vs actuals) |
| `nextWeekTaskIds?`, `weeklyTaskNotes?` | Planning links to `Task` ids + per-task weekly notes |

### `MonthlyReview`

| Field | Purpose |
|-------|---------|
| `id`, `month` | `YYYY-MM` |
| `biggestWins` … `nextMonthTop10Actions` | Reflection + planning text |
| `nextMonthTaskIds?`, `monthlyTaskNotes?` | Next-month focus task ids + notes |

### `WeeklyScoreboard`

Fixed set of numeric **target/actual** pairs (leads, calls, proposals, clients, videos, followers, HKSI hours, practice questions, sponsors, volunteers, parent contacts). All required numbers in the interface.

### Advisor / PA / MDRT / recruitment

- **`AdvisorExecutionState`:** `{ pa, mdrt, recruitment }`.
- **`PaTrackerData`:** counts + `productCategories` booleans.
- **`MdrtTrackerData`:** `primaryRoute` (`commission` \| `fyp` \| `income`) + current numeric totals.
- **`RecruitmentTrackerData`:** `candidates[]` (`RecruitmentCandidate`: id, name, `RecruitmentStage`, notes, `updatedAt`), plus `agentsOnboarded` / `agentsTarget`.

### Client / content / events / finance / HKSI / assets / prompts

All are first-class interfaces in `types/index.ts`:

- **`Contact`** — pipeline fields, `relatedProjectId`, follow-up dates.
- **`ContentItem`** — platform, pillar, status, metrics (views, likes, …), `projectId`.
- **`Event`** — type, date, attendance, budget, checklist string, `projectId`.
- **`FinanceItem`** — type/category/amount/date/paid, `projectId`.
- **`HksiExam`**, **`StudyLog`**, **`WrongAnswer`** — study tracking.
- **`DigitalAsset`**, **`AiPrompt`** — asset and prompt libraries tied to `projectId`.

### `AppSettings`

| Field | Purpose |
|-------|---------|
| `useLiveClock` | If true, “today” for pacing is device clock |
| `pacingDate` | If false, fixed ISO date (defaults to `REFERENCE_DATE` in types) |

---

## 6. State management and persistence

**Where data lives:** In memory inside `AppDataProvider`; on disk as **one JSON blob** in **`localStorage`** (`STORAGE_KEY`).

**`useAppData()`** (`src/context/AppDataContext.tsx`):

- On mount: `setData(loadData())`.
- Exposes `{ data, isReady, updateData, replaceData }`.
- Registers `setPacingDateResolver` so `getReferenceDate()` / task “overdue” logic follow settings.

**`updateData(updater)`:** Functional update on previous `AppData`, then **`saveData(next)`** writes to `localStorage`, then `setState`.

**`replaceData(next)`:** Used after import/reset—writes then replaces state.

**`loadData()` / `saveData()`** (`src/services/storage.ts`):

- **Load:** If missing/invalid/corrupt → `createDefaultData()` + save. Else `JSON.parse` → **`normalizeData(parsed)`** → always **`saveData`** again (migrations applied eagerly).
- **Save:** `localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...data, version: DATA_VERSION }))`.

**Initial / default data:** `createDefaultData()` in `src/data/seedData.ts` — seeds projects (including advisor growth project), advisor growth tasks (migrated), default HKSI exams, default AI prompts, empty collections for user data.

**Import / export / reset:**

- `exportDataJson`, `importDataJson`, `resetToDefault` in `storage.ts`.
- **Settings UI** wires export file download, file import → `replaceData`, reset → `replaceData(resetToDefault())`.

**Migrations / compatibility:**

- **`normalizeData`** merges advisor project, merges/strips tasks via `mergeAdvisorTasks`, merges HKSI exams with seed papers, fills **`advisor`** defaults, applies **`migrateDailyEntries`**, **`migrateWeeklyReview`**, **`migrateMonthlyReview`** on arrays.
- **`DATA_VERSION`** in types; persisted object always saved with current version.
- Adding fields: prefer **optional** properties + **migrator defaults** in `dataMigrations.ts` / `normalizeData` so old JSON loads cleanly.

---

## 7. Task system

**Storage:** `AppData.tasks` — flat array of `Task`.

**Statuses (`TaskStatus`):** `Not Started`, `In Progress`, `Waiting`, `Completed`, `Overdue`, `Deferred`. **`getEffectiveTaskStatus`** (`taskStatus.ts`) can surface **Overdue** from deadline vs reference date even if DB status not updated.

**Priorities:** `P0`–`P3` with `TASK_PRIORITY_LABELS`.

**Due dates:** `deadline` string (ISO `YYYY-MM-DD` expected); helpers in `taskDeadline.ts` (`isOverdueTask`, `isThisWeek`, etc.) use **`getReferenceDate()`** / pacing.

**Categories / modules / projects:**

- **Project** is the top bucket (`projectId` on task).
- **`module`** is a free string (UI/constants in `constants/taskModules.ts`, `ADVISOR_MODULES`).
- **`area`** is `TaskArea` (includes Insurance, Recruitment, …).
- **`track`** links a task to advisor dashboard groupings and optional metrics.

**Create / edit / delete:** **`TasksPage`** — modal form, `updateData` to replace or append `tasks`. Completion may run **`applyTaskUpdateWithMetrics` / `saveTaskWithMetrics`** (`taskMetrics.ts`) to bump advisor numbers when `metricKey` is set.

**TodayPage connection:**

- **`linkedTaskIds`** on `DailyEntry` reference master task ids.
- UI: **`LinkedTasksSection`**, **`LinkedTaskCard`**, **`TaskPickerModal`**, **`TaskWorkLogEditor`** — update entry slices and optionally patch **`tasks`** (e.g. status, permanent notes with confirm when appending).
- **`todayTasksSync.ts`**: `getMasterTasksForDay`, `formatTop3Text` — suggests tasks (deadline, `today` flag, linked ids) and formats top-3 text for save.

**Completion date / history:** **`completedAt`** on `Task` is set when marking complete (**unclear from code** whether every code path sets it—worth checking when completing from Today vs Tasks). There is **no** separate immutable event log of status changes beyond daily entries and task fields.

---

## 8. Today / Weekly / Monthly review system

### TodayPage (`/today`)

- **Purpose:** Daily **work cockpit**: link tasks, intents, per-day work log, optional journal fields, end-of-day closeout, carry unfinished to tomorrow.
- **Data read:** `dailyEntries`, `tasks`, `projects`, `settings`.
- **Data written:** **`dailyEntries`** (upsert for selected date); **`tasks`** when user updates task fields from linked cards / close day.
- **Important fields:** `linkedTaskIds`, `dailyTaskNotes`, `dailyTaskIntent`, `dailyWorkLogNote`, EOD strings, `firstTaskTomorrow`.
- **Links to other reviews:** Indirect—weekly/monthly **derive** summaries from `dailyEntries` (and weekly lists can seed monthly).

### WeeklyReviewPage (`/weekly`)

- **Purpose:** Reflect on week, fill **scoreboard**, see **weekly task activity** built from dailies, pick **`nextWeekTaskIds`** + `weeklyTaskNotes`.
- **Data read:** `weeklyReviews`, `dailyEntries`, `tasks`.
- **Data written:** `weeklyReviews`.
- **Task connection:** **`buildWeeklyActivityRows`** etc. in `reviewWorkHelpers.ts`; “Pull from daily” appends structured text into `whatWorked`.

### MonthlyReviewPage (`/monthly`)

- **Purpose:** Month-level narrative + **monthly task & project summary** from dailies + **next month focus** task ids/notes; optional pull of weekly review text for the month and imports from latest weekly focus list.
- **Data read:** `monthlyReviews`, `dailyEntries`, `weeklyReviews`, `tasks`.
- **Data written:** `monthlyReviews`.

**Cross-links:** Weekly **does not** auto-read `nextWeekTaskIds` into the next week’s daily entries (**unclear from code** if any automation exists—likely manual). Monthly can **import** weekly `nextWeekTaskIds` into `nextMonthTaskIds` via UI.

---

## 9. Business / portfolio modules

| Module | Related files | Data types | Function | Task / review links |
|--------|---------------|------------|----------|---------------------|
| **Dashboard / command center** | `Dashboard.tsx`, `components/dashboard/*`, `utils/dashboardStats.ts`, `taskStats.ts`, `dailyPriority.ts`, `advisorWarnings.ts` | Reads many slices | Warnings, execution stats, portfolio overview, daily priority grouping | Tasks drive stats; links to advisor/tasks |
| **PA tracker** | `PaTrackerPanel.tsx`, `PaPacingTable.tsx`, `utils/paTracker.ts`, `paPacingTable.ts` | `PaTrackerData` | Progress vs pacing | Tasks with `track`/`metricKey` for PA can update counts |
| **MDRT tracker** | `MdrtTrackerPanel.tsx`, `MdrtPacingTable.tsx`, `utils/mdrtTracker.ts`, `mdrtPacingTable.ts` | `MdrtTrackerData`, `MdrtRoute` | Commission/FYP/income pacing | Metric-linked tasks |
| **Recruitment** | `RecruitmentTrackerPanel.tsx`, `RecruitmentFunnelChart.tsx`, `utils/recruitmentTracker.ts` | `RecruitmentTrackerData`, `RecruitmentCandidate` | Pipeline + onboarded count | Tasks / metrics |
| **Insurance (execution)** | No separate route; README frames app | Advisor page + tasks (`area` / `track`) | Operational insurance work | Same as above |
| **HKSI** | `HksiPage.tsx`, `constants/hksiOptions.ts` | `HksiExam`, `StudyLog`, `WrongAnswer` | Exams 1–9 merge, logs, wrong answers | Weekly scoreboard has HKSI hours fields; tasks can reference study |
| **Content** | `ContentPage.tsx`, `ContentFormFields.tsx` | `ContentItem` | Pipeline + performance fields | Projects; monthly text fields may mention content |
| **Investments / authority** | Projects like “Investment News Channel”, content, finance | `ContentItem`, `FinanceItem` | No dedicated “investments” route | Tasks per project |
| **Events** | `EventsPage.tsx` | `Event` | Event CRM | Tasks, finance |
| **Relationships** | `ContactsPage.tsx` | `Contact` | CRM stages | Monthly “most valuable relationship” field |
| **Scoreboard** | `ScoreboardFields.tsx`, `WeeklyReview.scoreboard` | `WeeklyScoreboard` | Weekly numeric tracking | Manual entry on weekly page |

---

## 10. Components

**Layout:** `Layout` (sidebar + mobile drawer), `Sidebar` / `MobileNav` (from `config/navigation.ts`), `Header`, `PacingDateBanner`.

**UI:** `Card`, `Badge`, `StatCard`, `ProgressBar`, `FormField` (+ `inputClass` / `textareaClass`), `PageActions`, `EmptyState`, `FilterBar` / `FilterSearch` / `FilterSelect` / `ViewTabs`, `ModalForm` / `ModalFooter`, `ConfirmDialog`.

**Tasks:** `TaskListItem`, `TaskFormFields`, `TaskProgressWidgets`, `CalendarMonthView`, `YearEndMilestonesView`.

**Today / linked tasks:** `LinkedTasksSection`, `LinkedTaskCard`, `TaskPickerModal`, `TaskWorkLogEditor`, `TodayTasksPanel`.

**Reviews:** `ReviewFlowBanner`, `ReviewCompletenessIndicator`, `ScoreboardFields`.

**Advisor:** `PaTrackerPanel`, `MdrtTrackerPanel`, `RecruitmentTrackerPanel`, pacing tables/charts.

**Forms:** `*FormFields` under `components/{contacts,content,events,finance,assets,prompts,projects}/`.

---

## 11. Utilities and hooks

| File / hook | Role |
|-------------|------|
| **`useAppData`** | Access/update/replace global `AppData`. |
| **`useEntityCrud`** | Generic upsert/remove for keys of `AppData` that are `{id}[]`. |
| **`usePacingDate`** | Human-readable description + ISO from settings. |
| **`useDebouncedAdvisor`** | Local draft of `advisor`; debounced `updateData` + toast. |
| **`dateHelpers.ts`** | `getMondayOfWeek`, `formatWeekLabel`, `formatMonthLabel`. |
| **`referenceDate.ts`** | Pacing resolver, `getReferenceDate`, `getPacingDateIso`. |
| **`id.ts`** | `generateId` prefixes. |
| **`taskDeadline.ts`** | Parse dates, overdue/today/week/month helpers. |
| **`taskStatus.ts`** | Normalize legacy statuses, effective status, completed checks, progress sync. |
| **`taskTitle.ts`** | `getTaskTitle` (title vs deprecated `taskName`). |
| **`taskSort.ts`**, **`taskStats.ts`** | Ordering and dashboard execution stats. |
| **`taskMetrics.ts`** | Metric apply/revert when completing tasks with `metricKey`. |
| **`taskMigrate.ts`** | Per-task shape migration. |
| **`todayTasksSync.ts`** | Tasks-for-day suggestions, top-3 formatting. |
| **`reviewWorkHelpers.ts`** | Task pickers filters, daily note upserts, weekly/monthly aggregates, carry-forward helpers, `weekOverlapsMonth`, etc. |
| **`dashboardStats.ts`**, **`executionGoalsSummary.ts`**, **`advisorWarnings.ts`**, **`financeStats.ts`**, **`paTracker.ts`**, **`mdrtTracker.ts`**, **`recruitmentTracker.ts`** | Domain-specific computations. |
| **`defaults.ts`** | `emptyTask`, `emptyDailyEntry`, `emptyWeeklyReview`, … |
| **`cn.ts`** | Class name merge. |
| **`clipboard.ts`** | Clipboard helper (**usage:** grep if needed). |

---

## 12. Current strengths

- **Single persisted `AppData`** with a clear load/normalize/save pipeline.
- **Strong typing** in one `types/index.ts` hub.
- **Advisor + task metrics** integration for measurable work.
- **Today → Weekly → Monthly** flow is improving: linked tasks, aggregates, focus lists, `ReviewFlowBanner`.
- **Local-first** with explicit backup/restore in Settings.
- **Vercel + SPA rewrites** documented for production.

---

## 13. Current pain points / gaps

- **README drift:** README mentions an older **data version**; trust **`DATA_VERSION` in code** (currently **11**).
- **Cognitive load:** Many fields on review pages; mitigated partially by progressive disclosure but still dense.
- **Duplication:** Some string-based “pull snapshot” logic overlaps conceptually with structured aggregates (**weekly/monthly tables vs pasted text**).
- **Weak automatic chaining:** Choosing `nextWeekTaskIds` does not automatically create tomorrow’s `DailyEntry` (**unclear from code** if partial automation exists outside Today).
- **`ProjectDetailPage` is read-only** — may surprise users who expect inline edits.
- **Advisor save** uses debounced save + toast on every debounced flush—could feel chatty.
- **Risk:** Any `updateData` consumer must avoid mutating `prev` in place; pattern is usually correct but worth vigilance on new pages.

---

## 14. Suggested next improvements

- Tighten **Today → Weekly → Monthly** automation (e.g. optional “seed tomorrow from weekly focus”).
- More **shared abstractions** between weekly/monthly “focus task list + notes” UIs (already partially componentized).
- **Summary cards** at top of each review page driven from the same helpers that power tables (single source of truth).
- **README sync** with `DATA_VERSION` and feature list.
- Optional **task activity timeline** (would need new storage model—currently inferred from dailies only).

---

## 15. Important implementation notes

- **Naming:** Pages are `*Page.tsx`; routes are kebab-case; types are PascalCase; storage key is constant `STORAGE_KEY`.
- **Styling:** Tailwind utility classes; shared input classes from `FormField`; category colors from `@theme`.
- **Safe new fields:** Add optional `?` on types → extend **`migrateDailyEntries` / `migrateWeeklyReview` / `migrateMonthlyReview` / `normalizeData`** → default in **`empty*`** factories in `defaults.ts` if needed.
- **Avoid breaking `localStorage`:** Never remove required keys without defaults; keep migrators tolerant of `undefined` arrays.
- **Run / build:** `npm install`, `npm run dev` (Vite dev server), `npm run build` (`tsc -b && vite build`), `npm test` (Vitest), `npm run preview` for local production preview.
- **Limitations:** No multi-user sync, no server-side validation, browser storage size limits, no offline Service Worker **unclear from code** (not observed in `vite.config`).

---

## 16. File map (compact)

| File | One-line description |
|------|----------------------|
| `package.json` | Scripts and dependencies |
| `vite.config.ts` | Vite + React + Tailwind plugins |
| `vercel.json` | Vercel build output + SPA rewrites |
| `src/main.tsx` | App bootstrap |
| `src/App.tsx` | Router and providers |
| `src/index.css` | Tailwind v4 + theme tokens |
| `src/types/index.ts` | All core TypeScript types + constants |
| `src/context/AppDataContext.tsx` | Global state + persistence hook |
| `src/context/ToastContext.tsx` | Toast UI |
| `src/services/storage.ts` | localStorage load/save/import/export/reset/normalize |
| `src/services/dataMigrations.ts` | Daily/weekly/monthly/task migrators |
| `src/data/seedData.ts` | Default `AppData` factory |
| `src/data/advisorGrowthTasks.ts` | Advisor project + seed tasks |
| `src/config/navigation.ts` | Sidebar definition |
| `src/pages/*.tsx` | Route screens |
| `src/components/layout/*` | Shell and chrome |
| `src/components/ui/*` | Generic UI building blocks |
| `src/components/today/*` | Daily linked-task cockpit pieces |
| `src/components/reviews/*` | Review banners, completeness, scoreboard form |
| `src/components/advisor/*` | PA / MDRT / recruitment UI |
| `src/components/dashboard/*` | Home dashboard widgets |
| `src/components/tasks/*` | Master task UI |
| `src/utils/reviewWorkHelpers.ts` | Review/task aggregation and daily note helpers |
| `src/utils/taskMetrics.ts` | Task completion → advisor metric apply |
| `src/utils/defaults.ts` | Empty factories for forms |
| `src/hooks/useEntityCrud.ts` | Generic list CRUD against `AppData` |
| `src/hooks/useDebouncedAdvisor.ts` | Debounced advisor persistence |
| `vitest.config.ts` | Unit test config |

---

*End of overview.*
