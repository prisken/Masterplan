import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ProjectFormFields } from '../components/projects/ProjectFormFields';
import { Header } from '../components/layout/Header';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { EmptyState } from '../components/ui/EmptyState';
import { FilterBar, FilterSearch, FilterSelect } from '../components/ui/FilterBar';
import { ModalFooter, ModalForm } from '../components/ui/ModalForm';
import { PageActions } from '../components/ui/PageActions';
import { ProgressBar } from '../components/ui/ProgressBar';
import {
  projectCategories,
  projectPriorities,
  projectStatuses,
} from '../constants/options';
import { useAppData } from '../context/AppDataContext';
import { useToast } from '../context/ToastContext';
import type { Project } from '../types';
import { emptyProject } from '../utils/defaults';
import { generateId } from '../utils/id';
import { getProjectColors } from '../utils/projectColors';
import { computeProjectTaskProgress, sortProjects } from '../utils/dashboardStats';
import { cn } from '../utils/cn';

export function ProjectsPage() {
  const { data, updateData } = useAppData();
  const { toast } = useToast();

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [form, setForm] = useState<Project>(emptyProject());

  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);

  const filtered = useMemo(() => {
    return sortProjects(data.projects).filter((p) => {
      if (category && p.category !== category) return false;
      if (status && p.status !== status) return false;
      if (priority && p.priority !== priority) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          p.projectName.toLowerCase().includes(q) ||
          p.engine.toLowerCase().includes(q) ||
          p.mainGoal.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [data.projects, search, category, status, priority]);

  const openAdd = () => {
    setEditing(null);
    setForm({ ...emptyProject(), id: generateId('project') });
    setModalOpen(true);
  };

  const openEdit = (p: Project) => {
    setEditing(p);
    setForm({ ...p });
    setModalOpen(true);
  };

  const save = () => {
    if (!form.projectName.trim()) {
      toast('Project name is required', 'error');
      return;
    }
    updateData((prev) => {
      const exists = prev.projects.some((p) => p.id === form.id);
      const projects = exists
        ? prev.projects.map((p) => (p.id === form.id ? form : p))
        : [...prev.projects, form];
      return { ...prev, projects };
    });
    toast(editing ? 'Project updated' : 'Project added');
    setModalOpen(false);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    const taskCount = data.tasks.filter((t) => t.projectId === deleteTarget.id).length;
    updateData((prev) => ({
      ...prev,
      projects: prev.projects.filter((p) => p.id !== deleteTarget.id),
      tasks: prev.tasks.filter((t) => t.projectId !== deleteTarget.id),
      contacts: prev.contacts.filter((c) => c.relatedProjectId !== deleteTarget.id),
    }));
    toast(
      taskCount > 0
        ? `Project deleted (${taskCount} related tasks removed)`
        : 'Project deleted'
    );
    setDeleteTarget(null);
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <Header title="Projects" subtitle="Manage your five portfolio engines" />
        <PageActions onAdd={openAdd} addLabel="Add project" />
      </div>

      <Card className="mb-6">
        <FilterBar>
          <FilterSearch value={search} onChange={setSearch} placeholder="Search projects…" />
          <FilterSelect
            label="Category"
            value={category}
            onChange={setCategory}
            options={projectCategories.map((c) => ({ value: c, label: c }))}
          />
          <FilterSelect
            label="Status"
            value={status}
            onChange={setStatus}
            options={projectStatuses.map((s) => ({ value: s, label: s }))}
          />
          <FilterSelect
            label="Priority"
            value={priority}
            onChange={setPriority}
            options={projectPriorities.map((p) => ({ value: p, label: p }))}
          />
        </FilterBar>
      </Card>

      {filtered.length === 0 ? (
        <EmptyState
          title="No projects found"
          description="Adjust filters or add a new project."
          action={
            <button
              type="button"
              onClick={openAdd}
              className="text-sm font-medium text-slate-900 underline"
            >
              Add project
            </button>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((project) => {
            const colors = getProjectColors(project);
            const taskCount = data.tasks.filter((t) => t.projectId === project.id).length;
            const openCount = data.tasks.filter(
              (t) =>
                t.projectId === project.id &&
                t.status !== 'Completed' &&
                t.status !== 'Deferred'
            ).length;
            const contactCount = data.contacts.filter(
              (c) => c.relatedProjectId === project.id
            ).length;
            const taskProgress = computeProjectTaskProgress(project.id, data.tasks);

            return (
              <Card key={project.id} className="flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={cn('h-2 w-2 shrink-0 rounded-full', colors.accent)} />
                      <h3 className="truncate font-semibold text-slate-900">
                        {project.projectName}
                      </h3>
                    </div>
                    <p className="mt-0.5 text-xs text-slate-500">{project.engine}</p>
                  </div>
                  <Badge className={colors.badge}>{project.category}</Badge>
                </div>

                <div>
                  <p className="mb-1 text-[10px] text-slate-500">
                    Tasks {taskProgress}% complete
                  </p>
                  <ProgressBar value={taskProgress} accentClass={colors.accent} size="sm" />
                </div>

                <p className="line-clamp-2 text-sm text-slate-600">{project.mainGoal}</p>

                <div className="flex flex-wrap gap-2">
                  <Badge variant="neutral">{project.status}</Badge>
                  <Badge variant={project.priority === 'High' ? 'warning' : 'default'}>
                    {project.priority}
                  </Badge>
                </div>

                <p className="text-xs text-slate-500">
                  {openCount} open · {taskCount} tasks · {contactCount} contacts
                </p>

                <div className="mt-auto flex flex-wrap gap-2 border-t border-border pt-3">
                  <Link
                    to={`/projects/${project.id}`}
                    className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    View
                  </Link>
                  <button
                    type="button"
                    onClick={() => openEdit(project)}
                    className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(project)}
                    className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <ModalForm
        open={modalOpen}
        title={editing ? 'Edit project' : 'Add project'}
        onClose={() => setModalOpen(false)}
        footer={
          <ModalFooter
            onCancel={() => setModalOpen(false)}
            onSave={save}
            saveLabel={editing ? 'Save changes' : 'Add project'}
          />
        }
      >
        <ProjectFormFields value={form} onChange={setForm} />
      </ModalForm>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete project?"
        message={
          deleteTarget
            ? `Delete "${deleteTarget.projectName}"? Related tasks and contact links will be removed.`
            : ''
        }
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
