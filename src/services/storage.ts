import { createDefaultData } from '../data/seedData';
import type { AppData } from '../types';
import { DATA_VERSION, STORAGE_KEY } from '../types';
import { normalizeAppData } from './normalizeAppData';

export { normalizeAppData } from './normalizeAppData';

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seed = createDefaultData();
      saveData(seed);
      return seed;
    }
    const parsed = JSON.parse(raw) as Partial<AppData>;
    if (!parsed.version || !Array.isArray(parsed.projects)) {
      const seed = createDefaultData();
      saveData(seed);
      return seed;
    }
    const data = normalizeAppData(parsed);
    saveData(data);
    return data;
  } catch {
    const seed = createDefaultData();
    saveData(seed);
    return seed;
  }
}

export function saveData(data: AppData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...data, version: DATA_VERSION }));
}

/** Fresh seed data only; does not write localStorage (caller uses replaceData / saveData). */
export function resetToDefault(): AppData {
  return normalizeAppData(createDefaultData() as Partial<AppData>);
}

/** Read normalized AppData from localStorage if present and valid; does not create defaults. */
export function readLocalAppDataIfPresent(): AppData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<AppData>;
    if (!parsed.version || !Array.isArray(parsed.projects)) return null;
    return normalizeAppData(parsed);
  } catch {
    return null;
  }
}

export function exportDataJson(data: AppData): string {
  return JSON.stringify(data, null, 2);
}

/** Parse and normalize backup JSON. Does not write to localStorage (caller persists). */
export function importDataJson(json: string): AppData {
  const parsed = JSON.parse(json) as Partial<AppData>;
  if (!parsed.projects) throw new Error('Invalid backup: missing projects');
  return normalizeAppData(parsed);
}
