import { useMemo, useState } from 'react';
import { FinanceFormFields } from '../components/finance/FinanceFormFields';
import { Header } from '../components/layout/Header';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { EmptyState } from '../components/ui/EmptyState';
import { FilterBar, FilterSearch, FilterSelect } from '../components/ui/FilterBar';
import { ModalFooter, ModalForm } from '../components/ui/ModalForm';
import { PageActions } from '../components/ui/PageActions';
import { StatCard } from '../components/ui/StatCard';
import { financeCategories, financeTypes } from '../constants/contentOptions';
import { useAppData } from '../context/AppDataContext';
import { useToast } from '../context/ToastContext';
import type { FinanceItem } from '../types';
import { emptyFinance } from '../utils/defaults';
import { computeFinanceTotals, formatMoney } from '../utils/financeStats';
import { generateId } from '../utils/id';
import { getProjectById } from '../utils/projectColors';
import { cn } from '../utils/cn';

export function FinancePage() {
  const { data, updateData } = useAppData();
  const { toast } = useToast();

  const [search, setSearch] = useState('');
  const [projectId, setProjectId] = useState('');
  const [type, setType] = useState('');
  const [category, setCategory] = useState('');
  const [paidFilter, setPaidFilter] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<FinanceItem | null>(null);
  const [form, setForm] = useState<FinanceItem>(emptyFinance());
  const [deleteTarget, setDeleteTarget] = useState<FinanceItem | null>(null);

  const filtered = useMemo(() => {
    return data.finance
      .filter((f) => {
        if (projectId && f.projectId !== projectId) return false;
        if (type && f.type !== type) return false;
        if (category && f.category !== category) return false;
        if (paidFilter === 'paid' && !f.paid) return false;
        if (paidFilter === 'unpaid' && f.paid) return false;
        if (search) {
          const q = search.toLowerCase();
          if (!f.item.toLowerCase().includes(q) && !f.notes.toLowerCase().includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (a.date && b.date) return new Date(b.date).getTime() - new Date(a.date).getTime();
        return a.item.localeCompare(b.item);
      });
  }, [data.finance, search, projectId, type, category, paidFilter]);

  const totals = useMemo(() => computeFinanceTotals(filtered), [filtered]);
  const allTotals = useMemo(() => computeFinanceTotals(data.finance), [data.finance]);

  const openAdd = () => {
    setEditing(null);
    setForm({ ...emptyFinance(data.projects[0]?.id ?? ''), id: generateId('finance') });
    setModalOpen(true);
  };

  const openEdit = (f: FinanceItem) => {
    setEditing(f);
    setForm({ ...f });
    setModalOpen(true);
  };

  const save = () => {
    if (!form.item.trim()) {
      toast('Item description is required', 'error');
      return;
    }
    updateData((prev) => {
      const exists = prev.finance.some((f) => f.id === form.id);
      const finance = exists
        ? prev.finance.map((f) => (f.id === form.id ? form : f))
        : [...prev.finance, form];
      return { ...prev, finance };
    });
    toast(editing ? 'Entry updated' : 'Entry added');
    setModalOpen(false);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    updateData((prev) => ({
      ...prev,
      finance: prev.finance.filter((f) => f.id !== deleteTarget.id),
    }));
    toast('Entry deleted');
    setDeleteTarget(null);
  };

  const showingFiltered = filtered.length !== data.finance.length;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <Header title="Finance Tracker" subtitle="Track income, expenses, donations, and sponsorships" />
        <PageActions onAdd={openAdd} addLabel="Add entry" />
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-5">
        <StatCard
          label="Income"
          value={formatMoney(showingFiltered ? totals.income : allTotals.income)}
          icon="+"
          accent="bg-green-100 text-green-700"
        />
        <StatCard
          label="Expenses"
          value={formatMoney(showingFiltered ? totals.expenses : allTotals.expenses)}
          icon="−"
          accent="bg-red-100 text-red-700"
        />
        <StatCard
          label="Donations"
          value={formatMoney(showingFiltered ? totals.donations : allTotals.donations)}
          icon="♥"
          accent="bg-pink-100 text-pink-700"
        />
        <StatCard
          label="Sponsorships"
          value={formatMoney(showingFiltered ? totals.sponsorships : allTotals.sponsorships)}
          icon="★"
          accent="bg-amber-100 text-amber-700"
        />
        <StatCard
          label="Net"
          value={formatMoney(showingFiltered ? totals.net : allTotals.net)}
          sublabel={showingFiltered ? 'filtered view' : 'all entries'}
          icon="="
          accent="bg-slate-100 text-slate-800"
        />
      </div>

      <Card className="mb-4">
        <FilterBar>
          <FilterSearch value={search} onChange={setSearch} placeholder="Search entries…" />
          <FilterSelect
            label="Project"
            value={projectId}
            onChange={setProjectId}
            options={data.projects.map((p) => ({ value: p.id, label: p.projectName }))}
          />
          <FilterSelect
            label="Type"
            value={type}
            onChange={setType}
            options={financeTypes.map((t) => ({ value: t, label: t }))}
          />
          <FilterSelect
            label="Category"
            value={category}
            onChange={setCategory}
            options={financeCategories.map((c) => ({ value: c, label: c }))}
          />
          <FilterSelect
            label="Paid"
            value={paidFilter}
            onChange={setPaidFilter}
            allLabel="All"
            options={[
              { value: 'paid', label: 'Paid' },
              { value: 'unpaid', label: 'Unpaid' },
            ]}
          />
        </FilterBar>
      </Card>

      {filtered.length === 0 ? (
        <EmptyState
          title="No finance entries"
          description="Add income, expenses, or donations to track cash flow."
          action={
            <button type="button" onClick={openAdd} className="text-sm font-medium text-slate-900 underline">
              Add entry
            </button>
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-white">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-slate-50 text-xs font-medium uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3">Item</th>
                <th className="px-4 py-3">Project</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Paid</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((entry) => {
                const project = getProjectById(data.projects, entry.projectId);
                const isExpense = entry.type === 'Expense';
                return (
                  <tr key={entry.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900">{entry.item}</p>
                      <p className="text-xs text-slate-500">{entry.category}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{project?.projectName ?? '—'}</td>
                    <td className="px-4 py-3">
                      <Badge variant="neutral">{entry.type}</Badge>
                    </td>
                    <td
                      className={cn(
                        'px-4 py-3 font-medium',
                        isExpense ? 'text-red-600' : 'text-green-700'
                      )}
                    >
                      {isExpense ? '−' : '+'}
                      {formatMoney(entry.amount)}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{entry.date || '—'}</td>
                    <td className="px-4 py-3">
                      <Badge variant={entry.paid ? 'success' : 'warning'}>
                        {entry.paid ? 'Paid' : 'Unpaid'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(entry)}
                          className="text-xs font-medium text-slate-600 hover:text-slate-900"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(entry)}
                          className="text-xs font-medium text-red-600 hover:text-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <ModalForm
        open={modalOpen}
        title={editing ? 'Edit entry' : 'Add entry'}
        onClose={() => setModalOpen(false)}
        footer={
          <ModalFooter
            onCancel={() => setModalOpen(false)}
            onSave={save}
            saveLabel={editing ? 'Save changes' : 'Add entry'}
          />
        }
      >
        <FinanceFormFields value={form} onChange={setForm} projects={data.projects} />
      </ModalForm>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete entry?"
        message={deleteTarget ? `Delete "${deleteTarget.item}"?` : ''}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
