import type { DailyEntry } from '../../types';
import { cn } from '../../utils/cn';

/** Lightweight completeness hint — not a grade on your work. */
export function ReviewCompletenessIndicator({ entry }: { entry: DailyEntry }) {
  let score = 0;
  const checks: { ok: boolean; label: string }[] = [
    { ok: entry.linkedTaskIds.length > 0, label: 'Tasks linked' },
    {
      ok: !!(entry.dailyWorkLogNote && entry.dailyWorkLogNote.trim()),
      label: 'Day log note',
    },
    {
      ok: (entry.dailyTaskNotes ?? []).some(
        (n) =>
          !!(n.whatDidToday?.trim() || n.outcome?.trim() || n.note?.trim())
      ),
      label: 'Task work notes',
    },
    {
      ok: !!(entry.endOfDayCompleted && entry.endOfDayCompleted.trim()),
      label: 'Close-out captured',
    },
  ];
  checks.forEach((c) => {
    if (c.ok) score += 25;
  });

  return (
    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
      <span className="font-semibold text-slate-800">Day clarity</span>
      <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-200">
        <div
          className={cn('h-full rounded-full transition-all', score >= 75 ? 'bg-green-500' : 'bg-slate-700')}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="text-slate-500">{score}%</span>
      <ul className="flex flex-wrap gap-x-3 gap-y-1">
        {checks.map((c) => (
          <li key={c.label} className={c.ok ? 'text-green-700' : 'text-slate-400'}>
            {c.ok ? '✓' : '○'} {c.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
