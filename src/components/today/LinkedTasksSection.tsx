import { useMemo, useState } from 'react';
import type { DailyEntry, Task } from '../../types';
import { useAppData } from '../../context/AppDataContext';
import { resolvePacingDate } from '../../utils/referenceDate';
import {
  addUniqueTaskIds,
  getDailyTaskIntent,
  getProjectName,
  getTasksByIds,
  removeTaskId,
  stripDailyTaskMeta,
} from '../../utils/reviewWorkHelpers';
import { Card } from '../ui/Card';
import { LinkedTaskCard } from './LinkedTaskCard';
import { TaskPickerModal } from './TaskPickerModal';

interface LinkedTasksSectionProps {
  dateIso: string;
  entry: DailyEntry;
  onEntryChange: (e: DailyEntry) => void;
  onMoveTaskToTomorrow: (task: Task) => void;
}

export function LinkedTasksSection({
  dateIso,
  entry,
  onEntryChange,
  onMoveTaskToTomorrow,
}: LinkedTasksSectionProps) {
  const { data, updateData } = useAppData();
  const [pickerOpen, setPickerOpen] = useState(false);
  const refNow = resolvePacingDate(data.settings);

  const linkedTasks = useMemo(
    () => getTasksByIds(data, entry.linkedTaskIds),
    [data, entry.linkedTaskIds]
  );

  const { aimGroup, optionalGroup, blockedGroup } = useMemo(() => {
    const aim: Task[] = [];
    const opt: Task[] = [];
    const blk: Task[] = [];
    for (const t of linkedTasks) {
      const i = getDailyTaskIntent(entry, t.id);
      if (i === 'optional') opt.push(t);
      else if (i === 'blocked') blk.push(t);
      else aim.push(t);
    }
    return { aimGroup: aim, optionalGroup: opt, blockedGroup: blk };
  }, [linkedTasks, entry]);

  const addTasks = (ids: string[]) => {
    onEntryChange({
      ...entry,
      linkedTaskIds: addUniqueTaskIds(entry.linkedTaskIds, ids),
    });
  };

  const removeFromToday = (taskId: string) => {
    let next = stripDailyTaskMeta(entry, taskId);
    next = { ...next, linkedTaskIds: removeTaskId(next.linkedTaskIds, taskId) };
    onEntryChange(next);
  };

  const renderGroup = (title: string, tasks: Task[]) =>
    tasks.length === 0 ? null : (
      <div className="space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</h3>
        <div className="space-y-2">
          {tasks.map((task) => (
            <LinkedTaskCard
              key={task.id}
              task={task}
              entry={entry}
              anchorDateIso={dateIso}
              projectName={getProjectName(data, task.projectId)}
              refNow={refNow}
              onEntryChange={onEntryChange}
              updateData={updateData}
              onRemoveFromToday={() => removeFromToday(task.id)}
              onMoveToTomorrow={() => onMoveTaskToTomorrow(task)}
            />
          ))}
        </div>
      </div>
    );

  return (
    <>
      <Card className="mb-6">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Today&apos;s active tasks
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Linked tasks for {dateIso}. Removing only clears today&apos;s plan — master tasks stay.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white"
          >
            + Add tasks
          </button>
        </div>

        {linkedTasks.length === 0 ? (
          <p className="text-sm text-slate-500">
            No tasks in today&apos;s plan yet. Add from your master list.
          </p>
        ) : (
          <div className="space-y-6">
            {renderGroup('Aim to complete today', aimGroup)}
            {renderGroup('Optional / if time', optionalGroup)}
            {renderGroup('Blocked / waiting', blockedGroup)}
          </div>
        )}
      </Card>

      <TaskPickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        anchorDateIso={dateIso}
        refNow={refNow}
        tasks={data.tasks}
        excludeIds={new Set(entry.linkedTaskIds)}
        projectLabel={(pid: string) => getProjectName(data, pid)}
        onAdd={addTasks}
      />
    </>
  );
}
