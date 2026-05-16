import { Card } from '../ui/Card';
import { ProgressBar } from '../ui/ProgressBar';
import { Badge } from '../ui/Badge';
import type { MdrtTrackerData, MdrtRoute } from '../../types';
import { computeMdrtTracker, computeAllMdrtRoutes } from '../../utils/mdrtTracker';
import { MDRT_INTERNAL_DEADLINE, MDRT_OFFICIAL_DEADLINE } from '../../constants/advisorTargets';
import { mdrtRoutes } from '../../constants/options';
import { formatMoney } from '../../utils/financeStats';
import { MdrtPacingTable } from './MdrtPacingTable';

interface MdrtTrackerPanelProps {
  data: MdrtTrackerData;
  onChange: (data: MdrtTrackerData) => void;
}

export function MdrtTrackerPanel({ data, onChange }: MdrtTrackerPanelProps) {
  const primary = computeMdrtTracker(data);
  const allRoutes = computeAllMdrtRoutes(data);

  const statusLabel =
    primary.status === 'completed'
      ? 'On track (target met)'
      : primary.status === 'seriously_behind'
        ? 'Seriously behind'
        : primary.status === 'slightly_behind'
          ? 'Slightly behind'
          : 'On track';

  const statusVariant =
    primary.status === 'completed'
      ? 'success'
      : primary.status === 'seriously_behind'
        ? 'danger'
        : primary.status === 'slightly_behind'
          ? 'warning'
          : 'neutral';

  return (
    <Card>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">MDRT tracker</h2>
          <p className="text-xs text-slate-500">
            Internal {MDRT_INTERNAL_DEADLINE} · Official {MDRT_OFFICIAL_DEADLINE}
          </p>
        </div>
        <Badge variant={statusVariant}>{statusLabel}</Badge>
      </div>

      <label className="mb-4 block">
        <span className="text-xs font-medium text-slate-600">Primary route</span>
        <select
          className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
          value={data.primaryRoute}
          onChange={(e) => onChange({ ...data, primaryRoute: e.target.value as MdrtRoute })}
        >
          {mdrtRoutes.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
      </label>

      <div className="mb-4 grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="text-xs text-slate-600">Commission (HKD)</span>
          <input
            type="number"
            min={0}
            className="mt-1 w-full rounded-lg border border-border px-2 py-1 text-sm"
            value={data.currentCommission || ''}
            onChange={(e) =>
              onChange({ ...data, currentCommission: Number(e.target.value) || 0 })
            }
          />
        </label>
        <label className="block">
          <span className="text-xs text-slate-600">FYP (HKD)</span>
          <input
            type="number"
            min={0}
            className="mt-1 w-full rounded-lg border border-border px-2 py-1 text-sm"
            value={data.currentFyp || ''}
            onChange={(e) => onChange({ ...data, currentFyp: Number(e.target.value) || 0 })}
          />
        </label>
        <label className="block">
          <span className="text-xs text-slate-600">Income (HKD)</span>
          <input
            type="number"
            min={0}
            className="mt-1 w-full rounded-lg border border-border px-2 py-1 text-sm"
            value={data.currentIncome || ''}
            onChange={(e) => onChange({ ...data, currentIncome: Number(e.target.value) || 0 })}
          />
        </label>
        <label className="block">
          <span className="text-xs text-slate-600">First-year commission (HKD)</span>
          <input
            type="number"
            min={0}
            className="mt-1 w-full rounded-lg border border-border px-2 py-1 text-sm"
            value={data.currentFirstYearCommission || ''}
            onChange={(e) =>
              onChange({ ...data, currentFirstYearCommission: Number(e.target.value) || 0 })
            }
          />
        </label>
      </div>

      <div className="mb-4 rounded-lg bg-slate-50 p-4">
        <p className="text-sm font-medium text-slate-900">
          {primary.routeLabel}: {formatMoney(primary.current)} / {formatMoney(primary.target)}
        </p>
        <div className="mt-2">
          <ProgressBar value={primary.percent} accentClass="bg-credibility" />
        </div>
        <div className="mt-3 grid gap-1 text-xs text-slate-600 sm:grid-cols-2">
          <p>Gap: {formatMoney(primary.gap)}</p>
          <p>Expected by now: {formatMoney(primary.expectedByNow)}</p>
          <p>Monthly pace needed: {formatMoney(primary.monthlyPace)}</p>
          <p>Weekly pace needed: {formatMoney(primary.weeklyPace)}</p>
          <p>{primary.daysRemaining} days to year-end</p>
          {primary.firstYearGap !== undefined && (
            <p>First-year commission gap: {formatMoney(primary.firstYearGap)}</p>
          )}
        </div>
      </div>

      <MdrtPacingTable data={data} />

      <div className="border-t border-border pt-4">
        <p className="mb-2 text-xs font-semibold uppercase text-slate-500">All routes</p>
        <div className="space-y-2">
          {allRoutes.map((r) => (
            <div key={r.route} className="flex items-center justify-between text-sm">
              <span>{r.label}</span>
              <span className="text-slate-600">
                {formatMoney(r.current)} ({r.percent}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
