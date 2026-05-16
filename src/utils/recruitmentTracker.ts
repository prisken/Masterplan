import type { RecruitmentCandidate, RecruitmentStage, RecruitmentTrackerData } from '../types';
import {
  AGENTS_TARGET,
  RECRUITMENT_STAGE_ORDER,
} from '../constants/advisorTargets';
import { getReferenceDate } from './referenceDate';
import { parseDate } from './taskDeadline';
import { REFERENCE_DATE } from '../types';

export interface RecruitmentWarning {
  id: string;
  message: string;
  severity: 'risk' | 'critical';
}

const STAGE_INDEX: Record<RecruitmentStage, number> = Object.fromEntries(
  RECRUITMENT_STAGE_ORDER.map((s, i) => [s, i])
) as Record<RecruitmentStage, number>;

export function countByStage(candidates: RecruitmentCandidate[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const s of RECRUITMENT_STAGE_ORDER) counts[s] = 0;
  for (const c of candidates) {
    counts[c.stage] = (counts[c.stage] ?? 0) + 1;
  }
  return counts;
}

export function countSeriousCandidates(candidates: RecruitmentCandidate[]): number {
  const minStage: RecruitmentStage = 'Interested';
  const minIdx = STAGE_INDEX[minStage];
  return candidates.filter((c) => STAGE_INDEX[c.stage] >= minIdx).length;
}

export function countLicensingStarted(candidates: RecruitmentCandidate[]): number {
  const minStage: RecruitmentStage = 'Licensing Study Started';
  const minIdx = STAGE_INDEX[minStage];
  return candidates.filter((c) => STAGE_INDEX[c.stage] >= minIdx).length;
}

export function conversionRate(from: number, to: number): number {
  if (from <= 0) return 0;
  return Math.round((to / from) * 100);
}

export function computeRecruitmentWarnings(
  data: RecruitmentTrackerData,
  now = getReferenceDate()
): RecruitmentWarning[] {
  const warnings: RecruitmentWarning[] = [];
  const ref = now.getTime();
  const serious = countSeriousCandidates(data.candidates);
  const licensing = countLicensingStarted(data.candidates);
  const identified = data.candidates.length;

  const aug31 = parseDate('2026-08-31')?.getTime() ?? 0;
  const sep1 = parseDate('2026-09-01')?.getTime() ?? 0;
  const nov15 = parseDate('2026-11-15')?.getTime() ?? 0;

  if (ref >= aug31 && serious < 6) {
    warnings.push({
      id: 'pipeline-risk',
      message: 'Recruitment pipeline risk — fewer than 6 serious candidates by 31 Aug 2026.',
      severity: 'risk',
    });
  }
  if (ref >= sep1 && licensing < 4) {
    warnings.push({
      id: 'licensing-risk',
      message: 'Licensing timeline risk — fewer than 4 candidates started licensing study by 1 Sep 2026.',
      severity: 'critical',
    });
  }
  if (ref >= nov15 && data.agentsOnboarded < 2) {
    warnings.push({
      id: 'team-risk',
      message: 'Team-building target at risk — fewer than 2 agents onboarded by 15 Nov 2026.',
      severity: 'critical',
    });
  }

  if (identified < 30 && ref >= (parseDate('2026-05-31')?.getTime() ?? 0)) {
    warnings.push({
      id: 'identified-low',
      message: `Only ${identified} candidates identified (target 30 by 31 May 2026).`,
      severity: 'risk',
    });
  }

  return warnings;
}

export function getRecruitmentFunnelStats(data: RecruitmentTrackerData) {
  const byStage = countByStage(data.candidates);
  const identified = byStage['Identified'] ?? 0;
  const visionDone = Object.entries(byStage).reduce((sum, [stage, n]) => {
    return STAGE_INDEX[stage as RecruitmentStage] >= STAGE_INDEX['Vision Meeting Completed']
      ? sum + n
      : sum;
  }, 0);

  return {
    byStage,
    total: data.candidates.length,
    serious: countSeriousCandidates(data.candidates),
    licensingStarted: countLicensingStarted(data.candidates),
    agentsOnboarded: data.agentsOnboarded,
    agentsTarget: data.agentsTarget || AGENTS_TARGET,
    conversionIdentifiedToContacted: conversionRate(identified, byStage['Contacted'] ?? 0),
    conversionToVisionDone: conversionRate(data.candidates.length, visionDone),
  };
}

export function defaultRecruitmentTracker(): RecruitmentTrackerData {
  return {
    candidates: [],
    agentsOnboarded: 0,
    agentsTarget: AGENTS_TARGET,
  };
}

export { REFERENCE_DATE };
