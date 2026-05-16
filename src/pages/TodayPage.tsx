import { useEffect, useMemo, useState } from 'react';
import { Header } from '../components/layout/Header';
import { PacingDateBanner } from '../components/layout/PacingDateBanner';
import { ReviewCompletenessIndicator } from '../components/reviews/ReviewCompletenessIndicator';
import { ReviewFlowBanner } from '../components/reviews/ReviewFlowBanner';
import { LinkedTasksSection } from '../components/today/LinkedTasksSection';
import { TodayTasksPanel } from '../components/today/TodayTasksPanel';
import { Card } from '../components/ui/Card';
import { FormField, inputClass, textareaClass } from '../components/ui/FormField';
import { useAppData } from '../context/AppDataContext';
import { useToast } from '../context/ToastContext';
import { usePacingDate } from '../hooks/usePacingDate';
import { migrateDailyEntries } from '../services/dataMigrations';
import type { DailyEntry, Task } from '../types';
import { emptyDailyEntry } from '../utils/defaults';
import { cn } from '../utils/cn';
import { resolvePacingDate } from '../utils/referenceDate';
import {
  addDaysIso,
  addUniqueTaskIds,
  getDailyTaskNote,
  getOrCreateDailyEntry,
  getTasksByIds,
  removeTaskId,
  stripDailyTaskMeta,
  upsertDailyEntry,
  upsertDailyTaskIntent,
  upsertDailyTaskNote,
} from '../utils/reviewWorkHelpers';
import { applyTaskUpdateWithMetrics } from '../utils/taskMetrics';
import { getEffectiveTaskStatus, isTaskCompleted } from '../utils/taskStatus';
import { formatTop3Text, getActiveDateIso } from '../utils/todayTasksSync';
import { getTaskTitle } from '../utils/taskTitle';

const fieldGroups: {
  title: string;
  fields: { key: keyof DailyEntry; label: string; rows?: number }[];
}[] = [
  {
    title: "Today's priorities",
    fields: [
      { key: 'todayTop3Tasks', label: "Today's top 3 tasks (synced from linked tasks on save)", rows: 4 },
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
      { key: 'firstTaskTomorrow', label: 'First task tomorrow', rows: 2 },
    ],
  },
];

type CloseRow = {
  completed?: boolean;
  carry?: boolean;
  blocked?: boolean;
  outcome?: string;
};

export function TodayPage() {
  const { data, updateData } = useAppData();
  const { toast } = useToast();
  const { iso: pacingIso } = usePacingDate();
  const [date, setDate] = useState(() => getActiveDateIso(data.settings));
  const [entry, setEntry] = useState<DailyEntry>(() => emptyDailyEntry(pacingIso));
  const [showJournal, setShowJournal] = useState(false);
  const [showSuggested, setShowSuggested] = useState(false);
  const [showCloseDay, setShowCloseDay] = useState(false);
  const [closeRows, setCloseRows] = useState<Record<string, CloseRow>>({});

  useEffect(() => {
    const existing = data.dailyEntries.find((e) => e.date === date);
    setEntry(existing ? migrateDailyEntries([existing])[0] : emptyDailyEntry(date));
  }, [date, data.dailyEntries]);

  useEffect(() => {
    setCloseRows((prev) => {
      const next = { ...prev };
      for (const id of entry.linkedTaskIds) {
        if (!(id in next)) next[id] = {};
      }
      for (const k of Object.keys(next)) {
        if (!entry.linkedTaskIds.includes(k)) delete next[k];
      }
      return next;
    });
  }, [entry.linkedTaskIds]);

  const refNow = resolvePacingDate(data.settings);

  const save = () => {
    const linkedTasks = getTasksByIds(data, entry.linkedTaskIds);
    const top = linkedTasks.slice(0, 3);
    const toSave = {
      ...entry,
      date,
      id: `daily-${date}`,
      linkedTaskIds: entry.linkedTaskIds ?? [],
      todayTop3Tasks: formatTop3Text(top),
    };
    updateData((prev) => {
      const exists = prev.dailyEntries.some((e) => e.date === date);
      const dailyEntries = exists
        ? prev.dailyEntries.map((e) => (e.date === date ? toSave : e))
        : [...prev.dailyEntries, toSave];
      return { ...prev, dailyEntries };
    });
    toast('Daily plan saved');
  };

  const moveTaskToTomorrow = (task: Task) => {
    const tomorrow = addDaysIso(date, 1);
    const dn = getDailyTaskNote(entry, task.id);
    updateData((prev) => {
      let entries = [...prev.dailyEntries];
      const todayE = stripDailyTaskMeta(getOrCreateDailyEntry(entries, date), task.id);
      const todaySaved = {
        ...todayE,
        linkedTaskIds: removeTaskId(todayE.linkedTaskIds, task.id),
      };
      let tom = getOrCreateDailyEntry(entries, tomorrow);
      tom = upsertDailyTaskIntent(
        { ...tom, linkedTaskIds: addUniqueTaskIds(tom.linkedTaskIds, [task.id]) },
        task.id,
        'aim_today'
      );
      if (dn?.nextStep?.trim() || dn?.outcome?.trim()) {
        tom = upsertDailyTaskNote(tom, {
          taskId: task.id,
          note: [dn.nextStep && `Next: ${dn.nextStep}`, dn.outcome && `Was: ${dn.outcome}`]
            .filter(Boolean)
            .join(' · '),
        });
      }
      entries = upsertDailyEntry(entries, todaySaved);
      entries = upsertDailyEntry(entries, tom);
      return { ...prev, dailyEntries: entries };
    });
    setEntry((prev) => {
      const next = stripDailyTaskMeta(prev, task.id);
      return { ...next, linkedTaskIds: removeTaskId(next.linkedTaskIds, task.id) };
    });
    toast('Moved to tomorrow');
  };

  const carryUnfinishedForward = () => {
    const linked = getTasksByIds(data, entry.linkedTaskIds);
    const open = linked.filter((t) => !isTaskCompleted(getEffectiveTaskStatus(t, refNow)));
    if (open.length === 0) {
      toast('No unfinished tasks on today’s list');
      return;
    }
    const tomorrow = addDaysIso(date, 1);
    updateData((prev) => {
      let todayE = { ...entry, date, id: `daily-${date}` };
      let tom = getOrCreateDailyEntry(prev.dailyEntries, tomorrow);

      for (const task of open) {
        todayE = stripDailyTaskMeta(todayE, task.id);
        todayE = { ...todayE, linkedTaskIds: removeTaskId(todayE.linkedTaskIds, task.id) };
        tom = upsertDailyTaskIntent(
          { ...tom, linkedTaskIds: addUniqueTaskIds(tom.linkedTaskIds, [task.id]) },
          task.id,
          'aim_today'
        );
        const dn = getDailyTaskNote(entry, task.id);
        if (dn?.nextStep?.trim() || dn?.outcome?.trim()) {
          tom = upsertDailyTaskNote(tom, {
            taskId: task.id,
            note: [dn.nextStep && `Next: ${dn.nextStep}`, dn.outcome && `Carried: ${dn.outcome}`]
              .filter(Boolean)
              .join(' · '),
          });
        }
      }

      let entries = upsertDailyEntry(prev.dailyEntries, todayE);
      entries = upsertDailyEntry(entries, tom);
      return { ...prev, dailyEntries: entries };
    });
    setEntry((prev) => {
      let next = { ...prev };
      for (const task of open) {
        next = stripDailyTaskMeta(next, task.id);
        next = { ...next, linkedTaskIds: removeTaskId(next.linkedTaskIds, task.id) };
      }
      return next;
    });
    toast(`${open.length} unfinished tasks carried to tomorrow.`);
  };

  const applyCloseDay = () => {
    const tomorrow = addDaysIso(date, 1);
    const lines: string[] = [];
    let firstCarryTitle = '';

    updateData((prev) => {
      let tasks = [...prev.tasks];
      let todayEntry: DailyEntry = { ...entry, date, id: `daily-${date}` };
      let tom = getOrCreateDailyEntry(prev.dailyEntries, tomorrow);

      for (const id of entry.linkedTaskIds) {
        const row = closeRows[id];
        const task = tasks.find((t) => t.id === id);
        if (!task) continue;
        if (row?.outcome?.trim()) {
          lines.push(`• ${getTaskTitle(task)}: ${row.outcome.trim()}`);
        }
        if (row?.blocked) {
          todayEntry = upsertDailyTaskIntent(todayEntry, id, 'blocked');
        }
        if (row?.completed && !isTaskCompleted(getEffectiveTaskStatus(task, refNow))) {
          const res = applyTaskUpdateWithMetrics({ ...prev, tasks }, id, {
            status: 'Completed',
            completedAt: new Date().toISOString(),
            progressPercentage: 100,
          });
          tasks = res.data.tasks;
        }
        if (row?.carry && !isTaskCompleted(getEffectiveTaskStatus(task, refNow))) {
          if (!firstCarryTitle) firstCarryTitle = getTaskTitle(task);
          todayEntry = stripDailyTaskMeta(todayEntry, id);
          todayEntry = { ...todayEntry, linkedTaskIds: removeTaskId(todayEntry.linkedTaskIds, id) };
          tom = upsertDailyTaskIntent(
            { ...tom, linkedTaskIds: addUniqueTaskIds(tom.linkedTaskIds, [id]) },
            id,
            'aim_today'
          );
        }
      }

      todayEntry = {
        ...todayEntry,
        endOfDayCompleted: [entry.endOfDayCompleted, lines.join('\n')].filter(Boolean).join('\n\n'),
        firstTaskTomorrow:
          entry.firstTaskTomorrow?.trim() || firstCarryTitle || entry.firstTaskTomorrow || '',
      };

      let entries = upsertDailyEntry(prev.dailyEntries, todayEntry);
      entries = upsertDailyEntry(entries, tom);
      return { ...prev, tasks, dailyEntries: entries };
    });
    toast('Close-out applied');
    setShowCloseDay(false);
  };

  const pastDates = useMemo(
    () =>
      [...data.dailyEntries]
        .map((e) => e.date)
        .filter((d) => d !== date)
        .sort((a, b) => b.localeCompare(a))
        .slice(0, 8),
    [data.dailyEntries, date]
  );

  const linkedForClose = getTasksByIds(data, entry.linkedTaskIds);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <Header
          title="Today"
          subtitle="Daily work cockpit — plan tasks, log work, close the day"
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
          <button
            type="button"
            onClick={carryUnfinishedForward}
            className="mt-5 rounded-lg border border-border px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Carry unfinished → tomorrow
          </button>
        </div>
      </div>

      <ReviewFlowBanner active="today" />
      <div className="mb-4 rounded-xl border border-border bg-white px-4 py-3">
        <ReviewCompletenessIndicator entry={entry} />
      </div>

      <PacingDateBanner />

      <LinkedTasksSection
        dateIso={date}
        entry={entry}
        onEntryChange={setEntry}
        onMoveTaskToTomorrow={moveTaskToTomorrow}
      />

      <Card className="mb-6">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Daily work log
        </h2>
        <p className="mb-3 text-xs text-slate-500">
          Whole-day note only — task-specific logs stay on each task card.
        </p>
        <FormField label="Today note">
          <textarea
            className={textareaClass}
            rows={3}
            placeholder="Context for today: energy, theme, meetings…"
            value={entry.dailyWorkLogNote ?? ''}
            onChange={(e) => setEntry({ ...entry, dailyWorkLogNote: e.target.value })}
          />
        </FormField>
      </Card>

      <button
        type="button"
        onClick={() => setShowSuggested((s) => !s)}
        className="mb-2 text-xs font-semibold text-violet-700 underline"
      >
        {showSuggested ? 'Hide' : 'Show'} suggested tasks (pins / due)
      </button>
      {showSuggested && (
        <TodayTasksPanel dateIso={date} entry={entry} onEntryChange={setEntry} />
      )}

      <button
        type="button"
        onClick={() => setShowJournal((s) => !s)}
        className="mb-4 mt-4 block text-xs font-semibold text-slate-600 underline"
      >
        {showJournal ? 'Hide' : 'More details'} — priorities & reflection fields
      </button>

      {showJournal && (
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
                        value={(entry[f.key] as string) ?? ''}
                        onChange={(e) => setEntry({ ...entry, [f.key]: e.target.value })}
                      />
                    ) : (
                      <input
                        className={inputClass}
                        value={(entry[f.key] as string) ?? ''}
                        onChange={(e) => setEntry({ ...entry, [f.key]: e.target.value })}
                      />
                    )}
                  </FormField>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Card className="mt-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Close day
          </h2>
          <button
            type="button"
            onClick={() => setShowCloseDay((s) => !s)}
            className={cn(
              'rounded-lg px-3 py-1.5 text-xs font-medium',
              showCloseDay ? 'bg-slate-900 text-white' : 'border border-border text-slate-700'
            )}
          >
            {showCloseDay ? 'Hide checklist' : 'Open checklist'}
          </button>
        </div>
        {showCloseDay && (
          <div className="mt-4 space-y-4 border-t border-border pt-4">
            <p className="text-xs text-slate-500">
              Quick pass on each active task. Applying merges outcomes into “What did I complete?” and
              moves checked items as indicated.
            </p>
            {linkedForClose.length === 0 ? (
              <p className="text-sm text-slate-500">No linked tasks.</p>
            ) : (
              <ul className="space-y-3">
                {linkedForClose.map((task) => (
                  <li
                    key={task.id}
                    className="rounded-lg border border-border bg-slate-50/80 px-3 py-2 text-sm"
                  >
                    <p className="font-medium text-slate-900">{getTaskTitle(task)}</p>
                    <div className="mt-2 flex flex-wrap gap-3 text-xs">
                      <label className="flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={!!closeRows[task.id]?.completed}
                          onChange={(e) =>
                            setCloseRows((r) => ({
                              ...r,
                              [task.id]: { ...r[task.id], completed: e.target.checked },
                            }))
                          }
                        />
                        Completed
                      </label>
                      <label className="flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={!!closeRows[task.id]?.carry}
                          onChange={(e) =>
                            setCloseRows((r) => ({
                              ...r,
                              [task.id]: { ...r[task.id], carry: e.target.checked },
                            }))
                          }
                        />
                        Carry tomorrow
                      </label>
                      <label className="flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={!!closeRows[task.id]?.blocked}
                          onChange={(e) =>
                            setCloseRows((r) => ({
                              ...r,
                              [task.id]: { ...r[task.id], blocked: e.target.checked },
                            }))
                          }
                        />
                        Blocked
                      </label>
                    </div>
                    <input
                      className={cn(inputClass, 'mt-2 text-xs')}
                      placeholder="Short outcome"
                      value={closeRows[task.id]?.outcome ?? ''}
                      onChange={(e) =>
                        setCloseRows((r) => ({
                          ...r,
                          [task.id]: { ...r[task.id], outcome: e.target.value },
                        }))
                      }
                    />
                  </li>
                ))}
              </ul>
            )}
            <button
              type="button"
              onClick={applyCloseDay}
              disabled={linkedForClose.length === 0}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
            >
              Apply close-out
            </button>
          </div>
        )}
      </Card>

      {pastDates.length > 0 && (
        <Card className="mt-6" padding="sm">
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
    </div>
  );
}
