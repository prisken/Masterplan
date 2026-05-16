import { useMemo, useState } from 'react';
import { ContentFormFields } from '../components/content/ContentFormFields';
import { Header } from '../components/layout/Header';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { EmptyState } from '../components/ui/EmptyState';
import { FilterBar, FilterSearch, FilterSelect, ViewTabs } from '../components/ui/FilterBar';
import { ModalFooter, ModalForm } from '../components/ui/ModalForm';
import { PageActions } from '../components/ui/PageActions';
import { StatCard } from '../components/ui/StatCard';
import {
  contentPillars,
  contentStatuses,
  contentTypes,
  platforms,
} from '../constants/contentOptions';
import { useAppData } from '../context/AppDataContext';
import { useToast } from '../context/ToastContext';
import type { ContentItem } from '../types';
import { emptyContent } from '../utils/defaults';
import { generateId } from '../utils/id';
import { getProjectById } from '../utils/projectColors';

const viewTabs = [
  { id: 'all', label: 'All' },
  { id: 'week', label: "This Week" },
  { id: 'published', label: 'Published' },
  { id: 'ideas', label: 'Ideas' },
  { id: 'investment-news-channel', label: 'Investment' },
  { id: 'profit-pulse-ally', label: 'Profit Pulse' },
  { id: 'mama-supreme', label: 'Mama Supreme' },
  { id: 'eternal-moments', label: 'Eternal Moments' },
];

function isThisWeek(dateStr: string): boolean {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return false;
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - now.getDay());
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 7);
  return d >= start && d < end;
}

export function ContentPage() {
  const { data, updateData } = useAppData();
  const { toast } = useToast();

  const [view, setView] = useState('all');
  const [search, setSearch] = useState('');
  const [projectId, setProjectId] = useState('');
  const [platform, setPlatform] = useState('');
  const [status, setStatus] = useState('');
  const [pillar, setPillar] = useState('');
  const [contentType, setContentType] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ContentItem | null>(null);
  const [form, setForm] = useState<ContentItem>(emptyContent());
  const [deleteTarget, setDeleteTarget] = useState<ContentItem | null>(null);

  const summary = useMemo(() => {
    const published = data.content.filter((c) => c.status === 'Published').length;
    const scheduled = data.content.filter((c) => c.status === 'Scheduled').length;
    const totalViews = data.content.reduce((s, c) => s + (c.views || 0), 0);
    const totalLeads = data.content.reduce((s, c) => s + (c.leadsGenerated || 0), 0);
    return { published, scheduled, totalViews, totalLeads, total: data.content.length };
  }, [data.content]);

  const filtered = useMemo(() => {
    return data.content
      .filter((c) => {
        if (view === 'week' && !isThisWeek(c.publishDate)) return false;
        if (view === 'published' && c.status !== 'Published') return false;
        if (view === 'ideas' && c.status !== 'Idea') return false;
        if (
          ['investment-news-channel', 'profit-pulse-ally', 'mama-supreme', 'eternal-moments'].includes(
            view
          ) &&
          c.projectId !== view
        )
          return false;

        if (projectId && c.projectId !== projectId) return false;
        if (platform && c.platform !== platform) return false;
        if (status && c.status !== status) return false;
        if (pillar && c.contentPillar !== pillar) return false;
        if (contentType && c.contentType !== contentType) return false;
        if (search) {
          const q = search.toLowerCase();
          if (
            !c.contentTitle.toLowerCase().includes(q) &&
            !c.mainMessage.toLowerCase().includes(q)
          )
            return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (a.publishDate && b.publishDate) {
          return new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime();
        }
        return a.contentTitle.localeCompare(b.contentTitle);
      });
  }, [data.content, view, search, projectId, platform, status, pillar, contentType]);

  const openAdd = () => {
    setEditing(null);
    setForm({ ...emptyContent(data.projects[0]?.id ?? ''), id: generateId('content') });
    setModalOpen(true);
  };

  const openEdit = (c: ContentItem) => {
    setEditing(c);
    setForm({ ...c });
    setModalOpen(true);
  };

  const save = () => {
    if (!form.contentTitle.trim()) {
      toast('Title is required', 'error');
      return;
    }
    updateData((prev) => {
      const exists = prev.content.some((c) => c.id === form.id);
      const content = exists
        ? prev.content.map((c) => (c.id === form.id ? form : c))
        : [...prev.content, form];
      return { ...prev, content };
    });
    toast(editing ? 'Content updated' : 'Content added');
    setModalOpen(false);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    updateData((prev) => ({
      ...prev,
      content: prev.content.filter((c) => c.id !== deleteTarget.id),
    }));
    toast('Content deleted');
    setDeleteTarget(null);
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <Header title="Content Calendar" subtitle="Plan and track content across platforms" />
        <PageActions onAdd={openAdd} addLabel="Add content" />
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Total items" value={summary.total} icon="▤" accent="bg-slate-100 text-slate-700" />
        <StatCard label="Published" value={summary.published} icon="✓" accent="bg-green-100 text-green-700" />
        <StatCard label="Scheduled" value={summary.scheduled} icon="◷" accent="bg-blue-100 text-blue-700" />
        <StatCard
          label="Total views"
          value={summary.totalViews.toLocaleString()}
          sublabel={`${summary.totalLeads} leads`}
          icon="◎"
          accent="bg-purple-100 text-purple-700"
        />
      </div>

      <Card className="mb-4 space-y-4">
        <ViewTabs tabs={viewTabs} active={view} onChange={setView} />
        <FilterBar>
          <FilterSearch value={search} onChange={setSearch} placeholder="Search content…" />
          <FilterSelect
            label="Project"
            value={projectId}
            onChange={setProjectId}
            options={data.projects.map((p) => ({ value: p.id, label: p.projectName }))}
          />
          <FilterSelect
            label="Platform"
            value={platform}
            onChange={setPlatform}
            options={platforms.map((p) => ({ value: p, label: p }))}
          />
          <FilterSelect
            label="Status"
            value={status}
            onChange={setStatus}
            options={contentStatuses.map((s) => ({ value: s, label: s }))}
          />
          <FilterSelect
            label="Pillar"
            value={pillar}
            onChange={setPillar}
            options={contentPillars.map((p) => ({ value: p, label: p }))}
          />
          <FilterSelect
            label="Type"
            value={contentType}
            onChange={setContentType}
            options={contentTypes.map((t) => ({ value: t, label: t }))}
          />
        </FilterBar>
      </Card>

      {filtered.length === 0 ? (
        <EmptyState
          title="No content found"
          description="Add your first content item or adjust filters."
          action={
            <button type="button" onClick={openAdd} className="text-sm font-medium text-slate-900 underline">
              Add content
            </button>
          }
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => {
            const project = getProjectById(data.projects, item.projectId);
            return (
              <Card key={item.id} padding="sm" className="flex flex-wrap items-start gap-4">
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-slate-900">{item.contentTitle}</h3>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {project?.projectName ?? '—'} · {item.platform} · {item.contentType}
                  </p>
                  {item.publishDate && (
                    <p className="mt-1 text-xs text-slate-400">Publish: {item.publishDate}</p>
                  )}
                  {item.status === 'Published' && (
                    <p className="mt-1 text-xs text-slate-500">
                      {item.views} views · {item.likes} likes · {item.leadsGenerated} leads
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="neutral">{item.status}</Badge>
                  <Badge variant="default">{item.contentPillar}</Badge>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => openEdit(item)}
                    className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(item)}
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
        title={editing ? 'Edit content' : 'Add content'}
        onClose={() => setModalOpen(false)}
        footer={
          <ModalFooter
            onCancel={() => setModalOpen(false)}
            onSave={save}
            saveLabel={editing ? 'Save changes' : 'Add content'}
          />
        }
      >
        <ContentFormFields value={form} onChange={setForm} projects={data.projects} />
      </ModalForm>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete content?"
        message={deleteTarget ? `Delete "${deleteTarget.contentTitle}"?` : ''}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
