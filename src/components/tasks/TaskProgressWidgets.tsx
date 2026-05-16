import { Card } from '../ui/Card';
import { ProgressBar } from '../ui/ProgressBar';
import type { TrackProgress } from '../../utils/taskProgress';
import { cn } from '../../utils/cn';

interface TaskProgressWidgetsProps {
  tracks: TrackProgress[];
}

export function TaskProgressWidgets({ tracks }: TaskProgressWidgetsProps) {
  return (
    <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {tracks.map((t) => (
        <Card key={t.label} padding="sm">
          <div className="mb-2 flex items-start justify-between gap-2">
            <p className="text-sm font-semibold text-slate-900">{t.label}</p>
            <span className="text-xs font-medium text-slate-500">
              {t.done}/{t.total}
            </span>
          </div>
          <ProgressBar
            value={t.percent}
            accentClass="bg-credibility"
            size="sm"
            showLabel={false}
          />
          <p className="mt-2 text-xs text-slate-500">
            Internal: {t.internalDeadline}
            {t.daysToInternal !== null && (
              <span
                className={cn(
                  'ml-1 font-medium',
                  t.daysToInternal < 0 ? 'text-red-600' : 'text-slate-600'
                )}
              >
                ({t.daysToInternal}d)
              </span>
            )}
          </p>
          <p className="text-xs text-slate-500">
            Final: {t.finalDeadline}
            {t.overdueCount > 0 && (
              <span className="ml-1 font-medium text-red-600">{t.overdueCount} overdue</span>
            )}
          </p>
        </Card>
      ))}
    </div>
  );
}
