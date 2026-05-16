import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useToast } from './ToastContext';
import { loadData, saveData } from '../services/storage';
import type { AppData } from '../types';
import { resolvePacingDate, setPacingDateResolver } from '../utils/referenceDate';

type Persistence = 'local' | 'server';

interface AppDataContextValue {
  data: AppData;
  isReady: boolean;
  persistence: Persistence;
  loadError: string | null;
  updateData: (updater: (prev: AppData) => AppData) => void;
  replaceData: (data: AppData) => void;
  reloadFromServer: () => Promise<void>;
}

const AppDataContext = createContext<AppDataContextValue | null>(null);

interface AppDataProviderProps {
  persistence: Persistence;
  children: ReactNode;
}

type PutOk = { ok: true; data: AppData; updatedAt: string };
type PutStale = { ok: false; stale: true; data: AppData; serverUpdatedAt: string };
type PutResult = PutOk | PutStale;

async function putAppData(
  next: AppData,
  lastKnownUpdatedAt: string | null,
  force: boolean
): Promise<PutResult> {
  const r = await fetch('/api/app-data', {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      data: next,
      lastKnownUpdatedAt: force ? undefined : lastKnownUpdatedAt,
      force,
    }),
  });
  if (r.status === 409) {
    const j = (await r.json()) as { data?: AppData; serverUpdatedAt?: string };
    if (j.data && j.serverUpdatedAt) {
      return { ok: false, stale: true, data: j.data, serverUpdatedAt: j.serverUpdatedAt };
    }
    throw new Error('Conflict: stale write');
  }
  if (!r.ok) {
    const t = await r.text();
    throw new Error(t || `Save failed (${r.status})`);
  }
  const j = (await r.json()) as { data: AppData; updatedAt: string };
  return { ok: true, data: j.data, updatedAt: j.updatedAt };
}

async function getAppDataFromServer(): Promise<{ data: AppData; updatedAt: string }> {
  const r = await fetch('/api/app-data', { credentials: 'include' });
  if (!r.ok) {
    const t = await r.text();
    throw new Error(t || `Load failed (${r.status})`);
  }
  return (await r.json()) as { data: AppData; updatedAt: string };
}

export function AppDataProvider({ persistence, children }: AppDataProviderProps) {
  const { toast } = useToast();
  const [data, setData] = useState<AppData | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const serverUpdatedAtRef = useRef<string | null>(null);

  const applyServerPayload = useCallback((payload: { data: AppData; updatedAt: string }) => {
    setData(payload.data);
    serverUpdatedAtRef.current = payload.updatedAt;
    setPacingDateResolver(() => resolvePacingDate(payload.data.settings));
  }, []);

  useEffect(() => {
    if (!data) return;
    setPacingDateResolver(() => resolvePacingDate(data.settings));
  }, [data?.settings.useLiveClock, data?.settings.pacingDate, data]);

  useEffect(() => {
    if (persistence === 'local') {
      setData(loadData());
      setLoadError(null);
      serverUpdatedAtRef.current = null;
      return;
    }
    let cancelled = false;
    setLoadError(null);
    void (async () => {
      try {
        const payload = await getAppDataFromServer();
        if (!cancelled) applyServerPayload(payload);
      } catch (e) {
        if (!cancelled) {
          setLoadError(e instanceof Error ? e.message : 'Failed to load from server');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [persistence, applyServerPayload]);

  const reloadFromServer = useCallback(async () => {
    if (persistence !== 'server') return;
    setLoadError(null);
    const payload = await getAppDataFromServer();
    applyServerPayload(payload);
  }, [persistence, applyServerPayload]);

  const updateData = useCallback(
    (updater: (prev: AppData) => AppData) => {
      if (persistence === 'local') {
        setData((prev) => {
          if (!prev) return prev;
          const next = updater(prev);
          saveData(next);
          return next;
        });
        return;
      }
      setData((prev) => {
        if (!prev) return prev;
        const next = updater(prev);
        const snapshot = prev;
        void putAppData(next, serverUpdatedAtRef.current, false)
          .then((result) => {
            if (result.ok) {
              setData(result.data);
              serverUpdatedAtRef.current = result.updatedAt;
            } else if (result.stale) {
              setData(result.data);
              serverUpdatedAtRef.current = result.serverUpdatedAt;
              toast('Data changed elsewhere; loaded latest from server.', 'error');
            }
          })
          .catch(() => {
            setData(snapshot);
            toast('Could not save to server; changes reverted.', 'error');
          });
        return next;
      });
    },
    [persistence, toast]
  );

  const replaceData = useCallback(
    (next: AppData) => {
      if (persistence === 'local') {
        saveData(next);
        setData(next);
        return;
      }
      void putAppData(next, serverUpdatedAtRef.current, true)
        .then((result) => {
          if (result.ok) {
            setData(result.data);
            serverUpdatedAtRef.current = result.updatedAt;
          } else if (result.stale) {
            setData(result.data);
            serverUpdatedAtRef.current = result.serverUpdatedAt;
            toast('Server had conflicting version; loaded server copy.', 'error');
          }
        })
        .catch((e) => {
          toast(e instanceof Error ? e.message : 'Replace failed on server', 'error');
        });
    },
    [persistence, toast]
  );

  const contextValue = useMemo((): AppDataContextValue | null => {
    if (!data) return null;
    return {
      data,
      isReady: true,
      persistence,
      loadError,
      updateData,
      replaceData,
      reloadFromServer,
    };
  }, [data, persistence, loadError, updateData, replaceData, reloadFromServer]);

  if (persistence === 'server' && loadError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-surface p-6">
        <p className="max-w-md text-center text-sm text-red-700">{loadError}</p>
        <button
          type="button"
          onClick={() => {
            setLoadError(null);
            void (async () => {
              try {
                const payload = await getAppDataFromServer();
                applyServerPayload(payload);
              } catch (e) {
                setLoadError(e instanceof Error ? e.message : 'Retry failed');
              }
            })();
          }}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data || !contextValue) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <p className="text-slate-500">Loading your command center…</p>
      </div>
    );
  }

  return (
    <AppDataContext.Provider value={contextValue}>{children}</AppDataContext.Provider>
  );
}

export function useAppData(): AppDataContextValue {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData must be used within AppDataProvider');
  return ctx;
}
