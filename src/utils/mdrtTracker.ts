import type { MdrtRoute, MdrtTrackerData, PaceStatus } from '../types';
import {
  COMMISSION_MILESTONES,
  FYP_MILESTONES,
  MDRT_TARGETS,
} from '../constants/advisorTargets';
import { getReferenceDate, daysUntilYearEnd } from './referenceDate';
import { parseDate } from './taskDeadline';

export interface MdrtTrackerResult {
  route: MdrtRoute;
  routeLabel: string;
  current: number;
  target: number;
  gap: number;
  percent: number;
  expectedByNow: number;
  status: PaceStatus;
  monthlyPace: number;
  weeklyPace: number;
  daysRemaining: number;
  firstYearCommission?: number;
  firstYearGap?: number;
}

function getExpectedForRoute(
  _route: MdrtRoute,
  milestones: { date: string; amount: number }[],
  now = getReferenceDate()
): number {
  const ref = now.getTime();
  let expected = 0;
  for (const m of milestones) {
    const d = parseDate(m.date);
    if (d && d.getTime() <= ref) expected = m.amount;
  }
  return expected;
}

function paceStatus(current: number, expected: number, target: number): PaceStatus {
  if (current >= target) return 'completed';
  if (expected <= 0) return 'on_track';
  const ratio = current / expected;
  if (ratio >= 0.95) return 'on_track';
  if (ratio >= 0.75) return 'slightly_behind';
  return 'seriously_behind';
}

export function getMdrtCurrentValue(mdrt: MdrtTrackerData): number {
  switch (mdrt.primaryRoute) {
    case 'fyp':
      return mdrt.currentFyp;
    case 'income':
      return mdrt.currentIncome;
    default:
      return mdrt.currentCommission;
  }
}

export function computeMdrtTracker(mdrt: MdrtTrackerData, now = getReferenceDate()): MdrtTrackerResult {
  const route = mdrt.primaryRoute;
  const meta = MDRT_TARGETS[route];
  const target = meta.target;
  const current = getMdrtCurrentValue(mdrt);
  const milestones = route === 'fyp' ? FYP_MILESTONES : COMMISSION_MILESTONES;
  const expectedByNow = getExpectedForRoute(route, milestones, now);
  const gap = Math.max(0, target - current);
  const percent = target > 0 ? Math.round((current / target) * 100) : 0;
  const daysRemaining = daysUntilYearEnd();
  const monthsRemaining = Math.max(1, daysRemaining / 30);
  const weeksRemaining = Math.max(1, daysRemaining / 7);

  return {
    route,
    routeLabel: meta.label,
    current,
    target,
    gap,
    percent,
    expectedByNow,
    status: paceStatus(current, expectedByNow, target),
    monthlyPace: gap / monthsRemaining,
    weeklyPace: gap / weeksRemaining,
    daysRemaining,
    firstYearCommission:
      route === 'income' ? mdrt.currentFirstYearCommission : undefined,
    firstYearGap:
      route === 'income' && meta.firstYearCommission
        ? Math.max(0, meta.firstYearCommission - mdrt.currentFirstYearCommission)
        : undefined,
  };
}

export function computeAllMdrtRoutes(mdrt: MdrtTrackerData, now = getReferenceDate()) {
  return (['commission', 'fyp', 'income'] as MdrtRoute[]).map((route) => {
    const meta = MDRT_TARGETS[route];
    const current =
      route === 'commission'
        ? mdrt.currentCommission
        : route === 'fyp'
          ? mdrt.currentFyp
          : mdrt.currentIncome;
    const milestones = route === 'fyp' ? FYP_MILESTONES : COMMISSION_MILESTONES;
    const expectedByNow = getExpectedForRoute(route, milestones, now);
    return {
      route,
      label: meta.label,
      current,
      target: meta.target,
      percent: meta.target > 0 ? Math.round((current / meta.target) * 100) : 0,
      expectedByNow,
      status: paceStatus(current, expectedByNow, meta.target),
    };
  });
}
