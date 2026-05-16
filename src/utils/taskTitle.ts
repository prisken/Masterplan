import type { Task } from '../types';

export function getTaskTitle(task: Pick<Task, 'title' | 'taskName'>): string {
  const t = task.title?.trim();
  if (t) return t;
  const legacy = task.taskName?.trim();
  return legacy || 'Untitled task';
}
