import { financeCategories, financeTypes } from '../../constants/contentOptions';
import type { FinanceItem, Project } from '../../types';
import { FormField, inputClass, selectClass, textareaClass } from '../ui/FormField';

interface FinanceFormFieldsProps {
  value: FinanceItem;
  onChange: (f: FinanceItem) => void;
  projects: Project[];
}

export function FinanceFormFields({ value, onChange, projects }: FinanceFormFieldsProps) {
  const set = <K extends keyof FinanceItem>(key: K, val: FinanceItem[K]) =>
    onChange({ ...value, [key]: val });

  return (
    <div className="space-y-4">
      <FormField label="Item description">
        <input
          className={inputClass}
          value={value.item}
          onChange={(e) => set('item', e.target.value)}
        />
      </FormField>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Project">
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
        <FormField label="Type">
          <select
            className={selectClass}
            value={value.type}
            onChange={(e) => set('type', e.target.value as FinanceItem['type'])}
          >
            {financeTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </FormField>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Category">
          <select
            className={selectClass}
            value={value.category}
            onChange={(e) => set('category', e.target.value as FinanceItem['category'])}
          >
            {financeCategories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Amount">
          <input
            type="number"
            min={0}
            step={0.01}
            className={inputClass}
            value={value.amount}
            onChange={(e) => set('amount', Number(e.target.value))}
          />
        </FormField>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Date">
          <input
            type="date"
            className={inputClass}
            value={value.date}
            onChange={(e) => set('date', e.target.value)}
          />
        </FormField>
        <FormField label="Paid">
          <label className="mt-2 flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={value.paid}
              onChange={(e) => set('paid', e.target.checked)}
              className="rounded border-border"
            />
            Mark as paid
          </label>
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
