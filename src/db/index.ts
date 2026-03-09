import Dexie, { type EntityTable } from 'dexie';
import type { Category, WeeklyReport, GeneratedReport } from '@/types';

const db = new Dexie('WeekPulseDB') as Dexie & {
  categories: EntityTable<Category, 'id'>;
  weeklyReports: EntityTable<WeeklyReport, 'id'>;
  generatedReports: EntityTable<GeneratedReport, 'id'>;
};

db.version(1).stores({
  categories: 'id, sortOrder',
  weeklyReports: 'id, [year+week], year, status, weekStart',
  generatedReports: 'id, [type+year+period], year',
});

export { db };
