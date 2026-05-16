import { useCallback, useEffect, useRef, useState } from 'react';
import { useAppData } from '../context/AppDataContext';
import { useToast } from '../context/ToastContext';
import type { AdvisorExecutionState } from '../types';

const SAVE_DELAY_MS = 500;

function advisorEqual(a: AdvisorExecutionState, b: AdvisorExecutionState): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

/** Local draft + debounced persist to localStorage (avoids toast/save on every keystroke). */
export function useDebouncedAdvisor() {
  const { data, updateData } = useAppData();
  const { toast } = useToast();
  const [draft, setDraft] = useState<AdvisorExecutionState>(data.advisor);
  const skipNextSave = useRef(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    setDraft(data.advisor);
    skipNextSave.current = true;
  }, [data.advisor]);

  useEffect(() => {
    if (skipNextSave.current) {
      skipNextSave.current = false;
      return;
    }
    if (advisorEqual(draft, data.advisor)) return;

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      updateData((prev) => ({ ...prev, advisor: draft }));
      toast('Trackers saved');
    }, SAVE_DELAY_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [draft, data.advisor, updateData, toast]);

  const patchAdvisor = useCallback((patch: Partial<AdvisorExecutionState>) => {
    setDraft((prev) => ({ ...prev, ...patch }));
  }, []);

  return { draft, patchAdvisor };
}
