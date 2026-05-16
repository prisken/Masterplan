import type { AppSettings } from '../types';
import { REFERENCE_DATE } from '../types';
import { parseDate, startOfDay } from './taskDeadline';

let resolvePacingDateFn: (() => Date) | null = null;

/** Called from AppDataProvider when settings change. */
export function setPacingDateResolver(resolver: () => Date): void {
  resolvePacingDateFn = resolver;
}

export function resolvePacingDate(settings: AppSettings): Date {
  if (settings.useLiveClock) {
    return startOfDay(new Date());
  }
  return parseDate(settings.pacingDate) ?? parseDate(REFERENCE_DATE) ?? startOfDay();
}

/** Single “today” for tasks, advisor pacing, and dashboard follow-up due dates. */
export function getReferenceDate(): Date {
  if (resolvePacingDateFn) return resolvePacingDateFn();
  return parseDate(REFERENCE_DATE) ?? startOfDay();
}

export function getPacingDateIso(settings: AppSettings): string {
  const d = resolvePacingDate(settings);
  return d.toISOString().slice(0, 10);
}

export function getPacingDateDescription(settings: AppSettings): string {
  if (settings.useLiveClock) {
    return `Live clock (${getPacingDateIso(settings)})`;
  }
  return `Fixed pacing date (${settings.pacingDate})`;
}

export function daysBetween(from: string, to: string): number {
  const a = parseDate(from);
  const b = parseDate(to);
  if (!a || !b) return 0;
  return Math.ceil((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

export function daysFromReference(deadline: string): number | null {
  const d = parseDate(deadline);
  const ref = getReferenceDate();
  if (!d) return null;
  return Math.ceil((d.getTime() - ref.getTime()) / (1000 * 60 * 60 * 24));
}

export function daysUntilYearEnd(from?: string): number {
  const iso = from ?? getReferenceDate().toISOString().slice(0, 10);
  return daysBetween(iso, '2026-12-31');
}
