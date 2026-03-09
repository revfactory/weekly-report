---
name: weekpulse-build
description: "WeekPulse 프로젝트 빌드 오케스트레이터. 에이전트 팀을 조율하여 전체 서비스 구현. '빌드', '구현', '만들어줘' 요청 시 사용."
---

# WeekPulse Build — 오케스트레이터

에이전트 팀을 조율하여 WeekPulse 서비스를 구현하는 통합 스킬.

## 에이전트 팀 구성

| 에이전트 | 파일 | 역할 | 스킬 |
|---------|------|------|------|
| scaffolder | `.claude/agents/scaffolder.md` | 프로젝트 셋업, DB, 타입 | scaffold-weekpulse |
| ui-builder | `.claude/agents/ui-builder.md` | UI 컴포넌트, 페이지 | build-weekpulse-ui |
| ai-integrator | `.claude/agents/ai-integrator.md` | AI 서비스, 내보내기 | integrate-weekpulse-ai |
| qa-checker | `.claude/agents/qa-checker.md` | 품질 검증, 버그 수정 | check-weekpulse |

## 빌드 워크플로우

```
Phase 1 (순차)     Phase 2 (병렬)           Phase 3 (순차)
┌─────────────┐   ┌──────────────────┐     ┌─────────────┐
│  scaffolder  │──→│   ui-builder     │──┬─→│  qa-checker  │
│  (기반 구축) │   │   (UI 전체)      │  │  │  (검증/수정) │
└─────────────┘   ├──────────────────┤  │  └─────────────┘
                  │  ai-integrator   │──┘
                  │  (AI 서비스)     │
                  └──────────────────┘
```

### Phase 1: 기반 구축 (scaffolder)
```
Agent tool 호출:
- name: "scaffolder"
- prompt: ".claude/agents/scaffolder.md 에이전트 정의를 따르고, .claude/skills/scaffold-weekpulse/skill.md 스킬 절차대로 작업하세요. 스펙 파일: WEEK_REPORT_SPEC.md"
- mode: "auto"
```

**완료 확인:**
- `npm run dev` 정상 실행
- TypeScript 에러 0건
- 기본 카테고리 시드 동작

### Phase 2: 병렬 구현 (ui-builder + ai-integrator)
두 에이전트를 **동시에** 실행:

```
Agent tool 호출 1:
- name: "ui-builder"
- prompt: ".claude/agents/ui-builder.md 에이전트 정의를 따르고, .claude/skills/build-weekpulse-ui/skill.md 스킬 절차대로 작업하세요. 스펙 파일: WEEK_REPORT_SPEC.md"
- mode: "auto"

Agent tool 호출 2:
- name: "ai-integrator"
- prompt: ".claude/agents/ai-integrator.md 에이전트 정의를 따르고, .claude/skills/integrate-weekpulse-ai/skill.md 스킬 절차대로 작업하세요. 스펙 파일: WEEK_REPORT_SPEC.md"
- mode: "auto"
```

**CRITICAL:** 두 에이전트는 서로 다른 파일을 수정하므로 충돌 없음.
- ui-builder: components/, views/, stores/, styles/
- ai-integrator: services/, hooks/use-ai.ts, lib/export.ts

### Phase 3: 통합 검증 (qa-checker)
```
Agent tool 호출:
- name: "qa-checker"
- prompt: ".claude/agents/qa-checker.md 에이전트 정의를 따르고, .claude/skills/check-weekpulse/skill.md 스킬 절차대로 작업하세요. 스펙 파일: WEEK_REPORT_SPEC.md"
- mode: "auto"
```

**완료 확인:**
- `npm run build` 성공
- 모든 페이지 렌더링
- 검증 리포트 확인

## 개별 에이전트 실행

전체 빌드가 아닌 특정 작업만 필요할 때:

| 요청 | 실행 에이전트 |
|------|-------------|
| "셋업해줘", "프로젝트 생성" | scaffolder |
| "UI 구현해줘", "페이지 만들어줘" | ui-builder |
| "AI 연동해줘", "분류 기능 구현" | ai-integrator |
| "빌드 확인해줘", "검증해줘" | qa-checker |
| "전체 빌드", "다 만들어줘" | 전체 워크플로우 |

## 주의사항
- Phase 2의 두 에이전트는 반드시 **병렬** 실행 (성능 최적화)
- 각 에이전트는 `WEEK_REPORT_SPEC.md`를 반드시 먼저 읽어야 함
- Phase 간 이동 시 이전 Phase 완료 확인 필수
- 에이전트가 실패하면 에러 내용 확인 후 해당 에이전트만 재실행
