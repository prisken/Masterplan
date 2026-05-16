import type { Task, TaskPriority } from '../types';
import { parseDate, startOfDay } from './taskDeadline';
import { getEffectiveTaskStatus, isTaskCompleted } from './taskStatus';
import { getReferenceDate } from './referenceDate';

const PRIORITY_ORDER: Record<TaskPriority, number> = {
  P0: 0,
  P1: 1,
  P2: 2,
  P3: 3,
};

function urgencyBucket(task: Task, now: Date): number {
  const status = getEffectiveTaskStatus(task, now);
  if (isTaskCompleted(status)) return 6;
  const d = parseDate(task.deadline);
  if (!d) return 5;
  const today = startOfDay(now);
  const diffDays = Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return 0;
  if (diffDays <= 7 && task.priority === 'P0') return 1;
  if (diffDays <= 7 && task.priority === 'P1') return 2;
  if (diffDays <= 30) return 3;
  return 4;
}

export function compareTasksByUrgency(a: Task, b: Task, now = getReferenceDate()): number {
  const ba = urgencyBucket(a, now);
  const bb = urgencyBucket(b, now);
  if (ba !== bb) return ba - bb;
  if (ba === 6 && bb === 6) {
    const ca = parseDate(a.completedAt || a.deadline);
    const cb = parseDate(b.completedAt || b.deadline);
    if (ca && cb) return cb.getTime() - ca.getTime();
  }
  const da = parseDate(a.deadline);
  const db = parseDate(b.deadline);
  if (da && db) {
    const diff = da.getTime() - db.getTime();
    if (diff !== 0) return diff;
  } else if (da && !db) return -1;
  else if (!da && db) return 1;
  const po = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
  if (po !== 0) return po;
  return a.title.localeCompare(b.title);
}

/** @deprecated use compareTasksByUrgency */
export function compareTasksByDeadlineAndPriority(a: Task, b: Task): number {
  return compareTasksByUrgency(a, b);
}
