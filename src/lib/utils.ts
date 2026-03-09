import { getISOWeek, getISOWeekYear, startOfISOWeek, endOfISOWeek } from 'date-fns';

/**
 * cn() — conditional class names utility (clsx alternative)
 */
export function cn(...inputs: (string | undefined | null | false | Record<string, boolean>)[]): string {
  const classes: string[] = [];
  for (const input of inputs) {
    if (!input) continue;
    if (typeof input === 'string') {
      classes.push(input);
    } else {
      for (const [key, value] of Object.entries(input)) {
        if (value) classes.push(key);
      }
    }
  }
  return classes.join(' ');
}

/**
 * ISO 8601 주차 번호 계산
 */
export function getISOWeekNumber(date: Date): number {
  return getISOWeek(date);
}

/**
 * ISO 주차 기준 연도 (1월 초에 이전 연도 주차일 수 있음)
 */
export function getISOWeekYearNumber(date: Date): number {
  return getISOWeekYear(date);
}

/**
 * 해당 주의 시작일 (월요일) 반환
 */
export function getWeekStart(date: Date): Date {
  return startOfISOWeek(date);
}

/**
 * 해당 주의 종료일 (일요일) 반환
 */
export function getWeekEnd(date: Date): Date {
  return endOfISOWeek(date);
}

/**
 * 연도 + 주차로부터 해당 주의 시작일/종료일 계산
 */
export function getWeekRange(year: number, week: number): { start: Date; end: Date } {
  // ISO 8601: 1월 4일은 항상 첫째 주에 속함
  const jan4 = new Date(year, 0, 4);
  const start = startOfISOWeek(jan4);
  // week-1 만큼 7일씩 더함
  const weekStart = new Date(start);
  weekStart.setDate(weekStart.getDate() + (week - 1) * 7);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);
  return { start: weekStart, end: weekEnd };
}

/**
 * 날짜를 "M/D" 형식으로 포맷
 */
export function formatShortDate(date: Date): string {
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

/**
 * 주차 라벨 생성 (예: "W10 (3/2 ~ 3/8)")
 */
export function formatWeekLabel(year: number, week: number): string {
  const { start, end } = getWeekRange(year, week);
  return `W${week} (${formatShortDate(start)} ~ ${formatShortDate(end)})`;
}
