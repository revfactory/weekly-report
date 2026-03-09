---
name: integrate-weekpulse-ai
description: "WeekPulse AI 서비스 구현. 멀티 프로바이더(Anthropic/OpenAI/Gemini) 분류, 리포트 생성, 내보내기 기능."
---

# Integrate WeekPulse AI

## 사전 조건
- scaffolder 에이전트가 완료된 상태
- `WEEK_REPORT_SPEC.md` 읽기 (ai_classification, report_generation, data_export 섹션 필수)
- `configure-ai-provider` 스킬 참조 (멀티 프로바이더 아키텍처)

## 아키텍처 개요

```
settings-view.tsx
  └─ ai-config.ts (프로바이더/모델/키 관리)

ai-classifier.ts ──┐
                    ├─ ai-provider.ts (추상화) ──┬─ AnthropicProvider
report-generator.ts┘                            ├─ OpenAIProvider
                                                 └─ GeminiProvider
```

## 작업 절차

### Step 1: 의존성 설치
```bash
npm install openai @google/generative-ai
```

### Step 2: 프로바이더 추상화 레이어
`configure-ai-provider` 스킬의 Step 2~5를 따라 구현:
- 타입 정의 (AIProviderType, AIModelInfo, AIProviderConfig)
- 상수 (프로바이더별 모델, 라벨)
- ai-config.ts (설정 관리)
- ai-provider.ts (프로바이더 팩토리)

### Step 3: 분류 서비스 (`src/services/ai-classifier.ts`)
```typescript
import { createProvider } from './ai-provider';
import { getActiveConfig } from '@/lib/ai-config';

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
      return items.map(item => ({
        id: nanoid(),
        content: item.content,
        categoryId: item.categoryId,
        importance: item.importance,
        timeSpent: null,
      }));
    } catch (err) {
      lastError = err;
      if (err instanceof SyntaxError || (err instanceof Error && err.message.startsWith('PARSE_ERROR'))) continue;
      throw err;
    }
  }
  throw lastError;
}

export async function testApiConnection(config?: AIProviderConfig): Promise<boolean> {
  try {
    const provider = createProvider(config ?? getActiveConfig());
    await provider.chat('You are a test assistant.', 'Hi', 10);
    return true;
  } catch {
    return false;
  }
}
```

### Step 4: 리포트 생성 서비스 (`src/services/report-generator.ts`)
- `createProvider(getActiveConfig())`로 교체
- `provider.chat(systemPrompt, userMessage, 4096)` 사용

### Step 5: React 훅 (`src/hooks/use-ai.ts`)
기존 useClassify, useGenerateReport 유지. 내부적으로 프로바이더 추상화 사용.

### Step 6: API 연결 테스트
```typescript
// config를 직접 받을 수 있어 설정 UI에서 저장 전 테스트 가능
export async function testApiConnection(config?: AIProviderConfig): Promise<boolean>
```

### Step 7: 내보내기 유틸리티 (`src/lib/export.ts`) — 변경 없음

### Step 8: 설정 UI 업데이트
`configure-ai-provider` 스킬의 Step 8을 따라 구현.

## 완료 조건
- classifyReport: 선택된 프로바이더로 텍스트 분류 동작
- generateReport: 선택된 프로바이더로 리포트 생성 동작
- testApiConnection: 프로바이더별 연결 테스트 동작
- 설정 UI: 프로바이더/모델/키 선택 및 저장 동작
- 내보내기: 마크다운/PDF/JSON 다운로드 동작 (변경 없음)
- 기존 Anthropic API 키 마이그레이션 동작
- 빌드 에러 없음
