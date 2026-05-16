import { Link, useParams } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { ProgressBar } from '../components/ui/ProgressBar';
import { useAppData } from '../context/AppDataContext';
import { getProjectById, getProjectColors } from '../utils/projectColors';
import { statusVariant } from '../utils/badges';
import { computeProjectTaskProgress, getProjectTaskCounts } from '../utils/dashboardStats';

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data } = useAppData();
  const project = id ? getProjectById(data.projects, id) : undefined;

  if (!project) {
    return (
      <div>
        <Header title="Project not found" />
        <Link to="/projects" className="text-sm font-medium text-slate-900 underline">
          ← Back to projects
        </Link>
      </div>
    );
  }

  const colors = getProjectColors(project);
  const tasks = data.tasks.filter((t) => t.projectId === project.id);
  const contacts = data.contacts.filter((c) => c.relatedProjectId === project.id);
  const taskCounts = getProjectTaskCounts(project.id, data.tasks);
  const taskProgress = computeProjectTaskProgress(project.id, data.tasks);

  return (
    <div>
      <Link
        to="/projects"
        className="mb-4 inline-block text-sm font-medium text-slate-500 hover:text-slate-900"
      >
        ← Projects
      </Link>
      <Header title={project.projectName} subtitle={project.engine} />

      <div className="mb-6 flex flex-wrap gap-2">
        <Badge className={colors.badge}>{project.category}</Badge>
        <Badge variant="neutral">{project.status}</Badge>
        <Badge variant={project.priority === 'High' ? 'warning' : 'default'}>
          {project.priority}
        </Badge>
      </div>

      <Card className="mb-6">
        <p className="mb-2 text-sm text-slate-600">
          Task completion: {taskCounts.done} of {taskCounts.total} done ({taskProgress}%)
        </p>
        <ProgressBar value={taskProgress} accentClass={colors.accent} />
        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium text-slate-500">Main goal</dt>
            <dd className="mt-1 text-sm text-slate-800">{project.mainGoal}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-slate-500">Next milestone</dt>
            <dd className="mt-1 text-sm text-slate-800">{project.nextMilestone || '—'}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-slate-500">Target audience</dt>
            <dd className="mt-1 text-sm text-slate-800">{project.targetAudience || '—'}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-slate-500">Current phase</dt>
            <dd className="mt-1 text-sm text-slate-800">{project.currentPhase || '—'}</dd>
          </div>
        </dl>
        {project.notes && (
          <p className="mt-4 border-t border-border pt-4 text-sm text-slate-600">
            {project.notes}
          </p>
        )}
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Related tasks ({tasks.length})
          </h2>
          {tasks.length === 0 ? (
            <p className="text-sm text-slate-400">No tasks yet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {tasks.slice(0, 10).map((t) => (
                <li key={t.id} className="flex items-center justify-between gap-2 py-2">
                  <span className="truncate text-sm text-slate-800">{t.title || t.taskName}</span>
                  <Badge variant={statusVariant(t.status)}>{t.status}</Badge>
                </li>
              ))}
            </ul>
          )}
          <Link
            to={`/tasks?project=${project.id}`}
            className="mt-4 inline-block text-xs font-medium text-slate-600 underline"
          >
            Manage all tasks →
          </Link>
        </Card>

        <Card>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Related contacts ({contacts.length})
          </h2>
          {contacts.length === 0 ? (
            <p className="text-sm text-slate-400">No contacts yet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {contacts.slice(0, 10).map((c) => (
                <li key={c.id} className="py-2">
                  <p className="text-sm font-medium text-slate-800">{c.name}</p>
                  <p className="text-xs text-slate-500">
                    {c.contactType} · {c.stage}
                  </p>
                </li>
              ))}
            </ul>
          )}
          <Link
            to="/contacts"
            className="mt-4 inline-block text-xs font-medium text-slate-600 underline"
          >
            Manage contacts →
          </Link>
        </Card>
      </div>
    </div>
  );
}
