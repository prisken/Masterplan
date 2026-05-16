import { Link } from 'react-router-dom';
import { cn } from '../../utils/cn';

export function ReviewFlowBanner({ active }: { active: 'today' | 'weekly' | 'monthly' }) {
  const items = [
    { id: 'today' as const, path: '/today', label: 'Daily execution' },
    { id: 'weekly' as const, path: '/weekly', label: 'Weekly review' },
    { id: 'monthly' as const, path: '/monthly', label: 'Monthly strategy' },
  ];
  return (
    <div className="mb-6 flex flex-wrap items-center gap-2 rounded-xl border border-border bg-slate-50/90 px-4 py-3 text-sm">
      <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Flow</span>
      {items.map((item, i) => (
        <span key={item.id} className="flex items-center gap-2">
          {i > 0 && <span className="text-slate-300">→</span>}
          <Link
            to={item.path}
            className={cn(
              'rounded-lg px-3 py-1.5 font-medium transition-colors',
              active === item.id
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-white hover:text-slate-900'
            )}
          >
            {item.label}
          </Link>
        </span>
      ))}
    </div>
  );
}
