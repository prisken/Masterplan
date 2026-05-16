import { useMemo, useState } from 'react';
import { ScoreboardFields } from '../components/reviews/ScoreboardFields';
import { ReviewFlowBanner } from '../components/reviews/ReviewFlowBanner';
import { Header } from '../components/layout/Header';
import { TaskPickerModal } from '../components/today/TaskPickerModal';
import { Card } from '../components/ui/Card';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { EmptyState } from '../components/ui/EmptyState';
import { FormField, inputClass, textareaClass } from '../components/ui/FormField';
import { PageActions } from '../components/ui/PageActions';
import { useAppData } from '../context/AppDataContext';
import { useToast } from '../context/ToastContext';
import { migrateWeeklyReview } from '../services/dataMigrations';
import type { WeeklyReview } from '../types';
import { emptyWeeklyReview } from '../utils/defaults';
import { formatWeekLabel } from '../utils/dateHelpers';
import { generateId } from '../utils/id';
import { cn } from '../utils/cn';
import { resolvePacingDate } from '../utils/referenceDate';
import {
  addUniqueTaskIds,
  buildWeeklyActivityRows,
  getBlockedTasksForWeek,
  getCompletedTasksInRange,
  getProjectName,
  getTaskById,
  getWeekBoundsForDate,
  parseActionLines,
  removeTaskId,
} from '../utils/reviewWorkHelpers';
import { isOverdueTask } from '../utils/taskDeadline';
import { getEffectiveTaskStatus, isTaskCompleted } from '../utils/taskStatus';
import { getTaskTitle } from '../utils/taskTitle';

const reflectionFields: { key: keyof WeeklyReview; label: string; rows?: number }[] = [
  { key: 'whatWorked', label: 'What worked this week?', rows: 4 },
  { key: 'whatDidNotWork', label: 'What did not work?', rows: 4 },
  { key: 'projectMostProgress', label: 'Which project created the most progress?' },
  { key: 'projectMostStress', label: 'Which project created the most stress?' },
  { key: 'opportunityToDoubleDown', label: 'Which opportunity should I double down on?', rows: 2 },
  { key: 'stopDelegateDelay', label: 'What should I stop, delegate, or delay?', rows: 2 },
  { key: 'top5ActionsNextWeek', label: 'Top 5 actions for next week', rows: 5 },
];

export function WeeklyReviewPage() {
  const { data, updateData } = useAppData();
  const { toast } = useToast();

  const sorted = useMemo(
    () => [...data.weeklyReviews].sort((a, b) => b.weekStartDate.localeCompare(a.weekStartDate)),
    [data.weeklyReviews]
  );

  const [selectedId, setSelectedId] = useState<string | null>(sorted[0]?.id ?? null);
  const [form, setForm] = useState<WeeklyReview>(() =>
    sorted[0] ? migrateWeeklyReview(sorted[0]) : migrateWeeklyReview(emptyWeeklyReview())
  );
  const [deleteTarget, setDeleteTarget] = useState<WeeklyReview | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  const refNow = resolvePacingDate(data.settings);

  const activityRows = useMemo(
    () => buildWeeklyActivityRows(data, data.dailyEntries, form.weekStartDate),
    [data.dailyEntries, data.tasks, form.weekStartDate]
  );

  const selectReview = (review: WeeklyReview) => {
    setSelectedId(review.id);
    setForm(migrateWeeklyReview(review));
  };

  const startNew = () => {
    const fresh = migrateWeeklyReview({ ...emptyWeeklyReview(), id: generateId('weekly') });
    setSelectedId(fresh.id);
    setForm(fresh);
  };

  const pullDailySnapshot = () => {
    const { mon, sun } = getWeekBoundsForDate(form.weekStartDate);
    const completed = getCompletedTasksInRange(data, mon, sun);
    const blocked = getBlockedTasksForWeek(data, data.dailyEntries, form.weekStartDate);
    const overdue = data.tasks.filter(
      (t) => isOverdueTask(t, refNow) && !isTaskCompleted(getEffectiveTaskStatus(t, refNow))
    );
    const lines = [
      '— Daily-linked task activity —',
      ...activityRows.slice(0, 20).map(
        (r) =>
          `• ${getTaskTitle(r.task)} · ${r.daysWorked} day(s) · notes ${r.noteDays} · blocked days ${r.blockedDays}${r.latestOutcome ? ` · last outcome: ${r.latestOutcome}` : ''}`
      ),
      '',
      '— Completed this week (master tasks) —',
      ...completed.slice(0, 25).map((t) => `• ${getTaskTitle(t)}`),
      '',
      '— Flagged blocked during week —',
      ...blocked.map((t) => `• ${getTaskTitle(t)}`),
      '',
      '— Still overdue —',
      ...overdue.slice(0, 15).map((t) => `• ${getTaskTitle(t)} (${t.deadline || 'no date'})`),
    ];
    setForm((f) => ({
      ...f,
      whatWorked: [f.whatWorked, lines.join('\n')].filter(Boolean).join('\n\n'),
    }));
    toast('Pulled daily snapshot into “What worked”');
  };

  const matchTop5Lines = () => {
    const lines = parseActionLines(form.top5ActionsNextWeek).slice(0, 5);
    const ids: string[] = [];
    for (const line of lines) {
      const t = data.tasks.find((x) => getTaskTitle(x).toLowerCase() === line.toLowerCase());
      if (t) ids.push(t.id);
    }
    if (!ids.length) {
      toast('No exact title matches to tasks', 'error');
      return;
    }
    setForm((f) => ({ ...f, nextWeekTaskIds: addUniqueTaskIds(f.nextWeekTaskIds ?? [], ids) }));
    toast(`Linked ${ids.length} task(s) from Top 5 lines`);
  };

  const carryImportantOpen = () => {
    const ids = activityRows
      .filter(
        (r) =>
          (r.task.priority === 'P0' || r.task.priority === 'P1') &&
          !isTaskCompleted(getEffectiveTaskStatus(r.task, refNow))
      )
      .map((r) => r.task.id);
    if (!ids.length) {
      toast('No open P0/P1 in weekly activity', 'error');
      return;
    }
    setForm((f) => ({ ...f, nextWeekTaskIds: addUniqueTaskIds(f.nextWeekTaskIds ?? [], ids) }));
    toast(`Added ${ids.length} open P0/P1 to next week`);
  };

  const addNextWeekTasks = (ids: string[]) => {
    setForm((f) => ({ ...f, nextWeekTaskIds: addUniqueTaskIds(f.nextWeekTaskIds ?? [], ids) }));
  };

  const removeNextWeekTask = (taskId: string) => {
    setForm((f) => ({
      ...f,
      nextWeekTaskIds: removeTaskId(f.nextWeekTaskIds ?? [], taskId),
      weeklyTaskNotes: (f.weeklyTaskNotes ?? []).filter((x) => x.taskId !== taskId),
    }));
  };

  const setWeekNote = (taskId: string, note: string) => {
    const list = [...(form.weeklyTaskNotes ?? [])];
    const i = list.findIndex((x) => x.taskId === taskId);
    if (i >= 0) list[i] = { taskId, note };
    else list.push({ taskId, note });
    setForm({ ...form, weeklyTaskNotes: list });
  };

  const save = () => {
    if (!form.weekStartDate) {
      toast('Week start date is required', 'error');
      return;
    }
    updateData((prev) => {
      const exists = prev.weeklyReviews.some((r) => r.id === form.id);
      const weeklyReviews = exists
        ? prev.weeklyReviews.map((r) => (r.id === form.id ? form : r))
        : [...prev.weeklyReviews, form];
      return { ...prev, weeklyReviews };
    });
    toast('Weekly review saved');
    setSelectedId(form.id);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    updateData((prev) => ({
      ...prev,
      weeklyReviews: prev.weeklyReviews.filter((r) => r.id !== deleteTarget.id),
    }));
    toast('Review deleted');
    if (selectedId === deleteTarget.id) {
      const next = sorted.find((r) => r.id !== deleteTarget.id);
      if (next) selectReview(next);
      else startNew();
    }
    setDeleteTarget(null);
  };

  const scoreboardPct = useMemo(() => {
    const sb = form.scoreboard;
    const keys = [
      ['businessLeadsContactedTarget', 'businessLeadsContactedActual'],
      ['hksiStudyHoursTarget', 'hksiStudyHoursActual'],
      ['investmentVideosPostedTarget', 'investmentVideosPostedActual'],
    ] as const;
    let hit = 0;
    keys.forEach(([t, a]) => {
      const target = sb[t];
      const actual = sb[a];
      if (target > 0 && actual >= target) hit += 1;
    });
    return Math.round((hit / keys.length) * 100);
  }, [form.scoreboard]);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <Header title="Weekly Review" subtitle="Reflect, scoreboard, and plan next week" />
        <PageActions onAdd={startNew} addLabel="New review" />
      </div>

      <ReviewFlowBanner active="weekly" />

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
                    {formatWeekLabel(r.weekStartDate)}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <div className="space-y-6">
          <Card>
            <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
              <FormField label="Week starting (Monday)">
                <input
                  type="date"
                  className={inputClass}
                  value={form.weekStartDate}
                  onChange={(e) => setForm({ ...form, weekStartDate: e.target.value })}
                />
              </FormField>
              <p className="text-sm text-slate-500">
                Scoreboard health: <span className="font-semibold text-slate-800">{scoreboardPct}%</span>
              </p>
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
                onClick={pullDailySnapshot}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Pull from daily
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
              Weekly task activity
            </h2>
            <p className="mb-3 text-xs text-slate-500">
              Derived from daily entries (linked tasks + intents + notes) for this week.
            </p>
            {activityRows.length === 0 ? (
              <p className="text-sm text-slate-500">No linked task days this week.</p>
            ) : (
              <div className="max-h-64 overflow-auto text-xs">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-border text-slate-500">
                      <th className="py-1 pr-2 font-medium">Task</th>
                      <th className="py-1 pr-2 font-medium">Days</th>
                      <th className="py-1 pr-2 font-medium">Notes</th>
                      <th className="py-1 font-medium">Latest outcome</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activityRows.slice(0, 24).map((r) => (
                      <tr key={r.task.id} className="border-b border-border/60">
                        <td className="py-1.5 pr-2 font-medium text-slate-800">
                          {getTaskTitle(r.task)}
                        </td>
                        <td className="py-1.5 pr-2">{r.daysWorked}</td>
                        <td className="py-1.5 pr-2">{r.noteDays}</td>
                        <td className="py-1.5 text-slate-600">{r.latestOutcome || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          <Card>
            <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Next week focus tasks
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Planning-only links — does not change master task deadlines.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setPickerOpen(true)}
                  className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white"
                >
                  + Add tasks
                </button>
                <button
                  type="button"
                  onClick={matchTop5Lines}
                  className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-slate-700"
                >
                  Match Top 5 lines
                </button>
                <button
                  type="button"
                  onClick={carryImportantOpen}
                  className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-slate-700"
                >
                  Carry open P0/P1
                </button>
              </div>
            </div>
            {(form.nextWeekTaskIds ?? []).length === 0 ? (
              <p className="text-sm text-slate-500">No focus tasks yet.</p>
            ) : (
              <ul className="space-y-3">
                {(form.nextWeekTaskIds ?? []).map((id) => {
                  const t = getTaskById(data, id);
                  if (!t) return null;
                  const wnote =
                    form.weeklyTaskNotes?.find((x) => x.taskId === id)?.note ?? '';
                  return (
                    <li key={id} className="rounded-lg border border-border bg-slate-50/80 px-3 py-2">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-medium text-slate-900">{getTaskTitle(t)}</p>
                          <p className="text-[11px] text-slate-500">
                            {getProjectName(data, t.projectId)} · {t.module} ·{' '}
                            {isTaskCompleted(getEffectiveTaskStatus(t, refNow))
                              ? 'Done'
                              : t.status}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeNextWeekTask(id)}
                          className="text-[11px] font-medium text-red-600"
                        >
                          Remove
                        </button>
                      </div>
                      <textarea
                        className={cn(textareaClass, 'mt-2 text-xs')}
                        rows={2}
                        placeholder="Weekly planning note…"
                        value={wnote}
                        onChange={(e) => setWeekNote(id, e.target.value)}
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
              {reflectionFields.map((f) => (
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
          </Card>

          <Card>
            <ScoreboardFields
              value={form.scoreboard}
              onChange={(scoreboard) => setForm({ ...form, scoreboard })}
            />
          </Card>
        </div>
      </div>

      {sorted.length === 0 && (
        <div className="mt-6">
          <EmptyState
            title="Start your first weekly review"
            description='Click "New review" to capture this week wins and scoreboard.'
          />
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete weekly review?"
        message={
          deleteTarget
            ? `Delete review for week starting ${deleteTarget.weekStartDate}?`
            : ''
        }
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <TaskPickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        anchorDateIso={form.weekStartDate}
        refNow={refNow}
        tasks={data.tasks}
        excludeIds={new Set(form.nextWeekTaskIds ?? [])}
        projectLabel={(pid: string) => getProjectName(data, pid)}
        onAdd={addNextWeekTasks}
        heading="Pick focus tasks for next week"
      />
    </div>
  );
}
