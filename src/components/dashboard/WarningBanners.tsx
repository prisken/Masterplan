import { Link } from 'react-router-dom';
import type { AppWarning } from '../../utils/advisorWarnings';
import { cn } from '../../utils/cn';

export function WarningBanners({ warnings }: { warnings: AppWarning[] }) {
  if (warnings.length === 0) return null;
  return (
    <div className="mb-6 space-y-2">
      {warnings.map((w) => (
        <div
          key={w.id}
          className={cn(
            'rounded-lg border px-4 py-3 text-sm',
            w.severity === 'critical' && 'border-red-200 bg-red-50 text-red-900',
            w.severity === 'risk' && 'border-orange-200 bg-orange-50 text-orange-900',
            w.severity === 'info' && 'border-slate-200 bg-slate-50 text-slate-800'
          )}
        >
          {w.href ? (
            <Link to={w.href} className="font-medium underline-offset-2 hover:underline">
              {w.message}
            </Link>
          ) : (
            <p className="font-medium">{w.message}</p>
          )}
        </div>
      ))}
    </div>
  );
}
