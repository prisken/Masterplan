import { cn } from '../../utils/cn';

interface ProgressBarProps {
  value: number;
  max?: number;
  accentClass?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md';
}

export function ProgressBar({
  value,
  max = 100,
  accentClass = 'bg-revenue',
  showLabel = true,
  size = 'md',
}: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, Math.round((value / max) * 100)));
  const h = size === 'sm' ? 'h-1.5' : 'h-2.5';

  return (
    <div className="w-full">
      {showLabel && (
        <div className="mb-1 flex justify-between text-xs text-slate-500">
          <span>Progress</span>
          <span className="font-medium text-slate-700">{pct}%</span>
        </div>
      )}
      <div className={cn('w-full overflow-hidden rounded-full bg-slate-100', h)}>
        <div
          className={cn('h-full rounded-full transition-all duration-300', accentClass)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
