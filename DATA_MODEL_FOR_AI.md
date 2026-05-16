# Data Model for AI Assistants

This document describes **persisted and in-memory data** for the Master Portfolio Command Center: TypeScript types, defaults, migrations, read/write locations, relationships, gaps, compatibility risks, and **suggested optional fields** (documentation only — **no code was changed**).

**Sources of truth:** `src/types/index.ts`, `src/utils/defaults.ts`, `src/services/dataMigrations.ts`, `src/services/storage.ts`, `src/data/seedData.ts`, `src/utils/taskMigrate.ts`, and grep-backed usage in `src/pages`, `src/components`, `src/hooks`.

**Current persisted schema marker:** `DATA_VERSION = 11` (`types/index.ts`). Every `saveData` writes this version.

---

## 1. Root type: `AppData`

| Field | Type | Purpose |
|-------|------|---------|
| `version` | `number` | Set to `DATA_VERSION` on save; load accepts any positive version if `projects` array exists |
| `settings` | `AppSettings` | Pacing clock |
| `projects` | `Project[]` | Portfolio / engine projects |
| `tasks` | `Task[]` | Master task list |
| `contacts` | `Contact[]` | CRM |
| `content` | `ContentItem[]` | Content pipeline |
| `events` | `Event[]` | Events |
| `finance` | `FinanceItem[]` | Money in/out |
| `hksiExams` | `HksiExam[]` | Exam rows (merged with seed on load) |
| `studyLogs` | `StudyLog[]` | Study sessions |
| `wrongAnswers` | `WrongAnswer[]` | Error bank |
| `dailyEntries` | `DailyEntry[]` | Daily journal + linked tasks |
| `weeklyReviews` | `WeeklyReview[]` | Weekly reflection + scoreboard |
| `monthlyReviews` | `MonthlyReview[]` | Monthly reflection |
| `digitalAssets` | `DigitalAsset[]` | Asset library |
| `aiPrompts` | `AiPrompt[]` | Prompt library |
| `advisor` | `AdvisorExecutionState` | PA / MDRT / recruitment numbers |

### Where `AppData` is created

| Mechanism | Location | Notes |
|-----------|----------|-------|
| Fresh install / corrupt storage | `storage.loadData()` → `createDefaultData()` | `seedData.ts` |
| After reset | `resetToDefault()` | Same seed |
| After import | `importDataJson()` → `normalizeData()` | Requires `projects` on parsed JSON |
| Normalized load | `normalizeData(parsed)` | Always followed by `saveData` in `loadData` |

### Where `AppData` is read/written

| Operation | Location |
|-----------|----------|
| Read | Any `useAppData().data` consumer |
| Partial update | `updateData((prev) => ({ ...prev, ... }))` — `AppDataContext.tsx`, pages, hooks, some components |
| Full replace | `replaceData(next)` — Settings import/reset |
| Persist | `saveData` after every `updateData` / `replaceData`; `loadData` re-saves after normalize |

---

## 2. `AppSettings`

```ts
interface AppSettings {
  useLiveClock: boolean;
  pacingDate: string; // YYYY-MM-DD
}
```

| Action | Where |
|--------|-------|
| Created | `emptyAppSettings()` in `defaults.ts`; merged in `normalizeData` |
| Read | Pacing hooks, task deadline helpers, Today date selection, advisor warnings, many pages |
| Written | `SettingsPage` (`PacingSettingsCard` → `updateData` settings) |

**Relationships:** Drives **`getReferenceDate()`** / `resolvePacingDate` (not stored on `AppData` beyond `settings`).

---

## 3. `Project`

All fields are **required** strings/numbers/enums (no optionals on interface).

| Field | Role |
|-------|------|
| `id` | Stable key; referenced by `projectId` on tasks, contacts, content, events, finance, assets, prompts |
| `projectName`, `category`, `engine`, `status`, `priority` | Classification |
| `mainGoal`, `targetAudience`, `mainFeeling`, `mainMotive`, `currentPhase`, `owner`, `startDate`, `nextMilestone`, `milestoneDeadline` | Planning |
| `revenuePotential`, `timeDemand`, `progress`, `notes` | Ops |

**Created:** `emptyProject()` for forms; `defaultProjects` + `advisorGrowthProject` in `seedData.ts`; user saves on `ProjectsPage`.

**Read:** Project lists, detail page, filters, `mergeAdvisorProject` (ensures `ADVISOR_GROWTH_PROJECT_ID` exists).

**Written:** `ProjectsPage` via `updateData` (upsert/delete project array).

**Normalize:** HKSI project row may rename `projectName` / `mainGoal` when `id === 'hksi-papers'` (`storage.ts`).

**Constant:** `ADVISOR_GROWTH_PROJECT_ID = 'advisor-growth-center'` — advisor-linked tasks use this `projectId` in seed data; merge logic strips user tasks on this project in some paths (see §15).

---

## 4. `Task` and related types

### Stored fields (`Task`)

| Field | Optional? | Purpose |
|-------|-----------|---------|
| `id` | no | Primary key |
| `title` | no | Display (replaces deprecated `taskName`) |
| `taskName` | **yes** | Deprecated; migration reads via `migrateTask` |
| `projectId` | no | FK → `Project.id` |
| `module` | no | Subgroup string |
| `area` | no | `TaskArea` enum |
| `priority` | no | `P0`–`P3` |
| `status` | no | `TaskStatus`; legacy strings normalized in `taskMigrate` / `taskStatus` |
| `deadline` | no | ISO date or `''` |
| `owner`, `dependency`, `successMetric` | no | Text |
| `progressPercentage` | no | 0–100; synced with status |
| `timeNeeded`, `energyLevel`, `impact` | no | Enums |
| `track` | no | `TaskTrack`; may be `''` |
| `metricKey`, `metricMode`, `metricValue` | no | Links completion to `advisor` metrics |
| `metricSnapshot` | **yes** | Revert snapshot for metric apply |
| `today`, `thisWeek` | no | Flags for “today/week” views |
| `notes` | no | Permanent task notes |
| `createdAt`, `updatedAt`, `completedAt` | no | ISO strings; `completedAt` often `''` until done |

### Related types (not separate tables)

- `TaskArea`, `TaskPriority`, `TaskStatus`, `TimeNeeded`, `EnergyLevel`, `Impact`, `TaskTrack`, `TaskMetricKey`, `TaskMetricMode`, `LegacyTaskStatus` — all in `types/index.ts`.

### Where tasks are created

| Source | Details |
|---------|---------|
| `emptyTask(projectId)` | `defaults.ts` — new row from UI |
| `createDefaultData()` | `migrateTask` on `advisorGrowthTasks` only (portfolio `defaultTasks` is empty array) |
| `mergeAdvisorTasks(saved)` | On every load: migrates each task, merges with seed rules, **filters** (see §15) |

### Where tasks are read

Dashboard stats, `TasksPage`, `TodayPage` / linked-task UI, `WeeklyReviewPage` / `MonthlyReviewPage` aggregates, `ProjectDetailPage` filter, `reviewWorkHelpers`, `taskMetrics`, warnings, etc.

### Where tasks are written

`TasksPage` (CRUD, duplicate), `TodayPage` / `LinkedTaskCard` / close-day flows (status, notes, deadlines, completion + metrics).

### `migrateTask` / `migrateTasks` (`taskMigrate.ts`)

- Maps legacy priority strings → `P0`–`P3`.
- `title` from `title` or `taskName`.
- `normalizeTaskStatus` for legacy Done/Delayed.
- Default `deadline` from priority if missing (hardcoded 2026 dates in `DEFAULT_DEADLINE_BY_PRIORITY`).
- `module` fallback: `raw.module ?? raw.area ?? 'General'`.
- `completedAt`: if status Completed and missing, uses `updatedAt` or `now`.
- **`resolveTaskMetricFields`** applied last.

---

## 5. Advisor execution types

### `AdvisorExecutionState` (persisted under `AppData.advisor`)

```ts
{ pa: PaTrackerData; mdrt: MdrtTrackerData; recruitment: RecruitmentTrackerData; }
```

### `PaTrackerData`

Numeric counters + `productCategories: PaProductCategories` (three booleans). All required.

### `MdrtTrackerData`

`primaryRoute: MdrtRoute`, four `current*` numbers. All required.

### `RecruitmentTrackerData`

`candidates: RecruitmentCandidate[]`, `agentsOnboarded`, `agentsTarget`.

### `RecruitmentCandidate`

`id`, `name`, `stage: RecruitmentStage`, `notes`, `updatedAt`.

### Derived-only types (not in JSON)

`PaStatusLabel`, `PaceStatus` — computed in `paTracker.ts`, `mdrtTracker.ts`, `executionGoalsSummary.ts` for UI; **not stored** on `AdvisorExecutionState`.

**Created:** `emptyAdvisorExecution()` in `defaults.ts`; merged in `normalizeData` (nested defaults for `pa.productCategories`, `recruitment.candidates`).

**Written:** `useDebouncedAdvisor` → `updateData` with full `advisor` object after 500ms idle.

**Read:** `AdvisorPage` panels, dashboard execution widgets, warnings, task metric apply.

---

## 6. `Contact`

All fields required on interface. `relatedProjectId` links to `Project`.

**Created:** `emptyContact()` in `defaults.ts`.

**Read/Write:** `ContactsPage` via `useEntityCrud('contacts')`.

---

## 7. `ContentItem`

All fields required. `projectId` → `Project`. Engagement metrics are numbers (not optional).

**Created:** `emptyContent()` in `defaults.ts`.

**Read/Write:** `ContentPage` via `updateData` on `content`.

---

## 8. `Event`

All fields required. `checklist` defaults from `DEFAULT_EVENT_CHECKLIST` in `types/index.ts` when creating empty events via `emptyEvent()`.

**Created:** `emptyEvent()` in `defaults.ts`.

**Read/Write:** `EventsPage` via `updateData` on `events`.

---

## 9. `FinanceItem`

All fields required.

**Created:** `emptyFinance()` in `defaults.ts`.

**Read/Write:** `FinancePage` via `updateData` on `finance`.

---

## 10. HKSI types: `HksiExam`, `StudyLog`, `WrongAnswer`

### `HksiExam`

`paper` typed as `HksiPaper | string` to allow custom paper labels. Other fields required.

**Created:** Seed `defaultHksiExams` in `seedData.ts`; `emptyHksiExam()` in `defaults.ts`; merged on load via `mergeHksiExams` in `storage.ts` (canonical Papers 1–9 + extras not in seed list).

**Read/Write:** `HksiPage` — `updateData` on `hksiExams`, `studyLogs`, `wrongAnswers`; deletes filter arrays.

---

## 11. Daily planning: `DailyEntry`, `DailyTaskNote`, `DailyTaskIntent`

### `DailyTaskNote` (embedded)

| Field | Optional? | Purpose |
|-------|-----------|---------|
| `taskId` | no | FK → `Task.id` |
| `note`, `progressNote`, `whatDidToday`, `outcome`, `blocker`, `nextStep` | yes | Day-scoped text |
| `timeSpentMinutes` | yes | Optional duration |

### `DailyTaskIntent` (embedded)

`taskId` + `intent: DailyTaskIntentKind` (`aim_today` | `optional` | `blocked` | `carry_forward`).

### `DailyEntry`

| Field | TS optional? | After `migrateDailyEntries` |
|-------|----------------|------------------------------|
| `id`, `date` | no | Always set |
| `linkedTaskIds` | no | `[]` if missing |
| `dailyWorkLogNote` | **yes** in interface | Always string (may be `''`) |
| `dailyTaskNotes` | **yes** | Array, default `[]` |
| `dailyTaskIntent` | **yes** | Array, default `[]` |
| `todayTop3Tasks` … `firstTaskTomorrow` | no | Strings, default `''` |

**Note:** Interface marks some daily fields optional for **forward compatibility**, but migrator and `emptyDailyEntry` **always materialize** them so runtime code can rely on arrays/strings after load.

**Created:** `emptyDailyEntry(date)` in `defaults.ts`; new ids like `daily-${date}`.

**Read:** `TodayPage` (by date), `reviewWorkHelpers` (weekly/monthly aggregates), `todayTasksSync`, `ReviewCompletenessIndicator`.

**Written:** `TodayPage` (save, carry to tomorrow, close day), `LinkedTaskCard` / `LinkedTasksSection` / `TodayTasksPanel` (task patches + entry updates via callbacks/`updateData`).

**Relationships:** `linkedTaskIds[]` + `dailyTaskNotes` / `dailyTaskIntent` should stay consistent per `taskId` (enforced in UI, not DB constraints).

---

## 12. `WeeklyReview` and `WeeklyScoreboard`

### `WeeklyScoreboard`

Large fixed set of numeric **target/actual** pairs — all required numbers. Default full object: `DEFAULT_WEEKLY_SCOREBOARD` in `types/index.ts`.

### `WeeklyReview`

| Field | Optional? |
|-------|-----------|
| `id`, `weekStartDate`, reflection strings, `scoreboard` | no |
| `nextWeekTaskIds` | **yes** in interface; migrator → `[]` |
| `weeklyTaskNotes` | **yes**; migrator → `[]` |

**Created:** `emptyWeeklyReview()` in `defaults.ts`; new reviews on `WeeklyReviewPage` with `generateId`.

**Read/Write:** `WeeklyReviewPage`; monthly page reads `weeklyReviews` for “pull from weekly” / import focus ids.

**Migrate:** `migrateWeeklyReview` spreads `DEFAULT_WEEKLY_SCOREBOARD` then `r.scoreboard` so **new scoreboard keys** in code get defaults for old saves.

---

## 13. `MonthlyReview`

| Field | Optional? |
|-------|-----------|
| Core string fields, `month` | no |
| `nextMonthTaskIds`, `monthlyTaskNotes` | **yes**; migrator → `[]` |

**Created:** `emptyMonthlyReview()` in `defaults.ts`.

**Read/Write:** `MonthlyReviewPage`.

---

## 14. `DigitalAsset` and `AiPrompt`

Standard entity shapes; all top-level fields required on interfaces.

**Created:** `emptyDigitalAsset()`, `emptyAiPrompt()` in `defaults.ts`.

**Read/Write:** `AssetsPage`, `PromptsPage` via `updateData`.

**Normalize:** If `aiPrompts` missing or empty in parsed JSON, **`defaults.aiPrompts`** from seed replaces entire array (`storage.normalizeData`).

---

## 15. Task merge / strip: high-impact behavior (`mergeAdvisorTasks`)

On **every load**, `tasks` pass through `mergeAdvisorTasks` (`dataMigrations.ts`):

1. **`stripRemovedEngineTasks`** removes any task whose `projectId` is in `STRIPPED_PORTFOLIO_PROJECT_IDS` **or** equals `ADVISOR_GROWTH_PROJECT_ID`.

2. If the user’s task list contains **no** task with `projectId === ADVISOR_GROWTH_PROJECT_ID`, the code path adds migrated advisor seed tasks then strips — effectively **no advisor seed tasks remain** in that branch (they use AGC `projectId`).

3. If the user **has** AGC tasks, a merge-by-id path runs with `advisorGrowthTasks` seed map, metric backfill, then **still** applies `stripRemovedEngineTasks`, which **drops all tasks on `ADVISOR_GROWTH_PROJECT_ID`**.

**Implication:** Tasks stored under the advisor growth project ID are **not retained** after normalize. Portfolio tasks on the five legacy engine project IDs in `STRIPPED_PORTFOLIO_PROJECT_IDS` are also **removed**. This is the strongest **data loss / backward compatibility** risk in the pipeline (by design in code).

---

## 16. HKSI exam merge

`mergeHksiExams`: canonical Papers 1–9 from seed, merged by `paper` key with saved rows; extra saved exams with non-canonical `paper` labels are **appended**. Preserves user progress for standard papers.

---

## 17. Relationship diagram (conceptual)

```
AppData
├── settings
├── projects[] ◄──── projectId on Task, Contact, ContentItem, Event, FinanceItem, DigitalAsset, AiPrompt
├── tasks[] ◄────── linkedTaskIds[], dailyTaskNotes[].taskId, weeklyTaskNotes, monthlyTaskNotes, metricKey → advisor
├── advisor ◄────── Task.metricKey / completion handlers
├── contacts[], content[], events[], finance[], digitalAssets[], aiPrompts[]
├── hksiExams[], studyLogs[], wrongAnswers[]
├── dailyEntries[] ──► tasks (linkedTaskIds, dailyTaskNotes, dailyTaskIntent)
├── weeklyReviews[] ──► tasks (nextWeekTaskIds, weeklyTaskNotes); reads dailyEntries for aggregates
└── monthlyReviews[] ──► tasks (nextMonthTaskIds, monthlyTaskNotes); reads dailyEntries + weeklyReviews
```

---

## 18. Fields likely missing (product / modeling gaps)

These are **not** in `AppData` today; they may be useful for future work:

| Gap | Why it might matter |
|-----|---------------------|
| **Global task tags / labels** | Beyond `module` string |
| **Explicit `deletedAt` / soft delete** | Deletes are hard removes from arrays |
| **Task status history / audit log** | Only `updatedAt` / `completedAt` + daily entries imply history |
| **Stable FK from DailyEntry to WeeklyReview** | Reviews are independent lists |
| **User id / workspace** | Single-user local model |
| **Attachment / file refs** | Only URLs in some string fields |
| **Recurrence** on tasks/events | Not modeled |
| **Timezone** on `AppSettings` | Dates are plain ISO strings |
| **Versioned migrations** | No per-record `schemaVersion`; only global `DATA_VERSION` on save |

---

## 19. Backward compatibility risks

| Risk | Detail |
|------|--------|
| **`mergeAdvisorTasks` stripping** | Tasks on stripped portfolio projects or `advisor-growth-center` removed on load (§15). |
| **`normalizeData` always saves** | Any load mutates localStorage immediately (migrations applied eagerly). |
| **Strict import check** | `importDataJson` throws if `projects` missing — partial exports fail. |
| **Legacy task JSON** | Hand-edited JSON with invalid `priority`/`status` gets coerced via `migrateTask` / `normalizeTaskStatus`; may surprise users. |
| **Default deadlines in `migrateTask`** | Missing deadline filled from priority-specific **fixed 2026 dates** — stale over time. |
| **`aiPrompts` replacement** | Empty/missing `aiPrompts` in backup → replaced by seed defaults (could overwrite intentional empty list). |
| **Weekly scoreboard key drift** | Old saves merged with `DEFAULT_WEEKLY_SCOREBOARD`; extra unknown keys from old saves remain inside `scoreboard` object until overwritten in UI (TypeScript may not know them). |
| **`DailyEntry` optional vs runtime** | TS allows partial objects before migration; code assuming post-load shape should use `migrateDailyEntries` or load via `storage`. |
| **Orphan `linkedTaskIds`** | `TasksPage` does not reference `dailyEntries` (grep); deleting a task can leave stale ids in past `DailyEntry.linkedTaskIds` unless another path cleans them. |
| **`taskId` in weekly/monthly notes** | Can reference deleted tasks — UI should tolerate missing tasks. |

---

## 20. Suggested **safe** optional fields (future)

Use **optional** properties, defaults in **`migrateDailyEntries` / `migrateWeeklyReview` / `migrateMonthlyReview` / `migrateTask` / `normalizeData`**, and extend **`empty*`** factories. Avoid renaming or retyping existing required fields.

| Location | Suggested optional field | Purpose |
|----------|-------------------------|---------|
| `DailyEntry` | `lastEditedAt?: string` | Audit |
| `DailyEntry` | `weeklyReviewId?: string` | Link day to a week record (weak FK) |
| `Task` | `archivedAt?: string` | Soft archive without delete |
| `Task` | `sortOrder?: number` | Manual ordering within project |
| `WeeklyReview` | `summaryGeneratedAt?: string` | Idempotency for auto-summaries |
| `MonthlyReview` | `summaryGeneratedAt?: string` | Same |
| `AppSettings` | `weekStartsOn?: 0 \| 1` | Locale week boundaries (if logic added) |
| `RecruitmentCandidate` | `source?: string` | Provenance |

Do **not** add required fields without migration defaults — old `localStorage` JSON will fail or produce `undefined` in strict UI paths.

---

## 21. `useEntityCrud` collections

Hook parameter is a key of `AppData` whose value is `{ id: string }[]`. Used for **`contacts`** only in the codebase grep set; other entities use inline `updateData` on their array keys.

---

## 22. Quick reference: migrators vs defaults

| Type | Default factory | Migrator |
|------|-----------------|----------|
| `DailyEntry` | `emptyDailyEntry` | `migrateDailyEntries` |
| `WeeklyReview` | `emptyWeeklyReview` | `migrateWeeklyReview` |
| `MonthlyReview` | `emptyMonthlyReview` | `migrateMonthlyReview` |
| `Task` | `emptyTask` | `migrateTask` / `migrateTasks` inside `mergeAdvisorTasks` |
| `AppData` (whole) | `createDefaultData` | `normalizeData` in `storage.ts` |
| `HksiExam[]` | `defaultHksiExams` | `mergeHksiExams` |
| `AdvisorExecutionState` | `emptyAdvisorExecution` | Manual spread in `normalizeData` |

---

*End of data model document.*
