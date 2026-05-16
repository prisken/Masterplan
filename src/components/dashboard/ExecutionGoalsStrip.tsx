import { Link } from 'react-router-dom';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { ProgressBar } from '../ui/ProgressBar';
import type { ExecutionGoalsSummary } from '../../utils/executionGoalsSummary';
import {
  paceStatusLabel,
  paceStatusVariant,
  paStatusVariant,
} from '../../utils/executionGoalsSummary';
import { formatMoney } from '../../utils/financeStats';

interface ExecutionGoalsStripProps {
  summary: ExecutionGoalsSummary;
}

function PaMetricRow({
  label,
  metric,
}: {
  label: string;
  metric: { current: number; target: number; expected: number };
}) {
  const behind = metric.current < metric.expected;
  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between gap-2 text-xs">
        <span className="font-medium text-slate-600">{label}</span>
        <span className="tabular-nums text-slate-800">
          <strong>{metric.current}</strong>
          <span className="text-slate-400"> / {metric.target}</span>
        </span>
      </div>
      <ProgressBar
        value={metric.current}
        max={metric.target}
        size="sm"
        accentClass={behind ? 'bg-amber-500' : 'bg-credibility'}
        showLabel={false}
      />
      <p className="text-[10px] text-slate-400">
        Pace expects {metric.expected} by now
        {behind && <span className="ml-1 font-medium text-amber-700">· behind</span>}
      </p>
    </div>
  );
}

export function ExecutionGoalsStrip({ summary }: ExecutionGoalsStripProps) {
  const { pa, mdrt, recruitment } = summary;

  return (
    <section className="mb-8">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Year-end goals (tracker numbers)
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            From Advisor Growth Center — not task checklist %
          </p>
        </div>
        <Link to="/advisor" className="text-xs font-medium text-slate-600 underline">
          Edit trackers →
        </Link>
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        <Card>
          <div className="mb-3 flex items-start justify-between gap-2">
            <h3 className="text-sm font-semibold text-slate-900">PA</h3>
            <Badge variant={paStatusVariant(pa.status)}>{pa.status}</Badge>
          </div>
          <div className="space-y-3">
            <PaMetricRow label="Distinct insured" metric={pa.distinct} />
            <PaMetricRow label="New insured" metric={pa.newInsured} />
            <PaMetricRow label="Vitality / med / CI" metric={pa.vitality} />
          </div>
          <p className="mt-3 border-t border-border pt-3 text-xs text-slate-500">
            Product categories: <strong className="text-slate-800">{pa.productCategories}</strong>
          </p>
        </Card>

        <Card>
          <div className="mb-3 flex items-start justify-between gap-2">
            <h3 className="text-sm font-semibold text-slate-900">MDRT</h3>
            <Badge variant={paceStatusVariant(mdrt.status)}>
              {paceStatusLabel(mdrt.status)}
            </Badge>
          </div>
          <p className="text-xs text-slate-500">Primary route: {mdrt.routeLabel}</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-slate-900">
            {formatMoney(mdrt.current)}
          </p>
          <p className="text-xs text-slate-500">
            of {formatMoney(mdrt.target)} year-end target ({mdrt.percent}%)
          </p>
          <div className="mt-3">
            <ProgressBar
              value={mdrt.current}
              max={mdrt.target}
              size="sm"
              accentClass={
                mdrt.status === 'seriously_behind' ? 'bg-red-500' : 'bg-revenue'
              }
              showLabel={false}
            />
          </div>
          <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-lg bg-slate-50 px-2 py-1.5">
              <dt className="text-slate-500">Expected by now</dt>
              <dd className="font-semibold text-slate-800">{formatMoney(mdrt.expectedByNow)}</dd>
            </div>
            <div className="rounded-lg bg-slate-50 px-2 py-1.5">
              <dt className="text-slate-500">Gap to target</dt>
              <dd className="font-semibold text-slate-800">{formatMoney(mdrt.gap)}</dd>
            </div>
          </dl>
        </Card>

        <Card>
          <h3 className="mb-3 text-sm font-semibold text-slate-900">Recruitment</h3>
          <p className="text-2xl font-semibold tabular-nums text-slate-900">
            {recruitment.agentsOnboarded}
            <span className="text-lg font-normal text-slate-400">
              {' '}
              / {recruitment.agentsTarget}
            </span>
          </p>
          <p className="text-xs text-slate-500">Agents onboarded (year-end target)</p>
          <div className="mt-3">
            <ProgressBar
              value={recruitment.agentsOnboarded}
              max={recruitment.agentsTarget}
              size="sm"
              accentClass="bg-community"
              showLabel={false}
            />
          </div>
          <dl className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
            <div className="rounded-lg bg-slate-50 px-2 py-2">
              <dt className="text-slate-500">Pipeline</dt>
              <dd className="text-lg font-semibold text-slate-900">
                {recruitment.pipelineTotal}
              </dd>
            </div>
            <div className="rounded-lg bg-slate-50 px-2 py-2">
              <dt className="text-slate-500">Serious</dt>
              <dd className="text-lg font-semibold text-slate-900">
                {recruitment.seriousCandidates}
              </dd>
            </div>
            <div className="rounded-lg bg-slate-50 px-2 py-2">
              <dt className="text-slate-500">Licensing+</dt>
              <dd className="text-lg font-semibold text-slate-900">
                {recruitment.licensingStarted}
              </dd>
            </div>
          </dl>
        </Card>
      </div>
    </section>
  );
}
