import { Link } from 'react-router-dom';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import type { AppData } from '../../types';
import {
  buildLiveYearEndMilestones,
  type LiveYearEndMilestone,
  type YearEndMilestoneStatus,
} from '../../utils/yearEndPlan';
import { formatMoney } from '../../utils/financeStats';
import { cn } from '../../utils/cn';

const statusVariant: Record<
  YearEndMilestoneStatus,
  'success' | 'warning' | 'danger' | 'neutral' | 'default'
> = {
  met: 'success',
  behind: 'danger',
  upcoming: 'neutral',
  current: 'warning',
  checkpoint: 'default',
};

const statusDot: Record<YearEndMilestoneStatus, string> = {
  met: 'bg-green-500',
  behind: 'bg-red-500',
  upcoming: 'bg-slate-300',
  current: 'bg-amber-500',
  checkpoint: 'bg-slate-400',
};

interface YearEndMilestonesViewProps {
  data: AppData;
}

function MilestoneItem({ m }: { m: LiveYearEndMilestone }) {
  return (
    <li className="mb-4 ml-2">
      <span
        className={cn(
          'absolute -left-[5px] mt-1.5 h-2.5 w-2.5 rounded-full ring-2 ring-white',
          statusDot[m.status]
        )}
      />
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-xs font-semibold text-slate-500">{m.date}</p>
        <Badge variant={statusVariant[m.status]}>{m.category}</Badge>
      </div>
      <p className="text-sm font-medium text-slate-900">{m.title}</p>
      <p className="mt-0.5 text-xs text-slate-600">{m.detail}</p>
    </li>
  );
}

export function YearEndMilestonesView({ data }: YearEndMilestonesViewProps) {
  const { milestones, pacingDateLabel, goals } = buildLiveYearEndMilestones(data);
  const met = milestones.filter((m) => m.status === 'met').length;
  const behind = milestones.filter((m) => m.status === 'behind').length;

  return (
    <div className="space-y-6">
      <Card>
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Live year-end plan
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Pulled from Advisor trackers · {pacingDateLabel}
            </p>
          </div>
          <Link
            to="/advisor"
            className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white"
          >
            Open trackers
          </Link>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-lg bg-slate-50 px-3 py-2 text-center">
            <p className="text-lg font-semibold text-slate-900">{met}</p>
            <p className="text-[10px] text-slate-500">Milestones met</p>
          </div>
          <div className="rounded-lg bg-red-50 px-3 py-2 text-center">
            <p className="text-lg font-semibold text-red-800">{behind}</p>
            <p className="text-[10px] text-red-700">Behind pace</p>
          </div>
          <div className="rounded-lg bg-slate-50 px-3 py-2 text-center">
            <p className="text-lg font-semibold text-slate-900">
              {goals.pa.distinct.current}/{goals.pa.distinct.target}
            </p>
            <p className="text-[10px] text-slate-500">PA distinct</p>
          </div>
          <div className="rounded-lg bg-slate-50 px-3 py-2 text-center">
            <p className="text-lg font-semibold text-slate-900">
              {formatMoney(goals.mdrt.current)}
            </p>
            <p className="text-[10px] text-slate-500">MDRT {goals.mdrt.routeLabel}</p>
          </div>
        </div>

        <ol className="relative border-l-2 border-border pl-4">
          {milestones.map((m) => (
            <MilestoneItem key={m.id} m={m} />
          ))}
        </ol>
      </Card>

      <p className="text-xs text-slate-500">
        Legend: green = met by pacing date · red = past due and not met · amber = current period
        target · gray = upcoming. Edit numbers on{' '}
        <Link to="/advisor" className="font-medium underline">
          Advisor
        </Link>{' '}
        or complete metric-linked tasks to update live.
      </p>
    </div>
  );
}
