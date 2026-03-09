import { db } from '@/db';
import { nanoid } from 'nanoid';
import type { Category } from '@/types';

const DEFAULT_CATEGORIES: Omit<Category, 'id' | 'createdAt'>[] = [
  { name: '개발', color: '#3B82F6', icon: 'code', sortOrder: 0, isDefault: true },
  { name: '회의', color: '#F59E0B', icon: 'users', sortOrder: 1, isDefault: true },
  { name: '기획', color: '#8B5CF6', icon: 'lightbulb', sortOrder: 2, isDefault: true },
  { name: '리뷰', color: '#22C55E', icon: 'eye', sortOrder: 3, isDefault: true },
  { name: '학습', color: '#06B6D4', icon: 'book-open', sortOrder: 4, isDefault: true },
  { name: '운영', color: '#F97316', icon: 'settings', sortOrder: 5, isDefault: true },
  { name: '커뮤니케이션', color: '#EC4899', icon: 'message-circle', sortOrder: 6, isDefault: true },
  { name: '기타', color: '#78716C', icon: 'more-horizontal', sortOrder: 7, isDefault: true },
];

export async function seedDefaultCategories(): Promise<void> {
  const count = await db.categories.count();
  if (count > 0) return;

  const now = new Date();
  const categories: Category[] = DEFAULT_CATEGORIES.map((cat) => ({
    ...cat,
    id: nanoid(),
    createdAt: now,
  }));

  await db.categories.bulkAdd(categories);
}
