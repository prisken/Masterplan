import type { Project, Task } from '../../types';
import { getProjectColors } from '../../utils/projectColors';
import { computeProjectTaskProgress, getProjectTaskCounts } from '../../utils/dashboardStats';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { ProgressBar } from '../ui/ProgressBar';
import { cn } from '../../utils/cn';

interface ProjectProgressCardProps {
  project: Project;
  tasks: Task[];
}

export function ProjectProgressCard({ project, tasks }: ProjectProgressCardProps) {
  const colors = getProjectColors(project);
  const counts = getProjectTaskCounts(project.id, tasks);
  const taskProgress = computeProjectTaskProgress(project.id, tasks);

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className={cn('h-2.5 w-2.5 shrink-0 rounded-full', colors.accent)} />
            <h3 className="truncate font-semibold text-slate-900">{project.projectName}</h3>
          </div>
          <p className="mt-0.5 text-xs text-slate-500">{project.engine}</p>
        </div>
        <Badge className={colors.badge}>{project.category}</Badge>
      </div>

      <div>
        <p className="mb-1 text-xs text-slate-500">
          Task completion · {counts.done}/{counts.total || 0} done
        </p>
        <ProgressBar value={taskProgress} accentClass={colors.accent} size="sm" />
      </div>

      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <div className="rounded-lg bg-slate-50 py-2">
          <p className="font-semibold text-slate-800">{counts.open}</p>
          <p className="text-slate-400">Open tasks</p>
        </div>
        <div className="rounded-lg bg-slate-50 py-2">
          <p className="font-semibold text-slate-800">{counts.done}</p>
          <p className="text-slate-400">Done</p>
        </div>
        <div className="rounded-lg bg-slate-50 py-2">
          <p className="font-semibold text-slate-800">{taskProgress}%</p>
          <p className="text-slate-400">From tasks</p>
        </div>
      </div>

      <div className="border-t border-border pt-3">
        <p className="text-xs font-medium text-slate-500">Next milestone</p>
        <p className="mt-0.5 text-sm text-slate-800">{project.nextMilestone}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <Badge variant="neutral">{project.status}</Badge>
          <Badge variant={project.priority === 'High' ? 'warning' : 'default'}>
            {project.priority}
          </Badge>
        </div>
      </div>
    </Card>
  );
}
