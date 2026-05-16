import type { AdvisorExecutionState, PaceStatus, PaStatusLabel } from '../types';
import { AGENTS_TARGET } from '../constants/advisorTargets';
import { computeMdrtTracker } from './mdrtTracker';
import { computePaTracker } from './paTracker';
import {
  countLicensingStarted,
  countSeriousCandidates,
} from './recruitmentTracker';

export interface MetricTriple {
  current: number;
  target: number;
  expected: number;
}

export interface ExecutionGoalsSummary {
  pa: {
    status: PaStatusLabel;
    distinct: MetricTriple;
    newInsured: MetricTriple;
    vitality: MetricTriple;
    productCategories: string;
  };
  mdrt: {
    routeLabel: string;
    current: number;
    target: number;
    expectedByNow: number;
    percent: number;
    gap: number;
    status: PaceStatus;
  };
  recruitment: {
    agentsOnboarded: number;
    agentsTarget: number;
    pipelineTotal: number;
    seriousCandidates: number;
    licensingStarted: number;
  };
}

export function paceStatusLabel(status: PaceStatus): string {
  switch (status) {
    case 'completed':
      return 'Target met';
    case 'seriously_behind':
      return 'Seriously behind';
    case 'slightly_behind':
      return 'Slightly behind';
    default:
      return 'On track';
  }
}

export function paStatusVariant(
  status: PaStatusLabel
): 'success' | 'warning' | 'danger' | 'neutral' {
  if (status === 'Completed') return 'success';
  if (status === 'Seriously Behind') return 'danger';
  if (status === 'Slightly Behind') return 'warning';
  return 'neutral';
}

export function paceStatusVariant(
  status: PaceStatus
): 'success' | 'warning' | 'danger' | 'neutral' {
  if (status === 'completed') return 'success';
  if (status === 'seriously_behind') return 'danger';
  if (status === 'slightly_behind') return 'warning';
  return 'neutral';
}

export function computeExecutionGoalsSummary(
  advisor: AdvisorExecutionState
): ExecutionGoalsSummary {
  const paResult = computePaTracker(advisor.pa);
  const mdrtResult = computeMdrtTracker(advisor.mdrt);
  const rec = advisor.recruitment;

  const pick = (key: 'distinctInsured' | 'newInsured' | 'vitalityCustomers') => {
    const m = paResult.metrics.find((x) => x.key === key)!;
    return {
      current: m.current,
      target: m.target,
      expected: m.expectedByNow,
    };
  };

  return {
    pa: {
      status: paResult.status,
      distinct: pick('distinctInsured'),
      newInsured: pick('newInsured'),
      vitality: pick('vitalityCustomers'),
      productCategories: `${paResult.productCategoriesComplete}/${paResult.productCategoriesTotal}`,
    },
    mdrt: {
      routeLabel: mdrtResult.routeLabel,
      current: mdrtResult.current,
      target: mdrtResult.target,
      expectedByNow: mdrtResult.expectedByNow,
      percent: mdrtResult.percent,
      gap: mdrtResult.gap,
      status: mdrtResult.status,
    },
    recruitment: {
      agentsOnboarded: rec.agentsOnboarded,
      agentsTarget: rec.agentsTarget || AGENTS_TARGET,
      pipelineTotal: rec.candidates.length,
      seriousCandidates: countSeriousCandidates(rec.candidates),
      licensingStarted: countLicensingStarted(rec.candidates),
    },
  };
}
