import { Card } from '../ui/Card';
import { FormField, inputClass } from '../ui/FormField';
import type { AppSettings } from '../../types';
import { REFERENCE_DATE } from '../../types';
import { getPacingDateDescription } from '../../utils/referenceDate';

interface PacingSettingsCardProps {
  settings: AppSettings;
  onChange: (settings: AppSettings) => void;
}

export function PacingSettingsCard({ settings, onChange }: PacingSettingsCardProps) {
  const set = <K extends keyof AppSettings>(key: K, val: AppSettings[K]) =>
    onChange({ ...settings, [key]: val });

  return (
    <Card className="mb-6">
      <h2 className="text-sm font-semibold text-slate-900">Pacing date</h2>
      <p className="mt-2 text-sm text-slate-500">
        Controls what counts as &quot;today&quot; for task timelines (Today, This Week,
        Overdue), the task calendar, advisor PA/MDRT pace, and follow-ups due on the
        dashboard.
      </p>

      <div className="mt-4 space-y-4">
        <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-3">
          <input
            type="radio"
            name="pacing-mode"
            checked={settings.useLiveClock}
            onChange={() => set('useLiveClock', true)}
            className="mt-0.5"
          />
          <div>
            <p className="text-sm font-medium text-slate-900">Use live clock (recommended)</p>
            <p className="text-xs text-slate-500">
              Uses your device&apos;s current date. Best for daily real work.
            </p>
          </div>
        </label>

        <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-3">
          <input
            type="radio"
            name="pacing-mode"
            checked={!settings.useLiveClock}
            onChange={() => set('useLiveClock', false)}
            className="mt-0.5"
          />
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-900">Use fixed pacing date</p>
            <p className="text-xs text-slate-500">
              Simulates a specific &quot;today&quot; (e.g. planning from 15 May 2026).
            </p>
            {!settings.useLiveClock && (
              <FormField label="Pacing date" className="mt-3">
                <input
                  type="date"
                  className={inputClass}
                  value={settings.pacingDate}
                  onChange={(e) => set('pacingDate', e.target.value)}
                />
              </FormField>
            )}
          </div>
        </label>

        <button
          type="button"
          onClick={() =>
            onChange({ useLiveClock: false, pacingDate: REFERENCE_DATE })
          }
          className="text-xs font-medium text-slate-600 underline"
        >
          Reset to default pacing date ({REFERENCE_DATE})
        </button>
      </div>

      <p className="mt-4 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
        Active: <strong>{getPacingDateDescription(settings)}</strong>
      </p>
    </Card>
  );
}
