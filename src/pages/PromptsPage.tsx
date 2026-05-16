import { useMemo, useState } from 'react';
import { PromptFormFields } from '../components/prompts/PromptFormFields';
import { Header } from '../components/layout/Header';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { EmptyState } from '../components/ui/EmptyState';
import { FilterBar, FilterSearch, FilterSelect } from '../components/ui/FilterBar';
import { ModalFooter, ModalForm } from '../components/ui/ModalForm';
import { PageActions } from '../components/ui/PageActions';
import { promptUseCases } from '../constants/assetOptions';
import { useAppData } from '../context/AppDataContext';
import { useToast } from '../context/ToastContext';
import type { AiPrompt } from '../types';
import { copyToClipboard } from '../utils/clipboard';
import { emptyAiPrompt } from '../utils/defaults';
import { generateId } from '../utils/id';
import { getProjectById } from '../utils/projectColors';
export function PromptsPage() {
  const { data, updateData } = useAppData();
  const { toast } = useToast();

  const [search, setSearch] = useState('');
  const [projectId, setProjectId] = useState('');
  const [useCase, setUseCase] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AiPrompt | null>(null);
  const [form, setForm] = useState<AiPrompt>(emptyAiPrompt());
  const [deleteTarget, setDeleteTarget] = useState<AiPrompt | null>(null);

  const filtered = useMemo(() => {
    return data.aiPrompts
      .filter((p) => {
        if (projectId && p.projectId !== projectId) return false;
        if (useCase && p.useCase !== useCase) return false;
        if (search) {
          const q = search.toLowerCase();
          if (
            !p.promptName.toLowerCase().includes(q) &&
            !p.promptText.toLowerCase().includes(q)
          )
            return false;
        }
        return true;
      })
      .sort((a, b) => a.promptName.localeCompare(b.promptName));
  }, [data.aiPrompts, search, projectId, useCase]);

  const openAdd = () => {
    setEditing(null);
    setForm({
      ...emptyAiPrompt(data.projects[0]?.id ?? ''),
      id: generateId('prompt'),
    });
    setModalOpen(true);
  };

  const openEdit = (p: AiPrompt) => {
    setEditing(p);
    setForm({ ...p });
    setModalOpen(true);
  };

  const save = () => {
    if (!form.promptName.trim()) {
      toast('Prompt name is required', 'error');
      return;
    }
    updateData((prev) => {
      const exists = prev.aiPrompts.some((p) => p.id === form.id);
      const aiPrompts = exists
        ? prev.aiPrompts.map((p) => (p.id === form.id ? form : p))
        : [...prev.aiPrompts, form];
      return { ...prev, aiPrompts };
    });
    toast(editing ? 'Prompt updated' : 'Prompt added');
    setModalOpen(false);
  };

  const handleCopy = async (prompt: AiPrompt) => {
    const ok = await copyToClipboard(prompt.promptText);
    toast(ok ? 'Prompt copied to clipboard' : 'Copy failed', ok ? 'success' : 'error');
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    updateData((prev) => ({
      ...prev,
      aiPrompts: prev.aiPrompts.filter((p) => p.id !== deleteTarget.id),
    }));
    toast('Prompt deleted');
    setDeleteTarget(null);
  };

  const qualityVariant = (q: AiPrompt['qualityRating']) => {
    if (q === 'Excellent') return 'success' as const;
    if (q === 'Needs Work') return 'warning' as const;
    return 'default' as const;
  };

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <Header title="AI Prompt Library" subtitle="Reusable prompts for your portfolio work" />
        <PageActions onAdd={openAdd} addLabel="Add prompt" />
      </div>

      <Card className="mb-4">
        <FilterBar>
          <FilterSearch value={search} onChange={setSearch} placeholder="Search prompts…" />
          <FilterSelect
            label="Project"
            value={projectId}
            onChange={setProjectId}
            options={data.projects.map((p) => ({ value: p.id, label: p.projectName }))}
          />
          <FilterSelect
            label="Use case"
            value={useCase}
            onChange={setUseCase}
            options={promptUseCases.map((u) => ({ value: u, label: u }))}
          />
        </FilterBar>
      </Card>

      {filtered.length === 0 ? (
        <EmptyState title="No prompts found" description="Add or restore default prompts." />
      ) : (
        <div className="space-y-3">
          {filtered.map((prompt) => {
            const project = getProjectById(data.projects, prompt.projectId);
            const expanded = expandedId === prompt.id;
            return (
              <Card key={prompt.id} padding="sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-slate-900">{prompt.promptName}</h3>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {project?.projectName ?? '—'} · {prompt.useCase} · {prompt.outputFormat}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Badge variant={qualityVariant(prompt.qualityRating)}>
                        {prompt.qualityRating}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopy(prompt)}
                      className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800"
                    >
                      Copy prompt
                    </button>
                    <button
                      type="button"
                      onClick={() => setExpandedId(expanded ? null : prompt.id)}
                      className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    >
                      {expanded ? 'Hide' : 'Preview'}
                    </button>
                    <button
                      type="button"
                      onClick={() => openEdit(prompt)}
                      className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(prompt)}
                      className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                {expanded && (
                  <pre className="mt-4 max-h-64 overflow-auto rounded-lg bg-slate-50 p-4 text-xs leading-relaxed text-slate-700 whitespace-pre-wrap">
                    {prompt.promptText}
                  </pre>
                )}
              </Card>
            );
          })}
        </div>
      )}

      <ModalForm
        open={modalOpen}
        title={editing ? 'Edit prompt' : 'Add prompt'}
        onClose={() => setModalOpen(false)}
        footer={
          <ModalFooter
            onCancel={() => setModalOpen(false)}
            onSave={save}
            saveLabel={editing ? 'Save changes' : 'Add prompt'}
          />
        }
      >
        <PromptFormFields value={form} onChange={setForm} projects={data.projects} />
      </ModalForm>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete prompt?"
        message={deleteTarget ? `Delete "${deleteTarget.promptName}"?` : ''}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
