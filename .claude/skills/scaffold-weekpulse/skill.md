---
name: scaffold-weekpulse
description: "WeekPulse 프로젝트 초기 셋업. Vite+React+Tailwind 생성, DB 스키마, 타입, 라우팅 구성."
---

# Scaffold WeekPulse

## 사전 조건
- `WEEK_REPORT_SPEC.md` 읽기 (technology_stack, core_data_entities, file_structure 섹션 필수)

## 작업 절차

### Step 1: 프로젝트 생성
```bash
npm create vite@latest . -- --template react-ts
npm install
```

### Step 2: 의존성 설치
```bash
# Core
npm install react-router-dom zustand dexie dexie-react-hooks

# AI
npm install @anthropic-ai/sdk

# UI
npm install recharts react-markdown remark-gfm lucide-react

# Utilities
npm install date-fns nanoid html2pdf.js

# Dev
npm install -D @tailwindcss/vite tailwindcss
```

### Step 3: 설정 파일
1. `vite.config.ts` — React plugin + Tailwind plugin + path alias (@→src)
2. `tsconfig.json` — strict mode, paths alias
3. `src/styles/globals.css` — Tailwind v4 imports (@import "tailwindcss")
4. `index.html` — Pretendard 폰트 CDN link

### Step 4: 타입 정의 (`src/types/index.ts`)
스펙의 core_data_entities를 TypeScript 타입으로 변환:
- `Category`, `WeeklyReport`, `ReportItem`, `GeneratedReport`, `Settings`
- 모든 enum은 union type으로 (예: `'draft' | 'classified' | 'confirmed'`)

### Step 5: DB 스키마 (`src/db/index.ts`)
스펙의 database_schema 코드를 기반으로 Dexie 인스턴스 생성.
- categories, weeklyReports, generatedReports 테이블
- 스펙에 명시된 인덱스 반영

### Step 6: 시드 데이터 (`src/db/seed.ts`)
기본 카테고리 8개 생성 함수:
| 이름 | 색상 |
|------|------|
| 개발 | #3B82F6 |
| 회의 | #F59E0B |
| 기획 | #8B5CF6 |
| 리뷰 | #22C55E |
| 학습 | #06B6D4 |
| 운영 | #F97316 |
| 커뮤니케이션 | #EC4899 |
| 기타 | #78716C |

앱 최초 실행 시 카테고리가 비어있으면 시드 실행.

### Step 7: 유틸리티 (`src/lib/`)
- `utils.ts`: cn() (clsx 대체), ISO 주차 계산, 주 시작/종료일 계산
- `constants.ts`: 카테고리 색상 프리셋, 중요도 색상, 기본값

### Step 8: 라우팅 + App Shell 골격
- `src/app.tsx`: HashRouter + Routes 정의 (스펙의 route_definitions)
- `src/main.tsx`: 엔트리포인트
- `src/stores/ui-store.ts`: Zustand 스토어 (sidebarOpen, theme, toast)
- `src/hooks/use-weekly-reports.ts`: Dexie liveQuery 래퍼
- `src/hooks/use-categories.ts`: 카테고리 liveQuery 래퍼

### Step 9: 플레이스홀더 파일
file_structure의 모든 파일을 빈 컴포넌트 또는 빈 함수로 생성.
```tsx
// 예: src/views/write-view.tsx
export default function WriteView() {
  return <div>WriteView</div>;
}
```

### Step 10: 검증
```bash
npx tsc --noEmit  # 타입 에러 0건
npm run dev        # 정상 실행 확인
```

## 완료 조건
- `npm run dev` 실행 시 브라우저에서 사이드바 + 메인 패널 골격 표시
- 모든 라우트 네비게이션 동작
- DB 초기화 + 기본 카테고리 시드 완료
- TypeScript strict mode 에러 0건
