import type { TaskMetricKey, TaskMetricMode } from '../types';

export interface TaskMetricDefinition {
  key: TaskMetricKey;
  label: string;
  defaultMode: TaskMetricMode;
  hint: string;
}

export const TASK_METRIC_DEFINITIONS: TaskMetricDefinition[] = [
  {
    key: 'pa.distinctInsured',
    label: 'PA — Distinct insured',
    defaultMode: 'set',
    hint: 'Sets distinct insured count (milestone tasks).',
  },
  {
    key: 'pa.newInsured',
    label: 'PA — New insured',
    defaultMode: 'set',
    hint: 'Sets new insured customer count.',
  },
  {
    key: 'pa.vitalityCustomers',
    label: 'PA — Vitality / med / CI',
    defaultMode: 'set',
    hint: 'Sets vitality / medical / CI / accident customers.',
  },
  {
    key: 'pa.ifhcReports',
    label: 'PA — iFHC reports',
    defaultMode: 'set',
    hint: 'Sets cumulative iFHC reports completed.',
  },
  {
    key: 'pa.digitalActivities',
    label: 'PA — Digital activities',
    defaultMode: 'increment',
    hint: 'Adds to digital tool activity count.',
  },
  {
    key: 'pa.productCategory.savings',
    label: 'PA — Savings category met',
    defaultMode: 'set',
    hint: 'Marks savings product category complete.',
  },
  {
    key: 'pa.productCategory.protection',
    label: 'PA — Protection category met',
    defaultMode: 'set',
    hint: 'Marks protection product category complete.',
  },
  {
    key: 'pa.productCategory.thirdCategory',
    label: 'PA — Third category met',
    defaultMode: 'set',
    hint: 'Marks third PA product category complete.',
  },
  {
    key: 'mdrt.commission',
    label: 'MDRT — Commission (HKD)',
    defaultMode: 'set',
    hint: 'Sets cumulative commission toward MDRT.',
  },
  {
    key: 'mdrt.fyp',
    label: 'MDRT — FYP (HKD)',
    defaultMode: 'set',
    hint: 'Sets cumulative FYP.',
  },
  {
    key: 'mdrt.income',
    label: 'MDRT — Income (HKD)',
    defaultMode: 'set',
    hint: 'Sets cumulative income route value.',
  },
  {
    key: 'mdrt.firstYearCommission',
    label: 'MDRT — First-year commission (HKD)',
    defaultMode: 'set',
    hint: 'Sets first-year commission (income route).',
  },
  {
    key: 'recruitment.agentsOnboarded',
    label: 'Recruitment — Agents onboarded',
    defaultMode: 'set',
    hint: 'Sets agents onboarded count.',
  },
];

export function getMetricDefinition(key: TaskMetricKey): TaskMetricDefinition | undefined {
  return TASK_METRIC_DEFINITIONS.find((d) => d.key === key);
}
