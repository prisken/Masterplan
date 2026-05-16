import { useRef, useState } from 'react';
import { Header } from '../components/layout/Header';
import { PacingSettingsCard } from '../components/settings/PacingSettingsCard';
import { Card } from '../components/ui/Card';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { useAppData } from '../context/AppDataContext';
import { useToast } from '../context/ToastContext';
import {
  exportDataJson,
  importDataJson,
  resetToDefault,
} from '../services/storage';
import { applyPortfolioSixSeed, type PortfolioSixSeedReport } from '../utils/portfolioSixSeed';
import { APP_VERSION, STORAGE_KEY } from '../types';

export function SettingsPage() {
  const { data, replaceData, updateData } = useAppData();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [resetOpen, setResetOpen] = useState(false);
  const [seedSixOpen, setSeedSixOpen] = useState(false);

  const handleSeedSixPack = () => {
    let report!: PortfolioSixSeedReport;
    updateData((prev) => {
      const r = applyPortfolioSixSeed(prev);
      report = r.report;
      return r.next;
    });
    toast(
      `Six-pack: +${report.tasksAdded} task(s), skipped ${report.tasksSkippedExistingId + report.tasksSkippedDuplicateTitle}. Projects +${report.projectsAdded} new / ${report.projectsUpdated} updated.`
    );
    setSeedSixOpen(false);
  };

  const handleExport = () => {
    const json = exportDataJson(data);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `master-portfolio-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast('Backup downloaded');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const imported = importDataJson(reader.result as string);
        replaceData(imported);
        toast('Backup imported successfully');
      } catch (err) {
        toast(err instanceof Error ? err.message : 'Import failed', 'error');
      }
      if (fileRef.current) fileRef.current.value = '';
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    const fresh = resetToDefault();
    replaceData(fresh);
    toast('App reset to default data');
    setResetOpen(false);
  };

  const counts = {
    projects: data.projects.length,
    tasks: data.tasks.length,
    contacts: data.contacts.length,
    content: data.content.length,
    events: data.events.length,
    finance: data.finance.length,
    prompts: data.aiPrompts.length,
    assets: data.digitalAssets.length,
  };

  return (
    <div className="mx-auto max-w-2xl">
      <Header title="Settings" subtitle="Pacing date, backup, restore, and app info" />

      <PacingSettingsCard
        settings={data.settings}
        onChange={(settings) => updateData((prev) => ({ ...prev, settings }))}
      />

      <Card className="mb-6">
        <h2 className="text-sm font-semibold text-slate-900">About</h2>
        <p className="mt-2 text-sm text-slate-600">
          <strong>Master Portfolio Command Center</strong> — {APP_VERSION}
        </p>
        <p className="mt-2 text-sm text-slate-500">
          All data is stored locally in your browser. Nothing is sent to a server. No login
          required.
        </p>
        <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
          Warning: Clearing browser data for this site will erase your app data. Export
          backups regularly.
        </p>
      </Card>

      <Card className="mb-6">
        <h2 className="mb-3 text-sm font-semibold text-slate-900">Data summary</h2>
        <dl className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
          {Object.entries(counts).map(([key, val]) => (
            <div key={key} className="rounded-lg bg-slate-50 px-3 py-2">
              <dt className="text-xs capitalize text-slate-500">{key}</dt>
              <dd className="font-semibold text-slate-800">{val}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 text-xs text-slate-400">
          Storage key: <code className="rounded bg-slate-100 px-1">{STORAGE_KEY}</code>
        </p>
      </Card>

      <Card className="mb-6 space-y-4">
        <h2 className="text-sm font-semibold text-slate-900">Portfolio six-pack (projects + tasks)</h2>
        <p className="text-sm text-slate-500">
          Adds or updates the six canonical projects (Profit Pulse Ally, Investment News Channel, Mama
          Supreme, HKSI Papers, Eternal Moments, Advisor Growth Center) and appends any missing starter
          tasks. Existing tasks with the same stable id or same project + title are skipped. Export a
          backup first if unsure.
        </p>
        <button
          type="button"
          onClick={() => setSeedSixOpen(true)}
          className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Merge six-project starter pack
        </button>
      </Card>

      <Card className="mb-6 space-y-4">
        <h2 className="text-sm font-semibold text-slate-900">Backup & restore</h2>
        <p className="text-sm text-slate-500">
          Export all projects, tasks, contacts, content, finance, reviews, and more as a
          JSON file. Import a previous backup to restore.
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleExport}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            Export JSON backup
          </button>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Import JSON backup
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={handleImport}
          />
        </div>
      </Card>

      <Card className="border-red-100 bg-red-50/30">
        <h2 className="text-sm font-semibold text-red-900">Danger zone</h2>
        <p className="mt-2 text-sm text-red-800/80">
          Reset the app to default seed data. This removes all your custom entries and
          cannot be undone unless you have a backup.
        </p>
        <button
          type="button"
          onClick={() => setResetOpen(true)}
          className="mt-4 rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
        >
          Reset to default data
        </button>
      </Card>

      <ConfirmDialog
        open={seedSixOpen}
        title="Merge six-project starter pack?"
        message="This updates the six canonical projects (goals, engines) and adds any missing starter tasks. It will not remove existing tasks. Export a backup first if you want a rollback point."
        confirmLabel="Merge pack"
        danger={false}
        onConfirm={handleSeedSixPack}
        onCancel={() => setSeedSixOpen(false)}
      />

      <ConfirmDialog
        open={resetOpen}
        title="Reset all data?"
        message="This will replace everything with default projects, tasks, and prompts. Your custom data will be lost."
        confirmLabel="Reset everything"
        onConfirm={handleReset}
        onCancel={() => setResetOpen(false)}
      />
    </div>
  );
}
