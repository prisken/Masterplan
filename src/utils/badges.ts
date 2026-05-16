import type { TaskPriority, TaskStatus } from '../types';
import type { BadgeProps } from '../components/ui/Badge';

export function priorityVariant(priority: TaskPriority): BadgeProps['variant'] {
  if (priority === 'P0') return 'danger';
  if (priority === 'P1') return 'warning';
  return 'default';
}

export function priorityClass(priority: TaskPriority): string {
  if (priority === 'P0') return 'bg-red-100 text-red-800';
  if (priority === 'P1') return 'bg-orange-100 text-orange-800';
  if (priority === 'P2') return 'bg-amber-100 text-amber-800';
  return 'bg-slate-100 text-slate-700';
}

export function statusVariant(status: TaskStatus): BadgeProps['variant'] {
  if (status === 'Completed') return 'success';
  if (status === 'Overdue') return 'danger';
  if (status === 'Deferred') return 'neutral';
  if (status === 'In Progress') return 'warning';
  return 'neutral';
}
