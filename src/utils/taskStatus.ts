import type { Task, TaskStatus } from '../types';
import { parseDate, startOfDay } from './taskDeadline';
import { getReferenceDate } from './referenceDate';

const STATUS_MAP: Record<string, TaskStatus> = {
  Done: 'Completed',
  Delayed: 'Deferred',
  Completed: 'Completed',
  Overdue: 'Overdue',
  Deferred: 'Deferred',
  'Not Started': 'Not Started',
  'In Progress': 'In Progress',
  Waiting: 'Waiting',
};

export function normalizeTaskStatus(raw: string | undefined): TaskStatus {
  if (!raw) return 'Not Started';
  return STATUS_MAP[raw] ?? 'Not Started';
}

export function isTaskCompleted(status: TaskStatus): boolean {
  return status === 'Completed';
}

export function isTaskOpen(status: TaskStatus): boolean {
  return !isTaskCompleted(status) && status !== 'Deferred';
}

export function getEffectiveTaskStatus(task: Task, now = getReferenceDate()): TaskStatus {
  if (task.status === 'Completed' || task.status === 'Deferred') return task.status;
  if (task.deadline) {
    const d = parseDate(task.deadline);
    if (d && d < startOfDay(now)) return 'Overdue';
  }
  if (task.status === 'Overdue') return 'Overdue';
  return task.status;
}

export function syncTaskProgress(status: TaskStatus, progressPercentage: number): number {
  if (status === 'Completed') return 100;
  if (status === 'Not Started' && progressPercentage === 0) return 0;
  return Math.min(100, Math.max(0, progressPercentage));
}
