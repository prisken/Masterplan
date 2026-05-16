import { useMemo, useState } from 'react';
import { AssetFormFields } from '../components/assets/AssetFormFields';
import { Header } from '../components/layout/Header';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { EmptyState } from '../components/ui/EmptyState';
import { FilterBar, FilterSearch, FilterSelect } from '../components/ui/FilterBar';
import { ModalFooter, ModalForm } from '../components/ui/ModalForm';
import { PageActions } from '../components/ui/PageActions';
import { assetStatuses, assetTypes } from '../constants/assetOptions';
import { useAppData } from '../context/AppDataContext';
import { useToast } from '../context/ToastContext';
import type { DigitalAsset } from '../types';
import { emptyDigitalAsset } from '../utils/defaults';
import { generateId } from '../utils/id';
import { getProjectById } from '../utils/projectColors';

export function AssetsPage() {
  const { data, updateData } = useAppData();
  const { toast } = useToast();

  const [search, setSearch] = useState('');
  const [projectId, setProjectId] = useState('');
  const [assetType, setAssetType] = useState('');
  const [status, setStatus] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<DigitalAsset | null>(null);
  const [form, setForm] = useState<DigitalAsset>(emptyDigitalAsset());
  const [deleteTarget, setDeleteTarget] = useState<DigitalAsset | null>(null);

  const filtered = useMemo(() => {
    return data.digitalAssets
      .filter((a) => {
        if (projectId && a.projectId !== projectId) return false;
        if (assetType && a.assetType !== assetType) return false;
        if (status && a.status !== status) return false;
        if (search) {
          const q = search.toLowerCase();
          if (
            !a.assetName.toLowerCase().includes(q) &&
            !a.link.toLowerCase().includes(q) &&
            !a.notes.toLowerCase().includes(q)
          )
            return false;
        }
        return true;
      })
      .sort((a, b) => a.assetName.localeCompare(b.assetName));
  }, [data.digitalAssets, search, projectId, assetType, status]);

  const openAdd = () => {
    setEditing(null);
    setForm({
      ...emptyDigitalAsset(data.projects[0]?.id ?? ''),
      id: generateId('asset'),
    });
    setModalOpen(true);
  };

  const openEdit = (a: DigitalAsset) => {
    setEditing(a);
    setForm({ ...a });
    setModalOpen(true);
  };

  const save = () => {
    if (!form.assetName.trim()) {
      toast('Asset name is required', 'error');
      return;
    }
    updateData((prev) => {
      const exists = prev.digitalAssets.some((a) => a.id === form.id);
      const digitalAssets = exists
        ? prev.digitalAssets.map((a) => (a.id === form.id ? form : a))
        : [...prev.digitalAssets, form];
      return { ...prev, digitalAssets };
    });
    toast(editing ? 'Asset updated' : 'Asset added');
    setModalOpen(false);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    updateData((prev) => ({
      ...prev,
      digitalAssets: prev.digitalAssets.filter((a) => a.id !== deleteTarget.id),
    }));
    toast('Asset deleted');
    setDeleteTarget(null);
  };

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <Header
          title="Digital Assets"
          subtitle="Logos, decks, forms, scripts, and file links"
        />
        <PageActions onAdd={openAdd} addLabel="Add asset" />
      </div>

      <Card className="mb-4">
        <FilterBar>
          <FilterSearch value={search} onChange={setSearch} placeholder="Search assets…" />
          <FilterSelect
            label="Project"
            value={projectId}
            onChange={setProjectId}
            options={data.projects.map((p) => ({ value: p.id, label: p.projectName }))}
          />
          <FilterSelect
            label="Type"
            value={assetType}
            onChange={setAssetType}
            options={assetTypes.map((t) => ({ value: t, label: t }))}
          />
          <FilterSelect
            label="Status"
            value={status}
            onChange={setStatus}
            options={assetStatuses.map((s) => ({ value: s, label: s }))}
          />
        </FilterBar>
      </Card>

      {filtered.length === 0 ? (
        <EmptyState
          title="No assets found"
          description="Add links to Google Drive, files, or local paths."
          action={
            <button
              type="button"
              onClick={openAdd}
              className="text-sm font-medium text-slate-900 underline"
            >
              Add asset
            </button>
          }
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((asset) => {
            const project = getProjectById(data.projects, asset.projectId);
            return (
              <Card key={asset.id} padding="sm" className="flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-slate-900">{asset.assetName}</h3>
                  <Badge variant="neutral">{asset.status}</Badge>
                </div>
                <p className="text-xs text-slate-500">
                  {project?.projectName ?? '—'} · {asset.assetType}
                </p>
                {asset.link && (
                  <a
                    href={asset.link.startsWith('http') ? asset.link : undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="truncate text-xs text-blue-600 hover:underline"
                  >
                    {asset.link}
                  </a>
                )}
                <div className="mt-auto flex gap-2 border-t border-border pt-3">
                  <button
                    type="button"
                    onClick={() => openEdit(asset)}
                    className="text-xs font-medium text-slate-600 hover:text-slate-900"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(asset)}
                    className="text-xs font-medium text-red-600"
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
        title={editing ? 'Edit asset' : 'Add asset'}
        onClose={() => setModalOpen(false)}
        footer={
          <ModalFooter
            onCancel={() => setModalOpen(false)}
            onSave={save}
            saveLabel={editing ? 'Save changes' : 'Add asset'}
          />
        }
      >
        <AssetFormFields value={form} onChange={setForm} projects={data.projects} />
      </ModalForm>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete asset?"
        message={deleteTarget ? `Delete "${deleteTarget.assetName}"?` : ''}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
