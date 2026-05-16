import type { Project, Task } from '../types';
import { ADVISOR_GROWTH_PROJECT_ID } from '../types';

/** Seeded Advisor Growth tasks cleared; add tasks in-app or extend this list later. */
export const advisorGrowthTasks: Task[] = [];

export const advisorGrowthProject = {
  id: ADVISOR_GROWTH_PROJECT_ID,
  projectName: 'Advisor Growth Center',
  category: 'Revenue' as const,
  engine: 'Revenue Engine',
  status: 'Active' as const,
  priority: 'High' as const,
  mainGoal:
    'Complete PA by 31 Dec 2026 (internal target 30 Nov), MDRT by 31 Dec 2026 (internal 15 Dec), recruit 4 new agents, and build insurance production systems.',
  targetAudience: 'Insurance prospects, SME owners, families, and future agent partners',
  mainFeeling: 'Disciplined, ambitious, professional, accountable',
  mainMotive: 'PA qualification, MDRT production, team growth, sustainable insurance business',
  currentPhase: 'Execution',
  owner: 'You',
  startDate: '2026-05-15',
  nextMilestone: 'PA/MDRT tracker live and first 50 prospects listed',
  milestoneDeadline: '2026-05-24',
  revenuePotential: 'High' as const,
  timeDemand: 'High' as const,
  progress: 5,
  notes:
    'PA internal deadline: 2026-11-30. MDRT internal: 2026-12-15. Final PA/MDRT: 2026-12-31. Hiring: 4 agents by 2026-12-31.',
} satisfies Project;
