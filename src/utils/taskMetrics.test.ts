import { describe, expect, it } from 'vitest';
import { emptyAdvisorExecution } from './defaults';
import { inferTaskMetric, syncAdvisorMetricsOnTaskChange } from './taskMetrics';
import { migrateTask } from './taskMigrate';

describe('inferTaskMetric', () => {
  it('parses distinct insured milestone', () => {
    const m = inferTaskMetric('Reach 11 distinct insured customers');
    expect(m).toEqual({
      metricKey: 'pa.distinctInsured',
      metricMode: 'set',
      metricValue: 11,
    });
  });

  it('parses MDRT commission milestone', () => {
    const m = inferTaskMetric('Reach HKD 295,000 cumulative commission');
    expect(m?.metricKey).toBe('mdrt.commission');
    expect(m?.metricValue).toBe(295_000);
  });
});

describe('syncAdvisorMetricsOnTaskChange', () => {
  it('increments distinct insured on complete', () => {
    const before = migrateTask({
      id: 't1',
      title: 'Reach 5 distinct',
      metricKey: 'pa.distinctInsured',
      metricMode: 'set',
      metricValue: 5,
      status: 'Not Started',
    });
    const after = { ...before, status: 'Completed' as const, completedAt: '2026-01-01' };
    const advisor = emptyAdvisorExecution();
    const result = syncAdvisorMetricsOnTaskChange(advisor, before, after);
    expect(result.advisor.pa.distinctInsured).toBe(5);
    expect(result.taskPatch?.metricSnapshot).toBe(0);
  });
});
