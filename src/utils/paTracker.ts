import type { PaStatusLabel, PaTrackerData } from '../types';
import { PA_MILESTONES, PA_TARGETS } from '../constants/advisorTargets';
import { getReferenceDate } from './referenceDate';
import { parseDate } from './taskDeadline';

export interface PaMetricProgress {
  key: keyof typeof PA_TARGETS;
  label: string;
  current: number;
  target: number;
  percent: number;
  expectedByNow: number;
}

export interface PaTrackerResult {
  metrics: PaMetricProgress[];
  status: PaStatusLabel;
  expectedMilestone: (typeof PA_MILESTONES)[number];
  productCategoriesComplete: number;
  productCategoriesTotal: number;
}

function getExpectedMilestone(now = getReferenceDate()) {
  const ref = now.getTime();
  let current = PA_MILESTONES[0];
  for (const m of PA_MILESTONES) {
    const d = parseDate(m.date);
    if (d && d.getTime() <= ref) current = m;
  }
  return current;
}

export function computePaTracker(pa: PaTrackerData, now = getReferenceDate()): PaTrackerResult {
  const expected = getExpectedMilestone(now);
  const metrics: PaMetricProgress[] = [
    {
      key: 'distinctInsured',
      label: 'Distinct insured customers',
      current: pa.distinctInsured,
      target: PA_TARGETS.distinctInsured,
      percent: Math.round((pa.distinctInsured / PA_TARGETS.distinctInsured) * 100),
      expectedByNow: expected.distinct,
    },
    {
      key: 'newInsured',
      label: 'New insured customers',
      current: pa.newInsured,
      target: PA_TARGETS.newInsured,
      percent: Math.round((pa.newInsured / PA_TARGETS.newInsured) * 100),
      expectedByNow: expected.new,
    },
    {
      key: 'vitalityCustomers',
      label: 'Vitality / medical / CI / accident',
      current: pa.vitalityCustomers,
      target: PA_TARGETS.vitalityCustomers,
      percent: Math.round((pa.vitalityCustomers / PA_TARGETS.vitalityCustomers) * 100),
      expectedByNow: expected.targetCategory,
    },
    {
      key: 'ifhcReports',
      label: 'iFHC reports',
      current: pa.ifhcReports,
      target: PA_TARGETS.ifhcReports,
      percent: Math.round((pa.ifhcReports / PA_TARGETS.ifhcReports) * 100),
      expectedByNow: Math.min(
        PA_TARGETS.ifhcReports,
        Math.round((PA_TARGETS.ifhcReports * expected.distinct) / PA_TARGETS.distinctInsured)
      ),
    },
    {
      key: 'digitalActivities',
      label: 'Digital tool activities',
      current: pa.digitalActivities,
      target: PA_TARGETS.digitalActivities,
      percent: Math.round((pa.digitalActivities / PA_TARGETS.digitalActivities) * 100),
      expectedByNow: Math.round((PA_TARGETS.digitalActivities * expected.distinct) / PA_TARGETS.distinctInsured),
    },
  ];

  const productCategoriesComplete = [
    pa.productCategories.savings,
    pa.productCategories.protection,
    pa.productCategories.thirdCategory,
  ].filter(Boolean).length;

  const coreBehind = metrics.slice(0, 3).filter((m) => m.current < m.expectedByNow * 0.85).length;
  const coreAhead = metrics.slice(0, 3).every((m) => m.current >= m.target);

  let status: PaStatusLabel = 'On Track';
  if (coreAhead && productCategoriesComplete >= 3) status = 'Completed';
  else if (coreBehind >= 2) status = 'Seriously Behind';
  else if (coreBehind >= 1) status = 'Slightly Behind';

  return {
    metrics,
    status,
    expectedMilestone: expected,
    productCategoriesComplete,
    productCategoriesTotal: 3,
  };
}
