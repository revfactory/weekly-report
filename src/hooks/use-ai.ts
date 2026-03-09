import { useState, useCallback } from 'react';
import { nanoid } from 'nanoid';
import { classifyReport } from '@/services/ai-classifier';
import { generateReport } from '@/services/report-generator';
import { db } from '@/db';
import type { Category, ReportItem, ReportType, GeneratedReport } from '@/types';

// ─── Error helpers ────────────────────────────────────────────────

type AIErrorCode = 'API_KEY_NOT_SET' | 'NETWORK_ERROR' | 'PARSE_ERROR' | 'NO_DATA' | 'UNKNOWN';

function resolveErrorCode(err: unknown): AIErrorCode {
  if (err instanceof Error) {
    if (err.message === 'API_KEY_NOT_SET') return 'API_KEY_NOT_SET';
    if (err.message.startsWith('PARSE_ERROR')) return 'PARSE_ERROR';
    if (err.message.includes('확인된 주간보고가 없습니다')) return 'NO_DATA';
    if (err.message.includes('network') || err.message.includes('fetch')) return 'NETWORK_ERROR';
  }
  return 'UNKNOWN';
}

function getErrorMessage(code: AIErrorCode, raw?: string): string {
  switch (code) {
    case 'API_KEY_NOT_SET':
      return 'API 키가 설정되지 않았습니다. 설정에서 API 키를 입력해주세요.';
    case 'NETWORK_ERROR':
      return '네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.';
    case 'PARSE_ERROR':
      return 'AI 응답을 파싱할 수 없습니다. 다시 시도해주세요.';
    case 'NO_DATA':
      return raw ?? '해당 기간의 확인된 주간보고가 없습니다.';
    case 'UNKNOWN':
      return raw ?? 'AI 처리에 실패했습니다. 다시 시도해주세요.';
  }
}

// ─── useClassify (= useAIClassification) ──────────────────────────

export function useClassify() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ReportItem[] | null>(null);

  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setResult(null);
  }, []);

  const classify = useCallback(
    async (
      rawContent: string,
      categories: Pick<Category, 'id' | 'name'>[],
    ): Promise<ReportItem[]> => {
      setIsLoading(true);
      setError(null);
      try {
        const items = await classifyReport(rawContent, categories);
        setResult(items);
        return items;
      } catch (err) {
        const code = resolveErrorCode(err);
        const msg = getErrorMessage(code, err instanceof Error ? err.message : undefined);
        setError(msg);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  return { classify, isLoading, error, result, reset };
}

// ─── useGenerateReport (= useAIReportGeneration) ─────────────────

export function useGenerateReport() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [content, setContent] = useState<string | null>(null);

  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setContent(null);
  }, []);

  const generate = useCallback(
    async (
      type: ReportType,
      year: number,
      period: number,
    ): Promise<GeneratedReport | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await generateReport(type, year, period);

        // Upsert: update existing or create new
        const existing = await db.generatedReports
          .where('[type+year+period]')
          .equals([type, year, period])
          .first();

        const now = new Date();
        const report: GeneratedReport = existing
          ? {
              ...existing,
              content: result.content,
              sourceReportIds: result.sourceReportIds,
              title: result.title,
              updatedAt: now,
            }
          : {
              id: nanoid(),
              type,
              year,
              period,
              title: result.title,
              content: result.content,
              sourceReportIds: result.sourceReportIds,
              createdAt: now,
              updatedAt: now,
            };

        await db.generatedReports.put(report);
        setContent(report.content);
        return report;
      } catch (err) {
        const code = resolveErrorCode(err);
        const msg = getErrorMessage(code, err instanceof Error ? err.message : undefined);
        setError(msg);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  return { generate, isLoading, error, content, reset };
}

// Backward-compatible aliases
export const useAIClassification = useClassify;
export const useAIReportGeneration = useGenerateReport;
