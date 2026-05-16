import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import type { Task, TaskPriority, TaskStatus } from '../../types';
import { TASK_PRIORITY_LABELS } from '../../types';
import { priorityClass, statusVariant } from '../../utils/badges';
import { getDeadlineUrgency, urgencyStyles } from '../../utils/taskDeadline';
import { getProjectById } from '../../utils/projectColors';
import type { Project } from '../../types';
import { cn } from '../../utils/cn';
import { getMetricDefinition } from '../../constants/taskMetricKeys';
import { getTaskTitle } from '../../utils/taskTitle';
import { getEffectiveTaskStatus, isTaskCompleted } from '../../utils/taskStatus';
import { formatDaysRemaining } from '../../utils/taskStats';

interface TaskListItemProps {
  task: Task;
  projects: Project[];
  onToggleDone: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate?: () => void;
  onQuickPriority?: (p: TaskPriority) => void;
  onQuickStatus?: (s: TaskStatus) => void;
}

export function TaskListItem({
  task,
  projects,
  onToggleDone,
  onEdit,
  onDelete,
  onDuplicate,
  onQuickPriority,
  onQuickStatus,
}: TaskListItemProps) {
  const project = getProjectById(projects, task.projectId);
  const effectiveStatus = getEffectiveTaskStatus(task);
  const completed = isTaskCompleted(effectiveStatus);
  const urgency = getDeadlineUrgency(task);
  const style = urgencyStyles[urgency];
  const daysLabel = formatDaysRemaining(task.deadline);

  return (
    <Card padding="sm" className={cn('border-l-4', style.border, style.bg)}>
      <div className="flex flex-wrap items-start gap-3">
        <button
          type="button"
          onClick={onToggleDone}
          className={cn(
            'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-xs',
            completed
              ? 'border-green-500 bg-green-500 text-white'
              : 'border-slate-300 hover:border-slate-500'
          )}
          aria-label={completed ? 'Mark incomplete' : 'Mark completed'}
        >
          {completed ? '✓' : ''}
        </button>

        <div className="min-w-0 flex-1">
          <p
            className={cn(
              'font-medium',
              style.text,
              completed && 'line-through opacity-70'
            )}
          >
            {getTaskTitle(task)}
          </p>
          <p className="mt-0.5 text-xs text-slate-500">
            {project?.projectName ?? '—'}
            {task.module && ` · ${task.module}`}
            {task.owner && ` · ${task.owner}`}
          </p>
          {task.deadline && (
            <p className={cn('mt-1 text-xs font-medium', style.text)}>
              Due {task.deadline}
              {daysLabel && ` · ${daysLabel}`}
              {style.label && ` · ${style.label}`}
            </p>
          )}
          {task.metricKey && (
            <p className="mt-0.5 text-xs font-medium text-violet-700">
              ↗ {getMetricDefinition(task.metricKey)?.label ?? task.metricKey}
              {task.metricMode === 'set'
                ? ` → ${task.metricValue}`
                : ` +${task.metricValue || 1}`}
            </p>
          )}
          {task.successMetric && (
            <p className="mt-0.5 text-xs text-slate-400">Success: {task.successMetric}</p>
          )}
          {task.progressPercentage > 0 && task.progressPercentage < 100 && (
            <p className="mt-0.5 text-xs text-slate-500">{task.progressPercentage}% complete</p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className={cn(
              'rounded-full px-2 py-0.5 text-xs font-medium',
              priorityClass(task.priority)
            )}
          >
            {TASK_PRIORITY_LABELS[task.priority]}
          </span>
          <Badge variant={statusVariant(effectiveStatus)}>{effectiveStatus}</Badge>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2 border-t border-border/60 pt-3">
        <button type="button" onClick={onEdit} className="text-xs font-medium text-slate-600 hover:text-slate-900">
          Edit
        </button>
        {onDuplicate && (
          <button type="button" onClick={onDuplicate} className="text-xs font-medium text-slate-600 hover:text-slate-900">
            Duplicate
          </button>
        )}
        {onQuickPriority && task.priority !== 'P0' && (
          <button type="button" onClick={() => onQuickPriority('P0')} className="text-xs font-medium text-red-600">
            → P0
          </button>
        )}
        {onQuickStatus && !completed && (
          <button type="button" onClick={() => onQuickStatus('Completed')} className="text-xs font-medium text-green-700">
            Complete
          </button>
        )}
        <button type="button" onClick={onDelete} className="text-xs font-medium text-red-600 hover:text-red-700">
          Delete
        </button>
      </div>
    </Card>
  );
}
