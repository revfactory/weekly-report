---
name: check-weekpulse
description: "WeekPulse 품질 검증. 빌드, 타입, 스펙 준수 확인 및 버그 수정."
---

# Check WeekPulse

## 사전 조건
- 모든 에이전트(scaffolder, ui-builder, ai-integrator) 작업 완료
- `WEEK_REPORT_SPEC.md` 참조

## 검증 절차

### Step 1: 빌드 검증
```bash
npx tsc --noEmit 2>&1     # TypeScript 타입 에러
npm run build 2>&1          # Vite 빌드
```
- 에러 발견 시 직접 수정
- import 누락, 타입 불일치, 미사용 변수 등

### Step 2: 라우트 검증
`WEEK_REPORT_SPEC.md`의 route_definitions와 대조:
- [ ] / → /write 리다이렉트
- [ ] /write — WriteView
- [ ] /write/:id — WriteView (수정 모드)
- [ ] /list — ListView
- [ ] /list/:id — DetailView
- [ ] /dashboard — DashboardView
- [ ] /reports — ReportsView
- [ ] /reports/:type/:year/:period — ReportsView
- [ ] /settings — SettingsView

### Step 3: 데이터 엔티티 검증
타입 파일과 스펙 대조:
- [ ] Category: 모든 필드 존재
- [ ] WeeklyReport: 모든 필드 + status enum
- [ ] ReportItem: 모든 필드 + importance enum
- [ ] GeneratedReport: 모든 필드 + type enum

### Step 4: UI 검증
각 페이지 확인:
- [ ] WriteView: 텍스트 입력, 주차 선택, AI 분류 버튼, 결과 표시
- [ ] ListView: 카드 목록, 연도 필터, 빈 상태
- [ ] DetailView: 원문, 카테고리 그룹, 액션 버튼
- [ ] DashboardView: 통계 카드 4개, 차트 3종, 빈 상태
- [ ] ReportsView: 탭 3개, 기간 선택, 마크다운 렌더, 빈 상태
- [ ] SettingsView: API 키, 카테고리 관리, 데이터 관리

### Step 5: 기능 검증
- [ ] 테마 토글 (light/dark/system)
- [ ] 토스트 알림 (success/error)
- [ ] 사이드바 네비게이션
- [ ] 반응형 (모바일 드로어)

### Step 6: 수정 사항 적용
발견된 모든 문제를 직접 수정하고 다시 빌드 확인.

## 출력
검증 리포트를 마크다운으로 작성하여 콘솔에 출력.
