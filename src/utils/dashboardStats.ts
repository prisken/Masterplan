import type { AppData, Project, Task } from '../types';
import { computeFinanceTotals } from './financeStats';
import { getReferenceDate } from './referenceDate';

export interface DashboardStats {
  activeProjects: number;
  openTasks: number;
  doneTasks: number;
  highPriorityTasks: number;
  urgentTasks: number;
  contacts: number;
  followUpsDue: number;
  contentScheduled: number;
  contentPublished: number;
  upcomingEvents: number;
  incomeTotal: number;
  expensesTotal: number;
  todayTasks: Task[];
  highImpactTasks: Task[];
  upcomingDeadlines: Task[];
}

export function computeDashboardStats(data: AppData): DashboardStats {
  const { projects, tasks } = data;

  const activeProjects = projects.filter(
    (p) => p.status === 'Active' || p.status === 'Building'
  ).length;

  const openTasks = tasks.filter((t) => t.status !== 'Completed' && t.status !== 'Deferred').length;
  const doneTasks = tasks.filter((t) => t.status === 'Completed').length;
  const highPriorityTasks = tasks.filter(
    (t) =>
      (t.priority === 'P0' || t.priority === 'P1') &&
      t.status !== 'Completed' &&
      t.status !== 'Deferred'
  ).length;
  const urgentTasks = tasks.filter(
    (t) =>
      t.priority === 'P0' && t.status !== 'Completed' && t.status !== 'Deferred'
  ).length;

  const contacts = data.contacts.length;
  const pacingToday = getReferenceDate();
  const followUpsDue = data.contacts.filter((c) => {
    if (!c.nextFollowUpDate) return false;
    const d = new Date(c.nextFollowUpDate + 'T00:00:00');
    return !Number.isNaN(d.getTime()) && d <= pacingToday;
  }).length;

  const todayTasks = tasks
    .filter((t) => t.today && t.status !== 'Completed' && t.status !== 'Deferred')
    .slice(0, 3);

  const highImpactTasks = tasks
    .filter((t) => t.impact === 'High' && t.status !== 'Completed' && t.status !== 'Deferred')
    .slice(0, 5);

  const upcomingDeadlines = tasks
    .filter((t) => {
      if (!t.deadline || t.status === 'Completed' || t.status === 'Deferred') return false;
      const d = new Date(t.deadline + 'T00:00:00');
      return !Number.isNaN(d.getTime()) && d >= pacingToday;
    })
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
    .slice(0, 5);

  const contentScheduled = data.content.filter((c) => c.status === 'Scheduled').length;
  const contentPublished = data.content.filter((c) => c.status === 'Published').length;
  const upcomingEvents = data.events.filter((e) => {
    if (!e.date || e.status === 'Completed' || e.status === 'Cancelled') return false;
    const d = new Date(e.date + 'T00:00:00');
    return !Number.isNaN(d.getTime()) && d >= pacingToday;
  }).length;

  const financeTotals = computeFinanceTotals(data.finance);

  return {
    activeProjects,
    openTasks,
    doneTasks,
    highPriorityTasks,
    urgentTasks,
    contacts,
    followUpsDue,
    contentScheduled,
    contentPublished,
    upcomingEvents,
    incomeTotal: financeTotals.income,
    expensesTotal: financeTotals.expenses,
    todayTasks,
    highImpactTasks,
    upcomingDeadlines,
  };
}

export function getProjectTaskCounts(projectId: string, tasks: Task[]) {
  const projectTasks = tasks.filter((t) => t.projectId === projectId);
  return {
    total: projectTasks.length,
    open: projectTasks.filter((t) => t.status !== 'Completed' && t.status !== 'Deferred').length,
    done: projectTasks.filter((t) => t.status === 'Completed').length,
  };
}

/** Task completion % for progress bars (excludes Deferred from denominator). */
export function computeProjectTaskProgress(projectId: string, tasks: Task[]): number {
  const projectTasks = tasks.filter(
    (t) => t.projectId === projectId && t.status !== 'Deferred'
  );
  if (projectTasks.length === 0) return 0;
  const done = projectTasks.filter((t) => t.status === 'Completed').length;
  return Math.round((done / projectTasks.length) * 100);
}

export function sortProjects(projects: Project[]): Project[] {
  const order = [
    'advisor-growth-center',
    'profit-pulse-ally',
    'investment-news-channel',
    'mama-supreme',
    'hksi-papers',
    'eternal-moments',
  ];
  return [...projects].sort(
    (a, b) => order.indexOf(a.id) - order.indexOf(b.id)
  );
}
