import { advisorGrowthTasks } from '../data/advisorGrowthTasks';
import type { DailyEntry, MonthlyReview, Project, Task, WeeklyReview } from '../types';
import { ADVISOR_GROWTH_PROJECT_ID, DEFAULT_WEEKLY_SCOREBOARD } from '../types';
import { advisorGrowthProject } from '../data/advisorGrowthTasks';
import { migrateTask, migrateTasks } from '../utils/taskMigrate';
import { resolveTaskMetricFields } from '../utils/taskMetrics';
import { getMondayOfWeek } from '../utils/dateHelpers';

export function mergeAdvisorProject(projects: Project[]): Project[] {
  if (projects.some((p) => p.id === ADVISOR_GROWTH_PROJECT_ID)) return projects;
  return [...projects, { ...advisorGrowthProject }];
}

/**
 * Migrates tasks and merges optional advisor seed tasks by id.
 * Portfolio and Advisor Growth tasks are kept (no strip on load) so user tasks persist.
 */
export function mergeAdvisorTasks(tasks: Task[]): Task[] {
  const seedById = new Map(advisorGrowthTasks.map((t) => [t.id, migrateTask(t)]));
  const hasAgc = tasks.some((t) => t.projectId === ADVISOR_GROWTH_PROJECT_ID);

  if (!hasAgc) {
    return [...migrateTasks(tasks), ...advisorGrowthTasks.map((t) => migrateTask(t))];
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

  return [...byId.values()];
}

export function migrateDailyEntries(entries: Partial<DailyEntry>[]): DailyEntry[] {
  return entries.map((e) => ({
    id: e.id ?? `daily-${e.date ?? ''}`,
    date: e.date ?? '',
    linkedTaskIds: e.linkedTaskIds ?? [],
    dailyWorkLogNote: e.dailyWorkLogNote ?? '',
    dailyTaskNotes: Array.isArray(e.dailyTaskNotes) ? e.dailyTaskNotes : [],
    dailyTaskIntent: Array.isArray(e.dailyTaskIntent) ? e.dailyTaskIntent : [],
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

export function migrateWeeklyReview(r: Partial<WeeklyReview>): WeeklyReview {
  const sb = { ...DEFAULT_WEEKLY_SCOREBOARD, ...r.scoreboard };
  return {
    id: r.id ?? '',
    weekStartDate: r.weekStartDate ?? getMondayOfWeek(),
    whatWorked: r.whatWorked ?? '',
    whatDidNotWork: r.whatDidNotWork ?? '',
    projectMostProgress: r.projectMostProgress ?? '',
    projectMostStress: r.projectMostStress ?? '',
    opportunityToDoubleDown: r.opportunityToDoubleDown ?? '',
    stopDelegateDelay: r.stopDelegateDelay ?? '',
    top5ActionsNextWeek: r.top5ActionsNextWeek ?? '',
    scoreboard: sb,
    nextWeekTaskIds: Array.isArray(r.nextWeekTaskIds) ? r.nextWeekTaskIds : [],
    weeklyTaskNotes: Array.isArray(r.weeklyTaskNotes) ? r.weeklyTaskNotes : [],
  };
}

export function migrateMonthlyReview(r: Partial<MonthlyReview>): MonthlyReview {
  return {
    id: r.id ?? '',
    month: r.month ?? new Date().toISOString().slice(0, 7),
    biggestWins: r.biggestWins ?? '',
    biggestProblems: r.biggestProblems ?? '',
    revenueGenerated: r.revenueGenerated ?? '',
    followersGained: r.followersGained ?? '',
    leadsGenerated: r.leadsGenerated ?? '',
    eventsHeld: r.eventsHeld ?? '',
    sponsorsDonorsAdded: r.sponsorsDonorsAdded ?? '',
    hksiStudyProgress: r.hksiStudyProgress ?? '',
    bestPerformingContent: r.bestPerformingContent ?? '',
    mostValuableRelationshipBuilt: r.mostValuableRelationshipBuilt ?? '',
    projectDeservesMoreFocus: r.projectDeservesMoreFocus ?? '',
    projectShouldBeSimplified: r.projectShouldBeSimplified ?? '',
    nextMonthTop10Actions: r.nextMonthTop10Actions ?? '',
    nextMonthTaskIds: Array.isArray(r.nextMonthTaskIds) ? r.nextMonthTaskIds : [],
    monthlyTaskNotes: Array.isArray(r.monthlyTaskNotes) ? r.monthlyTaskNotes : [],
  };
}
