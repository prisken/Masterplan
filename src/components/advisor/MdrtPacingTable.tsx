import type { MdrtTrackerData } from '../../types';
import { getMdrtPacingTables, routeLabel, type MdrtPacingRow, type PacingRowStatus } from '../../utils/mdrtPacingTable';
import { formatMoney } from '../../utils/financeStats';
import { cn } from '../../utils/cn';

const statusStyles: Record<PacingRowStatus, string> = {
  met: 'bg-green-50 text-green-900',
  behind: 'bg-red-50 text-red-900',
  upcoming: 'bg-slate-50 text-slate-600',
  current: 'bg-amber-50 text-amber-900 ring-1 ring-amber-200',
};

const statusLabel: Record<PacingRowStatus, string> = {
  met: 'Met',
  behind: 'Behind',
  upcoming: 'Upcoming',
  current: 'Current target',
};

function PacingTable({
  title,
  rows,
  highlight,
}: {
  title: string;
  rows: MdrtPacingRow[];
  highlight?: boolean;
}) {
  return (
    <div className={cn('overflow-hidden rounded-lg border border-border', highlight && 'ring-2 ring-credibility/30')}>
      <p className="border-b border-border bg-slate-50 px-3 py-2 text-xs font-semibold uppercase text-slate-600">
        {title}
      </p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[320px] text-left text-xs">
          <thead>
            <tr className="border-b border-border text-slate-500">
              <th className="px-3 py-2 font-medium">Date</th>
              <th className="px-3 py-2 font-medium">Target</th>
              <th className="px-3 py-2 font-medium">Gap</th>
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
                <td className="px-3 py-2 tabular-nums">{formatMoney(row.targetAmount)}</td>
                <td className="px-3 py-2 tabular-nums">
                  {row.status === 'met' ? '—' : formatMoney(row.gap)}
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

interface MdrtPacingTableProps {
  data: MdrtTrackerData;
}

export function MdrtPacingTable({ data }: MdrtPacingTableProps) {
  const tables = getMdrtPacingTables(data);
  const primary = tables.primaryRoute;

  return (
    <div className="border-t border-border pt-4">
      <p className="mb-1 text-xs font-semibold uppercase text-slate-500">MDRT pacing tables</p>
      <p className="mb-3 text-xs text-slate-500">
        Cumulative targets vs your entered {routeLabel(primary)} actuals. Rows use pacing date.
      </p>
      <div className="grid gap-4 lg:grid-cols-2">
        <PacingTable
          title={`Commission (actual ${formatMoney(data.currentCommission)})`}
          rows={tables.commission}
          highlight={primary === 'commission'}
        />
        <PacingTable
          title={`FYP (actual ${formatMoney(data.currentFyp)})`}
          rows={tables.fyp}
          highlight={primary === 'fyp'}
        />
      </div>
    </div>
  );
}
