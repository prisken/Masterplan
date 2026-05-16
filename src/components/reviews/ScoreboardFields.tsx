import type { WeeklyScoreboard } from '../../types';
import { FormField, inputClass } from '../ui/FormField';

const scoreboardRows: { key: keyof WeeklyScoreboard; label: string }[] = [
  { key: 'businessLeadsContactedTarget', label: 'Business leads contacted' },
  { key: 'salesCallsBookedTarget', label: 'Sales calls booked' },
  { key: 'proposalsSentTarget', label: 'Proposals sent' },
  { key: 'newClientsClosedTarget', label: 'New clients closed' },
  { key: 'investmentVideosPostedTarget', label: 'Investment videos posted' },
  { key: 'followersGainedTarget', label: 'Followers gained' },
  { key: 'hksiStudyHoursTarget', label: 'HKSI study hours' },
  { key: 'practiceQuestionsCompletedTarget', label: 'Practice questions completed' },
  { key: 'sponsorContactsTarget', label: 'Sponsor contacts' },
  { key: 'volunteersRecruitedTarget', label: 'Volunteers recruited' },
  { key: 'parentCommunityContactsTarget', label: 'Parent / community contacts' },
];

function actualKey(targetKey: keyof WeeklyScoreboard): keyof WeeklyScoreboard {
  return targetKey.replace('Target', 'Actual') as keyof WeeklyScoreboard;
}

interface ScoreboardFieldsProps {
  value: WeeklyScoreboard;
  onChange: (s: WeeklyScoreboard) => void;
}

export function ScoreboardFields({ value, onChange }: ScoreboardFieldsProps) {
  return (
    <div className="space-y-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        Weekly scoreboard — target vs actual
      </p>
      {scoreboardRows.map(({ key, label }) => {
        const actual = actualKey(key);
        const targetVal = value[key] as number;
        const actualVal = value[actual] as number;
        const pct = targetVal > 0 ? Math.min(100, Math.round((actualVal / targetVal) * 100)) : 0;

        return (
          <div key={key} className="rounded-lg border border-border bg-slate-50/50 p-3">
            <p className="mb-2 text-sm font-medium text-slate-800">{label}</p>
            <div className="mb-2 grid grid-cols-2 gap-3">
              <FormField label="Target">
                <input
                  type="number"
                  min={0}
                  className={inputClass}
                  value={targetVal}
                  onChange={(e) =>
                    onChange({ ...value, [key]: Number(e.target.value) })
                  }
                />
              </FormField>
              <FormField label="Actual">
                <input
                  type="number"
                  min={0}
                  className={inputClass}
                  value={actualVal}
                  onChange={(e) =>
                    onChange({ ...value, [actual]: Number(e.target.value) })
                  }
                />
              </FormField>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-credibility transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="mt-1 text-right text-xs text-slate-500">{pct}% of target</p>
          </div>
        );
      })}
    </div>
  );
}
