import {
  engineByCategory,
  projectCategories,
  projectPriorities,
  projectStatuses,
  revenuePotentials,
  timeDemands,
} from '../../constants/options';
import { FormField, inputClass, selectClass, textareaClass } from '../ui/FormField';
import type { Project } from '../../types';

interface ProjectFormFieldsProps {
  value: Project;
  onChange: (p: Project) => void;
}

export function ProjectFormFields({ value, onChange }: ProjectFormFieldsProps) {
  const set = <K extends keyof Project>(key: K, val: Project[K]) =>
    onChange({ ...value, [key]: val });

  const onCategory = (category: Project['category']) => {
    onChange({ ...value, category, engine: engineByCategory[category] });
  };

  return (
    <div className="space-y-4">
      <FormField label="Project name">
        <input
          className={inputClass}
          value={value.projectName}
          onChange={(e) => set('projectName', e.target.value)}
        />
      </FormField>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Category">
          <select
            className={selectClass}
            value={value.category}
            onChange={(e) => onCategory(e.target.value as Project['category'])}
          >
            {projectCategories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Engine">
          <input className={inputClass} value={value.engine} readOnly />
        </FormField>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Status">
          <select
            className={selectClass}
            value={value.status}
            onChange={(e) => set('status', e.target.value as Project['status'])}
          >
            {projectStatuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Priority">
          <select
            className={selectClass}
            value={value.priority}
            onChange={(e) => set('priority', e.target.value as Project['priority'])}
          >
            {projectPriorities.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </FormField>
      </div>
      <FormField label="Main goal">
        <textarea
          className={textareaClass}
          value={value.mainGoal}
          onChange={(e) => set('mainGoal', e.target.value)}
        />
      </FormField>
      <FormField label="Target audience">
        <textarea
          className={textareaClass}
          value={value.targetAudience}
          onChange={(e) => set('targetAudience', e.target.value)}
        />
      </FormField>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Main feeling">
          <input
            className={inputClass}
            value={value.mainFeeling}
            onChange={(e) => set('mainFeeling', e.target.value)}
          />
        </FormField>
        <FormField label="Main motive">
          <input
            className={inputClass}
            value={value.mainMotive}
            onChange={(e) => set('mainMotive', e.target.value)}
          />
        </FormField>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Current phase">
          <input
            className={inputClass}
            value={value.currentPhase}
            onChange={(e) => set('currentPhase', e.target.value)}
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
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Start date">
          <input
            type="date"
            className={inputClass}
            value={value.startDate}
            onChange={(e) => set('startDate', e.target.value)}
          />
        </FormField>
        <FormField label="Overall progress % (manual)">
          <input
            type="number"
            min={0}
            max={100}
            className={inputClass}
            value={value.progress}
            onChange={(e) => set('progress', Number(e.target.value))}
          />
          <p className="mt-1 text-xs text-slate-500">
            Project cards use task completion from Master Tasks, not this field.
          </p>
        </FormField>
      </div>
      <FormField label="Next milestone">
        <input
          className={inputClass}
          value={value.nextMilestone}
          onChange={(e) => set('nextMilestone', e.target.value)}
        />
      </FormField>
      <FormField label="Milestone deadline">
        <input
          type="date"
          className={inputClass}
          value={value.milestoneDeadline}
          onChange={(e) => set('milestoneDeadline', e.target.value)}
        />
      </FormField>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Revenue potential">
          <select
            className={selectClass}
            value={value.revenuePotential}
            onChange={(e) =>
              set('revenuePotential', e.target.value as Project['revenuePotential'])
            }
          >
            {revenuePotentials.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Time demand">
          <select
            className={selectClass}
            value={value.timeDemand}
            onChange={(e) => set('timeDemand', e.target.value as Project['timeDemand'])}
          >
            {timeDemands.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </FormField>
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
