---
name: build-weekpulse-ui
description: "WeekPulse UI 구현. 공통 컴포넌트, 6개 페이지, 차트, 테마, 반응형 구현."
---

# Build WeekPulse UI

## 사전 조건
- scaffolder 에이전트가 완료된 상태 (프로젝트 셋업, 타입, DB 완료)
- `WEEK_REPORT_SPEC.md` 읽기 (pages_and_interfaces, aesthetic_guidelines 섹션 필수)

## 작업 절차

### Step 1: 테마 시스템
`src/stores/ui-store.ts`에 테마 로직 추가:
- localStorage("weekpulse-theme")에서 읽기
- system/light/dark 지원
- HTML root에 `dark` class 토글
- Tailwind dark mode: class 전략

### Step 2: 공통 UI 컴포넌트 (`src/components/ui/`)
스펙의 aesthetic_guidelines 참조하여 구현:

| 컴포넌트 | 핵심 요소 |
|---------|----------|
| button.tsx | variant(primary/secondary/danger/ghost), size(sm/md/lg), loading 상태 |
| input.tsx | label, error 메시지, 아이콘 |
| textarea.tsx | auto-resize, 글자수 카운터, min-height 300px |
| modal.tsx | 오버레이, scale 애니메이션, ESC 닫기 |
| badge.tsx | variant(카테고리/상태/중요도), 컬러 지원 |
| card.tsx | hover shadow 전환, 클릭 가능 |
| select.tsx | 드롭다운, 컬러 도트 지원 |
| tabs.tsx | 활성 탭 인디케이터 |
| toast.tsx | success/error/warning/info, 자동 닫힘, 스택 3개 |
| empty-state.tsx | 아이콘 + 제목 + 설명 + CTA 버튼 |

### Step 3: 레이아웃 (`src/components/layout/`)
- `app-shell.tsx`: Sidebar(240px) + Main Panel, 반응형
- `sidebar.tsx`: 로고, 네비게이션(4개), 설정, 테마 토글
  - 활성 상태: 좌측 3px accent border + 배경색
  - 모바일: 슬라이드인 드로어 (오버레이)
- `header.tsx`: 페이지 타이틀 + 우측 액션 영역

### Step 4: 페이지 구현 — WriteView (`src/views/write-view.tsx`)
스펙의 write_view 섹션 참조:
- 주차 선택 드롭다운 (현재 주 기본값)
- 텍스트에어리어 (마크다운 입력)
- "AI 분류" 버튼 (로딩 상태: 스피너 + "분류 중...")
- 분류 결과 섹션 (`src/components/features/classification-result.tsx`):
  - 각 항목: 카드, 카테고리 태그(변경 가능), 중요도 배지(토글), 시간 입력
  - 항목 추가/삭제
  - "확인 및 저장" 버튼
- API 키 미설정 시 경고 배너

### Step 5: 페이지 구현 — ListView (`src/views/list-view.tsx`)
- 연도 필터 드롭다운
- 카드 목록: 주차 제목, 상태 배지, 카테고리 태그 미리보기, 항목 수
- 카드 hover 애니메이션
- 빈 상태 UI

### Step 6: 페이지 구현 — DetailView (`src/views/detail-view.tsx`)
- 원문 보기 (접기/펼치기)
- 카테고리별 그룹핑 표시
- 요약 통계 (도넛 미니 차트)
- 수정/삭제/내보내기 액션

### Step 7: 페이지 구현 — DashboardView (`src/views/dashboard-view.tsx`)
- 통계 카드 4개 (그리드)
- 기간 필터 드롭다운
- Recharts 차트 3종:
  1. PieChart (도넛) — 카테고리별 분포, 카테고리 색상 사용
  2. LineChart — 주차별 업무량 추이, 멀티 시리즈
  3. BarChart (스택) — 중요도별 분포
- 데이터 부족 시 빈 상태

### Step 8: 페이지 구현 — ReportsView (`src/views/reports-view.tsx`)
- 탭: 월간 / 분기 / 연간
- 기간 선택기 (탭별 다른 UI)
- "리포트 생성" 버튼 (로딩: 스켈레톤)
- 생성된 리포트: react-markdown 렌더링
- 내보내기 버튼 (마크다운/PDF)
- 이전 리포트 목록

### Step 9: 페이지 구현 — SettingsView (`src/views/settings-view.tsx`)
- API 키 입력 (password type, 토글, 연결 테스트)
- 카테고리 관리 (목록, 추가/수정/삭제 모달, 색상 선택)
- 데이터 관리 (내보내기/가져오기/전체 삭제)

### Step 10: 반응형 + 폴리싱
- 모바일(~767px): 사이드바 드로어, 1컬럼
- 태블릿(768~1023px): 접기 사이드바
- 스펙의 animations 섹션 구현
- 모든 인터랙티브 요소 focus 인디케이터

## 완료 조건
- 6개 페이지 모두 렌더링 (데이터 없어도 빈 상태 표시)
- 다크/라이트 테마 토글 동작
- 모바일 반응형 동작
- 토스트 알림 동작
