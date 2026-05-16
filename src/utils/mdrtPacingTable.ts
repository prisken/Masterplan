import type { MdrtRoute, MdrtTrackerData } from '../types';
import {
  COMMISSION_MILESTONES,
  FYP_MILESTONES,
  MDRT_TARGETS,
} from '../constants/advisorTargets';
import { getReferenceDate } from './referenceDate';
import { parseDate } from './taskDeadline';

export type PacingRowStatus = 'met' | 'behind' | 'upcoming' | 'current';

export interface MdrtPacingRow {
  date: string;
  targetAmount: number;
  actual: number;
  gap: number;
  status: PacingRowStatus;
}

export function buildMdrtPacingRows(
  milestones: { date: string; amount: number }[],
  actual: number,
  now = getReferenceDate()
): MdrtPacingRow[] {
  const ref = now.getTime();
  let currentIdx = milestones.findIndex((m) => {
    const d = parseDate(m.date);
    return d && d.getTime() > ref;
  });
  if (currentIdx === -1) currentIdx = milestones.length - 1;

  return milestones.map((m, i) => {
    const d = parseDate(m.date);
    const isPast = d ? d.getTime() <= ref : false;
    const met = actual >= m.amount;
    let status: PacingRowStatus = 'upcoming';
    if (isPast) status = met ? 'met' : 'behind';
    else if (i === currentIdx) status = 'current';

    return {
      date: m.date,
      targetAmount: m.amount,
      actual,
      gap: Math.max(0, m.amount - actual),
      status,
    };
  });
}

export function getMdrtPacingTables(mdrt: MdrtTrackerData, now = getReferenceDate()) {
  return {
    primaryRoute: mdrt.primaryRoute,
    commission: buildMdrtPacingRows(COMMISSION_MILESTONES, mdrt.currentCommission, now),
    fyp: buildMdrtPacingRows(FYP_MILESTONES, mdrt.currentFyp, now),
    targets: MDRT_TARGETS,
  };
}

export function routeLabel(route: MdrtRoute): string {
  return MDRT_TARGETS[route].label;
}
