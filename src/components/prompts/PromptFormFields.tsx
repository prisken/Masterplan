import { outputFormats, promptUseCases, qualityRatings } from '../../constants/assetOptions';
import type { AiPrompt, Project } from '../../types';
import { FormField, inputClass, selectClass, textareaClass } from '../ui/FormField';

interface PromptFormFieldsProps {
  value: AiPrompt;
  onChange: (p: AiPrompt) => void;
  projects: Project[];
}

export function PromptFormFields({ value, onChange, projects }: PromptFormFieldsProps) {
  const set = <K extends keyof AiPrompt>(key: K, val: AiPrompt[K]) =>
    onChange({ ...value, [key]: val });

  return (
    <div className="space-y-4">
      <FormField label="Prompt name">
        <input
          className={inputClass}
          value={value.promptName}
          onChange={(e) => set('promptName', e.target.value)}
        />
      </FormField>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label="Project">
          <select
            className={selectClass}
            value={value.projectId}
            onChange={(e) => set('projectId', e.target.value)}
          >
            <option value="">None</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.projectName}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Use case">
          <select
            className={selectClass}
            value={value.useCase}
            onChange={(e) => set('useCase', e.target.value as AiPrompt['useCase'])}
          >
            {promptUseCases.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </FormField>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label="Output format">
          <select
            className={selectClass}
            value={value.outputFormat}
            onChange={(e) => set('outputFormat', e.target.value as AiPrompt['outputFormat'])}
          >
            {outputFormats.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Quality rating">
          <select
            className={selectClass}
            value={value.qualityRating}
            onChange={(e) => set('qualityRating', e.target.value as AiPrompt['qualityRating'])}
          >
            {qualityRatings.map((q) => (
              <option key={q} value={q}>
                {q}
              </option>
            ))}
          </select>
        </FormField>
      </div>
      <FormField label="Prompt text">
        <textarea
          className={`${textareaClass} min-h-[200px] font-mono text-xs`}
          value={value.promptText}
          onChange={(e) => set('promptText', e.target.value)}
        />
      </FormField>
      <FormField label="Notes">
        <textarea className={textareaClass} value={value.notes} onChange={(e) => set('notes', e.target.value)} />
      </FormField>
    </div>
  );
}
