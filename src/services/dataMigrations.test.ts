import { describe, expect, it } from 'vitest';
import { mergeAdvisorTasks } from './dataMigrations';
import type { Task } from '../types';
import { ADVISOR_GROWTH_PROJECT_ID } from '../types';
import { emptyTask } from '../utils/defaults';

describe('mergeAdvisorTasks', () => {
  it('does not inject Advisor Growth seed tasks', () => {
    const other: Task = {
      ...emptyTask('custom-project'),
      id: 'custom-1',
      title: 'Custom task',
    };
    const merged = mergeAdvisorTasks([other]);
    expect(merged.some((t) => t.projectId === ADVISOR_GROWTH_PROJECT_ID)).toBe(false);
    expect(merged.find((t) => t.id === 'custom-1')).toBeTruthy();
  });

  it('drops stored Advisor Growth tasks on merge', () => {
    const agc: Task = {
      ...emptyTask(ADVISOR_GROWTH_PROJECT_ID),
      id: 'agc-stale',
      title: 'Old AGC task',
      module: 'PA/MDRT System Build',
    };
    const merged = mergeAdvisorTasks([agc]);
    expect(merged.some((t) => t.id === 'agc-stale')).toBe(false);
  });

  it('keeps non–Advisor Growth tasks when mixing with AGC', () => {
    const other: Task = {
      ...emptyTask('x'),
      id: 'keep-me',
      title: 'Keep',
    };
    const agc: Task = {
      ...emptyTask(ADVISOR_GROWTH_PROJECT_ID),
      id: 'drop-me',
      title: 'Drop',
    };
    const merged = mergeAdvisorTasks([other, agc]);
    expect(merged.map((t) => t.id).sort()).toEqual(['keep-me']);
  });
});
