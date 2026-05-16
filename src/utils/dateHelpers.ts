export function getMondayOfWeek(date = new Date()): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d.toISOString().slice(0, 10);
}

export function formatWeekLabel(weekStart: string): string {
  if (!weekStart) return 'Unknown week';
  const start = new Date(weekStart);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return `${weekStart} → ${end.toISOString().slice(0, 10)}`;
}

export function formatMonthLabel(month: string): string {
  if (!month) return 'Unknown month';
  const [y, m] = month.split('-');
  const date = new Date(Number(y), Number(m) - 1, 1);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}
