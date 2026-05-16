import { useMemo, useState } from 'react';
import { ScoreboardFields } from '../components/reviews/ScoreboardFields';
import { Header } from '../components/layout/Header';
import { Card } from '../components/ui/Card';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { EmptyState } from '../components/ui/EmptyState';
import { FormField, inputClass, textareaClass } from '../components/ui/FormField';
import { PageActions } from '../components/ui/PageActions';
import { useAppData } from '../context/AppDataContext';
import { useToast } from '../context/ToastContext';
import type { WeeklyReview } from '../types';
import { emptyWeeklyReview } from '../utils/defaults';
import { formatWeekLabel } from '../utils/dateHelpers';
import { generateId } from '../utils/id';
import { cn } from '../utils/cn';

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
  const [form, setForm] = useState<WeeklyReview>(
    sorted[0] ? { ...sorted[0] } : emptyWeeklyReview()
  );
  const [deleteTarget, setDeleteTarget] = useState<WeeklyReview | null>(null);

  const selectReview = (review: WeeklyReview) => {
    setSelectedId(review.id);
    setForm({ ...review });
  };

  const startNew = () => {
    const fresh = { ...emptyWeeklyReview(), id: generateId('weekly') };
    setSelectedId(fresh.id);
    setForm(fresh);
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
            <div className="flex gap-2">
              <button
                type="button"
                onClick={save}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
              >
                Save review
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
    </div>
  );
}
