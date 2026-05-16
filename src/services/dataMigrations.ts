import { advisorGrowthTasks } from '../data/advisorGrowthTasks';
import type { DailyEntry, Project, Task } from '../types';
import { ADVISOR_GROWTH_PROJECT_ID } from '../types';
import { advisorGrowthProject } from '../data/advisorGrowthTasks';
import { migrateTask, migrateTasks } from '../utils/taskMigrate';
import { resolveTaskMetricFields } from '../utils/taskMetrics';

/** Cleared portfolio engines; Advisor Growth Center has no seeded tasks. */
const STRIPPED_PORTFOLIO_PROJECT_IDS = new Set([
  'profit-pulse-ally',
  'investment-news-channel',
  'mama-supreme',
  'hksi-papers',
  'eternal-moments',
]);

function stripRemovedEngineTasks(tasks: Task[]): Task[] {
  return tasks.filter((t) => {
    if (STRIPPED_PORTFOLIO_PROJECT_IDS.has(t.projectId)) return false;
    if (t.projectId === ADVISOR_GROWTH_PROJECT_ID) return false;
    return true;
  });
}

export function mergeAdvisorProject(projects: Project[]): Project[] {
  if (projects.some((p) => p.id === ADVISOR_GROWTH_PROJECT_ID)) return projects;
  return [...projects, { ...advisorGrowthProject }];
}

/**
 * Migrates tasks and strips cleared portfolio / Advisor Growth seeded tasks.
 * No Advisor Growth seed tasks are merged in anymore.
 */
export function mergeAdvisorTasks(tasks: Task[]): Task[] {
  const seedById = new Map(advisorGrowthTasks.map((t) => [t.id, migrateTask(t)]));
  const hasAgc = tasks.some((t) => t.projectId === ADVISOR_GROWTH_PROJECT_ID);

  if (!hasAgc) {
    return stripRemovedEngineTasks([
      ...migrateTasks(tasks),
      ...advisorGrowthTasks.map((t) => migrateTask(t)),
    ]);
  }

  const byId = new Map<string, Task>();
  for (const raw of tasks) {
    const migrated = migrateTask(raw);
    byId.set(migrated.id, migrated);
  }

  for (const [id, seed] of seedById) {
    const existing = byId.get(id);
    if (!existing) {
      byId.set(id, seed);
      continue;
    }
    if (!existing.metricKey && seed.metricKey) {
      byId.set(
        id,
        resolveTaskMetricFields({
          ...existing,
          metricKey: seed.metricKey,
          metricMode: seed.metricMode,
          metricValue: seed.metricValue,
        })
      );
    } else {
      byId.set(id, resolveTaskMetricFields(existing));
    }
  }

  for (const [id, task] of byId) {
    if (!task.metricKey) {
      byId.set(id, resolveTaskMetricFields(task));
    }
  }

  return stripRemovedEngineTasks([...byId.values()]);
}

export function migrateDailyEntries(entries: Partial<DailyEntry>[]): DailyEntry[] {
  return entries.map((e) => ({
    id: e.id ?? `daily-${e.date ?? ''}`,
    date: e.date ?? '',
    linkedTaskIds: e.linkedTaskIds ?? [],
    todayTop3Tasks: e.todayTop3Tasks ?? '',
    oneRevenueTask: e.oneRevenueTask ?? '',
    oneAuthorityTask: e.oneAuthorityTask ?? '',
    oneRelationshipTask: e.oneRelationshipTask ?? '',
    oneStudyTask: e.oneStudyTask ?? '',
    oneAdminTask: e.oneAdminTask ?? '',
    peopleToFollowUp: e.peopleToFollowUp ?? '',
    contentToCreateOrPost: e.contentToCreateOrPost ?? '',
    mustBeFinishedToday: e.mustBeFinishedToday ?? '',
    canWait: e.canWait ?? '',
    endOfDayCompleted: e.endOfDayCompleted ?? '',
    endOfDayLearned: e.endOfDayLearned ?? '',
    firstTaskTomorrow: e.firstTaskTomorrow ?? '',
  }));
}
