import { useState } from 'react';
import type { AppData, DailyEntry, DailyTaskIntentKind, Task } from '../../types';
import { TASK_PRIORITY_LABELS } from '../../types';
import { taskPriorities, taskStatuses } from '../../constants/options';
import { useToast } from '../../context/ToastContext';
import { applyTaskUpdateWithMetrics } from '../../utils/taskMetrics';
import {
  appendNoteWithTimestamp,
  deadlineLabel,
  getDailyTaskIntent,
  getDailyTaskNote,
  upsertDailyTaskIntent,
  upsertDailyTaskNote,
} from '../../utils/reviewWorkHelpers';
import { getEffectiveTaskStatus, isTaskCompleted } from '../../utils/taskStatus';
import { getTaskTitle } from '../../utils/taskTitle';
import { priorityVariant } from '../../utils/badges';
import { cn } from '../../utils/cn';
import { Badge } from '../ui/Badge';
import { FormField, inputClass, selectClass, textareaClass } from '../ui/FormField';
import { TaskWorkLogEditor } from './TaskWorkLogEditor';

function buildDailySummaryForAppend(note: ReturnType<typeof getDailyTaskNote>): string {
  if (!note) return '';
  const parts = [
    note.whatDidToday?.trim() && `Did: ${note.whatDidToday.trim()}`,
    note.outcome?.trim() && `Outcome: ${note.outcome.trim()}`,
    note.blocker?.trim() && `Blocker: ${note.blocker.trim()}`,
    note.nextStep?.trim() && `Next: ${note.nextStep.trim()}`,
    note.timeSpentMinutes != null && `Time: ${note.timeSpentMinutes}m`,
    note.progressNote?.trim() && `Progress: ${note.progressNote.trim()}`,
  ].filter(Boolean) as string[];
  return parts.join(' · ');
}

const INTENT_OPTIONS: { id: DailyTaskIntentKind; label: string }[] = [
  { id: 'aim_today', label: 'Aim today' },
  { id: 'optional', label: 'If time' },
  { id: 'blocked', label: 'Blocked' },
  { id: 'carry_forward', label: 'Carried' },
];

interface LinkedTaskCardProps {
  task: Task;
  entry: DailyEntry;
  anchorDateIso: string;
  projectName: string;
  refNow: Date;
  onEntryChange: (next: DailyEntry) => void;
  updateData: (fn: (prev: AppData) => AppData) => void;
  onRemoveFromToday: () => void;
  onMoveToTomorrow: () => void;
}

export function LinkedTaskCard({
  task,
  entry,
  anchorDateIso,
  projectName,
  refNow,
  onEntryChange,
  updateData,
  onRemoveFromToday,
  onMoveToTomorrow,
}: LinkedTaskCardProps) {
  const { toast } = useToast();
  const [expanded, setExpanded] = useState(false);
  const intent = getDailyTaskIntent(entry, task.id);
  const dailyNote = getDailyTaskNote(entry, task.id);
  const done = isTaskCompleted(getEffectiveTaskStatus(task, refNow));

  const patchTask = (patch: Partial<Task>) => {
    updateData((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) =>
        t.id === task.id ? { ...t, ...patch, updatedAt: new Date().toISOString() } : t
      ),
    }));
  };

  const markComplete = () => {
    let msg: string | undefined;
    updateData((prev) => {
      const now = new Date().toISOString();
      const res = applyTaskUpdateWithMetrics(prev, task.id, {
        status: 'Completed',
        completedAt: now,
        progressPercentage: 100,
      });
      msg = res.metricMessage;
      return res.data;
    });
    toast(msg ?? 'Marked complete');
  };

  const markInProgress = () => {
    patchTask({
      status: 'In Progress',
      completedAt: '',
      progressPercentage: task.progressPercentage || 0,
    });
  };

  const setIntent = (i: DailyTaskIntentKind) => {
    onEntryChange(upsertDailyTaskIntent(entry, task.id, i));
  };

  const appendPermanent = () => {
    const summary = buildDailySummaryForAppend(dailyNote);
    if (!summary) {
      toast('Add a work log first', 'error');
      return;
    }
    if (
      !window.confirm(
        "Append today's work summary to this task's permanent notes? (Does not remove today's log.)"
      )
    )
      return;
    updateData((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) =>
        t.id === task.id
          ? {
              ...t,
              notes: appendNoteWithTimestamp(t.notes ?? '', summary),
              updatedAt: new Date().toISOString(),
            }
          : t
      ),
    }));
    toast('Appended to task notes');
  };

  return (
    <div
      className={cn(
        'rounded-xl border bg-white',
        done ? 'border-slate-200 opacity-80' : 'border-border'
      )}
    >
      <div className="flex flex-wrap items-start gap-2 px-3 py-2">
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="min-w-0 flex-1 text-left"
        >
          <p className={cn('text-sm font-semibold text-slate-900', done && 'line-through')}>
            {getTaskTitle(task)}
          </p>
          <p className="text-[11px] text-slate-500">
            {projectName} · {task.module || '—'} · {deadlineLabel(task, anchorDateIso)} ·{' '}
            {getEffectiveTaskStatus(task, refNow)}
            {task.progressPercentage ? ` · ${task.progressPercentage}%` : ''}
          </p>
        </button>
        <Badge variant={priorityVariant(task.priority)} className="text-[10px]">
          {TASK_PRIORITY_LABELS[task.priority]}
        </Badge>
      </div>

      <div className="flex flex-wrap gap-1 border-t border-border px-3 py-2">
        {INTENT_OPTIONS.map((o) => (
          <button
            key={o.id}
            type="button"
            onClick={() => setIntent(o.id)}
            className={cn(
              'rounded-full px-2 py-0.5 text-[10px] font-medium',
              intent === o.id ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            )}
          >
            {o.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-1 border-t border-border px-3 py-2">
        <button
          type="button"
          disabled={done}
          onClick={markComplete}
          className="rounded-lg bg-green-600 px-2 py-1 text-[11px] font-medium text-white disabled:opacity-40"
        >
          Done
        </button>
        <button
          type="button"
          disabled={done}
          onClick={markInProgress}
          className="rounded-lg border border-border px-2 py-1 text-[11px] font-medium text-slate-700 disabled:opacity-40"
        >
          In progress
        </button>
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="rounded-lg border border-border px-2 py-1 text-[11px] font-medium text-slate-700"
        >
          {expanded ? 'Less' : 'Notes'}
        </button>
        <button
          type="button"
          disabled={done}
          onClick={onMoveToTomorrow}
          className="rounded-lg border border-border px-2 py-1 text-[11px] font-medium text-slate-700 disabled:opacity-40"
        >
          Tomorrow
        </button>
        <button
          type="button"
          onClick={onRemoveFromToday}
          className="rounded-lg border border-red-200 px-2 py-1 text-[11px] font-medium text-red-700"
        >
          Remove
        </button>
      </div>

      {expanded && (
        <div className="space-y-3 border-t border-border px-3 py-3">
          <div className="grid gap-3 sm:grid-cols-3">
            <FormField label="Status">
              <select
                className={selectClass}
                value={task.status}
                onChange={(e) =>
                  patchTask({
                    status: e.target.value as Task['status'],
                    completedAt:
                      e.target.value === 'Completed' ? new Date().toISOString() : '',
                    progressPercentage:
                      e.target.value === 'Completed' ? 100 : task.progressPercentage,
                  })
                }
              >
                {taskStatuses.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Priority">
              <select
                className={selectClass}
                value={task.priority}
                onChange={(e) => patchTask({ priority: e.target.value as Task['priority'] })}
              >
                {taskPriorities.map((p) => (
                  <option key={p} value={p}>
                    {TASK_PRIORITY_LABELS[p]}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Deadline">
              <input
                type="date"
                className={inputClass}
                value={task.deadline}
                onChange={(e) => patchTask({ deadline: e.target.value })}
              />
            </FormField>
          </div>
          <FormField label="Progress %">
            <input
              type="number"
              min={0}
              max={100}
              className={inputClass}
              value={task.progressPercentage}
              onChange={(e) => patchTask({ progressPercentage: Number(e.target.value) })}
            />
          </FormField>
          <FormField label="Permanent task notes">
            <textarea
              className={textareaClass}
              rows={3}
              value={task.notes}
              onChange={(e) => patchTask({ notes: e.target.value })}
            />
          </FormField>
          <TaskWorkLogEditor
            note={dailyNote}
            taskId={task.id}
            onChange={(n) => onEntryChange(upsertDailyTaskNote(entry, n))}
          />
          <button
            type="button"
            onClick={appendPermanent}
            className="text-xs font-medium text-violet-700 underline"
          >
            Append today's log to permanent notes
          </button>
        </div>
      )}
    </div>
  );
}
