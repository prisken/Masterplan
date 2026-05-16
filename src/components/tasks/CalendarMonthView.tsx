import type { Task } from '../../types';
import { parseDate } from '../../utils/taskDeadline';
import { getReferenceDate } from '../../utils/referenceDate';
import { getTaskTitle } from '../../utils/taskTitle';
import { getEffectiveTaskStatus, isTaskCompleted } from '../../utils/taskStatus';
import { cn } from '../../utils/cn';

interface CalendarMonthViewProps {
  tasks: Task[];
  month?: Date;
}

export function CalendarMonthView({ tasks, month }: CalendarMonthViewProps) {
  const ref = month ?? getReferenceDate();
  const year = ref.getFullYear();
  const mon = ref.getMonth();
  const first = new Date(year, mon, 1);
  const daysInMonth = new Date(year, mon + 1, 0).getDate();
  const startPad = (first.getDay() + 6) % 7;

  const byDay: Record<number, Task[]> = {};
  for (const t of tasks) {
    const d = parseDate(t.deadline);
    if (!d || d.getFullYear() !== year || d.getMonth() !== mon) continue;
    const day = d.getDate();
    if (!byDay[day]) byDay[day] = [];
    byDay[day].push(t);
  }

  const cells: (number | null)[] = [
    ...Array(startPad).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div>
      <p className="mb-3 text-sm font-medium text-slate-700">
        {ref.toLocaleString('default', { month: 'long', year: 'numeric' })}
      </p>
      <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-medium text-slate-500">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => (
          <div
            key={i}
            className={cn(
              'min-h-[72px] rounded border border-border p-1 text-left',
              day ? 'bg-white' : 'bg-transparent border-transparent'
            )}
          >
            {day && (
              <>
                <span className="text-[10px] font-semibold text-slate-600">{day}</span>
                <ul className="mt-0.5 space-y-0.5">
                  {(byDay[day] ?? []).slice(0, 2).map((t) => (
                    <li
                      key={t.id}
                      className={cn(
                        'truncate rounded px-0.5 text-[9px]',
                        isTaskCompleted(getEffectiveTaskStatus(t))
                          ? 'bg-green-100 text-green-800'
                          : 'bg-slate-100 text-slate-700'
                      )}
                      title={getTaskTitle(t)}
                    >
                      {getTaskTitle(t)}
                    </li>
                  ))}
                  {(byDay[day]?.length ?? 0) > 2 && (
                    <li className="text-[9px] text-slate-400">+{(byDay[day]?.length ?? 0) - 2}</li>
                  )}
                </ul>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
