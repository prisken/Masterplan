import { useMemo, useState } from 'react';
import { ContactFormFields } from '../components/contacts/ContactFormFields';
import { Header } from '../components/layout/Header';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { EmptyState } from '../components/ui/EmptyState';
import { FilterBar, FilterSearch, FilterSelect, ViewTabs } from '../components/ui/FilterBar';
import { ModalFooter, ModalForm } from '../components/ui/ModalForm';
import { PageActions } from '../components/ui/PageActions';
import { useAppData } from '../context/AppDataContext';
import { useEntityCrud } from '../hooks/useEntityCrud';
import { useToast } from '../context/ToastContext';
import type { Contact, ContactType } from '../types';
import { relationshipStrengths, stages } from '../constants/options';
import { emptyContact } from '../utils/defaults';
import { generateId } from '../utils/id';
import { getProjectById } from '../utils/projectColors';
import { cn } from '../utils/cn';

const viewTabs = [
  { id: 'all', label: 'All' },
  { id: 'Business Lead', label: 'Leads' },
  { id: 'Sponsor', label: 'Sponsors' },
  { id: 'Donor', label: 'Donors' },
  { id: 'Volunteer', label: 'Volunteers' },
  { id: 'Parent', label: 'Parents' },
  { id: 'followup', label: 'Follow up' },
];

function isFollowUpDue(contact: Contact): boolean {
  if (!contact.nextFollowUpDate) return false;
  const d = new Date(contact.nextFollowUpDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return !Number.isNaN(d.getTime()) && d <= today;
}

export function ContactsPage() {
  const { items: contacts, upsert, remove } = useEntityCrud<Contact>('contacts');
  const { data } = useAppData();
  const { toast } = useToast();

  const [view, setView] = useState('all');
  const [search, setSearch] = useState('');
  const [projectId, setProjectId] = useState('');
  const [stage, setStage] = useState('');
  const [relationship, setRelationship] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Contact | null>(null);
  const [form, setForm] = useState<Contact>(emptyContact());
  const [deleteTarget, setDeleteTarget] = useState<Contact | null>(null);

  const filtered = useMemo(() => {
    return contacts
      .filter((c) => {
        if (view === 'followup') {
          if (!isFollowUpDue(c)) return false;
        } else if (view !== 'all' && c.contactType !== (view as ContactType)) {
          return false;
        }
        if (projectId && c.relatedProjectId !== projectId) return false;
        if (stage && c.stage !== stage) return false;
        if (relationship && c.relationshipStrength !== relationship) return false;
        if (search) {
          const q = search.toLowerCase();
          if (
            !c.name.toLowerCase().includes(q) &&
            !c.organization.toLowerCase().includes(q) &&
            !c.email.toLowerCase().includes(q)
          )
            return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (a.nextFollowUpDate && b.nextFollowUpDate) {
          return (
            new Date(a.nextFollowUpDate).getTime() - new Date(b.nextFollowUpDate).getTime()
          );
        }
        return a.name.localeCompare(b.name);
      });
  }, [contacts, view, search, projectId, stage, relationship]);

  const openAdd = () => {
    setEditing(null);
    setForm({
      ...emptyContact(data.projects[0]?.id ?? ''),
      id: generateId('contact'),
    });
    setModalOpen(true);
  };

  const openEdit = (c: Contact) => {
    setEditing(c);
    setForm({ ...c });
    setModalOpen(true);
  };

  const save = () => {
    if (!form.name.trim()) {
      toast('Name is required', 'error');
      return;
    }
    upsert(form, {
      created: 'Contact added',
      updated: 'Contact updated',
    });
    setModalOpen(false);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    remove(deleteTarget.id, 'Contact deleted');
    setDeleteTarget(null);
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <Header title="Contacts" subtitle="CRM for leads, sponsors, donors, and partners" />
        <PageActions onAdd={openAdd} addLabel="Add contact" />
      </div>

      <Card className="mb-4 space-y-4">
        <ViewTabs tabs={viewTabs} active={view} onChange={setView} />
        <FilterBar>
          <FilterSearch value={search} onChange={setSearch} placeholder="Search contacts…" />
          <FilterSelect
            label="Project"
            value={projectId}
            onChange={setProjectId}
            options={data.projects.map((p) => ({ value: p.id, label: p.projectName }))}
          />
          <FilterSelect
            label="Stage"
            value={stage}
            onChange={setStage}
            options={stages.map((s) => ({ value: s, label: s }))}
          />
          <FilterSelect
            label="Relationship"
            value={relationship}
            onChange={setRelationship}
            options={relationshipStrengths.map((r) => ({ value: r, label: r }))}
          />
        </FilterBar>
      </Card>

      {filtered.length === 0 ? (
        <EmptyState
          title="No contacts found"
          description="Add your first lead, sponsor, or partner."
          action={
            <button
              type="button"
              onClick={openAdd}
              className="text-sm font-medium text-slate-900 underline"
            >
              Add contact
            </button>
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-white">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-slate-50 text-xs font-medium uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Project</th>
                <th className="px-4 py-3">Stage</th>
                <th className="px-4 py-3">Follow-up</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((contact) => {
                const project = getProjectById(data.projects, contact.relatedProjectId);
                const due = isFollowUpDue(contact);
                return (
                  <tr key={contact.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900">{contact.name}</p>
                      {contact.organization && (
                        <p className="text-xs text-slate-500">{contact.organization}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="neutral">{contact.contactType}</Badge>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {project?.projectName ?? '—'}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          contact.stage === 'Won'
                            ? 'success'
                            : contact.stage === 'Lost'
                              ? 'danger'
                              : 'default'
                        }
                      >
                        {contact.stage}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      {contact.nextFollowUpDate ? (
                        <span
                          className={cn(
                            'text-sm',
                            due ? 'font-semibold text-red-600' : 'text-slate-600'
                          )}
                        >
                          {contact.nextFollowUpDate}
                          {due && ' · Due'}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(contact)}
                          className="text-xs font-medium text-slate-600 hover:text-slate-900"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(contact)}
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
        title={editing ? 'Edit contact' : 'Add contact'}
        onClose={() => setModalOpen(false)}
        footer={
          <ModalFooter
            onCancel={() => setModalOpen(false)}
            onSave={save}
            saveLabel={editing ? 'Save changes' : 'Add contact'}
          />
        }
      >
        <ContactFormFields value={form} onChange={setForm} projects={data.projects} />
      </ModalForm>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete contact?"
        message={deleteTarget ? `Delete "${deleteTarget.name}"?` : ''}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
