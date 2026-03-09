<project_specification>

<project_name>WeekPulse - 주간보고 자동 분류 및 리포트 생성 서비스</project_name>

<overview>
WeekPulse는 개인용 주간보고 관리 서비스입니다. 사용자가 자유 텍스트로 주간 업무 내용을 입력하면, Claude API를 활용하여 자동으로 카테고리를 분류하고, 누적된 데이터를 기반으로 월간/분기/연간 리포트를 자동 생성합니다.

핵심 워크플로우: (1) 주간보고 입력 → (2) AI 자동 카테고리 분류 → (3) 분류 결과 확인/수정 → (4) 저장 → (5) 대시보드에서 누적 현황 확인 → (6) 월간/분기/연간 리포트 생성 및 다운로드. 카테고리는 사용자가 커스텀으로 정의할 수 있으며, AI가 입력 내용을 분석하여 적절한 카테고리에 자동 매핑합니다.

CRITICAL: 개인용 로컬-우선 앱입니다. 데이터는 IndexedDB에 저장됩니다. 인증/계정 없이 동작합니다. Claude API 호출은 클라이언트에서 직접 수행하며, API 키는 사용자가 설정 화면에서 입력합니다. API 키는 localStorage에 저장됩니다.
</overview>

<scope_boundaries>
  <in_scope>
    - 주간보고 자유 텍스트 입력 (마크다운 지원)
    - Claude API 기반 자동 카테고리 분류
    - 커스텀 카테고리 관리 (CRUD)
    - AI 분류 결과 수동 수정 기능
    - 주간보고 CRUD (생성, 조회, 수정, 삭제)
    - 대시보드: 카테고리별 업무 분포, 주차별 추이 차트
    - 월간 리포트 자동 생성 (해당 월의 주간보고 종합)
    - 분기 리포트 자동 생성 (3개월 종합)
    - 연간 리포트 자동 생성 (12개월 종합)
    - 리포트 마크다운/PDF 다운로드
    - 다크/라이트 테마
    - 데이터 JSON 내보내기/가져오기 (백업)
  </in_scope>
  <out_of_scope>
    - 사용자 인증/계정 시스템
    - 클라우드 동기화, 멀티 디바이스
    - 팀/조직 공유 기능
    - 이메일 알림/리마인더
    - 모바일 네이티브 앱
    - 자체 AI 모델 (Claude API만 사용)
  </out_of_scope>
  <future_considerations>
    - 팀 공유 모드 (Phase 2)
    - 슬랙/노션 연동 (Phase 2)
    - 리포트 템플릿 커스터마이징 (Phase 2)
    - 목표(OKR) 연동 (Phase 3)
  </future_considerations>
</scope_boundaries>

<technology_stack>
  <frontend_application>
    <framework>React 19 with TypeScript 5.7</framework>
    <build_tool>Vite 6.1</build_tool>
    <styling>Tailwind CSS v4.0</styling>
    <routing>React Router v7.2 (hash-based routing)</routing>
    <state_management>Zustand v5.0 for UI state, Dexie.js liveQuery for data</state_management>
  </frontend_application>
  <data_layer>
    <database>IndexedDB via Dexie.js v4.0</database>
    <reactive_queries>dexie-react-hooks for live-updating queries</reactive_queries>
    <note>CRITICAL: 모든 데이터 IndexedDB 저장. 서버 없음. Claude API 호출만 외부 통신.</note>
  </data_layer>
  <ai_layer>
    <api>Anthropic Claude API (claude-sonnet-4-20250514)</api>
    <sdk>@anthropic-ai/sdk v0.39 (브라우저 직접 호출, dangerouslyAllowBrowser: true)</sdk>
    <note>API 키는 사용자가 설정에서 입력, localStorage 저장</note>
  </ai_layer>
  <libraries>
    <charts>Recharts v2.15 for dashboard visualizations</charts>
    <markdown>react-markdown v9.0 + remark-gfm for markdown rendering</markdown>
    <pdf>html2pdf.js v0.10 for PDF export</pdf>
    <dates>date-fns v4.1 for date formatting and calculations</dates>
    <icons>Lucide React v0.468 for icons</icons>
    <ids>nanoid v5.1 for generating unique IDs</ids>
  </libraries>
</technology_stack>

<prerequisites>
  <environment_setup>
    - Node.js v20+ and npm v10+
    - Anthropic API 키 (사용자 제공)
    - Modern browser with IndexedDB support
  </environment_setup>
  <build_configuration>
    - Vite with React plugin
    - TypeScript strict mode enabled
    - Tailwind CSS v4 with @tailwindcss/vite plugin
    - Path alias: @ → src/
  </build_configuration>
</prerequisites>

<environment_variables>
  <note>빌드 시 환경 변수 불필요. API 키는 런타임에 사용자가 설정 화면에서 입력하며 localStorage에 저장됨.</note>
</environment_variables>

<file_structure>
src/
├── app.tsx                        # Root component with router
├── main.tsx                       # Entry point
├── db/
│   ├── index.ts                   # Dexie database instance + schema
│   └── seed.ts                    # 기본 카테고리 시드 데이터
├── components/
│   ├── ui/                        # Reusable primitives
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── textarea.tsx
│   │   ├── modal.tsx
│   │   ├── badge.tsx
│   │   ├── card.tsx
│   │   ├── select.tsx
│   │   ├── tabs.tsx
│   │   ├── toast.tsx
│   │   └── empty-state.tsx
│   ├── layout/
│   │   ├── sidebar.tsx            # Navigation sidebar
│   │   ├── app-shell.tsx          # Sidebar + main layout
│   │   └── header.tsx             # View header with title
│   └── features/
│       ├── report-editor.tsx      # 주간보고 입력/편집 폼
│       ├── category-tag.tsx       # 카테고리 태그 컴포넌트
│       ├── category-manager.tsx   # 카테고리 CRUD 모달
│       ├── classification-result.tsx  # AI 분류 결과 표시/수정
│       ├── report-card.tsx        # 주간보고 목록 카드
│       ├── dashboard-charts.tsx   # 대시보드 차트 모음
│       ├── period-report.tsx      # 월간/분기/연간 리포트 뷰
│       └── report-export.tsx      # 마크다운/PDF 내보내기
├── views/
│   ├── write-view.tsx             # 주간보고 작성
│   ├── list-view.tsx              # 주간보고 목록
│   ├── detail-view.tsx            # 주간보고 상세
│   ├── dashboard-view.tsx         # 대시보드 (차트/통계)
│   ├── reports-view.tsx           # 월간/분기/연간 리포트
│   └── settings-view.tsx         # API 키, 카테고리 관리
├── services/
│   ├── ai-classifier.ts          # Claude API 호출 및 분류 로직
│   └── report-generator.ts       # 리포트 생성 로직 (AI 활용)
├── stores/
│   └── ui-store.ts               # Zustand: 사이드바 상태, 테마, 토스트
├── hooks/
│   ├── use-weekly-reports.ts      # Dexie liveQuery 래퍼
│   ├── use-categories.ts          # 카테고리 liveQuery 래퍼
│   └── use-ai.ts                  # AI 분류/리포트 생성 훅
├── lib/
│   ├── utils.ts                   # cn() helper, 날짜/주차 계산
│   ├── constants.ts               # 기본 카테고리, 색상 프리셋
│   └── export.ts                  # 마크다운/PDF 내보내기 유틸
├── types/
│   └── index.ts                   # 모든 타입 정의
└── styles/
    └── globals.css                # Tailwind imports
</file_structure>

<core_data_entities>
  <category>
    - id: string (nanoid, 21 chars)
    - name: string (required, max 50 chars) — 예: "개발", "회의", "기획", "리뷰", "학습"
    - color: string (hex code, default #3B82F6)
    - icon: string (lucide icon name, optional)
    - sortOrder: number
    - isDefault: boolean (기본 제공 카테고리 여부)
    - createdAt: Date
    Indexes: [sortOrder]
  </category>

  <weekly_report>
    - id: string (nanoid, 21 chars)
    - year: number (예: 2026)
    - week: number (ISO week number, 1-53)
    - weekStart: Date (해당 주 월요일)
    - weekEnd: Date (해당 주 일요일)
    - rawContent: string (사용자 입력 원문, max 10000 chars)
    - items: ReportItem[] (분류된 업무 항목 배열)
    - status: enum (draft, classified, confirmed) — draft: 입력만, classified: AI 분류 완료, confirmed: 사용자 확인 완료
    - createdAt: Date
    - updatedAt: Date
    Indexes: [year+week], [year], [status], [weekStart]
  </weekly_report>

  <report_item>
    (weekly_report.items 배열의 요소, 별도 테이블 아님)
    - id: string (nanoid)
    - content: string (업무 내용, max 500 chars)
    - categoryId: string (FK to category.id)
    - importance: enum (high, medium, low) — AI가 판단, 사용자 수정 가능
    - timeSpent: number | null (시간 단위, 선택적)
  </report_item>

  <generated_report>
    - id: string (nanoid, 21 chars)
    - type: enum (monthly, quarterly, yearly)
    - year: number
    - period: number (월: 1-12, 분기: 1-4, 연간: 해당 없음 0)
    - title: string (예: "2026년 3월 월간 리포트")
    - content: string (AI 생성 마크다운, max 50000 chars)
    - sourceReportIds: string[] (참조한 주간보고 ID 목록)
    - createdAt: Date
    - updatedAt: Date
    Indexes: [type+year+period], [year]
  </generated_report>

  <settings>
    (단일 레코드, key-value 형태)
    - id: string ("user-settings" 고정)
    - apiKey: string (Anthropic API 키, localStorage에 별도 저장)
    - theme: enum (light, dark, system)
    - defaultCategories: string[] (기본 카테고리 ID 목록)
    - reportLanguage: string ("ko" 고정, 향후 확장 가능)
  </settings>
</core_data_entities>

<route_definitions>
  <routes>
    <route path="/" redirect="/write" />
    <route path="/write" page="WriteView" />
    <route path="/write/:id" page="WriteView" />
    <route path="/list" page="ListView" />
    <route path="/list/:id" page="DetailView" />
    <route path="/dashboard" page="DashboardView" />
    <route path="/reports" page="ReportsView" />
    <route path="/reports/:type/:year/:period" page="ReportsView" />
    <route path="/settings" page="SettingsView" />
  </routes>
  <note>Hash-based routing (#/write) for static hosting compatibility.</note>
</route_definitions>

<component_hierarchy>
  <app>
    <theme_provider>
      <toast_provider>
        <router>
          <app_shell>
            <sidebar width="240px">
              <app_logo />               <!-- "WeekPulse" 로고 -->
              <nav_links>
                <nav_item icon="pen-line" label="보고 작성" path="/write" />
                <nav_item icon="list" label="보고 목록" path="/list" />
                <nav_item icon="bar-chart-3" label="대시보드" path="/dashboard" />
                <nav_item icon="file-text" label="리포트" path="/reports" />
              </nav_links>
              <divider />
              <sidebar_footer>
                <nav_item icon="settings" label="설정" path="/settings" />
                <theme_toggle />
              </sidebar_footer>
            </sidebar>
            <main_panel>
              <outlet />
            </main_panel>
          </app_shell>
        </router>
      </toast_provider>
    </theme_provider>
  </app>

  <shared>
    <modal />
    <confirm_dialog />
    <toast_container />
    <empty_state />
    <loading_spinner />
  </shared>
</component_hierarchy>

<pages_and_interfaces>
  <global_layout>
    <sidebar>
      - Fixed left panel, 240px width, full height
      - Background: #FAFAFA (light) / #141414 (dark)
      - Border-right: 1px solid #E5E7EB (light) / #2D2D2D (dark)
      - Logo: "WeekPulse" 20px / 700 weight, #2563EB accent color, 24px padding
      - Nav items: 40px height, 12px horizontal padding, 8px gap icon-label
      - Active state: background #EFF6FF (light) / #1E3A5F (dark), text #2563EB, left 3px border accent
      - Icon: 18px, label: 14px / 500
    </sidebar>
    <main_panel>
      - Flex-grow, padding: 32px
      - Max content width: 960px, centered
    </main_panel>
  </global_layout>

  <write_view>
    <header>
      - Title: "주간보고 작성" 24px / 700
      - Week selector: 현재 주차 자동 선택, 드롭다운으로 변경 가능 (예: "2026년 W10 (3/2 ~ 3/8)")
      - 기존 보고가 있으면 "수정 모드" 배지 표시
    </header>
    <editor_section>
      - Textarea: min-height 300px, 15px font, 줄간격 1.8
      - Placeholder: "이번 주에 수행한 업무를 자유롭게 작성하세요.\n\n예시:\n- 사용자 인증 모듈 개발 완료\n- 주간 스프린트 미팅 참석\n- 코드 리뷰 3건 수행\n- AWS 비용 최적화 방안 조사"
      - Markdown 지원 안내 텍스트 (12px #9CA3AF)
      - 글자 수 카운터 우하단 (12px #9CA3AF)
    </editor_section>
    <action_bar>
      - "AI 분류" 버튼: primary style, 40px height, Sparkles 아이콘
      - "임시 저장" 버튼: secondary style
      - AI 분류 버튼 클릭 시: 로딩 스피너 + "분류 중..." 텍스트
    </action_bar>
    <classification_result>
      - AI 분류 완료 후 표시되는 섹션
      - 각 항목: 카드 형태, 좌측 카테고리 태그 (컬러 배지), 우측 중요도 배지
      - 카테고리 태그 클릭: 드롭다운으로 카테고리 변경 가능
      - 중요도 클릭: high/medium/low 토글
      - 시간 입력 필드 (선택): number input, "시간" suffix
      - 항목 삭제: X 버튼, hover 시 표시
      - 항목 추가: "+ 항목 추가" 버튼 (수동 추가)
      - "확인 및 저장" 버튼: success style, 하단 고정
    </classification_result>
    <empty_state>
      - API 키 미설정 시: 경고 아이콘 + "API 키를 설정해주세요" + 설정 페이지 링크
    </empty_state>
  </write_view>

  <list_view>
    <header>
      - Title: "주간보고 목록" 24px / 700
      - 필터: 연도 선택 드롭다운
      - 정렬: 최신순 (기본) / 오래된순 토글
    </header>
    <report_list>
      - 카드 목록 형태, 각 카드:
        - 제목: "W10 (3/2 ~ 3/8)" 16px / 600
        - 상태 배지: draft(회색), classified(파란), confirmed(초록)
        - 카테고리 태그 미리보기: 최대 4개, 나머지 "+N" 표시
        - 항목 수: "8개 항목" 13px #9CA3AF
        - 작성일: "2026-03-08" 13px #9CA3AF
        - 카드 클릭: 상세 보기로 이동
        - Hover: shadow 증가, translateY(-1px), 150ms ease
    </report_list>
    <empty_state>
      - Icon: file-text (48px, #9CA3AF)
      - Title: "아직 작성된 주간보고가 없습니다" 18px / 600
      - Subtitle: "첫 번째 주간보고를 작성해보세요" 14px #9CA3AF
      - CTA button: "보고 작성하기" → /write
    </empty_state>
  </list_view>

  <detail_view>
    <header>
      - Title: "W10 (3/2 ~ 3/8)" 24px / 700
      - 상태 배지
      - 액션 버튼: "수정" (→ /write/:id), "삭제" (확인 다이얼로그), "내보내기" 드롭다운 (마크다운/PDF)
    </header>
    <content_section>
      - 원문 보기: 접을 수 있는 섹션, 마크다운 렌더링
      - 분류 결과: 카테고리별 그룹핑
        - 카테고리 헤더: 컬러 도트 + 카테고리명 + 항목 수
        - 각 항목: content + 중요도 배지 + 시간
      - 카테고리별 시간 합계 표시
    </content_section>
    <summary_stats>
      - 총 항목 수, 카테고리별 분포 미니 차트 (도넛), 총 시간
    </summary_stats>
  </detail_view>

  <dashboard_view>
    <header>
      - Title: "대시보드" 24px / 700
      - 기간 필터: "최근 4주" / "최근 12주" / "올해" / 커스텀 범위
    </header>
    <stats_cards>
      - 4개 카드 가로 배치 (반응형 그리드)
      - 총 보고 수, 총 항목 수, 가장 많은 카테고리, 평균 항목/주
      - 각 카드: 56px, 아이콘 + 숫자(28px/700) + 라벨(13px/#9CA3AF)
    </stats_cards>
    <charts_section>
      - 차트 1: 카테고리별 업무 분포 (도넛 차트, Recharts PieChart)
        - 카테고리 색상 사용, 범례 우측, 중앙에 총 항목 수
      - 차트 2: 주차별 업무량 추이 (라인 차트, Recharts LineChart)
        - X축: 주차 (W1, W2...), Y축: 항목 수
        - 카테고리별 라인 (멀티 시리즈)
      - 차트 3: 중요도별 분포 (스택 바 차트, Recharts BarChart)
        - 주차별 high/medium/low 스택
      - 각 차트: 카드 컨테이너, 24px padding, 타이틀 16px/600
    </charts_section>
    <empty_state>
      - "데이터가 부족합니다. 최소 2주 이상의 주간보고를 작성하면 대시보드가 활성화됩니다."
    </empty_state>
  </dashboard_view>

  <reports_view>
    <header>
      - Title: "리포트" 24px / 700
      - 탭: "월간" | "분기" | "연간" (Tabs 컴포넌트)
    </header>
    <period_selector>
      - 월간: 연도 + 월 선택 (2026년 3월)
      - 분기: 연도 + 분기 선택 (2026년 Q1)
      - 연간: 연도 선택 (2026년)
      - "리포트 생성" 버튼: primary style, AI 아이콘
      - 이미 생성된 리포트가 있으면 "재생성" 버튼으로 변경
    </period_selector>
    <report_content>
      - AI 생성 완료 후 표시
      - 마크다운 렌더링: 요약, 카테고리별 상세, 주요 성과, 시간 분석, 다음 기간 전망
      - 내보내기 버튼: 마크다운 다운로드 / PDF 다운로드
      - 로딩 상태: 스켈레톤 + "리포트 생성 중..." (AI 응답 스트리밍)
    </report_content>
    <generated_reports_list>
      - 이전에 생성한 리포트 목록
      - 각 항목: 타이틀 + 생성일 + 타입 배지
      - 클릭 시 해당 리포트 표시
    </generated_reports_list>
    <empty_state>
      - "해당 기간의 주간보고가 없습니다. 먼저 주간보고를 작성해주세요."
    </empty_state>
  </reports_view>

  <settings_view>
    <header>
      - Title: "설정" 24px / 700
    </header>
    <api_key_section>
      - Label: "Anthropic API Key"
      - Input: password type, 표시/숨기기 토글 (eye icon)
      - 설명: "Claude API를 사용하여 업무를 분류하고 리포트를 생성합니다." 13px #9CA3AF
      - "저장" 버튼
      - 연결 테스트: "API 연결 테스트" 버튼, 성공/실패 표시
    </api_key_section>
    <category_section>
      - Title: "카테고리 관리" 18px / 600
      - 카테고리 목록: 드래그 정렬 가능
      - 각 항목: 컬러 도트 + 이름 + 수정 버튼 + 삭제 버튼
      - "카테고리 추가" 버튼
      - 카테고리 편집 모달: 이름 입력 + 색상 프리셋 선택 (12색)
    </category_section>
    <data_section>
      - Title: "데이터 관리" 18px / 600
      - "데이터 내보내기" 버튼: JSON 다운로드
      - "데이터 가져오기" 버튼: JSON 파일 업로드
      - "모든 데이터 삭제" 버튼: danger style, 확인 다이얼로그
    </data_section>
  </settings_view>
</pages_and_interfaces>

<core_functionality>
  <weekly_report_management>
    - 작성: 자유 텍스트 입력, 마크다운 지원
    - 주차 자동 계산: ISO 8601 week number 기준, 월요일 시작
    - 중복 방지: 동일 연도+주차의 보고가 이미 있으면 수정 모드로 전환
    - 임시 저장: draft 상태로 저장 (AI 분류 전)
    - 삭제: 확인 다이얼로그 후 삭제
  </weekly_report_management>

  <ai_classification>
    - Claude API (claude-sonnet-4-20250514) 호출
    - 시스템 프롬프트: 사용자의 카테고리 목록 + 분류 규칙 포함
    - 입력: rawContent 텍스트
    - 출력: JSON 배열 [{content, categoryId, importance}]
    - 분류 후 사용자 검토/수정 단계 필수
    - API 키 없으면 수동 분류 모드 (카테고리 직접 선택)
    - 에러 처리: API 실패 시 토스트 알림, 수동 분류 유도
    - CRITICAL: 프롬프트에 카테고리 ID와 이름을 매핑하여 전달. AI 응답은 structured output (JSON)으로 받음.
  </ai_classification>

  <report_generation>
    - 월간: 해당 월의 모든 confirmed 주간보고를 종합
    - 분기: 해당 분기(3개월)의 모든 confirmed 주간보고를 종합
    - 연간: 해당 연도의 모든 confirmed 주간보고를 종합
    - Claude API 호출로 종합 리포트 마크다운 생성
    - 리포트 구조: 개요 → 카테고리별 상세 → 주요 성과 → 시간 분석 → 인사이트/전망
    - 생성된 리포트는 IndexedDB에 저장 (캐싱)
    - 재생성 가능 (이전 리포트 덮어쓰기)
  </report_generation>

  <category_management>
    - 기본 카테고리 제공: 개발, 회의, 기획, 리뷰, 학습, 운영, 커뮤니케이션, 기타
    - 커스텀 카테고리 추가/수정/삭제
    - 카테고리 삭제 시: 해당 카테고리의 항목은 "기타"로 이동
    - 12개 색상 프리셋 제공
  </category_management>

  <data_export>
    - 리포트 마크다운 다운로드: .md 파일
    - 리포트 PDF 다운로드: html2pdf.js로 변환
    - 전체 데이터 JSON 내보내기: 모든 보고 + 카테고리 + 리포트
    - JSON 가져오기: 파일 선택 → 유효성 검증 → 기존 데이터 병합 또는 덮어쓰기 선택
  </data_export>

  <data_persistence>
    - 모든 변경 즉시 IndexedDB 저장 (Dexie)
    - liveQuery로 UI 자동 갱신
    - API 키: localStorage("weekpulse-api-key")
    - 테마: localStorage("weekpulse-theme")
  </data_persistence>
</core_functionality>

<error_handling>
  <user_facing>
    <toast_notifications>
      - Success: #22C55E, 3초 자동 닫힘, 우하단
      - Error: #EF4444, 수동 닫힘, 우하단
      - Warning: #F59E0B, 5초 자동 닫힘, 우하단
      - Info: #3B82F6, 3초 자동 닫힘, 우하단
      - 최대 3개 스택
    </toast_notifications>
    <form_validation>
      - 주간보고 내용 필수: "내용을 입력해주세요"
      - 카테고리 이름 필수: "카테고리 이름을 입력해주세요"
      - API 키 형식 검증: "sk-ant-" 접두사 확인
    </form_validation>
    <error_states>
      - API 키 미설정: 경고 배너 + 설정 페이지 링크
      - API 호출 실패: "AI 분류에 실패했습니다. 수동으로 분류하거나 다시 시도해주세요."
      - API 키 유효하지 않음: "API 키가 유효하지 않습니다. 설정에서 확인해주세요."
      - IndexedDB 사용 불가: 전체 페이지 에러 메시지
      - 해당 기간 데이터 없음: 빈 상태 UI
    </error_states>
  </user_facing>
</error_handling>

<aesthetic_guidelines>
  <design_philosophy>
    깔끔하고 전문적인 업무 도구 느낌. 콘텐츠 중심, 넉넉한 여백. Notion과 Linear에서 영감을 받은 모던 미니멀 디자인.
  </design_philosophy>

  <color_palette>
    <light_theme>
      - Background: #FFFFFF
      - Sidebar bg: #FAFAFA
      - Surface: #F9FAFB
      - Border: #E5E7EB
      - Text primary: #111827
      - Text secondary: #6B7280
      - Text muted: #9CA3AF
      - Accent/Primary: #2563EB
      - Accent hover: #1D4ED8
      - Success: #22C55E
      - Warning: #F59E0B
      - Danger: #EF4444
    </light_theme>
    <dark_theme>
      - Background: #0F0F0F
      - Sidebar bg: #141414
      - Surface: #1A1A1A
      - Border: #2D2D2D
      - Text primary: #F9FAFB
      - Text secondary: #9CA3AF
      - Text muted: #6B7280
      - Accent/Primary: #60A5FA
      - Accent hover: #93C5FD
      - Success: #4ADE80
      - Warning: #FBBF24
      - Danger: #F87171
    </dark_theme>
    <category_color_presets>
      - #3B82F6 (Blue), #22C55E (Green), #EF4444 (Red), #F59E0B (Amber)
      - #8B5CF6 (Violet), #EC4899 (Pink), #14B8A6 (Teal), #F97316 (Orange)
      - #6366F1 (Indigo), #84CC16 (Lime), #06B6D4 (Cyan), #78716C (Stone)
    </category_color_presets>
    <importance_colors>
      - High: #EF4444
      - Medium: #F59E0B
      - Low: #3B82F6
    </importance_colors>
  </color_palette>

  <typography>
    <font_families>
      - Primary: "Pretendard", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif
      - Monospace: "JetBrains Mono", "Fira Code", monospace
    </font_families>
    <font_sizes>
      - Page title: 24px / 700
      - Section title: 18px / 600
      - Card title: 16px / 600
      - Body: 15px / 400
      - Small body: 14px / 400
      - Caption: 13px / 500
      - Badge: 12px / 500
    </font_sizes>
  </typography>

  <spacing>
    - Base unit: 4px
    - Scale: 4, 8, 12, 16, 20, 24, 32, 48, 64
  </spacing>

  <borders_and_shadows>
    <borders>
      - Default: 1px solid #E5E7EB (light) / #2D2D2D (dark)
      - Radius small: 6px (badges, inputs)
      - Radius medium: 8px (cards, buttons)
      - Radius large: 12px (modals, panels)
    </borders>
    <shadows>
      - Card: 0 1px 3px rgba(0,0,0,0.08)
      - Card hover: 0 4px 12px rgba(0,0,0,0.1)
      - Modal: 0 16px 48px rgba(0,0,0,0.16)
    </shadows>
  </borders_and_shadows>

  <animations>
    - Card hover: shadow transition 150ms ease, translateY(-1px)
    - Sidebar active: background 100ms ease
    - Modal open: fade-in + scale(0.95→1) 200ms ease-out
    - Modal close: fade-out + scale(1→0.95) 150ms ease-in
    - Toast slide-in: translateX(100%→0) 300ms ease-out
    - Classification result: stagger fade-in, 각 항목 50ms 간격
    - Loading spinner: rotate 360deg 1s linear infinite
  </animations>

  <responsive_design>
    <breakpoints>
      - mobile: 0–767px (사이드바 숨김, 햄버거 메뉴)
      - tablet: 768–1023px (접을 수 있는 사이드바)
      - desktop: 1024px+ (풀 레이아웃)
    </breakpoints>
    <mobile_adaptations>
      - Sidebar → 슬라이드인 드로어 (좌측, 오버레이)
      - 차트 → 1컬럼 세로 스택
      - 최소 탭 타겟: 44x44px
    </mobile_adaptations>
  </responsive_design>
</aesthetic_guidelines>

<security_considerations>
  <data_protection>
    - 모든 데이터 로컬 IndexedDB 저장, 서버 전송 없음
    - API 키만 외부 통신에 사용
    - CRITICAL: API 키는 localStorage에 저장. 사용자에게 "로컬 저장" 명시.
  </data_protection>
  <input_validation>
    - 주간보고 내용: max 10000 chars
    - 카테고리 이름: max 50 chars
    - HTML 태그 스트립 (XSS 방지)
    - AI 응답 JSON 파싱 시 try-catch 필수
  </input_validation>
  <api_security>
    - API 키는 CORS 문제로 클라이언트에서 직접 호출 시 dangerouslyAllowBrowser 사용
    - CRITICAL: 프로덕션 배포 시 프록시 서버 사용 권장 (MVP에서는 직접 호출 허용)
  </api_security>
</security_considerations>

<final_integration_test>
  <test_scenario_1>
    <description>첫 주간보고 작성 및 AI 분류</description>
    <steps>
      1. 앱 최초 진입 → 설정 페이지로 이동하여 API 키 입력
      2. API 연결 테스트 버튼 클릭 → 성공 토스트 확인
      3. "보고 작성" 페이지 이동 → 현재 주차 자동 표시 확인
      4. 텍스트 입력: "사용자 인증 모듈 개발\n주간 미팅 참석\n코드 리뷰 3건"
      5. "AI 분류" 버튼 클릭 → 로딩 상태 확인
      6. 분류 결과 표시: 3개 항목, 각각 카테고리 태그 표시 확인
      7. 첫 번째 항목 카테고리를 "개발"에서 "기획"으로 수동 변경
      8. "확인 및 저장" 클릭 → 성공 토스트 확인
      9. "보고 목록" 이동 → 방금 작성한 보고 카드 확인 (confirmed 상태)
    </steps>
  </test_scenario_1>

  <test_scenario_2>
    <description>대시보드 차트 확인</description>
    <steps>
      1. 최소 3주치 주간보고 작성 (시나리오 1 반복)
      2. 대시보드 페이지 이동
      3. 통계 카드 4개 값 확인 (총 보고 수 = 3)
      4. 도넛 차트: 카테고리별 분포 확인, 범례 확인
      5. 라인 차트: 3주치 추이 확인, X축 주차 표시
      6. 기간 필터 "최근 4주" 선택 → 차트 갱신 확인
    </steps>
  </test_scenario_2>

  <test_scenario_3>
    <description>월간 리포트 생성 및 내보내기</description>
    <steps>
      1. 리포트 페이지 이동 → "월간" 탭 선택
      2. 현재 연/월 선택
      3. "리포트 생성" 클릭 → 로딩 상태 확인
      4. AI 생성 마크다운 리포트 표시 확인
      5. 리포트 내용: 요약, 카테고리별 상세, 인사이트 포함 확인
      6. "마크다운 다운로드" 클릭 → .md 파일 다운로드 확인
      7. "PDF 다운로드" 클릭 → .pdf 파일 다운로드 확인
      8. 이전 생성 리포트 목록에 항목 추가 확인
    </steps>
  </test_scenario_3>

  <test_scenario_4>
    <description>데이터 백업 및 복원</description>
    <steps>
      1. 설정 → "데이터 내보내기" 클릭 → JSON 파일 다운로드
      2. "모든 데이터 삭제" 클릭 → 확인 다이얼로그 → 삭제
      3. 보고 목록 확인 → 빈 상태
      4. 설정 → "데이터 가져오기" → 다운로드한 JSON 선택
      5. 가져오기 완료 → 보고 목록에 이전 데이터 복원 확인
    </steps>
  </test_scenario_4>
</final_integration_test>

<success_criteria>
  <functionality>
    - 주간보고 CRUD 정상 동작
    - AI 분류가 입력 텍스트를 카테고리별로 올바르게 분류 (정확도 80% 이상)
    - 분류 결과 수동 수정 가능
    - 월간/분기/연간 리포트 생성 및 다운로드 정상 동작
    - 데이터 JSON 내보내기/가져오기 정상 동작
  </functionality>
  <user_experience>
    - 초기 로드 1.5초 이내
    - AI 분류 응답 10초 이내
    - 모든 인터랙션 60fps
    - 빈 상태/로딩 상태/에러 상태 모두 적절한 UI 표시
  </user_experience>
  <technical_quality>
    - TypeScript strict mode 에러 0건
    - 콘솔 에러/경고 0건 (프로덕션)
  </technical_quality>
  <build>
    - npm run build 정상 완료
    - 정적 호스팅 배포 가능 (Vercel, Netlify, GitHub Pages)
  </build>
</success_criteria>

<build_output>
  <build_command>npm run build</build_command>
  <output_directory>dist/</output_directory>
  <contents>index.html + JS/CSS 번들, 정적 호스팅 배포 가능</contents>
</build_output>

<key_implementation_notes>
  <critical_paths>
    1. Dexie.js 스키마 설계 — 모든 데이터의 기반
    2. Claude API 분류 프롬프트 — 분류 품질 결정
    3. 주차 계산 로직 — ISO 8601 기준 정확한 주차 산출
  </critical_paths>

  <recommended_implementation_order>
    1. 프로젝트 셋업 (Vite + React + Tailwind + TypeScript)
    2. Dexie 데이터베이스 스키마 + 기본 카테고리 시드
    3. App Shell 레이아웃 (사이드바 + 라우터)
    4. 설정 페이지 (API 키 입력 + 카테고리 관리)
    5. 주간보고 작성 페이지 (텍스트 입력 + 주차 선택)
    6. AI 분류 서비스 (Claude API 연동)
    7. 분류 결과 표시/수정 UI
    8. 주간보고 목록 + 상세 보기
    9. 대시보드 차트 (Recharts)
    10. 리포트 생성 (월간/분기/연간 AI 종합)
    11. 내보내기 (마크다운/PDF/JSON)
    12. 테마 토글 + 반응형
    13. 에러 처리, 빈 상태, 로딩 상태 폴리싱
  </recommended_implementation_order>

  <ai_classification_prompt>
    ```
    시스템 프롬프트:
    당신은 주간 업무 보고를 분석하여 카테고리별로 분류하는 전문가입니다.

    사용 가능한 카테고리:
    {{categories}} — [{id, name}] 형태로 전달

    규칙:
    1. 입력 텍스트를 개별 업무 항목으로 분리하세요.
    2. 각 항목을 가장 적합한 카테고리에 매핑하세요.
    3. 각 항목의 중요도(high/medium/low)를 판단하세요.
    4. JSON 배열로 응답하세요.

    응답 형식:
    [{"content": "업무 내용", "categoryId": "카테고리ID", "importance": "medium"}]
    ```
  </ai_classification_prompt>

  <database_schema>
    ```typescript
    import Dexie, { type EntityTable } from 'dexie';
    import type { Category, WeeklyReport, GeneratedReport } from '@/types';

    const db = new Dexie('WeekPulseDB') as Dexie & {
      categories: EntityTable<Category, 'id'>;
      weeklyReports: EntityTable<WeeklyReport, 'id'>;
      generatedReports: EntityTable<GeneratedReport, 'id'>;
    };

    db.version(1).stores({
      categories: 'id, sortOrder',
      weeklyReports: 'id, [year+week], year, status, weekStart',
      generatedReports: 'id, [type+year+period], year',
    });

    export { db };
    ```
  </database_schema>

  <performance_considerations>
    - AI 분류 시 로딩 상태 즉시 표시 (UX)
    - 대시보드 차트 데이터 계산은 useMemo로 캐싱
    - 리포트 생성 시 긴 텍스트 → 토큰 제한 고려 (max_tokens 4096)
    - IndexedDB 쿼리 최적화: compound index 활용
  </performance_considerations>
</key_implementation_notes>

</project_specification>
