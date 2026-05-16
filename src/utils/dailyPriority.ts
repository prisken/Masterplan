import type { AppData, Task } from '../types';
import { ADVISOR_GROWTH_PROJECT_ID } from '../types';
import { compareTasksByUrgency } from './taskSort';
import { getEffectiveTaskStatus, isTaskCompleted } from './taskStatus';
import { isOverdueTask } from './taskDeadline';
import { getReferenceDate } from './referenceDate';
import { parseDate, startOfDay } from './taskDeadline';
import { getTaskTitle } from './taskTitle';

export interface PriorityGroup {
  label: string;
  tasks: Task[];
}

export function getDailyPriorityGroups(data: AppData, now = getReferenceDate()): PriorityGroup[] {
  const open = data.tasks.filter((t) => !isTaskCompleted(getEffectiveTaskStatus(t, now)));
  const today = startOfDay(now);
  const in7 = new Date(today);
  in7.setDate(today.getDate() + 7);

  const overdueP0 = open
    .filter((t) => t.priority === 'P0' && isOverdueTask(t, now))
    .sort(compareTasksByUrgency);

  const p0Due7 = open
    .filter((t) => {
      if (t.priority !== 'P0' || isOverdueTask(t, now)) return false;
      const d = parseDate(t.deadline);
      return d && d >= today && d <= in7;
    })
    .sort(compareTasksByUrgency);

  const gapClosing = open
    .filter(
      (t) =>
        t.projectId === ADVISOR_GROWTH_PROJECT_ID &&
        (t.track === 'pa' || t.track === 'mdrt') &&
        !overdueP0.includes(t) &&
        !p0Due7.includes(t)
    )
    .slice(0, 8)
    .sort(compareTasksByUrgency);

  const licensingRecruitment = open
    .filter(
      (t) =>
        (t.track === 'hiring' || t.track === 'recruitment') &&
        (t.dependency.toLowerCase().includes('licens') ||
          t.module.toLowerCase().includes('team') ||
          t.module.toLowerCase().includes('hiring'))
    )
    .slice(0, 6)
    .sort(compareTasksByUrgency);

  const followUps = open
    .filter(
      (t) =>
        t.status === 'Waiting' ||
        t.area === 'Sales' ||
        t.module.toLowerCase().includes('prospect')
    )
    .filter((t) => !gapClosing.includes(t) && !licensingRecruitment.includes(t))
    .slice(0, 6)
    .sort(compareTasksByUrgency);

  return [
    { label: '1. Overdue P0 tasks', tasks: overdueP0 },
    { label: '2. P0 due within 7 days', tasks: p0Due7 },
    { label: '3. PA / MDRT gap-closing tasks', tasks: gapClosing },
    { label: '4. Recruitment & licensing dependency', tasks: licensingRecruitment },
    { label: '5. Follow-up & waiting tasks', tasks: followUps },
  ].filter((g) => g.tasks.length > 0);
}

export { getTaskTitle };
