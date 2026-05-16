import { describe, expect, it } from 'vitest';
import { computeProjectTaskProgress } from './dashboardStats';
import type { Task } from '../types';

function task(id: string, projectId: string, status: Task['status']): Task {
  return {
    id,
    title: id,
    projectId,
    module: '',
    area: 'Admin',
    priority: 'P2',
    status,
    deadline: '',
    owner: '',
    dependency: '',
    successMetric: '',
    progressPercentage: 0,
    timeNeeded: '1 hour',
    energyLevel: 'Medium',
    impact: 'Medium',
    track: '',
    metricKey: '',
    metricMode: 'set',
    metricValue: 0,
    today: false,
    thisWeek: false,
    notes: '',
    createdAt: '',
    updatedAt: '',
    completedAt: '',
  };
}

describe('computeProjectTaskProgress', () => {
  it('returns percent of completed non-deferred tasks', () => {
    const tasks = [
      task('1', 'p1', 'Completed'),
      task('2', 'p1', 'Not Started'),
      task('3', 'p1', 'Deferred'),
    ];
    expect(computeProjectTaskProgress('p1', tasks)).toBe(50);
  });
});
