import { createDefaultData } from '../data/seedData';
import type { AppData, Task } from '../types';
import { DATA_VERSION, REFERENCE_DATE, STORAGE_KEY } from '../types';
import type { AppSettings } from '../types';
import { emptyAdvisorExecution, emptyAppSettings } from '../utils/defaults';
import type { AdvisorExecutionState } from '../types';
import {
  mergeAdvisorProject,
  mergeAdvisorTasks,
  migrateDailyEntries,
} from './dataMigrations';

function normalizeData(parsed: Partial<AppData>): AppData {
  const defaults = createDefaultData();
  const projects = mergeAdvisorProject(
    parsed.projects?.length ? parsed.projects.map((p) => ({ ...p })) : defaults.projects
  );
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
    hksiExams: parsed.hksiExams?.length ? parsed.hksiExams : defaults.hksiExams,
    studyLogs: parsed.studyLogs ?? [],
    wrongAnswers: parsed.wrongAnswers ?? [],
    dailyEntries: parsed.dailyEntries?.length
      ? migrateDailyEntries(parsed.dailyEntries)
      : [],
    weeklyReviews: parsed.weeklyReviews ?? [],
    monthlyReviews: parsed.monthlyReviews ?? [],
    digitalAssets: parsed.digitalAssets ?? [],
    aiPrompts: parsed.aiPrompts?.length ? parsed.aiPrompts : defaults.aiPrompts,
  };
}

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seed = createDefaultData();
      saveData(seed);
      return seed;
    }
    const parsed = JSON.parse(raw) as Partial<AppData>;
    if (!parsed.version || !Array.isArray(parsed.projects)) {
      const seed = createDefaultData();
      saveData(seed);
      return seed;
    }
    const data = normalizeData(parsed);
    saveData(data);
    return data;
  } catch {
    const seed = createDefaultData();
    saveData(seed);
    return seed;
  }
}

export function saveData(data: AppData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...data, version: DATA_VERSION }));
}

export function resetToDefault(): AppData {
  const seed = createDefaultData();
  saveData(seed);
  return seed;
}

export function exportDataJson(data: AppData): string {
  return JSON.stringify(data, null, 2);
}

export function importDataJson(json: string): AppData {
  const parsed = JSON.parse(json) as Partial<AppData>;
  if (!parsed.projects) throw new Error('Invalid backup: missing projects');
  const data = normalizeData(parsed);
  saveData(data);
  return data;
}
