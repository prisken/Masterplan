import {
  contactTypes,
  potentialValues,
  relationshipStrengths,
  sources,
  stages,
} from '../../constants/options';
import type { Contact, Project } from '../../types';
import { FormField, inputClass, selectClass, textareaClass } from '../ui/FormField';

interface ContactFormFieldsProps {
  value: Contact;
  onChange: (c: Contact) => void;
  projects: Project[];
}

export function ContactFormFields({ value, onChange, projects }: ContactFormFieldsProps) {
  const set = <K extends keyof Contact>(key: K, val: Contact[K]) =>
    onChange({ ...value, [key]: val });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Name">
          <input
            className={inputClass}
            value={value.name}
            onChange={(e) => set('name', e.target.value)}
          />
        </FormField>
        <FormField label="Organization">
          <input
            className={inputClass}
            value={value.organization}
            onChange={(e) => set('organization', e.target.value)}
          />
        </FormField>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Contact type">
          <select
            className={selectClass}
            value={value.contactType}
            onChange={(e) => set('contactType', e.target.value as Contact['contactType'])}
          >
            {contactTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Related project">
          <select
            className={selectClass}
            value={value.relatedProjectId}
            onChange={(e) => set('relatedProjectId', e.target.value)}
          >
            <option value="">None</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.projectName}
              </option>
            ))}
          </select>
        </FormField>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Role">
          <input
            className={inputClass}
            value={value.role}
            onChange={(e) => set('role', e.target.value)}
          />
        </FormField>
        <FormField label="Source">
          <select
            className={selectClass}
            value={value.source}
            onChange={(e) => set('source', e.target.value as Contact['source'])}
          >
            {sources.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </FormField>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Phone">
          <input
            className={inputClass}
            value={value.phone}
            onChange={(e) => set('phone', e.target.value)}
          />
        </FormField>
        <FormField label="Email">
          <input
            type="email"
            className={inputClass}
            value={value.email}
            onChange={(e) => set('email', e.target.value)}
          />
        </FormField>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Relationship">
          <select
            className={selectClass}
            value={value.relationshipStrength}
            onChange={(e) =>
              set('relationshipStrength', e.target.value as Contact['relationshipStrength'])
            }
          >
            {relationshipStrengths.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Stage">
          <select
            className={selectClass}
            value={value.stage}
            onChange={(e) => set('stage', e.target.value as Contact['stage'])}
          >
            {stages.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </FormField>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Last contact">
          <input
            type="date"
            className={inputClass}
            value={value.lastContactDate}
            onChange={(e) => set('lastContactDate', e.target.value)}
          />
        </FormField>
        <FormField label="Next follow-up">
          <input
            type="date"
            className={inputClass}
            value={value.nextFollowUpDate}
            onChange={(e) => set('nextFollowUpDate', e.target.value)}
          />
        </FormField>
      </div>
      <FormField label="Potential value">
        <select
          className={selectClass}
          value={value.potentialValue}
          onChange={(e) => set('potentialValue', e.target.value as Contact['potentialValue'])}
        >
          {potentialValues.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
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
