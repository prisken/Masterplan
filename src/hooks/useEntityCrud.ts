import { useCallback } from 'react';
import { useAppData } from '../context/AppDataContext';
import { useToast } from '../context/ToastContext';
import type { AppData } from '../types';

type EntityWithId = { id: string };

type ListCollectionKey = {
  [K in keyof AppData]: AppData[K] extends EntityWithId[] ? K : never;
}[keyof AppData];

export interface EntityCrudMessages {
  created?: string;
  updated?: string;
  deleted?: string;
}

export function useEntityCrud<T extends EntityWithId>(collection: ListCollectionKey) {
  const { data, updateData } = useAppData();
  const { toast } = useToast();

  const items = data[collection] as unknown as T[];

  const upsert = useCallback(
    (item: T, messages: EntityCrudMessages = {}) => {
      let created = false;
      updateData((prev) => {
        const list = prev[collection] as unknown as T[];
        created = !list.some((x) => x.id === item.id);
        const next = created
          ? [...list, item]
          : list.map((x) => (x.id === item.id ? item : x));
        return { ...prev, [collection]: next };
      });
      toast(
        created
          ? (messages.created ?? 'Saved')
          : (messages.updated ?? 'Updated')
      );
    },
    [collection, updateData, toast]
  );

  const remove = useCallback(
    (id: string, message = 'Deleted') => {
      updateData((prev) => ({
        ...prev,
        [collection]: (prev[collection] as unknown as T[]).filter((x) => x.id !== id),
      }));
      toast(message);
    },
    [collection, updateData, toast]
  );

  const replaceAll = useCallback(
    (next: T[]) => {
      updateData((prev) => ({ ...prev, [collection]: next }));
    },
    [collection, updateData]
  );

  return { items, upsert, remove, replaceAll };
}
