---
name: configure-ai-provider
description: "WeekPulse 멀티 AI 프로바이더 설정 구현. Anthropic/OpenAI/Gemini 프로바이더 선택, 모델 선택, API 키 관리."
---

# Configure AI Provider

멀티 AI 프로바이더(Anthropic, OpenAI, Gemini)를 지원하도록 서비스 레이어와 설정 UI를 구현합니다.

## 사전 조건
- 기존 멀티 프로바이더 서비스 레이어가 동작하는 상태
- `openai`, `@google/generative-ai` 이미 설치됨

## UX 설계 원칙

### 핵심: 2단계 분리
1. **사용할 프로바이더 선택** (상단): 활성 프로바이더 + 모델 선택
2. **API 키 관리** (하단): 모든 프로바이더의 키를 한눈에 관리

### UX 규칙
- 키 미등록 프로바이더도 활성 선택은 가능 (사용 시 에러로 안내)
- 각 프로바이더의 키 상태(등록됨/미등록)를 항상 표시
- 키 입력은 인라인 확장 (모달 없이)
- 키 저장은 프로바이더별 독립 (즉시 저장)
- 프로바이더/모델 변경은 즉시 반영 (별도 저장 버튼 없음)
- 연결 테스트는 해당 프로바이더의 키+선택된 모델로 수행

## 설정 UI 구조 (`src/views/settings-view.tsx`)

### 영역 1: 사용할 프로바이더 (상단)
```
┌─ 사용할 프로바이더 ─────────────────────────────────────────┐
│ ○ Anthropic    ● OpenAI       ○ Gemini                    │
│                                                            │
│ 모델                                                       │
│ ┌──────────────────┐ ┌──────────────────┐                 │
│ │ ● GPT-5.4        │ │ ○ GPT-5.4 Pro    │                 │
│ │   추천 · 균형     │ │   고성능          │                 │
│ └──────────────────┘ └──────────────────┘                 │
│ ┌──────────────────┐ ┌──────────────────┐ ┌────────────┐ │
│ │ ○ GPT-5 Mini     │ │ ○ o4 Mini        │ │ ○ o3 Pro   │ │
│ │   빠름 · 경제적   │ │   추론 특화       │ │   추론 최강  │ │
│ └──────────────────┘ └──────────────────┘ └────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

- **라디오 버튼 그룹**: 3개 프로바이더 중 하나 선택
- 선택 변경 시 `setActiveProvider()` + 모델 자동 업데이트
- **모델 라디오 카드**: 2~3열 그리드, 모델명 + 특성 태그 표시
- 모델 변경 시 `setActiveModel()` 즉시 반영
- Dropdown 대신 라디오 카드: 옵션 3~5개 수준에서 한눈에 비교 가능

### 영역 2: API 키 관리 (하단)
```
┌─ API 키 관리 ──────────────────────────────────────┐
│                                                    │
│  Anthropic     ● 등록됨     [키 변경] [테스트]      │
│  ───────────────────────────────────────────────   │
│  OpenAI        ● 등록됨     [키 변경] [테스트]      │
│  ───────────────────────────────────────────────   │
│  Gemini        ○ 미등록     [키 등록]              │
│                                                    │
└────────────────────────────────────────────────────┘
```

각 프로바이더 행:
- **프로바이더명**: 텍스트
- **상태 뱃지**:
  - `● 등록됨` (초록 dot + text-success)
  - `○ 미등록` (회색 dot + text-muted)
- **액션 버튼**:
  - 키 있을 때: `[키 변경]` `[테스트]`
  - 키 없을 때: `[키 등록]`

### 영역 2-1: 인라인 키 편집 (확장)
키 등록/변경 클릭 시 해당 행이 확장:

```
│  Anthropic     ● 등록됨     [취소]                  │
│  ┌───────────────────────────────────┐ 👁          │
│  │ sk-ant-...                        │             │
│  └───────────────────────────────────┘             │
│  [저장] [연결 테스트]  ✅ 연결 성공                   │
│  ───────────────────────────────────────────────   │
```

- Input: type=password, 프로바이더별 placeholder
- 👁 토글: 키 표시/숨김
- [저장]: `saveApiKey(provider, key)` 호출 후 접기
- [연결 테스트]: 해당 프로바이더+현재 활성 모델로 테스트
- 성공/실패 인라인 표시
- [취소]: 변경 취소 후 접기

### 하단 안내
```
ⓘ API 키는 브라우저 로컬 스토리지에만 저장됩니다.
```

## 상태 관리

```typescript
// 활성 프로바이더/모델: 변경 즉시 localStorage 반영 (저장 버튼 없음)
const [activeProvider, setActiveProviderState] = useState(getActiveProvider);
const [activeModel, setActiveModelState] = useState(getActiveModel);

// 키 편집 상태: 어떤 프로바이더가 편집 중인지
const [editingProvider, setEditingProvider] = useState<AIProviderType | null>(null);
const [editKey, setEditKey] = useState('');
const [showEditKey, setShowEditKey] = useState(false);
const [testingProvider, setTestingProvider] = useState<AIProviderType | null>(null);
const [testResults, setTestResults] = useState<Record<string, boolean | null>>({});

// 각 프로바이더의 키 등록 여부 (렌더링용)
const keyStatuses = useMemo(() => ({
  anthropic: !!getApiKey('anthropic'),
  openai: !!getApiKey('openai'),
  gemini: !!getApiKey('gemini'),
}), [editingProvider]); // editingProvider 변경 시 재계산
```

## 완료 조건
- [ ] 프로바이더 선택: 라디오 버튼, 즉시 반영
- [ ] 모델 선택: 활성 프로바이더 모델 목록, 즉시 반영
- [ ] API 키 관리: 3개 프로바이더 상태 한눈에 표시
- [ ] 인라인 키 편집: 모달 없이 행 확장
- [ ] 키 저장: 프로바이더별 독립 즉시 저장
- [ ] 연결 테스트: 프로바이더별 독립 테스트
- [ ] 키 없는 프로바이더도 선택 가능
- [ ] 빌드 에러 없음
