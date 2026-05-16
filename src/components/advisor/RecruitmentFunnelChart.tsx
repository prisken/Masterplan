import { RECRUITMENT_STAGE_ORDER } from '../../constants/advisorTargets';
import type { RecruitmentTrackerData } from '../../types';
import { getRecruitmentFunnelStats } from '../../utils/recruitmentTracker';
import { cn } from '../../utils/cn';

interface RecruitmentFunnelChartProps {
  data: RecruitmentTrackerData;
  className?: string;
}

export function RecruitmentFunnelChart({ data, className }: RecruitmentFunnelChartProps) {
  const stats = getRecruitmentFunnelStats(data);
  const counts = RECRUITMENT_STAGE_ORDER.map((stage) => stats.byStage[stage] ?? 0);
  const max = Math.max(1, ...counts);

  return (
    <div className={cn('border-t border-border pt-4', className)}>
      <p className="mb-1 text-xs font-semibold uppercase text-slate-500">Recruitment funnel</p>
      <p className="mb-3 text-xs text-slate-500">
        Count per pipeline stage ({stats.total} total candidates).
      </p>
      <div className="space-y-1.5">
        {RECRUITMENT_STAGE_ORDER.map((stage, i) => {
          const n = counts[i];
          const pct = Math.round((n / max) * 100);
          const isActive = n > 0;
          return (
            <div key={stage} className="flex items-center gap-2 text-xs">
              <span className="w-[11rem] shrink-0 truncate text-slate-600" title={stage}>
                {stage}
              </span>
              <div className="relative h-6 min-w-0 flex-1 overflow-hidden rounded-md bg-slate-100">
                <div
                  className={cn(
                    'absolute inset-y-0 left-0 rounded-md transition-all',
                    isActive ? 'bg-community' : 'bg-slate-200'
                  )}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="w-8 shrink-0 text-right font-semibold tabular-nums text-slate-800">
                {n}
              </span>
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500">
        <span>
          Serious (Interested+): <strong className="text-slate-800">{stats.serious}</strong>
        </span>
        <span>
          Licensing+: <strong className="text-slate-800">{stats.licensingStarted}</strong>
        </span>
        <span>
          Onboarded:{' '}
          <strong className="text-slate-800">
            {stats.agentsOnboarded}/{stats.agentsTarget}
          </strong>
        </span>
      </div>
    </div>
  );
}
