import { useMemo, useState } from 'react';
import { Header } from '../components/layout/Header';
import { Card } from '../components/ui/Card';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { EmptyState } from '../components/ui/EmptyState';
import { FormField, inputClass, textareaClass } from '../components/ui/FormField';
import { PageActions } from '../components/ui/PageActions';
import { useAppData } from '../context/AppDataContext';
import { useToast } from '../context/ToastContext';
import type { MonthlyReview } from '../types';
import { emptyMonthlyReview } from '../utils/defaults';
import { formatMonthLabel } from '../utils/dateHelpers';
import { generateId } from '../utils/id';
import { cn } from '../utils/cn';

const fields: { key: keyof MonthlyReview; label: string; rows?: number; type?: 'month' }[] = [
  { key: 'month', label: 'Month', type: 'month' },
  { key: 'biggestWins', label: 'Biggest wins', rows: 4 },
  { key: 'biggestProblems', label: 'Biggest problems', rows: 4 },
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
  { key: 'nextMonthTop10Actions', label: "Next month's top 10 actions", rows: 6 },
];

export function MonthlyReviewPage() {
  const { data, updateData } = useAppData();
  const { toast } = useToast();

  const sorted = useMemo(
    () => [...data.monthlyReviews].sort((a, b) => b.month.localeCompare(a.month)),
    [data.monthlyReviews]
  );

  const [selectedId, setSelectedId] = useState<string | null>(sorted[0]?.id ?? null);
  const [form, setForm] = useState<MonthlyReview>(
    sorted[0] ? { ...sorted[0] } : emptyMonthlyReview()
  );
  const [deleteTarget, setDeleteTarget] = useState<MonthlyReview | null>(null);

  const selectReview = (review: MonthlyReview) => {
    setSelectedId(review.id);
    setForm({ ...review });
  };

  const startNew = () => {
    const fresh = { ...emptyMonthlyReview(), id: generateId('monthly') };
    setSelectedId(fresh.id);
    setForm(fresh);
  };

  const save = () => {
    if (!form.month) {
      toast('Month is required', 'error');
      return;
    }
    updateData((prev) => {
      const exists = prev.monthlyReviews.some((r) => r.id === form.id);
      const monthlyReviews = exists
        ? prev.monthlyReviews.map((r) => (r.id === form.id ? form : r))
        : [...prev.monthlyReviews, form];
      return { ...prev, monthlyReviews };
    });
    toast('Monthly review saved');
    setSelectedId(form.id);
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
        <Header title="Monthly Review" subtitle="Big-picture wins, problems, and next-month focus" />
        <PageActions onAdd={startNew} addLabel="New review" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
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

        <Card>
          <div className="mb-6 flex flex-wrap gap-2">
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

          <div className="space-y-4">
            {fields.map((f) => (
              <FormField key={f.key} label={f.label}>
                {f.type === 'month' ? (
                  <input
                    type="month"
                    className={inputClass}
                    value={form.month}
                    onChange={(e) => setForm({ ...form, month: e.target.value })}
                  />
                ) : f.rows ? (
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
        </Card>
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
    </div>
  );
}
