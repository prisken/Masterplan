import { describe, expect, it } from 'vitest';
import { createDefaultData } from '../data/seedData';
import type { Task } from '../types';
import { emptyDailyEntry, emptyTask } from './defaults';
import {
  formatTop3Text,
  getMasterTasksForDay,
  linkTasksToEntry,
  suggestTop3Candidates,
} from './todayTasksSync';
describe('todayTasksSync', () => {
  const data = createDefaultData();
  const pacingIso = data.settings.pacingDate;

  it('includes tasks due on the selected day', () => {
    const task = {
      ...emptyTask('test-project'),
      id: 'test-due',
      deadline: pacingIso,
      status: 'Not Started' as const,
      today: false,
    };
    const app = { ...data, tasks: [...data.tasks, task] };
    const found = getMasterTasksForDay(app, pacingIso);
    expect(found.some((t) => t.id === 'test-due')).toBe(true);
  });

  it('links top 3 to entry ids and text', () => {
    const tasks: Task[] = [
      { ...emptyTask('p1'), id: 't1', title: 'First' },
      { ...emptyTask('p1'), id: 't2', title: 'Second' },
    ];
    const entry = linkTasksToEntry(emptyDailyEntry(pacingIso), tasks);
    expect(entry.linkedTaskIds).toHaveLength(2);
    expect(entry.todayTop3Tasks).toBe(formatTop3Text(tasks));
  });

  it('suggests pinned and due-today tasks first', () => {
    const pinned = {
      ...emptyTask('p1'),
      id: 'pinned-1',
      today: true,
      priority: 'P0' as const,
      status: 'Not Started' as const,
    };
    const app = { ...data, tasks: [pinned, ...data.tasks] };
    const suggested = suggestTop3Candidates(app, 1);
    expect(suggested[0]?.id).toBe('pinned-1');
  });
});
