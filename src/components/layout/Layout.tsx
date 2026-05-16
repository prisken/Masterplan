import { useState, type ReactNode } from 'react';
import { MobileNav } from './MobileNav';
import { Sidebar } from './Sidebar';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-surface">
      <Sidebar />

      {menuOpen && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 w-72 shadow-xl lg:hidden">
            <Sidebar mobile onNavigate={() => setMenuOpen(false)} />
          </div>
        </>
      )}

      <div className="flex min-h-[100dvh] min-h-screen flex-1 flex-col overflow-hidden lg:min-h-0 lg:overflow-visible">
        <div className="flex items-center gap-3 border-b border-border bg-surface-card px-4 py-3 lg:hidden">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="rounded-lg border border-border p-2 text-slate-600 hover:bg-slate-50"
            aria-label="Open menu"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div>
            <p className="text-sm font-semibold text-slate-900">Master Portfolio</p>
            <p className="text-xs text-slate-500">Command Center</p>
          </div>
        </div>

        <main className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto p-4 pb-6 md:p-6">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>

        <MobileNav />
      </div>
    </div>
  );
}
