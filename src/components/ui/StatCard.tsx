import type { ReactNode } from 'react';
import { Card } from './Card';
import { cn } from '../../utils/cn';

interface StatCardProps {
  label: string;
  value: string | number;
  sublabel?: string;
  icon?: ReactNode;
  accent?: string;
}

export function StatCard({ label, value, sublabel, icon, accent }: StatCardProps) {
  return (
    <Card padding="sm" className="flex flex-col gap-2">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        {icon && (
          <span
            className={cn(
              'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm',
              accent ?? 'bg-slate-100 text-slate-600'
            )}
          >
            {icon}
          </span>
        )}
      </div>
      <p className="text-2xl font-semibold tracking-tight text-slate-900">{value}</p>
      {sublabel && <p className="text-xs text-slate-400">{sublabel}</p>}
    </Card>
  );
}
