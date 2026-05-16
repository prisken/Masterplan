import { Card } from '../ui/Card';
import { ProgressBar } from '../ui/ProgressBar';
import { Badge } from '../ui/Badge';
import type { PaTrackerData } from '../../types';
import { computePaTracker } from '../../utils/paTracker';
import { PA_INTERNAL_DEADLINE, PA_OFFICIAL_DEADLINE } from '../../constants/advisorTargets';
import { PaPacingTable } from './PaPacingTable';

interface PaTrackerPanelProps {
  data: PaTrackerData;
  onChange: (data: PaTrackerData) => void;
}

export function PaTrackerPanel({ data, onChange }: PaTrackerPanelProps) {
  const result = computePaTracker(data);
  const set = <K extends keyof PaTrackerData>(key: K, val: PaTrackerData[K]) =>
    onChange({ ...data, [key]: val });

  const statusColor =
    result.status === 'Completed'
      ? 'success'
      : result.status === 'Seriously Behind'
        ? 'danger'
        : result.status === 'Slightly Behind'
          ? 'warning'
          : 'neutral';

  return (
    <Card>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">PA tracker</h2>
          <p className="text-xs text-slate-500">
            Internal {PA_INTERNAL_DEADLINE} · Official {PA_OFFICIAL_DEADLINE}
          </p>
        </div>
        <Badge variant={statusColor}>{result.status}</Badge>
      </div>
      <p className="mb-4 text-xs text-slate-500">
        Expected by {result.expectedMilestone.date}: {result.expectedMilestone.distinct} distinct,{' '}
        {result.expectedMilestone.new} new, {result.expectedMilestone.targetCategory} target-category
      </p>
      <div className="mb-4 grid gap-3 sm:grid-cols-2">
        {result.metrics.map((m) => (
          <label key={m.key} className="block">
            <span className="text-xs font-medium text-slate-600">{m.label}</span>
            <div className="mt-1 flex gap-2">
              <input
                type="number"
                min={0}
                className="w-20 rounded-lg border border-border px-2 py-1 text-sm"
                value={m.current}
                onChange={(e) => set(m.key, Number(e.target.value) || 0)}
              />
              <span className="self-center text-xs text-slate-400">/ {m.target}</span>
            </div>
            <ProgressBar value={m.percent} size="sm" accentClass="bg-credibility" showLabel={false} />
          </label>
        ))}
      </div>
      <PaPacingTable data={data} />

      <div className="border-t border-border pt-4">
        <p className="mb-2 text-xs font-semibold text-slate-600">Product categories</p>
        <div className="flex flex-wrap gap-4">
          {(['savings', 'protection', 'thirdCategory'] as const).map((key) => (
            <label key={key} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={data.productCategories[key]}
                onChange={(e) =>
                  onChange({
                    ...data,
                    productCategories: {
                      ...data.productCategories,
                      [key]: e.target.checked,
                    },
                  })
                }
              />
              {key === 'thirdCategory' ? 'Third category (GI / pension / ILP)' : key}
            </label>
          ))}
        </div>
        <p className="mt-2 text-xs text-slate-500">
          {result.productCategoriesComplete}/{result.productCategoriesTotal} categories confirmed
        </p>
      </div>
    </Card>
  );
}
