import type { AppData } from '../types';
import {
  AGENTS_TARGET,
  COMMISSION_MILESTONES,
  MDRT_OFFICIAL_DEADLINE,
  PA_MILESTONES,
  PA_OFFICIAL_DEADLINE,
} from '../constants/advisorTargets';
import { computeExecutionGoalsSummary } from './executionGoalsSummary';
import { computePaTracker } from './paTracker';
import { getMdrtPacingTables } from './mdrtPacingTable';
import { getReferenceDate, getPacingDateIso } from './referenceDate';
import { parseDate } from './taskDeadline';
import { getRecruitmentFunnelStats } from './recruitmentTracker';
import { isTaskCompleted, getEffectiveTaskStatus } from './taskStatus';
import { getTaskTitle } from './taskTitle';

export type YearEndMilestoneStatus = 'met' | 'behind' | 'upcoming' | 'current' | 'checkpoint';

export interface LiveYearEndMilestone {
  id: string;
  date: string;
  category: 'PA' | 'MDRT' | 'Recruitment' | 'Team';
  title: string;
  detail: string;
  status: YearEndMilestoneStatus;
}

const RECRUITMENT_CHECKPOINTS = [
  { id: 'rec-30', date: '2026-05-31', title: '30 recruitment names identified', minTotal: 30 },
  { id: 'rec-6', date: '2026-08-31', title: '6 serious candidates', minSerious: 6 },
  { id: 'rec-4-lic', date: '2026-09-01', title: '4 candidates licensing study started', minLicensing: 4 },
  { id: 'rec-2', date: '2026-11-15', title: '2 agents onboarded', minAgents: 2 },
  { id: 'rec-4', date: '2026-12-15', title: '4 agents onboarded (buffer)', minAgents: 4 },
];

function dateStatus(
  milestoneDate: string,
  met: boolean,
  now = getReferenceDate()
): YearEndMilestoneStatus {
  const d = parseDate(milestoneDate);
  if (!d) return 'checkpoint';
  const ref = now.getTime();
  const t = d.getTime();
  if (t > ref) return 'upcoming';
  if (met) return 'met';
  const next = PA_MILESTONES.find((m) => {
    const md = parseDate(m.date);
    return md && md.getTime() > ref;
  });
  if (next && parseDate(next.date)?.getTime() === t) return 'current';
  return 'behind';
}

export function buildLiveYearEndMilestones(data: AppData, now = getReferenceDate()): {
  milestones: LiveYearEndMilestone[];
  pacingDateLabel: string;
  goals: ReturnType<typeof computeExecutionGoalsSummary>;
} {
  const { pa, mdrt, recruitment } = data.advisor;
  const paResult = computePaTracker(pa, now);
  const mdrtTables = getMdrtPacingTables(mdrt, now);
  const recStats = getRecruitmentFunnelStats(recruitment);
  const goals = computeExecutionGoalsSummary(data.advisor);
  const ref = now.getTime();

  const milestones: LiveYearEndMilestone[] = [];

  for (const m of PA_MILESTONES) {
    const met =
      pa.distinctInsured >= m.distinct &&
      pa.newInsured >= m.new &&
      pa.vitalityCustomers >= m.targetCategory;
    const d = parseDate(m.date);
    let status: YearEndMilestoneStatus = 'upcoming';
    if (d && d.getTime() <= ref) status = met ? 'met' : 'behind';
    else if (m.date === paResult.expectedMilestone.date) status = 'current';

    milestones.push({
      id: `pa-${m.date}`,
      date: m.date,
      category: 'PA',
      title: `PA pace — ${m.distinct} distinct · ${m.new} new · ${m.targetCategory} vitality`,
      detail: `Now: ${pa.distinctInsured}/${m.distinct} distinct, ${pa.newInsured}/${m.new} new, ${pa.vitalityCustomers}/${m.targetCategory} vitality`,
      status,
    });
  }

  for (const m of COMMISSION_MILESTONES) {
    const row = mdrtTables.commission.find((r) => r.date === m.date);
    milestones.push({
      id: `mdrt-${m.date}`,
      date: m.date,
      category: 'MDRT',
      title: `MDRT commission pace — HKD ${m.amount.toLocaleString()}`,
      detail: `Now: HKD ${mdrt.currentCommission.toLocaleString()} cumulative (${row?.status ?? '—'})`,
      status: row?.status === 'met' ? 'met' : row?.status === 'behind' ? 'behind' : row?.status === 'current' ? 'current' : 'upcoming',
    });
  }

  for (const cp of RECRUITMENT_CHECKPOINTS) {
    const met =
      (cp.minTotal !== undefined && recStats.total >= cp.minTotal) ||
      (cp.minSerious !== undefined && recStats.serious >= cp.minSerious) ||
      (cp.minLicensing !== undefined && recStats.licensingStarted >= cp.minLicensing) ||
      (cp.minAgents !== undefined && recStats.agentsOnboarded >= cp.minAgents);
    milestones.push({
      id: cp.id,
      date: cp.date,
      category: 'Recruitment',
      title: cp.title,
      detail: `Pipeline ${recStats.total} · serious ${recStats.serious} · licensing+ ${recStats.licensingStarted} · onboarded ${recStats.agentsOnboarded}/${recStats.agentsTarget}`,
      status: dateStatus(cp.date, met, now),
    });
  }

  milestones.push({
    id: 'pa-official',
    date: PA_OFFICIAL_DEADLINE,
    category: 'PA',
    title: 'PA official completion',
    detail: `Targets: 18 distinct · 10 new · 8 vitality · 3 categories`,
    status:
      pa.distinctInsured >= 18 && pa.newInsured >= 10 && pa.vitalityCustomers >= 8
        ? ref >= (parseDate(PA_OFFICIAL_DEADLINE)?.getTime() ?? 0)
          ? 'met'
          : 'upcoming'
        : ref >= (parseDate(PA_OFFICIAL_DEADLINE)?.getTime() ?? 0)
          ? 'behind'
          : 'upcoming',
  });

  milestones.push({
    id: 'mdrt-official',
    date: MDRT_OFFICIAL_DEADLINE,
    category: 'MDRT',
    title: `MDRT official · ${AGENTS_TARGET} agents confirmed`,
    detail: `Commission ${mdrt.currentCommission.toLocaleString()} · agents ${recruitment.agentsOnboarded}/${AGENTS_TARGET}`,
    status: 'checkpoint',
  });

  const linkedTasks = data.tasks.filter((t) => t.metricKey && isTaskCompleted(getEffectiveTaskStatus(t, now)));
  if (linkedTasks.length > 0) {
    milestones.push({
      id: 'tasks-linked',
      date: getPacingDateIso(data.settings),
      category: 'Team',
      title: `${linkedTasks.length} metric-linked tasks completed`,
      detail: linkedTasks
        .slice(0, 3)
        .map((t) => getTaskTitle(t))
        .join(' · '),
      status: 'met',
    });
  }

  milestones.sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));

  return {
    milestones,
    pacingDateLabel: data.settings.useLiveClock ? 'live clock' : `pacing ${data.settings.pacingDate}`,
    goals,
  };
}
