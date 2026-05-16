import type { Task, TaskPriority, TaskTrack } from '../types';
import { resolveTaskMetricFields } from './taskMetrics';
import { normalizeTaskStatus, syncTaskProgress } from './taskStatus';

const LEGACY_PRIORITY: Record<string, TaskPriority> = {
  Urgent: 'P0',
  High: 'P1',
  Medium: 'P2',
  Low: 'P3',
};

const DEFAULT_DEADLINE_BY_PRIORITY: Record<TaskPriority, string> = {
  P0: '2026-05-22',
  P1: '2026-06-07',
  P2: '2026-06-30',
  P3: '2026-07-15',
};

export function normalizePriority(p: string): TaskPriority {
  if (p === 'P0' || p === 'P1' || p === 'P2' || p === 'P3') return p;
  return LEGACY_PRIORITY[p] ?? 'P2';
}

export function migrateTask(raw: Partial<Task> & { priority?: string; taskName?: string }): Task {
  const priority = normalizePriority(raw.priority ?? 'P2');
  const title = (raw.title ?? raw.taskName ?? '').trim();
  const status = normalizeTaskStatus(raw.status);
  const progressPercentage = syncTaskProgress(
    status,
    raw.progressPercentage ?? (status === 'Completed' ? 100 : 0)
  );
  const now = new Date().toISOString();

  const base: Task = {
    id: raw.id ?? '',
    title,
    projectId: raw.projectId ?? '',
    module: raw.module ?? raw.area ?? 'General',
    area: raw.area ?? 'Admin',
    priority,
    status,
    deadline: raw.deadline ?? DEFAULT_DEADLINE_BY_PRIORITY[priority],
    owner: raw.owner ?? 'You',
    dependency: raw.dependency ?? '',
    successMetric: raw.successMetric ?? '',
    progressPercentage,
    timeNeeded: raw.timeNeeded ?? '1 hour',
    energyLevel: raw.energyLevel ?? 'Medium',
    impact: raw.impact ?? 'Medium',
    track: (raw.track as TaskTrack) ?? '',
    metricKey: raw.metricKey ?? '',
    metricMode: raw.metricMode ?? 'set',
    metricValue: raw.metricValue ?? 0,
    metricSnapshot: raw.metricSnapshot,
    today: raw.today ?? false,
    thisWeek: raw.thisWeek ?? false,
    notes: raw.notes ?? '',
    createdAt: raw.createdAt ?? now,
    updatedAt: raw.updatedAt ?? now,
    completedAt:
      raw.completedAt ?? (status === 'Completed' ? raw.updatedAt ?? now : ''),
  };

  return resolveTaskMetricFields(base);
}

export function migrateTasks(tasks: Partial<Task>[]): Task[] {
  return tasks.map((t) => migrateTask(t));
}
