import { Link } from 'react-router-dom';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import type { DailyEntry, Task } from '../../types';
import { TASK_PRIORITY_LABELS } from '../../types';
import { useAppData } from '../../context/AppDataContext';
import { useToast } from '../../context/ToastContext';
import {
  getMasterTasksForDay,
  linkTasksToEntry,
  suggestTop3Candidates,
} from '../../utils/todayTasksSync';
import { applyTaskUpdateWithMetrics } from '../../utils/taskMetrics';
import { getEffectiveTaskStatus, isTaskCompleted } from '../../utils/taskStatus';
import { getTaskTitle } from '../../utils/taskTitle';
import { priorityVariant } from '../../utils/badges';
import { getPacingDateIso } from '../../utils/referenceDate';
import { cn } from '../../utils/cn';

interface TodayTasksPanelProps {
  dateIso: string;
  entry: DailyEntry;
  onEntryChange: (entry: DailyEntry) => void;
}

export function TodayTasksPanel({ dateIso, entry, onEntryChange }: TodayTasksPanelProps) {
  const { data, updateData } = useAppData();
  const { toast } = useToast();

  const masterTasks = getMasterTasksForDay(data, dateIso, entry);
  const pacingIso = getPacingDateIso(data.settings);

  const toggleComplete = (task: Task) => {
    const done = isTaskCompleted(getEffectiveTaskStatus(task));
    const now = new Date().toISOString();
    let metricMessage: string | undefined;
    updateData((prev) => {
      const result = applyTaskUpdateWithMetrics(prev, task.id, done
        ? { status: 'Not Started', completedAt: '', progressPercentage: 0 }
        : { status: 'Completed', completedAt: now, progressPercentage: 100 });
      metricMessage = result.metricMessage;
      return result.data;
    });
    toast(metricMessage ?? (done ? 'Task reopened' : 'Task completed'));
  };

  const setAsTop3 = (tasks: Task[]) => {
    onEntryChange(linkTasksToEntry(entry, tasks));
    updateData((prev) => {
      let next = prev;
      const ids = tasks.slice(0, 3).map((t) => t.id);
      const idSet = new Set(ids);
      next = {
        ...next,
        tasks: next.tasks.map((t) => ({ ...t, today: idSet.has(t.id) })),
      };
      return next;
    });
    toast('Top 3 linked to Master Tasks');
  };

  const applySuggestedTop3 = () => {
    setAsTop3(suggestTop3Candidates(data));
  };

  return (
    <Card className="mb-6">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Master Tasks (synced)
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Due {dateIso}, pinned for today, or in your Top 3 links
            {dateIso === pacingIso && ' · pacing day'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={applySuggestedTop3}
            className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            Suggest Top 3
          </button>
          <Link
            to={`/tasks?view=today`}
            className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white"
          >
            Open tasks →
          </Link>
        </div>
      </div>

      {entry.linkedTaskIds.length > 0 && (
        <p className="mb-3 text-xs text-violet-700">
          Linked: {entry.linkedTaskIds.length} task(s) · text field kept in sync
        </p>
      )}

      {masterTasks.length === 0 ? (
        <p className="text-sm text-slate-500">
          No open tasks for this day. Pin tasks on{' '}
          <Link to="/tasks" className="font-medium underline">
            Master Tasks
          </Link>{' '}
          or use Suggest Top 3.
        </p>
      ) : (
        <ul className="space-y-2">
          {masterTasks.map((task) => {
            const done = isTaskCompleted(getEffectiveTaskStatus(task));
            const inTop3 = entry.linkedTaskIds.includes(task.id);
            return (
              <li
                key={task.id}
                className={cn(
                  'flex items-start gap-3 rounded-lg border px-3 py-2',
                  inTop3 ? 'border-violet-200 bg-violet-50/50' : 'border-border bg-slate-50/80'
                )}
              >
                <button
                  type="button"
                  onClick={() => toggleComplete(task)}
                  className={cn(
                    'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px]',
                    done
                      ? 'border-green-500 bg-green-500 text-white'
                      : 'border-slate-300 hover:border-slate-500'
                  )}
                  aria-label={done ? 'Reopen' : 'Complete'}
                >
                  {done ? '✓' : ''}
                </button>
                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      'text-sm font-medium text-slate-900',
                      done && 'line-through opacity-60'
                    )}
                  >
                    {getTaskTitle(task)}
                  </p>
                  <p className="text-xs text-slate-500">
                    Due {task.deadline || '—'}
                    {task.today && ' · pinned'}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge variant={priorityVariant(task.priority)}>
                    {TASK_PRIORITY_LABELS[task.priority]}
                  </Badge>
                  {!inTop3 && (
                    <button
                      type="button"
                      onClick={() => {
                        const current = masterTasks.filter((t) =>
                          entry.linkedTaskIds.includes(t.id)
                        );
                        setAsTop3([...current, task].slice(0, 3));
                      }}
                      className="text-[10px] font-medium text-violet-700 underline"
                    >
                      + Top 3
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
