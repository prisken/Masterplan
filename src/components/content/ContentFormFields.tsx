import {
  contentPillars,
  contentStatuses,
  contentTypes,
  platforms,
} from '../../constants/contentOptions';
import type { ContentItem, Project } from '../../types';
import { FormField, inputClass, selectClass, textareaClass } from '../ui/FormField';

interface ContentFormFieldsProps {
  value: ContentItem;
  onChange: (c: ContentItem) => void;
  projects: Project[];
}

export function ContentFormFields({ value, onChange, projects }: ContentFormFieldsProps) {
  const set = <K extends keyof ContentItem>(key: K, val: ContentItem[K]) =>
    onChange({ ...value, [key]: val });

  const num = (key: keyof ContentItem) => (e: React.ChangeEvent<HTMLInputElement>) =>
    set(key, Number(e.target.value) as ContentItem[typeof key]);

  return (
    <div className="space-y-4">
      <FormField label="Title">
        <input
          className={inputClass}
          value={value.contentTitle}
          onChange={(e) => set('contentTitle', e.target.value)}
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
        <FormField label="Platform">
          <select
            className={selectClass}
            value={value.platform}
            onChange={(e) => set('platform', e.target.value as ContentItem['platform'])}
          >
            {platforms.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </FormField>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Content type">
          <select
            className={selectClass}
            value={value.contentType}
            onChange={(e) => set('contentType', e.target.value as ContentItem['contentType'])}
          >
            {contentTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Pillar">
          <select
            className={selectClass}
            value={value.contentPillar}
            onChange={(e) => set('contentPillar', e.target.value as ContentItem['contentPillar'])}
          >
            {contentPillars.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </FormField>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Status">
          <select
            className={selectClass}
            value={value.status}
            onChange={(e) => set('status', e.target.value as ContentItem['status'])}
          >
            {contentStatuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Publish date">
          <input
            type="date"
            className={inputClass}
            value={value.publishDate}
            onChange={(e) => set('publishDate', e.target.value)}
          />
        </FormField>
      </div>
      <FormField label="Main message">
        <textarea
          className={textareaClass}
          value={value.mainMessage}
          onChange={(e) => set('mainMessage', e.target.value)}
        />
      </FormField>
      <FormField label="Call to action">
        <input
          className={inputClass}
          value={value.callToAction}
          onChange={(e) => set('callToAction', e.target.value)}
        />
      </FormField>
      <FormField label="Asset link">
        <input
          className={inputClass}
          value={value.assetLink}
          onChange={(e) => set('assetLink', e.target.value)}
          placeholder="https://"
        />
      </FormField>
      <p className="text-xs font-medium text-slate-500">Performance metrics</p>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <FormField label="Views">
          <input type="number" min={0} className={inputClass} value={value.views} onChange={num('views')} />
        </FormField>
        <FormField label="Likes">
          <input type="number" min={0} className={inputClass} value={value.likes} onChange={num('likes')} />
        </FormField>
        <FormField label="Comments">
          <input type="number" min={0} className={inputClass} value={value.comments} onChange={num('comments')} />
        </FormField>
        <FormField label="Shares">
          <input type="number" min={0} className={inputClass} value={value.shares} onChange={num('shares')} />
        </FormField>
        <FormField label="Leads">
          <input
            type="number"
            min={0}
            className={inputClass}
            value={value.leadsGenerated}
            onChange={num('leadsGenerated')}
          />
        </FormField>
      </div>
      <FormField label="Performance notes">
        <textarea
          className={textareaClass}
          value={value.performanceNotes}
          onChange={(e) => set('performanceNotes', e.target.value)}
        />
      </FormField>
    </div>
  );
}
