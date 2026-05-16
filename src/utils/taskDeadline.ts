import type { Task } from '../types';
import { getReferenceDate } from './referenceDate';
import { getEffectiveTaskStatus, isTaskCompleted } from './taskStatus';

export type DeadlineUrgency = 'none' | 'completed' | 'overdue' | 'week' | 'month' | 'ok';

export function parseDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  const d = new Date(dateStr + 'T00:00:00');
  return Number.isNaN(d.getTime()) ? null : d;
}

export function startOfDay(d = new Date()): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function getDeadlineUrgency(task: Task, now = getReferenceDate()): DeadlineUrgency {
  if (isTaskCompleted(getEffectiveTaskStatus(task, now))) return 'completed';
  const deadline = parseDate(task.deadline);
  if (!deadline) return 'none';

  const today = startOfDay(now);
  const diffDays = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'overdue';
  if (diffDays <= 7) return 'week';
  if (diffDays <= 30) return 'month';
  return 'ok';
}

export const urgencyStyles: Record<
  DeadlineUrgency,
  { border: string; bg: string; text: string; label: string }
> = {
  none: { border: 'border-border', bg: 'bg-white', text: 'text-slate-700', label: '' },
  completed: {
    border: 'border-green-200',
    bg: 'bg-green-50',
    text: 'text-green-800',
    label: 'Completed',
  },
  overdue: {
    border: 'border-red-300',
    bg: 'bg-red-50',
    text: 'text-red-800',
    label: 'Overdue',
  },
  week: {
    border: 'border-orange-300',
    bg: 'bg-orange-50',
    text: 'text-orange-900',
    label: 'Due ≤7d',
  },
  month: {
    border: 'border-amber-200',
    bg: 'bg-amber-50',
    text: 'text-amber-900',
    label: 'Due ≤30d',
  },
  ok: { border: 'border-border', bg: 'bg-white', text: 'text-slate-700', label: '' },
};

export function isToday(deadline: string, now = getReferenceDate()): boolean {
  const d = parseDate(deadline);
  if (!d) return false;
  const t = startOfDay(now);
  return d.getTime() === t.getTime();
}

export function isThisWeek(deadline: string, now = getReferenceDate()): boolean {
  const d = parseDate(deadline);
  if (!d) return false;
  const t = startOfDay(now);
  const day = t.getDay();
  const monday = new Date(t);
  monday.setDate(t.getDate() - day + (day === 0 ? -6 : 1));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return d >= monday && d <= sunday;
}

export function isThisMonth(deadline: string, now = getReferenceDate()): boolean {
  const d = parseDate(deadline);
  if (!d) return false;
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
}

export function isOverdueTask(task: Task, now = getReferenceDate()): boolean {
  if (isTaskCompleted(getEffectiveTaskStatus(task, now))) return false;
  return getDeadlineUrgency(task, now) === 'overdue';
}

export function isUpcoming30Days(task: Task, now = getReferenceDate()): boolean {
  if (isTaskCompleted(getEffectiveTaskStatus(task, now)) || !task.deadline) return false;
  const d = parseDate(task.deadline);
  if (!d) return false;
  const t = startOfDay(now);
  const in30 = new Date(t);
  in30.setDate(t.getDate() + 30);
  return d >= t && d <= in30;
}
