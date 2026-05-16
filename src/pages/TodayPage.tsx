import { useEffect, useState } from 'react';
import { Header } from '../components/layout/Header';
import { PacingDateBanner } from '../components/layout/PacingDateBanner';
import { TodayTasksPanel } from '../components/today/TodayTasksPanel';
import { Card } from '../components/ui/Card';
import { FormField, inputClass, textareaClass } from '../components/ui/FormField';
import { useAppData } from '../context/AppDataContext';
import { useToast } from '../context/ToastContext';
import { usePacingDate } from '../hooks/usePacingDate';
import type { DailyEntry } from '../types';
import { emptyDailyEntry } from '../utils/defaults';
import { getActiveDateIso } from '../utils/todayTasksSync';

const fieldGroups: { title: string; fields: { key: keyof DailyEntry; label: string; rows?: number }[] }[] = [
  {
    title: "Today's priorities",
    fields: [
      { key: 'todayTop3Tasks', label: "Today's top 3 tasks (synced with Master Tasks below)", rows: 4 },
      { key: 'oneRevenueTask', label: 'One revenue task' },
      { key: 'oneAuthorityTask', label: 'One authority task' },
      { key: 'oneRelationshipTask', label: 'One relationship task' },
      { key: 'oneStudyTask', label: 'One study task' },
      { key: 'oneAdminTask', label: 'One admin task' },
    ],
  },
  {
    title: 'Outreach & content',
    fields: [
      { key: 'peopleToFollowUp', label: 'People to follow up', rows: 3 },
      { key: 'contentToCreateOrPost', label: 'Content to create / post', rows: 3 },
    ],
  },
  {
    title: 'Focus',
    fields: [
      { key: 'mustBeFinishedToday', label: 'Must be finished today', rows: 3 },
      { key: 'canWait', label: 'What can wait', rows: 3 },
    ],
  },
  {
    title: 'End of day review',
    fields: [
      { key: 'endOfDayCompleted', label: 'What did I complete?', rows: 4 },
      { key: 'endOfDayLearned', label: 'What did I learn?', rows: 3 },
      { key: 'firstTaskTomorrow', label: 'First task tomorrow' },
    ],
  },
];

export function TodayPage() {
  const { data, updateData } = useAppData();
  const { toast } = useToast();
  const { iso: pacingIso } = usePacingDate();
  const [date, setDate] = useState(() => getActiveDateIso(data.settings));
  const [entry, setEntry] = useState<DailyEntry>(emptyDailyEntry(pacingIso));

  useEffect(() => {
    const existing = data.dailyEntries.find((e) => e.date === date);
    setEntry(existing ? { ...existing, linkedTaskIds: existing.linkedTaskIds ?? [] } : emptyDailyEntry(date));
  }, [date, data.dailyEntries]);

  const save = () => {
    const toSave = { ...entry, date, id: `daily-${date}`, linkedTaskIds: entry.linkedTaskIds ?? [] };
    updateData((prev) => {
      const exists = prev.dailyEntries.some((e) => e.date === date);
      const dailyEntries = exists
        ? prev.dailyEntries.map((e) => (e.date === date ? toSave : e))
        : [...prev.dailyEntries, toSave];
      return { ...prev, dailyEntries };
    });
    toast('Daily plan saved');
  };

  const pastDates = [...data.dailyEntries]
    .map((e) => e.date)
    .filter((d) => d !== date)
    .sort((a, b) => b.localeCompare(a))
    .slice(0, 8);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <Header
          title="Today"
          subtitle="Daily journal + synced Master Tasks"
        />
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-slate-500">Date</span>
            <input
              type="date"
              className={inputClass}
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </label>
          <button
            type="button"
            onClick={() => setDate(pacingIso)}
            className="mt-5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-slate-600"
          >
            Jump to pacing day
          </button>
          <button
            type="button"
            onClick={save}
            className="mt-5 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            Save day
          </button>
        </div>
      </div>

      <PacingDateBanner />

      <TodayTasksPanel dateIso={date} entry={entry} onEntryChange={setEntry} />

      {pastDates.length > 0 && (
        <Card className="mb-6" padding="sm">
          <p className="mb-2 text-xs font-medium text-slate-500">Previous days</p>
          <div className="flex flex-wrap gap-2">
            {pastDates.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDate(d)}
                className="rounded-full border border-border px-3 py-1 text-xs text-slate-600 hover:bg-slate-50"
              >
                {d}
              </button>
            ))}
          </div>
        </Card>
      )}

      <div className="space-y-6">
        {fieldGroups.map((group) => (
          <Card key={group.title}>
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
              {group.title}
            </h2>
            <div className="space-y-4">
              {group.fields.map((f) => (
                <FormField key={f.key} label={f.label}>
                  {f.rows && f.rows > 1 ? (
                    <textarea
                      className={textareaClass}
                      rows={f.rows}
                      value={entry[f.key] as string}
                      onChange={(e) => setEntry({ ...entry, [f.key]: e.target.value })}
                    />
                  ) : (
                    <input
                      className={inputClass}
                      value={entry[f.key] as string}
                      onChange={(e) => setEntry({ ...entry, [f.key]: e.target.value })}
                    />
                  )}
                </FormField>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
