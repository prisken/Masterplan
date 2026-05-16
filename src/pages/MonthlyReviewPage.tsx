import { useMemo, useState } from 'react';
import { Header } from '../components/layout/Header';
import { ReviewFlowBanner } from '../components/reviews/ReviewFlowBanner';
import { TaskPickerModal } from '../components/today/TaskPickerModal';
import { Card } from '../components/ui/Card';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { EmptyState } from '../components/ui/EmptyState';
import { FormField, inputClass, textareaClass } from '../components/ui/FormField';
import { PageActions } from '../components/ui/PageActions';
import { useAppData } from '../context/AppDataContext';
import { useToast } from '../context/ToastContext';
import { migrateMonthlyReview } from '../services/dataMigrations';
import type { MonthlyReview } from '../types';
import { emptyMonthlyReview } from '../utils/defaults';
import { formatMonthLabel, formatWeekLabel } from '../utils/dateHelpers';
import { generateId } from '../utils/id';
import { cn } from '../utils/cn';
import { resolvePacingDate } from '../utils/referenceDate';
import {
  addUniqueTaskIds,
  buildMonthlyActivityRows,
  countAdvisorTasks,
  getCompletedTasksInRange,
  getProjectName,
  getTaskById,
  lastDayOfMonthIso,
  parseActionLines,
  removeTaskId,
  weekOverlapsMonth,
} from '../utils/reviewWorkHelpers';
import { isOverdueTask } from '../utils/taskDeadline';
import { getEffectiveTaskStatus, isTaskCompleted } from '../utils/taskStatus';
import { getTaskTitle } from '../utils/taskTitle';

const reflectionPrimary: { key: keyof MonthlyReview; label: string; rows?: number }[] = [
  { key: 'biggestWins', label: 'Biggest wins', rows: 4 },
  { key: 'biggestProblems', label: 'Biggest problems', rows: 4 },
];

const reflectionPlanning: { key: keyof MonthlyReview; label: string; rows?: number }[] = [
  { key: 'nextMonthTop10Actions', label: "Next month's top 10 actions", rows: 6 },
];

const reflectionMetrics: { key: keyof MonthlyReview; label: string; rows?: number }[] = [
  { key: 'revenueGenerated', label: 'Revenue generated' },
  { key: 'followersGained', label: 'Followers gained' },
  { key: 'leadsGenerated', label: 'Leads generated' },
  { key: 'eventsHeld', label: 'Events held' },
  { key: 'sponsorsDonorsAdded', label: 'Sponsors / donors added' },
  { key: 'hksiStudyProgress', label: 'HKSI study progress', rows: 3 },
  { key: 'bestPerformingContent', label: 'Best performing content', rows: 2 },
  { key: 'mostValuableRelationshipBuilt', label: 'Most valuable relationship built', rows: 2 },
  { key: 'projectDeservesMoreFocus', label: 'Project that deserves more focus next month' },
  { key: 'projectShouldBeSimplified', label: 'Project that should be simplified' },
];

export function MonthlyReviewPage() {
  const { data, updateData } = useAppData();
  const { toast } = useToast();

  const sorted = useMemo(
    () => [...data.monthlyReviews].sort((a, b) => b.month.localeCompare(a.month)),
    [data.monthlyReviews]
  );

  const [selectedId, setSelectedId] = useState<string | null>(sorted[0]?.id ?? null);
  const [form, setForm] = useState<MonthlyReview>(() =>
    sorted[0] ? migrateMonthlyReview(sorted[0]) : migrateMonthlyReview(emptyMonthlyReview())
  );
  const [deleteTarget, setDeleteTarget] = useState<MonthlyReview | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  const refNow = resolvePacingDate(data.settings);

  const monthStart = form.month ? `${form.month}-01` : '';
  const monthEnd = form.month ? lastDayOfMonthIso(form.month) : '';

  const activityRows = useMemo(
    () =>
      form.month ? buildMonthlyActivityRows(data, data.dailyEntries, form.month) : [],
    [data, data.dailyEntries, data.tasks, form.month]
  );

  const completedMonth = useMemo(
    () =>
      monthStart && monthEnd ? getCompletedTasksInRange(data, monthStart, monthEnd) : [],
    [data.tasks, monthStart, monthEnd]
  );

  const projectRollup = useMemo(() => {
    const m = new Map<string, { days: number; carries: number; label: string }>();
    for (const row of activityRows) {
      const pid = row.task.projectId;
      const cur = m.get(pid) ?? { days: 0, carries: 0, label: getProjectName(data, pid) };
      cur.days += row.daysWorked;
      cur.carries += row.carryCount;
      m.set(pid, cur);
    }
    return [...m.entries()]
      .map(([id, v]) => ({ id, ...v }))
      .sort((a, b) => b.days - a.days);
  }, [activityRows, data.projects]);

  const advisorCompletedMonth = useMemo(() => {
    return {
      pa: completedMonth.filter((t) => t.track === 'pa').length,
      mdrt: completedMonth.filter((t) => t.track === 'mdrt').length,
      rec: completedMonth.filter((t) => t.track === 'recruitment' || t.track === 'hiring').length,
    };
  }, [completedMonth]);

  const topCarriedRows = useMemo(
    () =>
      [...activityRows]
        .filter((r) => r.carryCount > 0)
        .sort((a, b) => b.carryCount - a.carryCount)
        .slice(0, 8),
    [activityRows]
  );

  const quietProjectRows = useMemo(() => [...projectRollup].slice(-5).reverse(), [projectRollup]);

  const pickerAnchor = form.month
    ? `${form.month}-15`
    : refNow.toISOString().slice(0, 10);

  const selectReview = (review: MonthlyReview) => {
    setSelectedId(review.id);
    setForm(migrateMonthlyReview(review));
  };

  const startNew = () => {
    const fresh = migrateMonthlyReview({ ...emptyMonthlyReview(), id: generateId('monthly') });
    setSelectedId(fresh.id);
    setForm(fresh);
  };

  const pullMonthlySummary = () => {
    if (!form.month || !monthStart || !monthEnd) {
      toast('Pick a month first', 'error');
      return;
    }
    const overdueCrit = data.tasks.filter(
      (t) =>
        (t.priority === 'P0' || t.priority === 'P1') &&
        isOverdueTask(t, refNow) &&
        !isTaskCompleted(getEffectiveTaskStatus(t, refNow))
    );
    const topCarry = [...activityRows].sort((a, b) => b.carryCount - a.carryCount).slice(0, 8);
    const quietProjects = [...projectRollup].slice(-5).reverse();
    const pa = countAdvisorTasks(data, (t) => t.track === 'pa');
    const mdrt = countAdvisorTasks(data, (t) => t.track === 'mdrt');
    const rec = countAdvisorTasks(data, (t) => t.track === 'recruitment' || t.track === 'hiring');

    const lines = [
      '— Completed this month —',
      ...completedMonth.slice(0, 30).map((t) => `• ${getTaskTitle(t)}`),
      '',
      '— Most active tasks (by linked days) —',
      ...activityRows.slice(0, 12).map(
        (r) =>
          `• ${getTaskTitle(r.task)} · ${r.daysWorked} day(s) · carries ${r.carryCount} · notes ${r.noteDays}`
      ),
      '',
      '— Repeatedly carried forward —',
      ...topCarry.filter((r) => r.carryCount > 0).map((r) => `• ${getTaskTitle(r.task)} · ${r.carryCount}x`),
      '',
      '— Overdue P0/P1 still open —',
      ...overdueCrit.slice(0, 15).map((t) => `• ${getTaskTitle(t)} (${t.deadline || 'no date'})`),
      '',
      '— Hot projects (linked days) —',
      ...projectRollup.slice(0, 6).map((p) => `• ${p.label}: ${p.days} day-links`),
      '',
      '— Quieter projects —',
      ...quietProjects.map((p) => `• ${p.label}: ${p.days} day-links`),
      '',
      '— Advisor-linked tasks (tracks) —',
      `PA: ${pa.done} done / ${pa.open} open`,
      `MDRT: ${mdrt.done} done / ${mdrt.open} open`,
      `Recruitment / hiring: ${rec.done} done / ${rec.open} open`,
    ];

    setForm((f) => ({
      ...f,
      biggestWins: [f.biggestWins, lines.join('\n')].filter(Boolean).join('\n\n'),
    }));
    toast('Summary appended to Biggest wins');
  };

  const carryFromLatestWeekly = () => {
    const latest = [...data.weeklyReviews].sort((a, b) =>
      b.weekStartDate.localeCompare(a.weekStartDate)
    )[0];
    const ids = latest?.nextWeekTaskIds ?? [];
    if (!ids.length) {
      toast('No next-week list on latest weekly review', 'error');
      return;
    }
    setForm((f) => ({
      ...f,
      nextMonthTaskIds: addUniqueTaskIds(f.nextMonthTaskIds ?? [], ids),
    }));
    toast(`Imported ${ids.length} task id(s) from latest weekly review`);
  };

  const carryOpenWeeklyFocusOnly = () => {
    const latest = [...data.weeklyReviews].sort((a, b) =>
      b.weekStartDate.localeCompare(a.weekStartDate)
    )[0];
    const ids = (latest?.nextWeekTaskIds ?? []).filter((id) => {
      const t = getTaskById(data, id);
      return t && !isTaskCompleted(getEffectiveTaskStatus(t, refNow));
    });
    if (!ids.length) {
      toast('No open tasks in latest weekly focus list', 'error');
      return;
    }
    setForm((f) => ({
      ...f,
      nextMonthTaskIds: addUniqueTaskIds(f.nextMonthTaskIds ?? [], ids),
    }));
    toast(`Added ${ids.length} open task(s) from weekly focus`);
  };

  const pullFromWeekly = () => {
    if (!form.month) {
      toast('Pick a month first', 'error');
      return;
    }
    const weeks = data.weeklyReviews
      .filter((w) => weekOverlapsMonth(w.weekStartDate, form.month))
      .sort((a, b) => a.weekStartDate.localeCompare(b.weekStartDate));
    if (!weeks.length) {
      toast('No weekly reviews overlap this month', 'error');
      return;
    }
    const blocks = weeks.map((w) => {
      const parts = [
        `## ${formatWeekLabel(w.weekStartDate)}`,
        w.whatWorked && `What worked:\n${w.whatWorked}`,
        w.whatDidNotWork && `What didn't:\n${w.whatDidNotWork}`,
        w.projectMostProgress && `Most progress: ${w.projectMostProgress}`,
        w.projectMostStress && `Most stress: ${w.projectMostStress}`,
        w.top5ActionsNextWeek && `Top 5 next week:\n${w.top5ActionsNextWeek}`,
      ];
      return parts.filter(Boolean).join('\n\n');
    });
    setForm((f) => ({
      ...f,
      biggestWins: [f.biggestWins, '--- Weekly review excerpts ---\n\n' + blocks.join('\n\n---\n\n')]
        .filter(Boolean)
        .join('\n\n'),
    }));
    toast(`Pulled ${weeks.length} weekly review(s) into Biggest wins`);
  };

  const carryMonthlyImportantOpen = () => {
    const ids = activityRows
      .filter(
        (r) =>
          (r.task.priority === 'P0' || r.task.priority === 'P1') &&
          !isTaskCompleted(getEffectiveTaskStatus(r.task, refNow))
      )
      .map((r) => r.task.id);
    if (!ids.length) {
      toast('No open P0/P1 in monthly activity', 'error');
      return;
    }
    setForm((f) => ({ ...f, nextMonthTaskIds: addUniqueTaskIds(f.nextMonthTaskIds ?? [], ids) }));
    toast(`Added ${ids.length} open P0/P1 from monthly activity`);
  };

  const matchTop10Lines = () => {
    const lines = parseActionLines(form.nextMonthTop10Actions).slice(0, 10);
    const ids: string[] = [];
    for (const line of lines) {
      const t = data.tasks.find((x) => getTaskTitle(x).toLowerCase() === line.toLowerCase());
      if (t) ids.push(t.id);
    }
    if (!ids.length) {
      toast('No exact title matches', 'error');
      return;
    }
    setForm((f) => ({ ...f, nextMonthTaskIds: addUniqueTaskIds(f.nextMonthTaskIds ?? [], ids) }));
    toast(`Linked ${ids.length} task(s)`);
  };

  const addMonthTasks = (ids: string[]) => {
    setForm((f) => ({ ...f, nextMonthTaskIds: addUniqueTaskIds(f.nextMonthTaskIds ?? [], ids) }));
  };

  const removeMonthTask = (taskId: string) => {
    setForm((f) => ({
      ...f,
      nextMonthTaskIds: removeTaskId(f.nextMonthTaskIds ?? [], taskId),
      monthlyTaskNotes: (f.monthlyTaskNotes ?? []).filter((x) => x.taskId !== taskId),
    }));
  };

  const setMonthNote = (taskId: string, note: string) => {
    const list = [...(form.monthlyTaskNotes ?? [])];
    const i = list.findIndex((x) => x.taskId === taskId);
    if (i >= 0) list[i] = { taskId, note };
    else list.push({ taskId, note });
    setForm({ ...form, monthlyTaskNotes: list });
  };

  const save = () => {
    if (!form.month) {
      toast('Month is required', 'error');
      return;
    }
    const normalized = migrateMonthlyReview(form);
    updateData((prev) => {
      const exists = prev.monthlyReviews.some((r) => r.id === normalized.id);
      const monthlyReviews = exists
        ? prev.monthlyReviews.map((r) => (r.id === normalized.id ? normalized : r))
        : [...prev.monthlyReviews, normalized];
      return { ...prev, monthlyReviews };
    });
    toast('Monthly review saved');
    setSelectedId(normalized.id);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    updateData((prev) => ({
      ...prev,
      monthlyReviews: prev.monthlyReviews.filter((r) => r.id !== deleteTarget.id),
    }));
    toast('Review deleted');
    if (selectedId === deleteTarget.id) {
      const next = sorted.find((r) => r.id !== deleteTarget.id);
      if (next) selectReview(next);
      else startNew();
    }
    setDeleteTarget(null);
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <Header
          title="Monthly Review"
          subtitle="Task patterns from your dailies, reflection, and next-month focus"
        />
        <PageActions onAdd={startNew} addLabel="New review" />
      </div>

      <ReviewFlowBanner active="monthly" />

      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <Card padding="sm">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Saved reviews ({sorted.length})
          </p>
          {sorted.length === 0 ? (
            <p className="text-sm text-slate-400">No reviews yet.</p>
          ) : (
            <ul className="space-y-1">
              {sorted.map((r) => (
                <li key={r.id}>
                  <button
                    type="button"
                    onClick={() => selectReview(r)}
                    className={cn(
                      'w-full rounded-lg px-3 py-2 text-left text-sm transition-colors',
                      selectedId === r.id
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-600 hover:bg-slate-100'
                    )}
                  >
                    {formatMonthLabel(r.month)}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <div className="space-y-6">
          <Card>
            <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
              <FormField label="Month">
                <input
                  type="month"
                  className={inputClass}
                  value={form.month}
                  onChange={(e) => setForm({ ...form, month: e.target.value })}
                />
              </FormField>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={save}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
              >
                Save review
              </button>
              <button
                type="button"
                onClick={pullMonthlySummary}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Pull monthly summary
              </button>
              <button
                type="button"
                onClick={pullFromWeekly}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Pull from weekly
              </button>
              {sorted.some((r) => r.id === form.id) && (
                <button
                  type="button"
                  onClick={() => setDeleteTarget(form)}
                  className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  Delete
                </button>
              )}
            </div>
          </Card>

          <Card>
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
              Monthly task &amp; project summary
            </h2>
            <p className="mb-3 text-xs text-slate-500">
              Built from daily entries (linked tasks, carry-forward flags, and work notes) for{' '}
              {form.month ? formatMonthLabel(form.month) : 'this month'}.
            </p>
            {!form.month ? (
              <p className="text-sm text-slate-500">Select a month to see aggregates.</p>
            ) : (
              <>
                <div className="mb-3 flex flex-wrap gap-2 text-[11px] text-slate-600">
                  <span className="rounded-full bg-slate-100 px-2 py-0.5">
                    Completed (month): {completedMonth.length}
                  </span>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5">
                    Tasks with daily links: {activityRows.length}
                  </span>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5">
                    PA done: {advisorCompletedMonth.pa}
                  </span>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5">
                    MDRT done: {advisorCompletedMonth.mdrt}
                  </span>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5">
                    Recruit/hiring done: {advisorCompletedMonth.rec}
                  </span>
                </div>
                {activityRows.length === 0 ? (
                  <p className="text-sm text-slate-500">No linked tasks in daily entries this month.</p>
                ) : (
                  <div className="max-h-72 overflow-auto text-xs">
                    <table className="w-full border-collapse text-left">
                      <thead>
                        <tr className="border-b border-border text-slate-500">
                          <th className="py-1 pr-2 font-medium">Task</th>
                          <th className="py-1 pr-2 font-medium">Days</th>
                          <th className="py-1 pr-2 font-medium">Carries</th>
                          <th className="py-1 pr-2 font-medium">Notes</th>
                          <th className="py-1 pr-2 font-medium">Priority</th>
                          <th className="py-1 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activityRows.slice(0, 36).map((r) => (
                          <tr key={r.task.id} className="border-b border-border/60">
                            <td className="py-1.5 pr-2 font-medium text-slate-800">
                              {getTaskTitle(r.task)}
                            </td>
                            <td className="py-1.5 pr-2">{r.daysWorked}</td>
                            <td className="py-1.5 pr-2">{r.carryCount}</td>
                            <td className="py-1.5 pr-2">{r.noteDays}</td>
                            <td className="py-1.5 pr-2">{r.task.priority}</td>
                            <td className="py-1.5 text-slate-600">
                              {isTaskCompleted(getEffectiveTaskStatus(r.task, refNow))
                                ? 'Done'
                                : r.task.status}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                <div className="mt-4 grid gap-3 text-xs text-slate-600 md:grid-cols-2">
                  <div>
                    <p className="mb-1 font-semibold text-slate-700">Hot projects (by linked days)</p>
                    <ul className="space-y-0.5">
                      {projectRollup.slice(0, 5).map((p) => (
                        <li key={p.id}>
                          • {p.label}: {p.days} day-links, {p.carries} carries
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="mb-1 font-semibold text-slate-700">Quieter projects</p>
                    <ul className="space-y-0.5">
                      {quietProjectRows.length === 0 ? (
                        <li>—</li>
                      ) : (
                        quietProjectRows.map((p) => (
                          <li key={p.id}>
                            • {p.label}: {p.days} day-links
                          </li>
                        ))
                      )}
                    </ul>
                  </div>
                </div>
                {topCarriedRows.length > 0 && (
                  <div className="mt-3 text-xs text-slate-600">
                    <span className="font-semibold text-slate-700">Often carried forward: </span>
                    {topCarriedRows.map((r) => getTaskTitle(r.task)).join(' · ')}
                  </div>
                )}
              </>
            )}
          </Card>

          <Card>
            <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Next month focus tasks
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Planning links only — master tasks are unchanged until you edit them.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setPickerOpen(true)}
                  className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white"
                >
                  Plan next month
                </button>
                <button
                  type="button"
                  onClick={matchTop10Lines}
                  className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-slate-700"
                >
                  Match Top 10 lines
                </button>
                <button
                  type="button"
                  onClick={carryMonthlyImportantOpen}
                  className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-slate-700"
                >
                  Carry open P0/P1
                </button>
                <button
                  type="button"
                  onClick={carryFromLatestWeekly}
                  className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-slate-700"
                >
                  Import weekly focus list
                </button>
                <button
                  type="button"
                  onClick={carryOpenWeeklyFocusOnly}
                  className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-slate-700"
                >
                  Import open weekly focus
                </button>
              </div>
            </div>
            {(form.nextMonthTaskIds ?? []).length === 0 ? (
              <p className="text-sm text-slate-500">No focus tasks yet.</p>
            ) : (
              <ul className="space-y-3">
                {(form.nextMonthTaskIds ?? []).map((id) => {
                  const t = getTaskById(data, id);
                  if (!t) return null;
                  const mnote = form.monthlyTaskNotes?.find((x) => x.taskId === id)?.note ?? '';
                  return (
                    <li key={id} className="rounded-lg border border-border bg-slate-50/80 px-3 py-2">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-medium text-slate-900">{getTaskTitle(t)}</p>
                          <p className="text-[11px] text-slate-500">
                            {getProjectName(data, t.projectId)} · {t.module} ·{' '}
                            {isTaskCompleted(getEffectiveTaskStatus(t, refNow))
                              ? 'Done'
                              : t.status}{' '}
                            · {t.deadline || 'no deadline'}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeMonthTask(id)}
                          className="text-[11px] font-medium text-red-600"
                        >
                          Remove
                        </button>
                      </div>
                      <textarea
                        className={cn(textareaClass, 'mt-2 text-xs')}
                        rows={2}
                        placeholder="Monthly planning note…"
                        value={mnote}
                        onChange={(e) => setMonthNote(id, e.target.value)}
                      />
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>

          <Card>
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
              Reflection
            </h2>
            <div className="space-y-4">
              {reflectionPrimary.map((f) => (
                <FormField key={f.key} label={f.label}>
                  <textarea
                    className={textareaClass}
                    rows={f.rows ?? 2}
                    value={form[f.key] as string}
                    onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                  />
                </FormField>
              ))}
              {reflectionPlanning.map((f) => (
                <FormField key={f.key} label={f.label}>
                  <textarea
                    className={textareaClass}
                    rows={f.rows ?? 2}
                    value={form[f.key] as string}
                    onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                  />
                </FormField>
              ))}
            </div>
            <details className="mt-6 rounded-lg border border-border bg-slate-50/50">
              <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-slate-700">
                More metrics &amp; details
              </summary>
              <div className="space-y-4 border-t border-border px-4 py-4">
                {reflectionMetrics.map((f) => (
                  <FormField key={f.key} label={f.label}>
                    {f.rows ? (
                      <textarea
                        className={textareaClass}
                        rows={f.rows}
                        value={form[f.key] as string}
                        onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                      />
                    ) : (
                      <input
                        className={inputClass}
                        value={form[f.key] as string}
                        onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                      />
                    )}
                  </FormField>
                ))}
              </div>
            </details>
          </Card>
        </div>
      </div>

      {sorted.length === 0 && (
        <div className="mt-6">
          <EmptyState
            title="Start your first monthly review"
            description='Click "New review" to capture this month.'
          />
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete monthly review?"
        message={
          deleteTarget ? `Delete review for ${formatMonthLabel(deleteTarget.month)}?` : ''
        }
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <TaskPickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        anchorDateIso={pickerAnchor}
        refNow={refNow}
        tasks={data.tasks}
        excludeIds={new Set(form.nextMonthTaskIds ?? [])}
        projectLabel={(pid: string) => getProjectName(data, pid)}
        onAdd={addMonthTasks}
        heading="Pick focus tasks for next month"
      />
    </div>
  );
}
