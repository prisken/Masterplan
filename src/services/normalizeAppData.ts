import { createDefaultData, defaultHksiExams } from '../data/seedData';
import type { AppData, HksiExam, Task } from '../types';
import { DATA_VERSION, REFERENCE_DATE } from '../types';
import type { AppSettings } from '../types';
import { emptyAdvisorExecution, emptyAppSettings } from '../utils/defaults';
import type { AdvisorExecutionState } from '../types';
import {
  mergeAdvisorProject,
  mergeAdvisorTasks,
  migrateDailyEntries,
  migrateMonthlyReview,
  migrateWeeklyReview,
} from './dataMigrations';

/** Ensures Papers 1–9 exist; preserves saved rows by `paper`; keeps custom papers not in the seed list. */
function mergeHksiExams(saved: HksiExam[] | undefined): HksiExam[] {
  const canonicalSeed = defaultHksiExams.map((e) => ({ ...e }));
  const seedPaperLabels = new Set(canonicalSeed.map((s) => s.paper));
  const byPaper = new Map<string, HksiExam>();
  for (const e of saved ?? []) {
    byPaper.set(e.paper, { ...e });
  }
  const merged = canonicalSeed.map((s) => {
    const existing = byPaper.get(s.paper);
    return existing ? { ...s, ...existing } : { ...s };
  });
  const extras = (saved ?? []).filter((e) => !seedPaperLabels.has(e.paper));
  return [...merged, ...extras.map((e) => ({ ...e }))];
}

/**
 * Pure normalization used by localStorage persistence and server API.
 * Safe to import from Vercel serverless functions (no localStorage).
 */
export function normalizeAppData(parsed: Partial<AppData>): AppData {
  const defaults = createDefaultData();
  const projects = mergeAdvisorProject(
    parsed.projects?.length ? parsed.projects.map((p) => ({ ...p })) : defaults.projects
  ).map((p) => {
    if (p.id !== 'hksi-papers') return p;
    if (p.projectName === 'HKSI Paper 1, 7, 8' || p.mainGoal === 'Complete HKSI Paper 1, 7, and 8') {
      return {
        ...p,
        projectName: 'HKSI Papers 1–9',
        mainGoal: 'Complete HKSI Papers 1 through 9',
      };
    }
    return p;
  });
  const tasks = mergeAdvisorTasks(
    parsed.tasks?.length ? (parsed.tasks as Task[]) : defaults.tasks
  );

  const advisor: AdvisorExecutionState = parsed.advisor
    ? {
        pa: {
          ...emptyAdvisorExecution().pa,
          ...parsed.advisor.pa,
          productCategories: {
            ...emptyAdvisorExecution().pa.productCategories,
            ...parsed.advisor.pa?.productCategories,
          },
        },
        mdrt: { ...emptyAdvisorExecution().mdrt, ...parsed.advisor.mdrt },
        recruitment: {
          ...emptyAdvisorExecution().recruitment,
          ...parsed.advisor.recruitment,
          candidates: parsed.advisor.recruitment?.candidates ?? [],
        },
      }
    : emptyAdvisorExecution();

  const settings: AppSettings = {
    ...emptyAppSettings(),
    ...parsed.settings,
    pacingDate: parsed.settings?.pacingDate ?? REFERENCE_DATE,
    useLiveClock: parsed.settings?.useLiveClock ?? false,
  };

  return {
    version: DATA_VERSION,
    settings,
    projects,
    tasks,
    advisor,
    contacts: parsed.contacts ?? [],
    content: parsed.content ?? [],
    events: parsed.events ?? [],
    finance: parsed.finance ?? [],
    hksiExams: mergeHksiExams(parsed.hksiExams),
    studyLogs: parsed.studyLogs ?? [],
    wrongAnswers: parsed.wrongAnswers ?? [],
    dailyEntries: parsed.dailyEntries?.length
      ? migrateDailyEntries(parsed.dailyEntries)
      : [],
    weeklyReviews: Array.isArray(parsed.weeklyReviews)
      ? parsed.weeklyReviews.map((r) => migrateWeeklyReview(r))
      : [],
    monthlyReviews: Array.isArray(parsed.monthlyReviews)
      ? parsed.monthlyReviews.map((r) => migrateMonthlyReview(r))
      : [],
    digitalAssets: parsed.digitalAssets ?? [],
    aiPrompts: parsed.aiPrompts?.length ? parsed.aiPrompts : defaults.aiPrompts,
  };
}
