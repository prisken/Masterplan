import type { PaTrackerData } from '../types';
import { PA_MILESTONES } from '../constants/advisorTargets';
import { computePaTracker } from './paTracker';
import { getReferenceDate } from './referenceDate';
import { parseDate } from './taskDeadline';

export type PaPacingRowStatus = 'met' | 'behind' | 'upcoming' | 'current';

export interface PaPacingRow {
  date: string;
  distinctTarget: number;
  newTarget: number;
  categoryTarget: number;
  distinctActual: number;
  newActual: number;
  categoryActual: number;
  status: PaPacingRowStatus;
}

export function buildPaPacingRows(pa: PaTrackerData, now = getReferenceDate()): PaPacingRow[] {
  const ref = now.getTime();
  const { vitalityCustomers } = pa;

  let currentIdx = PA_MILESTONES.findIndex((m) => {
    const d = parseDate(m.date);
    return d && d.getTime() > ref;
  });
  if (currentIdx === -1) currentIdx = PA_MILESTONES.length - 1;

  return PA_MILESTONES.map((m, i) => {
    const d = parseDate(m.date);
    const isPast = d ? d.getTime() <= ref : false;
    const met =
      pa.distinctInsured >= m.distinct &&
      pa.newInsured >= m.new &&
      vitalityCustomers >= m.targetCategory;
    let status: PaPacingRowStatus = 'upcoming';
    if (isPast) status = met ? 'met' : 'behind';
    else if (i === currentIdx) status = 'current';

    return {
      date: m.date,
      distinctTarget: m.distinct,
      newTarget: m.new,
      categoryTarget: m.targetCategory,
      distinctActual: pa.distinctInsured,
      newActual: pa.newInsured,
      categoryActual: vitalityCustomers,
      status,
    };
  });
}

export function getPaPacingSummary(pa: PaTrackerData) {
  const result = computePaTracker(pa);
  return {
    rows: buildPaPacingRows(pa),
    status: result.status,
    expectedMilestone: result.expectedMilestone,
  };
}
