import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db';
import type { WeeklyReport } from '@/types';

export function useWeeklyReports(year?: number): WeeklyReport[] | undefined {
  return useLiveQuery(() => {
    if (year !== undefined) {
      return db.weeklyReports.where('year').equals(year).reverse().sortBy('week');
    }
    return db.weeklyReports.orderBy('weekStart').reverse().toArray();
  }, [year]);
}

export function useWeeklyReport(id: string | undefined): WeeklyReport | undefined {
  return useLiveQuery(
    () => (id ? db.weeklyReports.get(id) : undefined),
    [id],
  );
}

export function useWeeklyReportByWeek(year: number, week: number): WeeklyReport | undefined {
  return useLiveQuery(
    () => db.weeklyReports.where('[year+week]').equals([year, week]).first(),
    [year, week],
  );
}
