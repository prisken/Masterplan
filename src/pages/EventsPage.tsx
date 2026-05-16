import { useMemo, useState } from 'react';
import { EventFormFields } from '../components/events/EventFormFields';
import { Header } from '../components/layout/Header';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { EmptyState } from '../components/ui/EmptyState';
import { FilterBar, FilterSearch, FilterSelect, ViewTabs } from '../components/ui/FilterBar';
import { ModalFooter, ModalForm } from '../components/ui/ModalForm';
import { PageActions } from '../components/ui/PageActions';
import { StatCard } from '../components/ui/StatCard';
import { eventStatuses, eventTypes } from '../constants/contentOptions';
import { useAppData } from '../context/AppDataContext';
import { useToast } from '../context/ToastContext';
import type { Event } from '../types';
import { emptyEvent } from '../utils/defaults';
import { formatMoney } from '../utils/financeStats';
import { generateId } from '../utils/id';
import { getProjectById } from '../utils/projectColors';
import { cn } from '../utils/cn';

const viewTabs = [
  { id: 'all', label: 'All' },
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'planning', label: 'Planning' },
  { id: 'completed', label: 'Completed' },
];

function isUpcoming(dateStr: string): boolean {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return !Number.isNaN(d.getTime()) && d >= today;
}

export function EventsPage() {
  const { data, updateData } = useAppData();
  const { toast } = useToast();

  const [view, setView] = useState('all');
  const [search, setSearch] = useState('');
  const [projectId, setProjectId] = useState('');
  const [eventType, setEventType] = useState('');
  const [status, setStatus] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Event | null>(null);
  const [form, setForm] = useState<Event>(emptyEvent());
  const [deleteTarget, setDeleteTarget] = useState<Event | null>(null);

  const summary = useMemo(() => {
    const upcoming = data.events.filter(
      (e) => isUpcoming(e.date) && e.status !== 'Completed' && e.status !== 'Cancelled'
    ).length;
    const totalBudget = data.events.reduce((s, e) => s + (e.budget || 0), 0);
    const totalRevenue = data.events.reduce((s, e) => s + (e.revenueOrDonations || 0), 0);
    const totalAttendees = data.events.reduce((s, e) => s + (e.actualAttendees || 0), 0);
    return { upcoming, totalBudget, totalRevenue, totalAttendees, total: data.events.length };
  }, [data.events]);

  const filtered = useMemo(() => {
    return data.events
      .filter((e) => {
        if (view === 'upcoming' && (!isUpcoming(e.date) || e.status === 'Cancelled')) return false;
        if (view === 'planning' && !['Idea', 'Planning', 'Confirmed', 'Promoting'].includes(e.status))
          return false;
        if (view === 'completed' && e.status !== 'Completed') return false;

        if (projectId && e.projectId !== projectId) return false;
        if (eventType && e.eventType !== eventType) return false;
        if (status && e.status !== status) return false;
        if (search) {
          const q = search.toLowerCase();
          if (
            !e.eventName.toLowerCase().includes(q) &&
            !e.venueOrLink.toLowerCase().includes(q)
          )
            return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (a.date && b.date) return new Date(a.date).getTime() - new Date(b.date).getTime();
        return a.eventName.localeCompare(b.eventName);
      });
  }, [data.events, view, search, projectId, eventType, status]);

  const openAdd = () => {
    setEditing(null);
    setForm({ ...emptyEvent(data.projects[0]?.id ?? ''), id: generateId('event') });
    setModalOpen(true);
  };

  const openEdit = (e: Event) => {
    setEditing(e);
    setForm({ ...e });
    setModalOpen(true);
  };

  const save = () => {
    if (!form.eventName.trim()) {
      toast('Event name is required', 'error');
      return;
    }
    updateData((prev) => {
      const exists = prev.events.some((e) => e.id === form.id);
      const events = exists
        ? prev.events.map((e) => (e.id === form.id ? form : e))
        : [...prev.events, form];
      return { ...prev, events };
    });
    toast(editing ? 'Event updated' : 'Event added');
    setModalOpen(false);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    updateData((prev) => ({
      ...prev,
      events: prev.events.filter((e) => e.id !== deleteTarget.id),
    }));
    toast('Event deleted');
    setDeleteTarget(null);
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <Header title="Events" subtitle="Plan charity gatherings, seminars, and livestreams" />
        <PageActions onAdd={openAdd} addLabel="Add event" />
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Total events" value={summary.total} icon="◈" accent="bg-slate-100 text-slate-700" />
        <StatCard label="Upcoming" value={summary.upcoming} icon="◷" accent="bg-blue-100 text-blue-700" />
        <StatCard
          label="Total budget"
          value={formatMoney(summary.totalBudget)}
          icon="$"
          accent="bg-amber-100 text-amber-700"
        />
        <StatCard
          label="Revenue / donations"
          value={formatMoney(summary.totalRevenue)}
          sublabel={`${summary.totalAttendees} attendees`}
          icon="♥"
          accent="bg-pink-100 text-pink-700"
        />
      </div>

      <Card className="mb-4 space-y-4">
        <ViewTabs tabs={viewTabs} active={view} onChange={setView} />
        <FilterBar>
          <FilterSearch value={search} onChange={setSearch} placeholder="Search events…" />
          <FilterSelect
            label="Project"
            value={projectId}
            onChange={setProjectId}
            options={data.projects.map((p) => ({ value: p.id, label: p.projectName }))}
          />
          <FilterSelect
            label="Type"
            value={eventType}
            onChange={setEventType}
            options={eventTypes.map((t) => ({ value: t, label: t }))}
          />
          <FilterSelect
            label="Status"
            value={status}
            onChange={setStatus}
            options={eventStatuses.map((s) => ({ value: s, label: s }))}
          />
        </FilterBar>
      </Card>

      {filtered.length === 0 ? (
        <EmptyState
          title="No events found"
          description="Add your first event or adjust filters."
          action={
            <button type="button" onClick={openAdd} className="text-sm font-medium text-slate-900 underline">
              Add event
            </button>
          }
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((event) => {
            const project = getProjectById(data.projects, event.projectId);
            const upcoming = isUpcoming(event.date);
            return (
              <Card key={event.id} padding="sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-slate-900">{event.eventName}</h3>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {project?.projectName ?? '—'} · {event.eventType}
                    </p>
                    <p className={cn('mt-1 text-sm', upcoming ? 'font-medium text-blue-700' : 'text-slate-600')}>
                      {event.date || 'No date'} · {event.venueOrLink || 'No venue'}
                    </p>
                    <p className="mt-2 text-xs text-slate-500">
                      Attendees: {event.actualAttendees}/{event.targetAttendees} · Sponsors:{' '}
                      {event.sponsorsConfirmed}/{event.sponsorsNeeded} · Volunteers:{' '}
                      {event.volunteersConfirmed}/{event.volunteersNeeded}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Budget {formatMoney(event.budget)} · Revenue {formatMoney(event.revenueOrDonations)}
                    </p>
                  </div>
                  <Badge
                    variant={
                      event.status === 'Completed'
                        ? 'success'
                        : event.status === 'Cancelled'
                          ? 'danger'
                          : 'neutral'
                    }
                  >
                    {event.status}
                  </Badge>
                </div>
                <div className="mt-3 flex gap-2 border-t border-border pt-3">
                  <button
                    type="button"
                    onClick={() => openEdit(event)}
                    className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(event)}
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
        title={editing ? 'Edit event' : 'Add event'}
        onClose={() => setModalOpen(false)}
        footer={
          <ModalFooter
            onCancel={() => setModalOpen(false)}
            onSave={save}
            saveLabel={editing ? 'Save changes' : 'Add event'}
          />
        }
      >
        <EventFormFields value={form} onChange={setForm} projects={data.projects} />
      </ModalForm>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete event?"
        message={deleteTarget ? `Delete "${deleteTarget.eventName}"?` : ''}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
