import type { ReportType, WeeklyReport, Category } from '@/types';
import { createProvider } from './ai-provider';
import { getActiveConfig } from '@/lib/ai-config';
import { db } from '@/db';

function filterByPeriod(
  reports: WeeklyReport[],
  type: ReportType,
  period: number,
): WeeklyReport[] {
  return reports.filter((r) => {
    if (type === 'monthly') {
      const month = new Date(r.weekStart).getMonth() + 1;
      return month === period;
    }
    if (type === 'quarterly') {
      const month = new Date(r.weekStart).getMonth() + 1;
      const quarter = Math.ceil(month / 3);
      return quarter === period;
    }
    return true; // yearly
  });
}

function buildReportContext(
  reports: WeeklyReport[],
  categoryMap: Map<string, Category>,
): string {
  const lines: string[] = [];

  for (const report of reports.sort((a, b) => a.week - b.week)) {
    lines.push(`### W${report.week} 주간보고`);
    for (const item of report.items) {
      const cat = categoryMap.get(item.categoryId);
      const catName = cat?.name ?? '기타';
      const timeStr = item.timeSpent ? ` (${item.timeSpent}시간)` : '';
      lines.push(`- [${catName}][${item.importance}] ${item.content}${timeStr}`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

function getTypeLabel(type: ReportType): string {
  switch (type) {
    case 'monthly': return '월간';
    case 'quarterly': return '분기';
    case 'yearly': return '연간';
  }
}

function getPeriodLabel(type: ReportType, year: number, period: number): string {
  if (type === 'monthly') return `${year}년 ${period}월 월간`;
  if (type === 'quarterly') return `${year}년 Q${period} 분기`;
  return `${year}년 연간`;
}

function buildReportTitle(type: ReportType, year: number, period: number): string {
  return `${getPeriodLabel(type, year, period)} 리포트`;
}

export interface GenerateReportResult {
  content: string;
  sourceReportIds: string[];
  title: string;
}

/**
 * 월간/분기/연간 리포트를 AI로 생성합니다.
 * DB에서 해당 기간의 confirmed 주간보고를 조회하여 종합합니다.
 */
export async function generateReport(
  type: ReportType,
  year: number,
  period: number,
): Promise<GenerateReportResult> {
  const provider = createProvider(getActiveConfig());

  const allReports = await db.weeklyReports
    .where('year')
    .equals(year)
    .toArray();

  const confirmedReports = allReports.filter((r) => r.status === 'confirmed');
  const categories = await db.categories.toArray();
  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  const filteredReports = filterByPeriod(confirmedReports, type, period);

  if (filteredReports.length === 0) {
    throw new Error('해당 기간의 확인된 주간보고가 없습니다.');
  }

  const context = buildReportContext(filteredReports, categoryMap);
  const periodLabel = getPeriodLabel(type, year, period);
  const title = buildReportTitle(type, year, period);

  const systemPrompt = `당신은 업무 리포트를 종합하여 전문적인 보고서를 작성하는 전문가입니다.
마크다운 형식으로 다음 구조로 리포트를 작성하세요:

1. ## 개요 — 해당 기간의 전반적인 업무 요약 (기간, 총 업무 항목 수, 핵심 요약)
2. ## 카테고리별 상세 — 각 카테고리별 항목 목록, 비중(%), 주요 내용
3. ## 주요 성과 — 중요도 'high' 항목 중심의 핵심 성과
4. ## 시간 분석 — 카테고리별 시간 투입 분석 (시간 데이터가 있는 경우)
5. ## 인사이트 및 전망 — 업무 패턴 분석, 개선점, 다음 기간 제안

한국어로 작성하세요. 전문적이고 구체적으로 작성하세요. 마크다운만 출력하세요.`;

  const content = await provider.chat(
    systemPrompt,
    `${periodLabel} 리포트를 작성해주세요.\n\n${context}`,
    4096,
  );

  return {
    content,
    sourceReportIds: filteredReports.map((r) => r.id),
    title,
  };
}

export { buildReportTitle, getTypeLabel, getPeriodLabel };
