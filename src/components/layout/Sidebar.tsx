import { NavLink } from 'react-router-dom';
import { navItems } from '../../config/navigation';
import { useAuth } from '../../context/AuthContext';
import { APP_VERSION } from '../../types';
import { cn } from '../../utils/cn';

interface SidebarProps {
  onNavigate?: () => void;
  mobile?: boolean;
}

export function Sidebar({ onNavigate, mobile }: SidebarProps) {
  const auth = useAuth();

  return (
    <aside
      className={cn(
        'flex flex-col border-border bg-surface-card',
        mobile
          ? 'h-full w-full'
          : 'hidden h-screen w-64 shrink-0 border-r lg:flex'
      )}
    >
      <div className="border-b border-border px-5 py-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Portfolio
        </p>
        <h2 className="mt-1 text-base font-semibold leading-tight text-slate-900">
          Master Portfolio
        </h2>
        <p className="text-sm text-slate-500">Command Center</p>
        <span className="mt-2 inline-block rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
          {APP_VERSION}
        </span>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-0.5">
          {navItems.map((item) => (
            <li key={item.path}>
              {item.enabled ? (
                <NavLink
                  to={item.path}
                  end={item.path === '/'}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    )
                  }
                >
                  <span className="w-5 text-center text-xs opacity-80">{item.icon}</span>
                  {item.label}
                </NavLink>
              ) : (
                <span
                  className="flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-300"
                  title="Coming in a later phase"
                >
                  <span className="w-5 text-center text-xs opacity-50">{item.icon}</span>
                  {item.label}
                  <span className="ml-auto text-[10px] text-slate-300">Soon</span>
                </span>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {auth.enabled && auth.status === 'authenticated' && (
        <div className="border-t border-border px-3 py-4">
          <button
            type="button"
            onClick={() => void auth.logout()}
            className="w-full rounded-lg border border-border px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          >
            Sign out
          </button>
        </div>
      )}
    </aside>
  );
}
