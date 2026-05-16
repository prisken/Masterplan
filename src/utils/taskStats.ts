import type { AppData, Task } from '../types';
import { getEffectiveTaskStatus, isTaskCompleted, isTaskOpen } from './taskStatus';
import { isOverdueTask, isThisMonth, isThisWeek } from './taskDeadline';
import { getReferenceDate } from './referenceDate';
import { getAdvisorProgressWidgets } from './taskProgress';
import { getTaskTitle } from './taskTitle';

export interface TaskSummaryStats {
  total: number;
  open: number;
  completed: number;
  overdue: number;
  dueThisWeek: number;
  dueThisMonth: number;
  p0Open: number;
  p0Overdue: number;
}

export function computeTaskSummaryStats(tasks: Task[], now = getReferenceDate()): TaskSummaryStats {
  const openTasks = tasks.filter((t) => isTaskOpen(getEffectiveTaskStatus(t, now)));
  return {
    total: tasks.length,
    open: openTasks.length,
    completed: tasks.filter((t) => isTaskCompleted(getEffectiveTaskStatus(t, now))).length,
    overdue: openTasks.filter((t) => isOverdueTask(t, now)).length,
    dueThisWeek: openTasks.filter(
      (t) => t.thisWeek || (!!t.deadline && isThisWeek(t.deadline, now))
    ).length,
    dueThisMonth: openTasks.filter((t) => !!t.deadline && isThisMonth(t.deadline, now)).length,
    p0Open: openTasks.filter((t) => t.priority === 'P0').length,
    p0Overdue: openTasks.filter((t) => t.priority === 'P0' && isOverdueTask(t, now)).length,
  };
}

export interface ExecutionDashboardStats {
  taskSummary: TaskSummaryStats;
  trackWidgets: ReturnType<typeof getAdvisorProgressWidgets>;
  agentsOnboarded: number;
  agentsTarget: number;
}

export function computeExecutionDashboardStats(data: AppData): ExecutionDashboardStats {
  return {
    taskSummary: computeTaskSummaryStats(data.tasks),
    trackWidgets: getAdvisorProgressWidgets(data.tasks),
    agentsOnboarded: data.advisor.recruitment.agentsOnboarded,
    agentsTarget: data.advisor.recruitment.agentsTarget,
  };
}

export function formatDaysRemaining(deadline: string, now = getReferenceDate()): string {
  if (!deadline) return '';
  const d = new Date(deadline + 'T00:00:00');
  const t = new Date(now);
  t.setHours(0, 0, 0, 0);
  const diff = Math.ceil((d.getTime() - t.getTime()) / (1000 * 60 * 60 * 24));
  if (diff < 0) return `${Math.abs(diff)}d overdue`;
  if (diff === 0) return 'Due today';
  return `${diff}d left`;
}

export { getTaskTitle };
