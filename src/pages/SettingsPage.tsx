import { useRef, useState, type ChangeEvent } from 'react';
import { Header } from '../components/layout/Header';
import { PacingSettingsCard } from '../components/settings/PacingSettingsCard';
import { Card } from '../components/ui/Card';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { useAppData } from '../context/AppDataContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  exportDataJson,
  importDataJson,
  readLocalAppDataIfPresent,
  resetToDefault,
} from '../services/storage';
import { applyPortfolioSixSeed, type PortfolioSixSeedReport } from '../utils/portfolioSixSeed';
import { APP_VERSION, STORAGE_KEY, type AppData } from '../types';

export function SettingsPage() {
  const { data, replaceData, updateData, persistence, reloadFromServer } = useAppData();
  const auth = useAuth();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [resetOpen, setResetOpen] = useState(false);
  const [seedSixOpen, setSeedSixOpen] = useState(false);
  const [importConfirmOpen, setImportConfirmOpen] = useState(false);
  const [importPending, setImportPending] = useState<AppData | null>(null);
  const [uploadLocalOpen, setUploadLocalOpen] = useState(false);

  const localPeek = persistence === 'server' ? readLocalAppDataIfPresent() : null;

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

  const handleImportFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const imported = importDataJson(reader.result as string);
        if (persistence === 'server') {
          setImportPending(imported);
          setImportConfirmOpen(true);
        } else {
          replaceData(imported);
          toast('Backup imported successfully');
        }
      } catch (err) {
        toast(err instanceof Error ? err.message : 'Import failed', 'error');
      }
      if (fileRef.current) fileRef.current.value = '';
    };
    reader.readAsText(file);
  };

  const confirmImport = () => {
    if (importPending) {
      replaceData(importPending);
      toast('Backup imported to server');
    }
    setImportPending(null);
    setImportConfirmOpen(false);
  };

  const handleReset = async () => {
    try {
      if (persistence === 'server') {
        const r = await fetch('/api/app-data/reset', {
          method: 'POST',
          credentials: 'include',
        });
        if (!r.ok) {
          const t = await r.text();
          toast(t || `Reset failed (${r.status})`, 'error');
          return;
        }
        await reloadFromServer();
        toast('Server data reset to defaults');
      } else {
        replaceData(resetToDefault());
        toast('App reset to default data');
      }
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Reset failed', 'error');
    } finally {
      setResetOpen(false);
    }
  };

  const confirmUploadLocal = () => {
    const local = readLocalAppDataIfPresent();
    if (!local) {
      toast('No valid local data found in this browser', 'error');
      setUploadLocalOpen(false);
      return;
    }
    replaceData(local);
    toast('Local snapshot uploaded to server');
    setUploadLocalOpen(false);
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

      {auth.enabled && auth.status === 'authenticated' && (
        <Card className="mb-6">
          <h2 className="text-sm font-semibold text-slate-900">Account</h2>
          <p className="mt-2 text-sm text-slate-600">
            Signed in as <strong>{auth.username}</strong>. Data is loaded from the server on this
            device.
          </p>
          <button
            type="button"
            onClick={() => void auth.logout()}
            className="mt-4 rounded-lg border border-border px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Sign out
          </button>
        </Card>
      )}

      <PacingSettingsCard
        settings={data.settings}
        onChange={(settings) => updateData((prev) => ({ ...prev, settings }))}
      />

      <Card className="mb-6">
        <h2 className="text-sm font-semibold text-slate-900">About</h2>
        <p className="mt-2 text-sm text-slate-600">
          <strong>Master Portfolio Command Center</strong> — {APP_VERSION}
        </p>
        {persistence === 'server' ? (
          <>
            <p className="mt-2 text-sm text-slate-500">
              You are using <strong>server-backed storage</strong>. Changes sync to the database;
              refresh or another device shows the same projects, tasks, reviews, and contacts.
            </p>
            <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
              This browser may still contain an older <strong>localStorage</strong> copy from before
              server mode—it is not used as the source of truth unless you explicitly upload it
              below.
            </p>
          </>
        ) : (
          <>
            <p className="mt-2 text-sm text-slate-500">
              All data is stored locally in your browser. Nothing is sent to a server. No login
              required.
            </p>
            <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
              Warning: Clearing browser data for this site will erase your app data. Export backups
              regularly.
            </p>
          </>
        )}
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
          Local storage key (legacy / backup):{' '}
          <code className="rounded bg-slate-100 px-1">{STORAGE_KEY}</code>
        </p>
      </Card>

      {persistence === 'server' && (
        <Card className="mb-6 space-y-3">
          <h2 className="text-sm font-semibold text-slate-900">One-time: promote local snapshot</h2>
          <p className="text-sm text-slate-500">
            If this browser still has portfolio data in localStorage from before server login, you
            can push it to the server once. This <strong>replaces</strong> the server copy—export a
            server backup first if unsure.
          </p>
          {localPeek ? (
            <button
              type="button"
              onClick={() => setUploadLocalOpen(true)}
              className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-950 hover:bg-amber-100"
            >
              Upload this device’s local data to server…
            </button>
          ) : (
            <p className="text-sm text-slate-400">No valid local snapshot found in this browser.</p>
          )}
        </Card>
      )}

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
          Export all projects, tasks, contacts, content, finance, reviews, and more as a JSON file.
          {persistence === 'server'
            ? ' Import replaces the server copy after you confirm.'
            : ' Import a previous backup to restore.'}
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
            onChange={handleImportFile}
          />
        </div>
      </Card>

      <Card className="border-red-100 bg-red-50/30">
        <h2 className="text-sm font-semibold text-red-900">Danger zone</h2>
        <p className="mt-2 text-sm text-red-800/80">
          {persistence === 'server'
            ? 'Reset the server copy to default seed data. Other devices will see the same reset. Export a backup first.'
            : 'Reset the app to default seed data. This removes all your custom entries and cannot be undone unless you have a backup.'}
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
        message={
          persistence === 'server'
            ? 'This resets the database copy to default projects, tasks, and prompts. All signed-in devices will see the change.'
            : 'This will replace everything with default projects, tasks, and prompts. Your custom data will be lost.'
        }
        confirmLabel="Reset everything"
        onConfirm={() => void handleReset()}
        onCancel={() => setResetOpen(false)}
      />

      <ConfirmDialog
        open={importConfirmOpen}
        title="Replace server data with this backup?"
        message="Importing will overwrite the current server snapshot with the JSON file you selected. Export the server first if you need a rollback."
        confirmLabel="Import and overwrite server"
        danger
        onConfirm={confirmImport}
        onCancel={() => {
          setImportPending(null);
          setImportConfirmOpen(false);
        }}
      />

      <ConfirmDialog
        open={uploadLocalOpen}
        title="Overwrite server with this browser’s localStorage?"
        message="The server copy will be replaced by the normalized data found in this browser’s local storage key. This cannot be undone except by restoring a JSON export."
        confirmLabel="Upload to server"
        danger
        onConfirm={confirmUploadLocal}
        onCancel={() => setUploadLocalOpen(false)}
      />
    </div>
  );
}
