import { Link } from 'react-router-dom';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import type { PriorityGroup } from '../../utils/dailyPriority';
import { getTaskTitle } from '../../utils/taskTitle';
import { TASK_PRIORITY_LABELS } from '../../types';
import { priorityVariant } from '../../utils/badges';
import { formatDaysRemaining } from '../../utils/taskStats';

export function DailyPriorityPanel({ groups }: { groups: PriorityGroup[] }) {
  if (groups.length === 0) {
    return (
      <Card>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Today&apos;s recommended focus
        </h2>
        <p className="mt-2 text-sm text-slate-500">No priority tasks — great progress.</p>
      </Card>
    );
  }

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Today&apos;s recommended focus
        </h2>
        <Link to="/tasks?view=today" className="text-xs font-medium text-slate-600 underline">
          All tasks →
        </Link>
      </div>
      <div className="space-y-4">
        {groups.map((g) => (
          <div key={g.label}>
            <p className="mb-2 text-xs font-semibold text-slate-600">{g.label}</p>
            <ul className="space-y-2">
              {g.tasks.slice(0, 5).map((t) => (
                <li
                  key={t.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-slate-50/80 px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900">
                      {getTaskTitle(t)}
                    </p>
                    <p className="text-xs text-slate-500">
                      {t.module || '—'} · {formatDaysRemaining(t.deadline)}
                    </p>
                  </div>
                  <Badge variant={priorityVariant(t.priority)}>
                    {TASK_PRIORITY_LABELS[t.priority]}
                  </Badge>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Card>
  );
}
