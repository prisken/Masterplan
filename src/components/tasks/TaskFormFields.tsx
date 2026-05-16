import {
  energyLevels,
  impactLevels,
  taskAreas,
  taskPriorities,
  taskStatuses,
  taskTracks,
  timeNeededOptions,
} from '../../constants/options';
import { ADVISOR_MODULES } from '../../constants/taskModules';
import { TASK_METRIC_DEFINITIONS, getMetricDefinition } from '../../constants/taskMetricKeys';
import { TASK_PRIORITY_LABELS } from '../../types';
import type { Project, Task, TaskMetricKey } from '../../types';
import { inferTaskMetric } from '../../utils/taskMetrics';
import { FormField, inputClass, selectClass, textareaClass } from '../ui/FormField';

interface TaskFormFieldsProps {
  value: Task;
  onChange: (t: Task) => void;
  projects: Project[];
  tasks: Task[];
}

export function TaskFormFields({ value, onChange, projects, tasks }: TaskFormFieldsProps) {
  const set = <K extends keyof Task>(key: K, val: Task[K]) =>
    onChange({ ...value, [key]: val });

  const otherTasks = tasks.filter((t) => t.id !== value.id);

  return (
    <div className="space-y-4">
      <FormField label="Title">
        <input
          className={inputClass}
          value={value.title || value.taskName || ''}
          onChange={(e) => {
            const title = e.target.value;
            if (!value.metricKey) {
              const inferred = inferTaskMetric(title);
              if (inferred) {
                onChange({ ...value, title, ...inferred });
                return;
              }
            }
            set('title', title);
          }}
        />
      </FormField>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label="Project / module">
          <select
            className={selectClass}
            value={value.projectId}
            onChange={(e) => set('projectId', e.target.value)}
          >
            <option value="">Select project</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.projectName}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Module (section)">
          <input
            className={inputClass}
            value={value.module}
            onChange={(e) => set('module', e.target.value)}
            placeholder="e.g. PA Policy Requirements"
            list="advisor-module-list"
          />
          <datalist id="advisor-module-list">
            {ADVISOR_MODULES.map((m) => (
              <option key={m} value={m} />
            ))}
          </datalist>
        </FormField>
      </div>
      <FormField label="Progress %">
        <input
          type="number"
          min={0}
          max={100}
          className={inputClass}
          value={value.progressPercentage}
          onChange={(e) => set('progressPercentage', Number(e.target.value) || 0)}
        />
      </FormField>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label="Priority">
          <select
            className={selectClass}
            value={value.priority}
            onChange={(e) => set('priority', e.target.value as Task['priority'])}
          >
            {taskPriorities.map((p) => (
              <option key={p} value={p}>
                {TASK_PRIORITY_LABELS[p]}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Status">
          <select
            className={selectClass}
            value={value.status}
            onChange={(e) => set('status', e.target.value as Task['status'])}
          >
            {taskStatuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </FormField>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label="Deadline">
          <input
            type="date"
            className={inputClass}
            value={value.deadline}
            onChange={(e) => set('deadline', e.target.value)}
          />
        </FormField>
        <FormField label="Owner">
          <input
            className={inputClass}
            value={value.owner}
            onChange={(e) => set('owner', e.target.value)}
          />
        </FormField>
      </div>
      <FormField label="Dependency (task name or note)">
        <input
          className={inputClass}
          value={value.dependency}
          onChange={(e) => set('dependency', e.target.value)}
          list="task-deps"
        />
        <datalist id="task-deps">
          {otherTasks.map((t) => (
            <option key={t.id} value={t.title || t.taskName || ''} />
          ))}
        </datalist>
      </FormField>
      <FormField label="Success metric">
        <input
          className={inputClass}
          value={value.successMetric}
          onChange={(e) => set('successMetric', e.target.value)}
        />
      </FormField>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label="Area">
          <select
            className={selectClass}
            value={value.area}
            onChange={(e) => set('area', e.target.value as Task['area'])}
          >
            {taskAreas.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Progress track (Advisor)">
          <select
            className={selectClass}
            value={value.track}
            onChange={(e) => set('track', e.target.value as Task['track'])}
          >
            {taskTracks.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </FormField>
      </div>
      <div className="rounded-lg border border-violet-100 bg-violet-50/50 p-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-violet-800">
          Advisor metric link
        </p>
        <p className="mb-3 text-xs text-violet-700/80">
          Completing this task updates the linked tracker on /advisor automatically.
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Metric">
            <select
              className={selectClass}
              value={value.metricKey}
              onChange={(e) => {
                const metricKey = e.target.value as TaskMetricKey;
                const def = getMetricDefinition(metricKey);
                onChange({
                  ...value,
                  metricKey,
                  metricMode: def?.defaultMode ?? 'set',
                  metricValue: metricKey ? value.metricValue || 1 : 0,
                });
              }}
            >
              <option value="">None</option>
              {TASK_METRIC_DEFINITIONS.map((d) => (
                <option key={d.key} value={d.key}>
                  {d.label}
                </option>
              ))}
            </select>
          </FormField>
          {value.metricKey ? (
            <>
              <FormField label="Update mode">
                <select
                  className={selectClass}
                  value={value.metricMode}
                  onChange={(e) => set('metricMode', e.target.value as Task['metricMode'])}
                >
                  <option value="set">Set to value (milestone)</option>
                  <option value="increment">Add to current</option>
                </select>
              </FormField>
              <FormField label="Value">
                <input
                  type="number"
                  min={0}
                  className={inputClass}
                  value={value.metricValue}
                  onChange={(e) => set('metricValue', Number(e.target.value) || 0)}
                />
              </FormField>
            </>
          ) : null}
        </div>
        {value.metricKey ? (
          <p className="mt-2 text-xs text-violet-600">
            {getMetricDefinition(value.metricKey)?.hint}
          </p>
        ) : null}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label="Time needed">
          <select
            className={selectClass}
            value={value.timeNeeded}
            onChange={(e) => set('timeNeeded', e.target.value as Task['timeNeeded'])}
          >
            {timeNeededOptions.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Energy / impact">
          <div className="grid grid-cols-2 gap-2">
            <select
              className={selectClass}
              value={value.energyLevel}
              onChange={(e) => set('energyLevel', e.target.value as Task['energyLevel'])}
            >
              {energyLevels.map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
            </select>
            <select
              className={selectClass}
              value={value.impact}
              onChange={(e) => set('impact', e.target.value as Task['impact'])}
            >
              {impactLevels.map((i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </select>
          </div>
        </FormField>
      </div>
      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={value.today}
            onChange={(e) => set('today', e.target.checked)}
            className="rounded border-border"
          />
          Pin to Today view
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={value.thisWeek}
            onChange={(e) => set('thisWeek', e.target.checked)}
            className="rounded border-border"
          />
          Pin to This Week view
        </label>
      </div>
      <FormField label="Notes">
        <textarea
          className={textareaClass}
          value={value.notes}
          onChange={(e) => set('notes', e.target.value)}
        />
      </FormField>
    </div>
  );
}
