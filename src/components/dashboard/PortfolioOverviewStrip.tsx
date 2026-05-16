import { Link } from 'react-router-dom';
import { Card } from '../ui/Card';
import type { DashboardStats } from '../../utils/dashboardStats';
import { formatMoney } from '../../utils/financeStats';

interface PortfolioOverviewStripProps {
  stats: DashboardStats;
}

export function PortfolioOverviewStrip({ stats }: PortfolioOverviewStripProps) {
  return (
    <section className="mb-8">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
        Portfolio overview
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Link to="/projects" className="block">
          <Card padding="sm" className="transition-shadow hover:shadow-md">
            <p className="text-2xl font-semibold text-slate-900">{stats.activeProjects}</p>
            <p className="text-xs text-slate-500">Active projects</p>
          </Card>
        </Link>
        <Link to="/contacts" className="block">
          <Card padding="sm" className="transition-shadow hover:shadow-md">
            <p className="text-2xl font-semibold text-slate-900">{stats.contacts}</p>
            <p className="text-xs text-slate-500">
              Contacts
              {stats.followUpsDue > 0 && (
                <span className="ml-1 font-medium text-red-600">
                  · {stats.followUpsDue} follow-ups due
                </span>
              )}
            </p>
          </Card>
        </Link>
        <Link to="/content" className="block">
          <Card padding="sm" className="transition-shadow hover:shadow-md">
            <p className="text-2xl font-semibold text-slate-900">{stats.contentPublished}</p>
            <p className="text-xs text-slate-500">{stats.contentScheduled} scheduled</p>
          </Card>
        </Link>
        <Link to="/finance" className="block">
          <Card padding="sm" className="transition-shadow hover:shadow-md">
            <p className="text-lg font-semibold text-slate-900">{formatMoney(stats.incomeTotal)}</p>
            <p className="text-xs text-slate-500">Income · {formatMoney(stats.expensesTotal)} exp.</p>
          </Card>
        </Link>
      </div>
    </section>
  );
}
