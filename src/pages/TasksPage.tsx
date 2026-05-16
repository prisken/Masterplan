import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CalendarMonthView } from '../components/tasks/CalendarMonthView';
import { YearEndMilestonesView } from '../components/tasks/YearEndMilestonesView';
import { WarningBanners } from '../components/dashboard/WarningBanners';
import { TaskFormFields } from '../components/tasks/TaskFormFields';
import { TaskListItem } from '../components/tasks/TaskListItem';
import { TaskProgressWidgets } from '../components/tasks/TaskProgressWidgets';
import { Header } from '../components/layout/Header';
import { PacingDateBanner } from '../components/layout/PacingDateBanner';
import { usePacingDate } from '../hooks/usePacingDate';
import { Card } from '../components/ui/Card';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { EmptyState } from '../components/ui/EmptyState';
import { FilterBar, FilterSearch, FilterSelect, ViewTabs } from '../components/ui/FilterBar';
import { ModalFooter, ModalForm } from '../components/ui/ModalForm';
import { PageActions } from '../components/ui/PageActions';
import { useAppData } from '../context/AppDataContext';
import { useToast } from '../context/ToastContext';
import type { Task } from '../types';
import { TASK_PRIORITY_LABELS, ADVISOR_GROWTH_PROJECT_ID } from '../types';
import { taskPriorities, taskStatuses } from '../constants/options';
import { emptyTask } from '../utils/defaults';
import { generateId } from '../utils/id';
import { getProjectById } from '../utils/projectColors';
import {
  isOverdueTask,
  isThisMonth,
  isThisWeek,
  isToday,
  isUpcoming30Days,
} from '../utils/taskDeadline';
import { getAdvisorProgressWidgets } from '../utils/taskProgress';
import { compareTasksByUrgency } from '../utils/taskSort';
import { getTaskTitle } from '../utils/taskTitle';
import { isTaskCompleted, getEffectiveTaskStatus } from '../utils/taskStatus';
import { computeAppWarnings } from '../utils/advisorWarnings';
import { cn } from '../utils/cn';
import { taskTracks } from '../constants/options';
import { ADVISOR_MODULES } from '../constants/taskModules';
import {
  applyTaskUpdateWithMetrics,
  saveTaskWithMetrics,
  resolveTaskMetricFields,
} from '../utils/taskMetrics';
const views = [
  { id: 'all', label: 'All open' },
  { id: 'today', label: 'Today' },
  { id: 'week', label: 'This Week' },
  { id: 'month', label: 'This Month' },
  { id: 'overdue', label: 'Overdue' },
  { id: 'upcoming30', label: 'Upcoming 30d' },
  { id: 'by-project', label: 'By Project' },
  { id: 'by-priority', label: 'By Priority' },
  { id: 'completed', label: 'Completed' },
  { id: 'calendar', label: 'Calendar' },
  { id: 'milestones', label: 'Year-end' },
];

function matchesView(task: Task, view: string): boolean {
  if (view === 'completed') return isTaskCompleted(getEffectiveTaskStatus(task));
  if (view === 'calendar' || view === 'milestones') return true;
  if (isTaskCompleted(getEffectiveTaskStatus(task))) return false;

  switch (view) {
    case 'all':
      return true;
    case 'today':
      return task.today || (!!task.deadline && isToday(task.deadline));
    case 'week':
      return task.thisWeek || (!!task.deadline && isThisWeek(task.deadline));
    case 'month':
      return !!task.deadline && isThisMonth(task.deadline);
    case 'overdue':
      return isOverdueTask(task);
    case 'upcoming30':
      return isUpcoming30Days(task);
    case 'by-project':
    case 'by-priority':
      return true;
    default:
      return true;
  }
}

export function TasksPage() {
  const { data, updateData } = useAppData();
  const { description } = usePacingDate();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const [view, setView] = useState(searchParams.get('view') || 'all');
  const [search, setSearch] = useState('');
  const [projectId, setProjectId] = useState('');
  const [module, setModule] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [owner, setOwner] = useState('');
  const [deadlineFrom, setDeadlineFrom] = useState('');
  const [deadlineTo, setDeadlineTo] = useState('');
  const [track, setTrack] = useState('');
  const [moreFilters, setMoreFilters] = useState(false);

  useEffect(() => {
    const v = searchParams.get('view');
    if (v) setView(v);
    const p = searchParams.get('project');
    if (p) setProjectId(p);
  }, [searchParams]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [form, setForm] = useState<Task>(emptyTask());
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);

  const moduleOptions = useMemo(() => {
    const set = new Set<string>(ADVISOR_MODULES);
    data.tasks.forEach((t) => {
      if (t.module) set.add(t.module);
    });
    return [...set].sort();
  }, [data.tasks]);

  const ownerOptions = useMemo(() => {
    const set = new Set<string>();
    data.tasks.forEach((t) => {
      if (t.owner) set.add(t.owner);
    });
    return [...set].sort();
  }, [data.tasks]);

  const filtered = useMemo(() => {
    return data.tasks
      .filter((t) => {
        if (!matchesView(t, view)) return false;

        if (projectId && t.projectId !== projectId) return false;
        if (module && t.module !== module) return false;
        if (status && t.status !== status) return false;
        if (priority && t.priority !== priority) return false;
        if (owner && t.owner !== owner) return false;
        if (track && t.track !== track) return false;
        if (deadlineFrom && (!t.deadline || t.deadline < deadlineFrom)) return false;
        if (deadlineTo && (!t.deadline || t.deadline > deadlineTo)) return false;

        if (search) {
          const q = search.toLowerCase();
          const hay = [
            getTaskTitle(t),
            t.notes,
            t.module,
            t.owner,
            t.dependency,
            t.successMetric,
          ]
            .join(' ')
            .toLowerCase();
          if (!hay.includes(q)) return false;
        }
        return true;
      })
      .sort(compareTasksByUrgency);
  }, [
    data.tasks,
    view,
    search,
    projectId,
    module,
    status,
    priority,
    owner,
    track,
    deadlineFrom,
    deadlineTo,
  ]);

  const grouped = useMemo(() => {
    if (view === 'by-project') {
      const map = new Map<string, Task[]>();
      for (const t of filtered) {
        const key = t.projectId || 'none';
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(t);
      }
      return [...map.entries()]
        .map(([id, tasks]) => ({
          key: id,
          label: getProjectById(data.projects, id)?.projectName ?? 'No project',
          tasks,
        }))
        .sort((a, b) => a.label.localeCompare(b.label));
    }
    if (view === 'by-priority') {
      return taskPriorities
        .map((p) => ({
          key: p,
          label: TASK_PRIORITY_LABELS[p],
          tasks: filtered.filter((t) => t.priority === p),
        }))
        .filter((g) => g.tasks.length > 0);
    }
    return null;
  }, [view, filtered, data.projects]);

  const progressTracks = useMemo(
    () => getAdvisorProgressWidgets(data.tasks),
    [data.tasks]
  );

  const showAdvisorWidgets =
    !projectId || projectId === ADVISOR_GROWTH_PROJECT_ID;

  const openAdd = () => {
    setEditing(null);
    setForm({
      ...emptyTask(projectId || data.projects[0]?.id || ''),
      id: generateId('task'),
    });
    setModalOpen(true);
  };

  const openEdit = (t: Task) => {
    setEditing(t);
    setForm({ ...t });
    setModalOpen(true);
  };

  const save = () => {
    if (!getTaskTitle(form).trim()) {
      toast('Task title is required', 'error');
      return;
    }
    if (!form.projectId) {
      toast('Select a project', 'error');
      return;
    }
    const now = new Date().toISOString();
    const title = getTaskTitle(form);
    const completed =
      form.status === 'Completed'
        ? { completedAt: form.completedAt || now, progressPercentage: 100 }
        : { completedAt: '', progressPercentage: form.progressPercentage };
    const task = resolveTaskMetricFields({ ...form, title, updatedAt: now, ...completed });
    const isNew = !editing;
    let metricMessage: string | undefined;
    updateData((prev) => {
      const payload = isNew ? { ...task, createdAt: now } : task;
      const result = saveTaskWithMetrics(prev, payload, isNew);
      metricMessage = result.metricMessage;
      return result.data;
    });
    toast(metricMessage ?? (editing ? 'Task updated' : 'Task added'));
    setModalOpen(false);
  };

  const patchTask = (taskId: string, patch: Partial<Task>, fallback = 'Task updated') => {
    const now = new Date().toISOString();
    let metricMessage: string | undefined;
    updateData((prev) => {
      const result = applyTaskUpdateWithMetrics(prev, taskId, { ...patch, updatedAt: now });
      metricMessage = result.metricMessage;
      return result.data;
    });
    toast(metricMessage ?? fallback);
  };

  const toggleDone = (task: Task) => {
    const done = isTaskCompleted(getEffectiveTaskStatus(task));
    const now = new Date().toISOString();
    patchTask(
      task.id,
      done
        ? { status: 'Not Started', completedAt: '', progressPercentage: 0 }
        : { status: 'Completed', completedAt: now, progressPercentage: 100 },
      done ? 'Task reopened' : 'Task completed'
    );
  };

  const duplicateTask = (task: Task) => {
    const now = new Date().toISOString();
    const copy: Task = {
      ...task,
      id: generateId('task'),
      title: `${getTaskTitle(task)} (copy)`,
      status: 'Not Started',
      completedAt: '',
      progressPercentage: 0,
      metricSnapshot: undefined,
      createdAt: now,
      updatedAt: now,
    };
    updateData((prev) => ({ ...prev, tasks: [...prev.tasks, copy] }));
    toast('Task duplicated');
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    updateData((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((t) => t.id !== deleteTarget.id),
    }));
    toast('Task deleted');
    setDeleteTarget(null);
  };

  const renderList = (tasks: Task[]) => (
    <div className="space-y-2">
      {tasks.map((task) => (
        <TaskListItem
          key={task.id}
          task={task}
          projects={data.projects}
          onToggleDone={() => toggleDone(task)}
          onEdit={() => openEdit(task)}
          onDelete={() => setDeleteTarget(task)}
          onDuplicate={() => duplicateTask(task)}
          onQuickPriority={(p) => patchTask(task.id, { priority: p })}
          onQuickStatus={(s) =>
            patchTask(task.id, {
              status: s,
              ...(s === 'Completed'
                ? { completedAt: new Date().toISOString(), progressPercentage: 100 }
                : { completedAt: '', progressPercentage: task.progressPercentage }),
            })
          }
        />
      ))}
    </div>
  );

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <Header
          title="Master Tasks"
          subtitle={`Deadlines & priorities · ${description}`}
        />
        <PageActions onAdd={openAdd} addLabel="Add task" />
      </div>

      <PacingDateBanner />
      <WarningBanners warnings={computeAppWarnings(data)} />

      {showAdvisorWidgets && <TaskProgressWidgets tracks={progressTracks} />}

      <Card className="mb-4 space-y-4">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              setView('overdue');
              setSearchParams({ view: 'overdue' });
            }}
            className="rounded-lg border border-red-200 bg-red-50 px-2 py-1 text-xs font-medium text-red-800"
          >
            Filter overdue
          </button>
          <button
            type="button"
            onClick={() => {
              setPriority('P0');
              setView('all');
            }}
            className="rounded-lg border border-orange-200 bg-orange-50 px-2 py-1 text-xs font-medium text-orange-900"
          >
            Filter P0
          </button>
        </div>
        <ViewTabs
          tabs={views}
          active={view}
          onChange={(id) => {
            setView(id);
            setSearchParams(id === 'all' ? {} : { view: id });
          }}
        />
        <FilterBar>
          <FilterSearch value={search} onChange={setSearch} placeholder="Search tasks…" />
          <FilterSelect
            label="Project"
            value={projectId}
            onChange={(id) => {
              setProjectId(id);
              const params: Record<string, string> = {};
              if (view !== 'all') params.view = view;
              if (id) params.project = id;
              setSearchParams(params);
            }}
            options={data.projects.map((p) => ({ value: p.id, label: p.projectName }))}
          />
          <FilterSelect
            label="Module"
            value={module}
            onChange={setModule}
            options={moduleOptions.map((m) => ({ value: m, label: m }))}
          />
          <FilterSelect
            label="Priority"
            value={priority}
            onChange={setPriority}
            options={taskPriorities.map((p) => ({
              value: p,
              label: TASK_PRIORITY_LABELS[p],
            }))}
          />
          <button
            type="button"
            onClick={() => setMoreFilters((v) => !v)}
            className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-slate-700 lg:hidden"
          >
            {moreFilters ? 'Fewer filters' : 'More filters'}
          </button>
          <div
            className={cn(
              'flex w-full flex-wrap items-end gap-3',
              moreFilters ? 'flex' : 'hidden lg:flex'
            )}
          >
            <FilterSelect
              label="Status"
              value={status}
              onChange={setStatus}
              options={taskStatuses.map((s) => ({ value: s, label: s }))}
            />
            <FilterSelect
              label="Owner"
              value={owner}
              onChange={setOwner}
              options={ownerOptions.map((o) => ({ value: o, label: o }))}
            />
            <FilterSelect
              label="Track"
              value={track}
              onChange={setTrack}
              options={taskTracks
                .filter((t) => t.value)
                .map((t) => ({ value: t.value, label: t.label }))}
            />
            <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
              Deadline from
              <input
                type="date"
                value={deadlineFrom}
                onChange={(e) => setDeadlineFrom(e.target.value)}
                className="rounded-lg border border-border bg-white px-2 py-1.5 text-sm text-slate-900"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
              Deadline to
              <input
                type="date"
                value={deadlineTo}
                onChange={(e) => setDeadlineTo(e.target.value)}
                className="rounded-lg border border-border bg-white px-2 py-1.5 text-sm text-slate-900"
              />
            </label>
          </div>
        </FilterBar>
        <p className="text-xs text-slate-500">
          {filtered.length} task{filtered.length === 1 ? '' : 's'}
          {view !== 'all' && ` · ${views.find((v) => v.id === view)?.label}`}
        </p>
      </Card>

      {view === 'calendar' ? (
        <CalendarMonthView tasks={data.tasks} />
      ) : view === 'milestones' ? (
        <YearEndMilestonesView data={data} />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No tasks match"
          description="Try another view or add a new task."
          action={
            <button
              type="button"
              onClick={openAdd}
              className="text-sm font-medium text-slate-900 underline"
            >
              Add task
            </button>
          }
        />
      ) : grouped ? (
        <div className="space-y-6">
          {grouped.map((section) => (
            <section key={section.key}>
              <h3 className="mb-2 text-sm font-semibold text-slate-700">{section.label}</h3>
              {renderList(section.tasks)}
            </section>
          ))}
        </div>
      ) : (
        renderList(filtered)
      )}

      <ModalForm
        open={modalOpen}
        title={editing ? 'Edit task' : 'Add task'}
        onClose={() => setModalOpen(false)}
        footer={
          <ModalFooter
            onCancel={() => setModalOpen(false)}
            onSave={save}
            saveLabel={editing ? 'Save changes' : 'Add task'}
          />
        }
      >
        <TaskFormFields
          value={form}
          onChange={setForm}
          projects={data.projects}
          tasks={data.tasks}
        />
      </ModalForm>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete task?"
        message={deleteTarget ? `Delete "${getTaskTitle(deleteTarget)}"?` : ''}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
