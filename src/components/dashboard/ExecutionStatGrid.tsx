import { Link } from 'react-router-dom';
import { StatCard } from '../ui/StatCard';
import type { TaskSummaryStats } from '../../utils/taskStats';
import type { TrackProgress } from '../../utils/taskProgress';

interface ExecutionStatGridProps {
  taskSummary: TaskSummaryStats;
  trackWidgets: TrackProgress[];
  agentsOnboarded: number;
  agentsTarget: number;
}

export function ExecutionStatGrid({
  taskSummary,
  trackWidgets,
  agentsOnboarded,
  agentsTarget,
}: ExecutionStatGridProps) {
  const track = (id: string) => trackWidgets.find((t) => t.label.toLowerCase().includes(id));

  return (
    <div className="space-y-6">
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Task execution
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
          <StatCard
            label="Total tasks"
            value={taskSummary.total}
            icon="☑"
            accent="bg-slate-100 text-slate-700"
          />
          <StatCard
            label="Overdue"
            value={taskSummary.overdue}
            sublabel="open past deadline"
            icon="!"
            accent="bg-red-100 text-red-700"
          />
          <StatCard
            label="Due this week"
            value={taskSummary.dueThisWeek}
            icon="◷"
            accent="bg-orange-100 text-orange-700"
          />
          <StatCard
            label="Due this month"
            value={taskSummary.dueThisMonth}
            icon="▦"
            accent="bg-amber-100 text-amber-700"
          />
          <StatCard
            label="P0 critical"
            value={taskSummary.p0Open}
            sublabel={`${taskSummary.p0Overdue} overdue`}
            icon="⚡"
            accent="bg-red-100 text-red-800"
          />
          <StatCard
            label="Completed"
            value={taskSummary.completed}
            icon="✓"
            accent="bg-green-100 text-green-700"
          />
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Year-end goals (task checklist)
          </h2>
          <Link to="/advisor" className="text-xs font-medium text-slate-600 underline">
            Open trackers →
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {[
            { w: track('pa'), label: 'PA progress' },
            { w: track('mdrt'), label: 'MDRT progress' },
            { w: track('ifhc'), label: 'iFHC progress' },
            { w: track('digital'), label: 'Digital activity' },
            { w: track('recruitment'), label: 'Recruitment' },
            {
              w: track('hiring') ?? track('4-agent'),
              label: 'Agents hired',
              custom: `${agentsOnboarded}/${agentsTarget}`,
            },
          ].map((item) => {
            const w = item.w;
            const pct = w?.percent ?? 0;
            const accent =
              pct >= 80
                ? 'bg-green-100 text-green-700'
                : w && w.overdueCount > 0
                  ? 'bg-red-100 text-red-700'
                  : 'bg-blue-100 text-blue-700';
            return (
              <StatCard
                key={item.label}
                label={item.label}
                value={item.custom ?? `${w?.done ?? 0}/${w?.total ?? 0}`}
                sublabel={item.custom ? 'onboarded' : `${pct}% tasks done`}
                icon="◎"
                accent={accent}
              />
            );
          })}
        </div>
      </section>
    </div>
  );
}
