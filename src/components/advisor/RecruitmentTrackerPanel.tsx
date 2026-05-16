import { Card } from '../ui/Card';
import { ProgressBar } from '../ui/ProgressBar';
import { Badge } from '../ui/Badge';
import type { RecruitmentCandidate, RecruitmentStage, RecruitmentTrackerData } from '../../types';
import {
  computeRecruitmentWarnings,
  getRecruitmentFunnelStats,
} from '../../utils/recruitmentTracker';
import { recruitmentStages } from '../../constants/options';
import { generateId } from '../../utils/id';
import { daysUntilYearEnd } from '../../utils/referenceDate';
import { RecruitmentFunnelChart } from './RecruitmentFunnelChart';

interface RecruitmentTrackerPanelProps {
  data: RecruitmentTrackerData;
  onChange: (data: RecruitmentTrackerData) => void;
}

export function RecruitmentTrackerPanel({ data, onChange }: RecruitmentTrackerPanelProps) {
  const stats = getRecruitmentFunnelStats(data);
  const warnings = computeRecruitmentWarnings(data);

  const addCandidate = () => {
    const c: RecruitmentCandidate = {
      id: generateId('cand'),
      name: 'New candidate',
      stage: 'Identified',
      notes: '',
      updatedAt: new Date().toISOString(),
    };
    onChange({ ...data, candidates: [...data.candidates, c] });
  };

  const updateCandidate = (id: string, patch: Partial<RecruitmentCandidate>) => {
    onChange({
      ...data,
      candidates: data.candidates.map((c) =>
        c.id === id ? { ...c, ...patch, updatedAt: new Date().toISOString() } : c
      ),
    });
  };

  const removeCandidate = (id: string) => {
    onChange({ ...data, candidates: data.candidates.filter((c) => c.id !== id) });
  };

  const hirePct = Math.round((data.agentsOnboarded / stats.agentsTarget) * 100);

  return (
    <Card>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Recruitment & team building</h2>
          <p className="text-xs text-slate-500">{daysUntilYearEnd()} days to 31 Dec 2026</p>
        </div>
        <Badge variant={hirePct >= 100 ? 'success' : hirePct >= 50 ? 'warning' : 'danger'}>
          {data.agentsOnboarded}/{stats.agentsTarget} agents
        </Badge>
      </div>

      {warnings.length > 0 && (
        <div className="mb-4 space-y-2">
          {warnings.map((w) => (
            <p
              key={w.id}
              className={`rounded-lg px-3 py-2 text-xs font-medium ${
                w.severity === 'critical'
                  ? 'bg-red-50 text-red-800'
                  : 'bg-orange-50 text-orange-800'
              }`}
            >
              {w.message}
            </p>
          ))}
        </div>
      )}

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <label className="block">
          <span className="text-xs text-slate-600">Agents onboarded</span>
          <input
            type="number"
            min={0}
            max={20}
            className="mt-1 w-full rounded-lg border border-border px-2 py-1 text-sm"
            value={data.agentsOnboarded}
            onChange={(e) =>
              onChange({ ...data, agentsOnboarded: Number(e.target.value) || 0 })
            }
          />
        </label>
        <label className="block">
          <span className="text-xs text-slate-600">Target agents</span>
          <input
            type="number"
            min={1}
            className="mt-1 w-full rounded-lg border border-border px-2 py-1 text-sm"
            value={data.agentsTarget}
            onChange={(e) => onChange({ ...data, agentsTarget: Number(e.target.value) || 4 })}
          />
        </label>
        <div className="flex flex-col justify-end">
          <ProgressBar value={hirePct} accentClass="bg-credibility" size="sm" />
        </div>
      </div>

      <RecruitmentFunnelChart data={data} className="mb-4 border-t-0 pt-0" />

      <div className="flex items-center justify-between border-t border-border pt-4">
        <p className="text-sm font-semibold text-slate-800">Candidates</p>
        <button
          type="button"
          onClick={addCandidate}
          className="text-xs font-medium text-slate-900 underline"
        >
          + Add candidate
        </button>
      </div>

      {data.candidates.length === 0 ? (
        <p className="mt-2 text-sm text-slate-400">No candidates yet. Add names to track the funnel.</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {data.candidates.map((c) => (
            <li
              key={c.id}
              className="flex flex-wrap items-end gap-2 rounded-lg border border-border p-3"
            >
              <input
                className="min-w-[120px] flex-1 rounded border border-border px-2 py-1 text-sm"
                value={c.name}
                onChange={(e) => updateCandidate(c.id, { name: e.target.value })}
              />
              <select
                className="rounded border border-border px-2 py-1 text-sm"
                value={c.stage}
                onChange={(e) =>
                  updateCandidate(c.id, { stage: e.target.value as RecruitmentStage })
                }
              >
                {recruitmentStages.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => removeCandidate(c.id)}
                className="text-xs text-red-600"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
