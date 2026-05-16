import { eventStatuses, eventTypes } from '../../constants/contentOptions';
import type { Event, Project } from '../../types';
import { FormField, inputClass, selectClass, textareaClass } from '../ui/FormField';

interface EventFormFieldsProps {
  value: Event;
  onChange: (e: Event) => void;
  projects: Project[];
}

export function EventFormFields({ value, onChange, projects }: EventFormFieldsProps) {
  const set = <K extends keyof Event>(key: K, val: Event[K]) =>
    onChange({ ...value, [key]: val });

  const num = (key: keyof Event) => (e: React.ChangeEvent<HTMLInputElement>) =>
    set(key, Number(e.target.value) as Event[typeof key]);

  return (
    <div className="space-y-4">
      <FormField label="Event name">
        <input
          className={inputClass}
          value={value.eventName}
          onChange={(e) => set('eventName', e.target.value)}
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
        <FormField label="Event type">
          <select
            className={selectClass}
            value={value.eventType}
            onChange={(e) => set('eventType', e.target.value as Event['eventType'])}
          >
            {eventTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
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
        <FormField label="Status">
          <select
            className={selectClass}
            value={value.status}
            onChange={(e) => set('status', e.target.value as Event['status'])}
          >
            {eventStatuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </FormField>
      </div>
      <FormField label="Venue or link">
        <input
          className={inputClass}
          value={value.venueOrLink}
          onChange={(e) => set('venueOrLink', e.target.value)}
        />
      </FormField>
      <FormField label="Main goal">
        <textarea
          className={textareaClass}
          value={value.mainGoal}
          onChange={(e) => set('mainGoal', e.target.value)}
        />
      </FormField>
      <p className="text-xs font-medium text-slate-500">Attendance & resources</p>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Target attendees">
          <input type="number" min={0} className={inputClass} value={value.targetAttendees} onChange={num('targetAttendees')} />
        </FormField>
        <FormField label="Actual attendees">
          <input type="number" min={0} className={inputClass} value={value.actualAttendees} onChange={num('actualAttendees')} />
        </FormField>
        <FormField label="Budget">
          <input type="number" min={0} className={inputClass} value={value.budget} onChange={num('budget')} />
        </FormField>
        <FormField label="Revenue / donations">
          <input type="number" min={0} className={inputClass} value={value.revenueOrDonations} onChange={num('revenueOrDonations')} />
        </FormField>
        <FormField label="Sponsors needed">
          <input type="number" min={0} className={inputClass} value={value.sponsorsNeeded} onChange={num('sponsorsNeeded')} />
        </FormField>
        <FormField label="Sponsors confirmed">
          <input type="number" min={0} className={inputClass} value={value.sponsorsConfirmed} onChange={num('sponsorsConfirmed')} />
        </FormField>
        <FormField label="Volunteers needed">
          <input type="number" min={0} className={inputClass} value={value.volunteersNeeded} onChange={num('volunteersNeeded')} />
        </FormField>
        <FormField label="Volunteers confirmed">
          <input type="number" min={0} className={inputClass} value={value.volunteersConfirmed} onChange={num('volunteersConfirmed')} />
        </FormField>
      </div>
      <FormField label="Planning checklist">
        <textarea
          className={`${textareaClass} min-h-[200px] font-mono text-xs`}
          value={value.checklist}
          onChange={(e) => set('checklist', e.target.value)}
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
