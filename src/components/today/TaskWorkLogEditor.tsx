import type { DailyTaskNote } from '../../types';
import { FormField, inputClass, textareaClass } from '../ui/FormField';

interface TaskWorkLogEditorProps {
  note: DailyTaskNote | undefined;
  taskId: string;
  onChange: (next: DailyTaskNote) => void;
}

export function TaskWorkLogEditor({ note, taskId, onChange }: TaskWorkLogEditorProps) {
  const n = note ?? { taskId };
  const patch = (partial: Partial<DailyTaskNote>) => onChange({ ...n, taskId, ...partial });

  return (
    <div className="space-y-3 border-t border-border pt-3">
      <FormField label="Quick note (today only)">
        <textarea
          className={textareaClass}
          rows={2}
          placeholder="Scratchpad for this task today…"
          value={n.note ?? ''}
          onChange={(e) => patch({ note: e.target.value })}
        />
      </FormField>
      <FormField label="What I did today">
        <textarea
          className={textareaClass}
          rows={2}
          value={n.whatDidToday ?? ''}
          onChange={(e) => patch({ whatDidToday: e.target.value })}
        />
      </FormField>
      <div className="grid gap-3 sm:grid-cols-2">
        <FormField label="Outcome">
          <input
            className={inputClass}
            value={n.outcome ?? ''}
            onChange={(e) => patch({ outcome: e.target.value })}
          />
        </FormField>
        <FormField label="Blocker">
          <input
            className={inputClass}
            value={n.blocker ?? ''}
            onChange={(e) => patch({ blocker: e.target.value })}
          />
        </FormField>
      </div>
      <FormField label="Next step">
        <input
          className={inputClass}
          value={n.nextStep ?? ''}
          onChange={(e) => patch({ nextStep: e.target.value })}
        />
      </FormField>
      <FormField label="Time spent (minutes)">
        <input
          type="number"
          min={0}
          className={inputClass}
          value={n.timeSpentMinutes ?? ''}
          onChange={(e) =>
            patch({
              timeSpentMinutes: e.target.value === '' ? undefined : Number(e.target.value),
            })
          }
        />
      </FormField>
      <FormField label="Progress note (today)">
        <textarea
          className={textareaClass}
          rows={2}
          value={n.progressNote ?? ''}
          onChange={(e) => patch({ progressNote: e.target.value })}
        />
      </FormField>
    </div>
  );
}
