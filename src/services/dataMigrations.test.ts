import { describe, expect, it } from 'vitest';
import { mergeAdvisorTasks } from './dataMigrations';
import type { Task } from '../types';
import { ADVISOR_GROWTH_PROJECT_ID } from '../types';
import { emptyTask } from '../utils/defaults';

describe('mergeAdvisorTasks', () => {
  it('does not inject Advisor Growth seed tasks when seed list is empty', () => {
    const other: Task = {
      ...emptyTask('custom-project'),
      id: 'custom-1',
      title: 'Custom task',
    };
    const merged = mergeAdvisorTasks([other]);
    expect(merged.some((t) => t.projectId === ADVISOR_GROWTH_PROJECT_ID)).toBe(false);
    expect(merged.find((t) => t.id === 'custom-1')).toBeTruthy();
  });

  it('keeps tasks on Advisor Growth project (user tasks persist on load)', () => {
    const agc: Task = {
      ...emptyTask(ADVISOR_GROWTH_PROJECT_ID),
      id: 'agc-user-task',
      title: 'User AGC task',
    };
    const merged = mergeAdvisorTasks([agc]);
    expect(merged.some((t) => t.id === 'agc-user-task')).toBe(true);
  });

  it('keeps both AGC and non-AGC tasks when mixed', () => {
    const other: Task = {
      ...emptyTask('x'),
      id: 'keep-me',
      title: 'Keep',
    };
    const agc: Task = {
      ...emptyTask(ADVISOR_GROWTH_PROJECT_ID),
      id: 'agc-me',
      title: 'AGC',
    };
    const merged = mergeAdvisorTasks([other, agc]);
    expect(merged.map((t) => t.id).sort()).toEqual(['agc-me', 'keep-me']);
  });
});
