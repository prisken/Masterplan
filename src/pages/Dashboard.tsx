import { Link } from 'react-router-dom';
import { WarningBanners } from '../components/dashboard/WarningBanners';
import { DailyPriorityPanel } from '../components/dashboard/DailyPriorityPanel';
import { ExecutionGoalsStrip } from '../components/dashboard/ExecutionGoalsStrip';
import { ExecutionStatGrid } from '../components/dashboard/ExecutionStatGrid';
import { PortfolioOverviewStrip } from '../components/dashboard/PortfolioOverviewStrip';
import { Header } from '../components/layout/Header';
import { PacingDateBanner } from '../components/layout/PacingDateBanner';
import { usePacingDate } from '../hooks/usePacingDate';
import { Card } from '../components/ui/Card';
import { useAppData } from '../context/AppDataContext';
import { computeAppWarnings } from '../utils/advisorWarnings';
import { getDailyPriorityGroups } from '../utils/dailyPriority';
import { computeExecutionDashboardStats } from '../utils/taskStats';
import { computeDashboardStats } from '../utils/dashboardStats';
import { computeExecutionGoalsSummary } from '../utils/executionGoalsSummary';
export function Dashboard() {
  const { data } = useAppData();
  const { description } = usePacingDate();
  const warnings = computeAppWarnings(data);
  const exec = computeExecutionDashboardStats(data);
  const portfolio = computeDashboardStats(data);
  const priorityGroups = getDailyPriorityGroups(data);
  const goals = computeExecutionGoalsSummary(data.advisor);

  return (
    <div>
      <Header
        title="Execution Dashboard"
        subtitle={`Business command center · ${description}`}
      />

      <PacingDateBanner />
      <WarningBanners warnings={warnings} />

      <ExecutionGoalsStrip summary={goals} />

      <ExecutionStatGrid
        taskSummary={exec.taskSummary}
        trackWidgets={exec.trackWidgets}
        agentsOnboarded={exec.agentsOnboarded}
        agentsTarget={exec.agentsTarget}
      />

      <PortfolioOverviewStrip stats={portfolio} />

      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        <DailyPriorityPanel groups={priorityGroups} />
        <Card>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Quick links
          </h2>
          <p className="mb-3 text-sm text-slate-600">
            Tracker numbers are at the top. Below is task checklist progress.
          </p>
          <div className="flex flex-wrap gap-2">
            <Link
              to="/advisor"
              className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white"
            >
              PA / MDRT / Recruitment trackers
            </Link>
            <Link
              to="/tasks"
              className="rounded-lg border border-border px-3 py-2 text-xs font-medium text-slate-700"
            >
              Master Tasks
            </Link>
            <Link
              to="/tasks?view=overdue"
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-800"
            >
              Overdue tasks
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
