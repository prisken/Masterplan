import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { loadData, saveData } from '../services/storage';
import type { AppData } from '../types';
import { resolvePacingDate, setPacingDateResolver } from '../utils/referenceDate';

interface AppDataContextValue {
  data: AppData;
  isReady: boolean;
  updateData: (updater: (prev: AppData) => AppData) => void;
  replaceData: (data: AppData) => void;
}

const AppDataContext = createContext<AppDataContextValue | null>(null);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData | null>(null);

  useEffect(() => {
    setData(loadData());
  }, []);

  useEffect(() => {
    if (!data) return;
    setPacingDateResolver(() => resolvePacingDate(data.settings));
  }, [data?.settings.useLiveClock, data?.settings.pacingDate, data]);

  const updateData = useCallback((updater: (prev: AppData) => AppData) => {
    setData((prev) => {
      if (!prev) return prev;
      const next = updater(prev);
      saveData(next);
      return next;
    });
  }, []);

  const replaceData = useCallback((next: AppData) => {
    saveData(next);
    setData(next);
  }, []);

  const value = useMemo(
    () =>
      data
        ? { data, isReady: true, updateData, replaceData }
        : {
            data: loadData(),
            isReady: false,
            updateData,
            replaceData,
          },
    [data, updateData, replaceData]
  );

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <p className="text-slate-500">Loading your command center…</p>
      </div>
    );
  }

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData(): AppDataContextValue {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData must be used within AppDataProvider');
  return ctx;
}
