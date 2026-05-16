import { NavLink } from 'react-router-dom';
import { cn } from '../../utils/cn';

const mobileTabs = [
  { path: '/', label: 'Home', icon: '◉' },
  { path: '/advisor', label: 'Advisor', icon: '◆' },
  { path: '/tasks', label: 'Tasks', icon: '☑' },
  { path: '/today', label: 'Today', icon: '☀' },
];

export function MobileNav() {
  return (
    <nav className="z-40 shrink-0 border-t border-border bg-surface-card px-2 pt-0.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] lg:hidden">
      <ul className="flex justify-around">
        {mobileTabs.map((tab) => (
          <li key={tab.path} className="flex-1">
            <NavLink
              to={tab.path}
              end={tab.path === '/'}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center gap-0.5 px-2 py-3 text-[10px] font-medium transition-colors',
                  isActive ? 'text-slate-900' : 'text-slate-400'
                )
              }
            >
              <span className="text-base">{tab.icon}</span>
              {tab.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
