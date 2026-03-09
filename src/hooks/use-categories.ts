import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db';
import type { Category } from '@/types';

export function useCategories(): Category[] | undefined {
  return useLiveQuery(() => db.categories.orderBy('sortOrder').toArray());
}

export function useCategory(id: string | undefined): Category | undefined {
  return useLiveQuery(
    () => (id ? db.categories.get(id) : undefined),
    [id],
  );
}
