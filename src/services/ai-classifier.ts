import { nanoid } from 'nanoid';
import type { Category, ClassificationResultItem, ReportItem, AIProviderConfig } from '@/types';
import { createProvider, SAFE_TEST_MODELS } from './ai-provider';
import { getActiveConfig } from '@/lib/ai-config';

function buildSystemPrompt(categories: Pick<Category, 'id' | 'name'>[]): string {
  const categoryList = categories.map((c) => `- ID: "${c.id}", 이름: "${c.name}"`).join('\n');
  return `당신은 주간 업무 보고를 분석하여 카테고리별로 분류하는 전문가입니다.

사용 가능한 카테고리:
${categoryList}

규칙:
1. 입력 텍스트를 개별 업무 항목으로 분리하세요.
2. 각 항목을 가장 적합한 카테고리에 매핑하세요.
3. 각 항목의 중요도(high/medium/low)를 판단하세요.
4. 반드시 유효한 JSON 배열로만 응답하세요. 다른 텍스트를 포함하지 마세요.

응답 형식:
[{"content": "업무 내용", "categoryId": "카테고리ID", "importance": "medium"}]`;
}

function parseClassificationResponse(text: string): ClassificationResultItem[] {
  let jsonStr = text.trim();

  const fenceMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) {
    jsonStr = fenceMatch[1].trim();
  } else {
    const arrayMatch = jsonStr.match(/\[[\s\S]*\]/);
    if (arrayMatch) {
      jsonStr = arrayMatch[0];
    }
  }

  const parsed = JSON.parse(jsonStr);
  if (!Array.isArray(parsed)) {
    throw new Error('PARSE_ERROR: AI 응답이 배열 형식이 아닙니다.');
  }

  return parsed.map((item: Record<string, unknown>) => ({
    content: String(item.content || ''),
    categoryId: String(item.categoryId || ''),
    importance: (['high', 'medium', 'low'].includes(item.importance as string)
      ? (item.importance as 'high' | 'medium' | 'low')
      : 'medium'),
  }));
}

/**
 * 주간보고 텍스트를 AI로 카테고리별 분류합니다.
 * JSON 파싱 실패 시 1회 재시도합니다.
 */
export async function classifyReport(
  rawContent: string,
  categories: Pick<Category, 'id' | 'name'>[],
): Promise<ReportItem[]> {
  const provider = createProvider(getActiveConfig());
  const systemPrompt = buildSystemPrompt(categories);

  let lastError: unknown;

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const text = await provider.chat(systemPrompt, rawContent, 2048);
      const items = parseClassificationResponse(text);

      return items.map((item) => ({
        id: nanoid(),
        content: item.content,
        categoryId: item.categoryId,
        importance: item.importance,
        timeSpent: null,
      }));
    } catch (err) {
      lastError = err;
      if (
        err instanceof SyntaxError ||
        (err instanceof Error && err.message.startsWith('PARSE_ERROR'))
      ) {
        continue;
      }
      throw err;
    }
  }

  throw lastError;
}

/**
 * API 연결 테스트. config를 지정하면 해당 설정으로 테스트합니다.
 */
export async function testApiConnection(config?: AIProviderConfig): Promise<boolean> {
  try {
    const cfg = config ?? getActiveConfig();
    // 테스트 시 안전한 모델 사용 (존재가 확실한 모델)
    const testConfig = {
      ...cfg,
      model: SAFE_TEST_MODELS[cfg.provider] ?? cfg.model,
    };
    const provider = createProvider(testConfig);
    await provider.chat('You are a test assistant.', 'Hi', 1024);
    return true;
  } catch {
    return false;
  }
}
