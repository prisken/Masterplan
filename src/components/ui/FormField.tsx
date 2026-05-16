import type { ReactNode } from 'react';
import { cn } from '../../utils/cn';

interface FormFieldProps {
  label: string;
  children: ReactNode;
  className?: string;
  hint?: string;
}

export function FormField({ label, children, className, hint }: FormFieldProps) {
  return (
    <label className={cn('block', className)}>
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-slate-400">{hint}</span>}
    </label>
  );
}

export const inputClass =
  'w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400';

export const selectClass = inputClass;

export const textareaClass =
  'w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 min-h-[80px]';
