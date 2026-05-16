import type { MdrtRoute } from '../types';

export const PA_INTERNAL_DEADLINE = '2026-11-30';
export const PA_OFFICIAL_DEADLINE = '2026-12-31';
export const MDRT_INTERNAL_DEADLINE = '2026-12-15';
export const MDRT_OFFICIAL_DEADLINE = '2026-12-31';
export const HIRING_INTERNAL_DEADLINE = '2026-11-30';
export const HIRING_OFFICIAL_DEADLINE = '2026-12-31';

export const PA_TARGETS = {
  distinctInsured: 18,
  newInsured: 10,
  vitalityCustomers: 8,
  ifhcReports: 24,
  digitalActivities: 100,
} as const;

export interface PaMilestone {
  date: string;
  distinct: number;
  new: number;
  targetCategory: number;
}

export const PA_MILESTONES: PaMilestone[] = [
  { date: '2026-05-31', distinct: 2, new: 1, targetCategory: 1 },
  { date: '2026-06-30', distinct: 5, new: 3, targetCategory: 2 },
  { date: '2026-07-31', distinct: 8, new: 5, targetCategory: 4 },
  { date: '2026-08-31', distinct: 11, new: 7, targetCategory: 5 },
  { date: '2026-09-30', distinct: 14, new: 8, targetCategory: 6 },
  { date: '2026-10-31', distinct: 16, new: 9, targetCategory: 7 },
  { date: '2026-11-30', distinct: 18, new: 10, targetCategory: 8 },
  { date: '2026-12-15', distinct: 18, new: 10, targetCategory: 8 },
  { date: '2026-12-31', distinct: 18, new: 10, targetCategory: 8 },
];

export const MDRT_TARGETS: Record<
  MdrtRoute,
  { label: string; target: number; firstYearCommission?: number }
> = {
  commission: { label: 'Commission', target: 512_800 },
  fyp: { label: 'FYP', target: 2_051_200 },
  income: {
    label: 'Income',
    target: 888_100,
    firstYearCommission: 256_400,
  },
};

export const COMMISSION_MILESTONES: { date: string; amount: number }[] = [
  { date: '2026-06-30', amount: 70_000 },
  { date: '2026-07-31', amount: 135_000 },
  { date: '2026-08-31', amount: 210_000 },
  { date: '2026-09-30', amount: 295_000 },
  { date: '2026-10-31', amount: 385_000 },
  { date: '2026-11-30', amount: 475_000 },
  { date: '2026-12-15', amount: 512_800 },
];

export const FYP_MILESTONES: { date: string; amount: number }[] = [
  { date: '2026-06-30', amount: 280_000 },
  { date: '2026-07-31', amount: 540_000 },
  { date: '2026-08-31', amount: 840_000 },
  { date: '2026-09-30', amount: 1_180_000 },
  { date: '2026-10-31', amount: 1_540_000 },
  { date: '2026-11-30', amount: 1_900_000 },
  { date: '2026-12-15', amount: 2_051_200 },
];

export const RECRUITMENT_STAGE_ORDER = [
  'Identified',
  'Contacted',
  'Vision Meeting Booked',
  'Vision Meeting Completed',
  'Interested',
  'Licensing Study Started',
  'Exam Ready',
  'Exam Passed',
  'Contracting / Appointment',
  'Onboarded',
  'Active Agent',
] as const;

export const AGENTS_TARGET = 4;
