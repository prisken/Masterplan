import { assetStatuses, assetTypes } from '../../constants/assetOptions';
import type { DigitalAsset, Project } from '../../types';
import { FormField, inputClass, selectClass, textareaClass } from '../ui/FormField';

interface AssetFormFieldsProps {
  value: DigitalAsset;
  onChange: (a: DigitalAsset) => void;
  projects: Project[];
}

export function AssetFormFields({ value, onChange, projects }: AssetFormFieldsProps) {
  const set = <K extends keyof DigitalAsset>(key: K, val: DigitalAsset[K]) =>
    onChange({ ...value, [key]: val });

  return (
    <div className="space-y-4">
      <FormField label="Asset name">
        <input
          className={inputClass}
          value={value.assetName}
          onChange={(e) => set('assetName', e.target.value)}
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
        <FormField label="Asset type">
          <select
            className={selectClass}
            value={value.assetType}
            onChange={(e) => set('assetType', e.target.value as DigitalAsset['assetType'])}
          >
            {assetTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </FormField>
      </div>
      <FormField label="Status">
        <select
          className={selectClass}
          value={value.status}
          onChange={(e) => set('status', e.target.value as DigitalAsset['status'])}
        >
          {assetStatuses.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </FormField>
      <FormField label="Link or file path" hint="Google Drive URL or local path">
        <input
          className={inputClass}
          value={value.link}
          onChange={(e) => set('link', e.target.value)}
          placeholder="https:// or /path/to/file"
        />
      </FormField>
      <FormField label="Last updated">
        <input
          type="date"
          className={inputClass}
          value={value.lastUpdated}
          onChange={(e) => set('lastUpdated', e.target.value)}
        />
      </FormField>
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
