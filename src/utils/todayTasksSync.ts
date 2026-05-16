import type { AppData, AppSettings, DailyEntry, Task } from '../types';
import { getPacingDateIso, resolvePacingDate } from './referenceDate';
import { isToday, parseDate } from './taskDeadline';
import { compareTasksByUrgency } from './taskSort';
import { getEffectiveTaskStatus, isTaskCompleted } from './taskStatus';
import { getTaskTitle } from './taskTitle';

export function getActiveDateIso(settings: AppSettings, override?: string): string {
  return override ?? getPacingDateIso(settings);
}

/** Open Master Tasks for a given day (deadline, pin-today, or linked on daily entry). */
export function getMasterTasksForDay(
  data: AppData,
  dateIso: string,
  entry?: DailyEntry | null
): Task[] {
  const pacingDay = resolvePacingDate(data.settings);
  const dayDate = parseDate(dateIso);
  const isPacingDay =
    dayDate && dayDate.getTime() === pacingDay.getTime();

  const linked = new Set(entry?.linkedTaskIds ?? []);
  const open = data.tasks.filter((t) => !isTaskCompleted(getEffectiveTaskStatus(t, pacingDay)));

  const matched = open.filter((t) => {
    if (linked.has(t.id)) return true;
    if (t.deadline === dateIso) return true;
    if (isPacingDay && t.today) return true;
    if (isPacingDay && isToday(t.deadline, pacingDay)) return true;
    return false;
  });

  const byId = new Map<string, Task>();
  for (const t of matched) byId.set(t.id, t);
  return [...byId.values()].sort(compareTasksByUrgency);
}

export function formatTop3Text(tasks: Task[]): string {
  return tasks
    .slice(0, 3)
    .map((t) => getTaskTitle(t))
    .join('\n');
}

export function linkTasksToEntry(entry: DailyEntry, tasks: Task[]): DailyEntry {
  const top = tasks.slice(0, 3);
  return {
    ...entry,
    linkedTaskIds: top.map((t) => t.id),
    todayTop3Tasks: formatTop3Text(top),
  };
}

export function parseTop3Lines(text: string): string[] {
  return text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
}

/** Resolve linked ids, falling back to title match from todayTop3Tasks text. */
export function resolveLinkedTasks(data: AppData, entry: DailyEntry): Task[] {
  const byId = entry.linkedTaskIds
    .map((id) => data.tasks.find((t) => t.id === id))
    .filter((t): t is Task => !!t);

  if (byId.length > 0) return byId;

  const lines = parseTop3Lines(entry.todayTop3Tasks);
  if (lines.length === 0) return [];

  return lines
    .map((line) => {
      const lower = line.toLowerCase();
      return data.tasks.find((t) => getTaskTitle(t).toLowerCase() === lower);
    })
    .filter((t): t is Task => !!t);
}

export function pinTasks(data: AppData, taskIds: string[], pinned: boolean): AppData {
  const set = new Set(taskIds);
  return {
    ...data,
    tasks: data.tasks.map((t) => (set.has(t.id) ? { ...t, today: pinned } : t)),
  };
}

export function suggestTop3Candidates(data: AppData, limit = 3): Task[] {
  const pacingDay = resolvePacingDate(data.settings);
  const open = data.tasks
    .filter((t) => !isTaskCompleted(getEffectiveTaskStatus(t, pacingDay)))
    .sort(compareTasksByUrgency);
  const pinned = open.filter((t) => t.today);
  const dueToday = open.filter((t) => isToday(t.deadline, pacingDay) && !pinned.includes(t));
  const combined = [...pinned, ...dueToday];
  const seen = new Set<string>();
  const out: Task[] = [];
  for (const t of combined) {
    if (seen.has(t.id)) continue;
    seen.add(t.id);
    out.push(t);
    if (out.length >= limit) break;
  }
  if (out.length < limit) {
    for (const t of open) {
      if (seen.has(t.id)) continue;
      out.push(t);
      if (out.length >= limit) break;
    }
  }
  return out;
}
