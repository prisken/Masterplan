import type { PaTrackerData } from '../../types';
import { buildPaPacingRows, type PaPacingRowStatus } from '../../utils/paPacingTable';
import { cn } from '../../utils/cn';

const statusStyles: Record<PaPacingRowStatus, string> = {
  met: 'bg-green-50 text-green-900',
  behind: 'bg-red-50 text-red-900',
  upcoming: 'bg-slate-50 text-slate-600',
  current: 'bg-amber-50 text-amber-900 ring-1 ring-amber-200',
};

const statusLabel: Record<PaPacingRowStatus, string> = {
  met: 'Met',
  behind: 'Behind',
  upcoming: 'Upcoming',
  current: 'Current',
};

interface PaPacingTableProps {
  data: PaTrackerData;
}

export function PaPacingTable({ data }: PaPacingTableProps) {
  const rows = buildPaPacingRows(data);

  return (
    <div className="border-t border-border pt-4">
      <p className="mb-1 text-xs font-semibold uppercase text-slate-500">PA pacing table</p>
      <p className="mb-3 text-xs text-slate-500">
        Monthly cumulative targets vs your current counts (distinct / new / vitality).
      </p>
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full min-w-[480px] text-left text-xs">
          <thead>
            <tr className="border-b border-border bg-slate-50 text-slate-500">
              <th className="px-3 py-2 font-medium">Date</th>
              <th className="px-3 py-2 font-medium">Distinct</th>
              <th className="px-3 py-2 font-medium">New</th>
              <th className="px-3 py-2 font-medium">Vitality</th>
              <th className="px-3 py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.date}
                className={cn('border-b border-border/60 last:border-0', statusStyles[row.status])}
              >
                <td className="px-3 py-2 font-medium">{row.date}</td>
                <td className="px-3 py-2 tabular-nums">
                  {row.distinctActual}/{row.distinctTarget}
                </td>
                <td className="px-3 py-2 tabular-nums">
                  {row.newActual}/{row.newTarget}
                </td>
                <td className="px-3 py-2 tabular-nums">
                  {row.categoryActual}/{row.categoryTarget}
                </td>
                <td className="px-3 py-2">{statusLabel[row.status]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
