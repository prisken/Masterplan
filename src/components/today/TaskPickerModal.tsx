import { useMemo, useState } from 'react';
import type { Task } from '../../types';
import { TASK_PRIORITY_LABELS } from '../../types';
import { Badge } from '../ui/Badge';
import { cn } from '../../utils/cn';
import { priorityVariant } from '../../utils/badges';
import {
  deadlineLabel,
  filterTasksForPicker,
  type TaskPickerFilter,
} from '../../utils/reviewWorkHelpers';
import { getEffectiveTaskStatus, isTaskCompleted } from '../../utils/taskStatus';
import { getTaskTitle } from '../../utils/taskTitle';

const FILTERS: { id: TaskPickerFilter; label: string }[] = [
  { id: 'all', label: 'All open' },
  { id: 'overdue', label: 'Overdue' },
  { id: 'due_today', label: 'Due today' },
  { id: 'due_week', label: 'Due this week' },
  { id: 'p0', label: 'P0' },
  { id: 'p1', label: 'P1' },
  { id: 'pa', label: 'PA' },
  { id: 'mdrt', label: 'MDRT' },
  { id: 'recruitment', label: 'Recruitment' },
  { id: 'client', label: 'Client / prospecting' },
];

interface TaskPickerModalProps {
  open: boolean;
  onClose: () => void;
  anchorDateIso: string;
  refNow: Date;
  tasks: Task[];
  excludeIds: Set<string>;
  projectLabel: (projectId: string) => string;
  onAdd: (ids: string[]) => void;
  heading?: string;
}

export function TaskPickerModal({
  open,
  onClose,
  anchorDateIso,
  refNow,
  tasks,
  excludeIds,
  projectLabel,
  onAdd,
  heading = 'Add tasks to today',
}: TaskPickerModalProps) {
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<TaskPickerFilter>('all');
  const [picked, setPicked] = useState<Set<string>>(new Set());

  const openTasks = useMemo(
    () => tasks.filter((t) => !isTaskCompleted(getEffectiveTaskStatus(t, refNow))),
    [tasks, refNow]
  );

  const filtered = useMemo(() => {
    let list = filterTasksForPicker(openTasks, filter, anchorDateIso, refNow);
    if (q.trim()) {
      const s = q.trim().toLowerCase();
      list = list.filter(
        (t) =>
          getTaskTitle(t).toLowerCase().includes(s) ||
          t.module.toLowerCase().includes(s) ||
          projectLabel(t.projectId).toLowerCase().includes(s)
      );
    }
    return list.filter((t) => !excludeIds.has(t.id));
  }, [openTasks, filter, anchorDateIso, refNow, q, excludeIds, projectLabel]);

  if (!open) return null;

  const toggle = (id: string) => {
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const add = () => {
    onAdd([...picked]);
    setPicked(new Set());
    setQ('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <button type="button" className="absolute inset-0 bg-black/40" aria-label="Close" onClick={onClose} />
      <div className="relative flex max-h-[85vh] w-full max-w-lg flex-col rounded-xl border border-border bg-white shadow-xl">
        <div className="border-b border-border px-4 py-3">
          <h3 className="text-base font-semibold text-slate-900">{heading}</h3>
          <p className="mt-1 text-xs text-slate-500">Search and filter the master list. Nothing is deleted.</p>
          <input
            type="search"
            className="mt-3 w-full rounded-lg border border-border px-3 py-2 text-sm"
            placeholder="Search title, module, project…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <div className="mt-2 flex flex-wrap gap-1">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                className={cn(
                  'rounded-full px-2.5 py-0.5 text-[11px] font-medium',
                  filter === f.id ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
        <ul className="min-h-0 flex-1 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <li className="p-4 text-center text-sm text-slate-500">No matching tasks.</li>
          ) : (
            filtered.map((t) => (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => toggle(t.id)}
                  className={cn(
                    'mb-1 flex w-full items-start gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-colors',
                    picked.has(t.id) ? 'border-violet-400 bg-violet-50' : 'border-transparent hover:bg-slate-50'
                  )}
                >
                  <span
                    className={cn(
                      'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border text-[10px]',
                      picked.has(t.id) ? 'border-violet-600 bg-violet-600 text-white' : 'border-slate-300'
                    )}
                  >
                    {picked.has(t.id) ? '✓' : ''}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="font-medium text-slate-900">{getTaskTitle(t)}</span>
                    <span className="mt-0.5 block text-xs text-slate-500">
                      {projectLabel(t.projectId)} · {t.module} · {deadlineLabel(t, anchorDateIso)}
                    </span>
                  </span>
                  <Badge variant={priorityVariant(t.priority)} className="shrink-0 text-[10px]">
                    {TASK_PRIORITY_LABELS[t.priority]}
                  </Badge>
                </button>
              </li>
            ))
          )}
        </ul>
        <div className="flex justify-end gap-2 border-t border-border px-4 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-slate-700"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={add}
            disabled={picked.size === 0}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
          >
            Add {picked.size || ''} to today
          </button>
        </div>
      </div>
    </div>
  );
}
