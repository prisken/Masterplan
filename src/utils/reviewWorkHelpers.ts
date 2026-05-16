import type { AppData, DailyEntry, DailyTaskIntentKind, DailyTaskNote, Task } from '../types';
import { emptyDailyEntry } from './defaults';
import {
  isOverdueTask,
  isToday,
  parseDate,
  startOfDay,
} from './taskDeadline';
import { getEffectiveTaskStatus, isTaskCompleted } from './taskStatus';

export function getTaskById(data: AppData, id: string): Task | undefined {
  return data.tasks.find((t) => t.id === id);
}

export function getTasksByIds(data: AppData, ids: string[]): Task[] {
  const map = new Map(data.tasks.map((t) => [t.id, t]));
  return ids.map((id) => map.get(id)).filter((t): t is Task => !!t);
}

export function addUniqueTaskIds(existing: string[], add: string[]): string[] {
  const set = new Set(existing);
  for (const id of add) set.add(id);
  return [...set];
}

export function removeTaskId(ids: string[], taskId: string): string[] {
  return ids.filter((id) => id !== taskId);
}

export function getDailyTaskNote(entry: DailyEntry, taskId: string): DailyTaskNote | undefined {
  return entry.dailyTaskNotes?.find((n) => n.taskId === taskId);
}

export function upsertDailyTaskNote(entry: DailyEntry, patch: DailyTaskNote): DailyEntry {
  const list = [...(entry.dailyTaskNotes ?? [])];
  const i = list.findIndex((n) => n.taskId === patch.taskId);
  if (i >= 0) list[i] = { ...list[i], ...patch };
  else list.push({ ...patch });
  return { ...entry, dailyTaskNotes: list };
}

export function removeDailyTaskNote(entry: DailyEntry, taskId: string): DailyEntry {
  return {
    ...entry,
    dailyTaskNotes: (entry.dailyTaskNotes ?? []).filter((n) => n.taskId !== taskId),
  };
}

export function getDailyTaskIntent(entry: DailyEntry, taskId: string): DailyTaskIntentKind {
  const row = entry.dailyTaskIntent?.find((x) => x.taskId === taskId);
  return row?.intent ?? 'aim_today';
}

export function upsertDailyTaskIntent(
  entry: DailyEntry,
  taskId: string,
  intent: DailyTaskIntentKind
): DailyEntry {
  const list = [...(entry.dailyTaskIntent ?? [])];
  const i = list.findIndex((x) => x.taskId === taskId);
  if (i >= 0) list[i] = { taskId, intent };
  else list.push({ taskId, intent });
  return { ...entry, dailyTaskIntent: list };
}

export function removeDailyTaskIntent(entry: DailyEntry, taskId: string): DailyEntry {
  return {
    ...entry,
    dailyTaskIntent: (entry.dailyTaskIntent ?? []).filter((x) => x.taskId !== taskId),
  };
}

export function stripDailyTaskMeta(entry: DailyEntry, taskId: string): DailyEntry {
  let next = removeDailyTaskNote(entry, taskId);
  next = removeDailyTaskIntent(next, taskId);
  return next;
}

export function addDaysIso(dateIso: string, delta: number): string {
  const d = parseDate(dateIso);
  if (!d) return dateIso;
  d.setDate(d.getDate() + delta);
  return d.toISOString().slice(0, 10);
}

export function getWeekBoundsForDate(anchorIso: string): { mon: string; sun: string } {
  const d = parseDate(anchorIso);
  if (!d) return { mon: anchorIso, sun: anchorIso };
  const day = d.getDay();
  const monday = new Date(d);
  monday.setDate(d.getDate() - day + (day === 0 ? -6 : 1));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return { mon: monday.toISOString().slice(0, 10), sun: sunday.toISOString().slice(0, 10) };
}

export function getDailyEntriesForWeek(entries: DailyEntry[], weekStartIso: string): DailyEntry[] {
  const { mon, sun } = getWeekBoundsForDate(weekStartIso);
  return entries.filter((e) => e.date >= mon && e.date <= sun);
}

export function getDailyEntriesForMonth(entries: DailyEntry[], monthIso: string): DailyEntry[] {
  return entries.filter((e) => e.date.startsWith(monthIso));
}

export function getTasksForDailyEntry(data: AppData, entry: DailyEntry | undefined): Task[] {
  if (!entry) return [];
  return getTasksByIds(data, entry.linkedTaskIds);
}

export type TaskPickerFilter =
  | 'all'
  | 'overdue'
  | 'due_today'
  | 'due_week'
  | 'p0'
  | 'p1'
  | 'pa'
  | 'mdrt'
  | 'recruitment'
  | 'client';

export function matchesTaskPickerFilter(
  task: Task,
  filter: TaskPickerFilter,
  anchorDateIso: string,
  refNow: Date
): boolean {
  if (filter === 'all') return true;
  if (isTaskCompleted(getEffectiveTaskStatus(task, refNow))) return false;
  const anchorDay = parseDate(anchorDateIso) ?? refNow;
  if (filter === 'overdue') return isOverdueTask(task, refNow);
  if (filter === 'due_today') return isToday(task.deadline, anchorDay);
  if (filter === 'due_week') {
    if (!task.deadline) return false;
    const { mon, sun } = getWeekBoundsForDate(anchorDateIso);
    return task.deadline >= mon && task.deadline <= sun;
  }
  if (filter === 'p0') return task.priority === 'P0';
  if (filter === 'p1') return task.priority === 'P1';
  if (filter === 'pa') return task.track === 'pa';
  if (filter === 'mdrt') return task.track === 'mdrt';
  if (filter === 'recruitment') return task.track === 'recruitment' || task.track === 'hiring';
  if (filter === 'client') {
    return (
      task.track === 'ifhc' ||
      task.area === 'Sales' ||
      /prospect/i.test(task.module) ||
      /client/i.test(task.module)
    );
  }
  return true;
}

export function filterTasksForPicker(
  tasks: Task[],
  filter: TaskPickerFilter,
  anchorDateIso: string,
  refNow: Date
): Task[] {
  return tasks.filter((t) => matchesTaskPickerFilter(t, filter, anchorDateIso, refNow));
}

export function deadlineLabel(task: Task, anchorIso: string): string {
  const ref = parseDate(anchorIso) ?? new Date();
  if (!task.deadline) return 'No deadline';
  const d = parseDate(task.deadline);
  if (!d) return task.deadline;
  const t0 = startOfDay(ref);
  const diff = Math.ceil((d.getTime() - t0.getTime()) / 86400000);
  if (diff < 0) return `${-diff}d overdue`;
  if (diff === 0) return 'Due today';
  return `${diff}d left`;
}

export function appendNoteWithTimestamp(existing: string, addition: string): string {
  const stamp = new Date().toISOString().slice(0, 10);
  const line = `[${stamp}] ${addition.trim()}`;
  if (!existing.trim()) return line;
  return `${existing.trim()}\n${line}`;
}

export function parseActionLines(text: string): string[] {
  return text
    .split(/\n+/)
    .map((l) => l.replace(/^\d+\.\s*/, '').trim())
    .filter(Boolean);
}

export function getProjectName(data: AppData, projectId: string): string {
  return data.projects.find((p) => p.id === projectId)?.projectName ?? projectId;
}

export interface WeekTaskActivityRow {
  task: Task;
  daysWorked: number;
  latestOutcome: string;
  noteDays: number;
  blockedDays: number;
}

export function getTasksWorkedOnInWeek(
  entries: DailyEntry[],
  weekStartIso: string
): Map<string, { days: Set<string>; notes: number; blocked: number; lastOutcome: string }> {
  const weekEntries = getDailyEntriesForWeek(entries, weekStartIso);
  const map = new Map<
    string,
    { days: Set<string>; notes: number; blocked: number; lastOutcome: string }
  >();

  for (const e of weekEntries) {
    for (const id of e.linkedTaskIds) {
      let row = map.get(id);
      if (!row) {
        row = { days: new Set(), notes: 0, blocked: 0, lastOutcome: '' };
        map.set(id, row);
      }
      row.days.add(e.date);
      const intent = getDailyTaskIntent(e, id);
      if (intent === 'blocked') row.blocked += 1;
      const n = getDailyTaskNote(e, id);
      if (n && (n.whatDidToday || n.outcome || n.note || n.progressNote || n.nextStep)) {
        row.notes += 1;
        if (n.outcome) row.lastOutcome = n.outcome;
      }
    }
  }
  return map;
}

export function buildWeeklyActivityRows(
  data: AppData,
  entries: DailyEntry[],
  weekStartIso: string
): WeekTaskActivityRow[] {
  const map = getTasksWorkedOnInWeek(entries, weekStartIso);
  const rows: WeekTaskActivityRow[] = [];
  for (const [id, meta] of map) {
    const task = getTaskById(data, id);
    if (!task) continue;
    rows.push({
      task,
      daysWorked: meta.days.size,
      latestOutcome: meta.lastOutcome,
      noteDays: meta.notes,
      blockedDays: meta.blocked,
    });
  }
  return rows.sort((a, b) => b.daysWorked - a.daysWorked);
}

export function getCompletedTasksInRange(data: AppData, startIso: string, endIso: string): Task[] {
  return data.tasks.filter((t) => {
    if (!t.completedAt) return false;
    const d = t.completedAt.slice(0, 10);
    return d >= startIso && d <= endIso;
  });
}

export function getCarriedForwardCount(entries: DailyEntry[], taskId: string): number {
  let n = 0;
  for (const e of entries) {
    const intent = e.dailyTaskIntent?.find((x) => x.taskId === taskId);
    if (intent?.intent === 'carry_forward') n += 1;
  }
  return n;
}

export function getBlockedTasksForWeek(
  data: AppData,
  entries: DailyEntry[],
  weekStartIso: string
): Task[] {
  const weekEntries = getDailyEntriesForWeek(entries, weekStartIso);
  const ids = new Set<string>();
  for (const e of weekEntries) {
    for (const row of e.dailyTaskIntent ?? []) {
      if (row.intent === 'blocked') ids.add(row.taskId);
    }
  }
  return getTasksByIds(data, [...ids]);
}

export function upsertDailyEntry(prevEntries: DailyEntry[], entry: DailyEntry): DailyEntry[] {
  const exists = prevEntries.some((e) => e.date === entry.date);
  if (!exists) return [...prevEntries, entry];
  return prevEntries.map((e) => (e.date === entry.date ? entry : e));
}

export function getOrCreateDailyEntry(prevEntries: DailyEntry[], dateIso: string): DailyEntry {
  const found = prevEntries.find((e) => e.date === dateIso);
  if (found) return { ...found, linkedTaskIds: found.linkedTaskIds ?? [] };
  return emptyDailyEntry(dateIso);
}

export interface MonthlyTaskAggregate {
  task: Task;
  daysWorked: number;
  carryCount: number;
  noteDays: number;
}

export function buildMonthlyActivityRows(
  data: AppData,
  entries: DailyEntry[],
  monthIso: string
): MonthlyTaskAggregate[] {
  const monthEntries = getDailyEntriesForMonth(entries, monthIso);
  const map = new Map<string, { days: Set<string>; carry: number; notes: number }>();
  for (const e of monthEntries) {
    for (const id of e.linkedTaskIds) {
      let agg = map.get(id);
      if (!agg) agg = { days: new Set(), carry: 0, notes: 0 };
      agg.days.add(e.date);
      if (getDailyTaskIntent(e, id) === 'carry_forward') agg.carry += 1;
      const n = getDailyTaskNote(e, id);
      if (n && (n.whatDidToday || n.outcome || n.note)) agg.notes += 1;
      map.set(id, agg);
    }
  }
  const out: MonthlyTaskAggregate[] = [];
  for (const [id, meta] of map) {
    const task = getTaskById(data, id);
    if (!task) continue;
    out.push({
      task,
      daysWorked: meta.days.size,
      carryCount: meta.carry,
      noteDays: meta.notes,
    });
  }
  return out.sort((a, b) => b.daysWorked - a.daysWorked);
}

/** True if any Mon–Sun day of the week falls in `monthYYYYMM` (YYYY-MM). */
export function weekOverlapsMonth(weekStartIso: string, monthYYYYMM: string): boolean {
  if (!weekStartIso || !monthYYYYMM) return false;
  const parts = weekStartIso.split('-').map(Number);
  if (parts.length < 3 || parts.some((n) => Number.isNaN(n))) return false;
  const [y, mo, da] = parts;
  const start = new Date(y, mo - 1, da);
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (ym === monthYYYYMM) return true;
  }
  return false;
}

export function countAdvisorTasks(data: AppData, predicate: (t: Task) => boolean): {
  open: number;
  done: number;
} {
  let open = 0;
  let done = 0;
  for (const t of data.tasks) {
    if (!predicate(t)) continue;
    if (isTaskCompleted(getEffectiveTaskStatus(t))) done += 1;
    else open += 1;
  }
  return { open, done };
}

export function lastDayOfMonthIso(monthIso: string): string {
  const parts = monthIso.split('-');
  if (parts.length < 2) return monthIso;
  const y = Number(parts[0]);
  const m = Number(parts[1]);
  if (!y || !m) return monthIso;
  const d = new Date(y, m, 0);
  return d.toISOString().slice(0, 10);
}
