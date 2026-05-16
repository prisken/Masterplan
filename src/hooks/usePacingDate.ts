import { useMemo } from 'react';
import { useAppData } from '../context/AppDataContext';
import {
  getPacingDateDescription,
  getPacingDateIso,
  getReferenceDate,
  resolvePacingDate,
} from '../utils/referenceDate';

export function usePacingDate() {
  const { data } = useAppData();

  return useMemo(
    () => ({
      settings: data.settings,
      date: getReferenceDate(),
      iso: getPacingDateIso(data.settings),
      description: getPacingDateDescription(data.settings),
      resolve: () => resolvePacingDate(data.settings),
    }),
    [data.settings]
  );
}
