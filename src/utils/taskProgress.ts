import type { Task, TaskTrack } from '../types';
import { ADVISOR_GROWTH_PROJECT_ID } from '../types';
import { parseDate, startOfDay } from './taskDeadline';
import { getReferenceDate } from './referenceDate';

export interface TrackProgress {
  label: string;
  done: number;
  total: number;
  percent: number;
  internalDeadline: string;
  finalDeadline: string;
  daysToInternal: number | null;
  daysToFinal: number | null;
  overdueCount: number;
}

function daysUntil(dateStr: string, now = getReferenceDate()): number | null {
  const d = parseDate(dateStr);
  if (!d) return null;
  const t = startOfDay(now);
  return Math.ceil((d.getTime() - t.getTime()) / (1000 * 60 * 60 * 24));
}

function calcTrack(
  tasks: Task[],
  track: TaskTrack,
  label: string,
  internalDeadline: string,
  finalDeadline: string
): TrackProgress {
  const relevant = tasks.filter(
    (t) => t.projectId === ADVISOR_GROWTH_PROJECT_ID && t.track === track
  );
  const done = relevant.filter((t) => t.status === 'Completed').length;
  const total = relevant.length;
  const percent = total > 0 ? Math.round((done / total) * 100) : 0;
  const overdueCount = relevant.filter((t) => {
    if (t.status === 'Completed' || !t.deadline) return false;
    const d = parseDate(t.deadline);
    return d && d < startOfDay();
  }).length;

  return {
    label,
    done,
    total,
    percent,
    internalDeadline,
    finalDeadline,
    daysToInternal: daysUntil(internalDeadline),
    daysToFinal: daysUntil(finalDeadline),
    overdueCount,
  };
}

export function getAdvisorProgressWidgets(tasks: Task[]): TrackProgress[] {
  return [
    calcTrack(tasks, 'pa', 'PA progress', '2026-11-30', '2026-12-31'),
    calcTrack(tasks, 'mdrt', 'MDRT progress', '2026-12-15', '2026-12-31'),
    calcTrack(tasks, 'ifhc', 'iFHC progress', '2026-11-30', '2026-12-31'),
    calcTrack(tasks, 'digital', 'Digital activity', '2026-06-30', '2026-12-31'),
    calcTrack(tasks, 'recruitment', 'Recruitment pipeline', '2026-08-31', '2026-12-31'),
    calcTrack(
      tasks,
      'hiring',
      '4-agent hiring',
      '2026-12-15',
      '2026-12-31'
    ),
  ];
}
