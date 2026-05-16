import type { AppData } from '../types';
import { computePaTracker } from './paTracker';
import { computeMdrtTracker } from './mdrtTracker';
import { computeRecruitmentWarnings } from './recruitmentTracker';
import { computeTaskSummaryStats } from './taskStats';
import { getReferenceDate } from './referenceDate';

export interface AppWarning {
  id: string;
  message: string;
  severity: 'info' | 'risk' | 'critical';
  href?: string;
}

export function computeAppWarnings(data: AppData, now = getReferenceDate()): AppWarning[] {
  const warnings: AppWarning[] = [];
  const taskStats = computeTaskSummaryStats(data.tasks, now);
  const pa = computePaTracker(data.advisor.pa, now);
  const mdrt = computeMdrtTracker(data.advisor.mdrt, now);

  if (taskStats.p0Overdue > 0) {
    warnings.push({
      id: 'p0-overdue',
      message: `Critical overdue tasks: ${taskStats.p0Overdue} P0 task(s) past deadline.`,
      severity: 'critical',
      href: '/tasks?view=overdue',
    });
  }

  if (pa.status === 'Seriously Behind') {
    warnings.push({
      id: 'pa-behind',
      message: 'PA is behind pace — core customer targets are below the expected milestone.',
      severity: 'critical',
      href: '/advisor',
    });
  } else if (pa.status === 'Slightly Behind') {
    warnings.push({
      id: 'pa-slight',
      message: 'PA is slightly behind pace — review distinct/new customer progress.',
      severity: 'risk',
      href: '/advisor',
    });
  }

  if (mdrt.status === 'seriously_behind') {
    warnings.push({
      id: 'mdrt-behind',
      message: `MDRT is behind pace on ${mdrt.routeLabel} route — increase production activity.`,
      severity: 'critical',
      href: '/advisor',
    });
  } else if (mdrt.status === 'slightly_behind') {
    warnings.push({
      id: 'mdrt-slight',
      message: 'MDRT is slightly behind milestone pace.',
      severity: 'risk',
      href: '/advisor',
    });
  }

  for (const w of computeRecruitmentWarnings(data.advisor.recruitment, now)) {
    warnings.push({
      id: w.id,
      message: w.message,
      severity: w.severity === 'critical' ? 'critical' : 'risk',
      href: '/advisor',
    });
  }

  return warnings;
}
