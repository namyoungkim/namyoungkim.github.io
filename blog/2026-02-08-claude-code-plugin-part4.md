---
slug: claude-code-plugin-part4
title: "[Claude Code Plugin 만들기 #4] 자기 개선 루프 — AI가 스스로 성장하게 만들기"
authors: namyoungkim
tags: [claude, claude-code, plugin, ai, dev-tools, tutorial]
---

> 이 글은 Claude Code Plugin 만들기 시리즈의 마지막 편입니다. Plugin이 시간이 지남에 따라 계속 발전하는 자기 개선 시스템을 구축하는 방법을 다룹니다.

---

## TL;DR

- Plugin은 한 번 만들고 끝이 아니라, 계속 발전시키는 것
- `/reflect` → `/harvest` → `/prune` 3단계 사이클로 지식 축적
- `docs/MISTAKES.md`와 `docs/PATTERNS.md`에 교훈을 체계적으로 기록
- scope 태그(`universal` vs `project-only`)로 지식의 재사용 범위를 결정
- 일관성 검증 스크립트로 설정 간 불일치 자동 감지

<!-- truncate -->

---

## Plugin이 끝이 아니라 시작이다

Plugin을 만들었으면 끝일까요? 아닙니다. 진짜 강력한 건 **AI가 경험에서 배우고 계속 성장하는 시스템**을 만드는 것입니다.

시험만 보고 끝내면 다음 시험도 같은 실수를 반복합니다. 하지만 틀린 문제를 오답노트에 정리하고, 반복되는 패턴을 분석하면? 계속 성장하게 됩니다.

**AI도 마찬가지입니다.** 한 번 설정해놓은 Plugin은 시간이 지나면서 버그, 패턴, 실수가 쌓입니다. 이걸 자동으로 정리하고 학습하게 만드는 게 자기 개선 루프입니다.

---

## 자기 개선 삼총사: Reflect → Harvest → Prune

세 가지 커맨드가 AI를 성장시킵니다.

### 1단계: /reflect — 오답노트 쓰기

매 세션이 끝나면 `/reflect`를 실행합니다.

```
Claude Code> /reflect
```

AI가 이번 세션에서 한 일, 실수, 배운 점을 분석합니다. 결과는 두 파일에 기록됩니다:

- **`docs/MISTAKES.md`** — 실수와 교훈
- **`docs/PATTERNS.md`** — 유용한 코드 패턴

예를 들어 이번 세션에서 "timeout 단위를 착각했다"면:

```markdown title="docs/MISTAKES.md"
### [2026-02-08] Hook timeout 단위 착각
- **scope**: universal
- **프로젝트**: leo-claude-plugin
- **상황**: hooks.json에서 timeout을 5000으로 설정
- **원인**: 밀리초로 착각했지만 실제 단위는 초
- **교훈**: ALWAYS hook timeout은 초 단위. 밀리초가 아님. 10초 = timeout: 10
- **관련 파일**: hooks/hooks.json
```

여기서 **scope 태그**가 중요합니다:
- `universal` — 모든 프로젝트에서 유용한 교훈
- `project-only` — 이 프로젝트에서만 해당하는 교훈

### 2단계: /harvest — 여러 프로젝트의 지식 수집

여러 프로젝트를 진행하다 보면 각 프로젝트의 `docs/MISTAKES.md`에 교훈이 쌓입니다.

```
Claude Code> /harvest
```

`/harvest`를 실행하면 `universal`로 태그된 항목들을 모아옵니다. 그리고 물어봅니다:

- "이걸 새로운 Skill로 추가할까요?"
- "CLAUDE.md에 규칙으로 넣을까요?"
- "Hook으로 자동화할까요?"

예를 들어, 여러 프로젝트에서 "timeout 단위 착각" 실수가 반복되면:
1. Skill에 timeout 가이드를 추가하거나
2. Hook에 timeout 값 검증 로직을 넣거나
3. CLAUDE.md에 "timeout은 초 단위" 규칙을 명시

**중요: 사람의 승인 후에만 반영합니다.** AI가 자동으로 설정을 바꾸면 위험하기 때문입니다.

### 3단계: /prune — 핵심만 남기고 정리

시간이 지나면 CLAUDE.md가 길어집니다. 규칙, 패턴, 주의사항이 계속 쌓이기 때문입니다.

```
Claude Code> /prune
```

CLAUDE.md를 **50줄 이내**로 유지하는 것이 목표입니다. 어떻게?

1. **긴 내용** → `docs/` 폴더로 이동
2. **자동화 가능한 검증** → Hook으로 전환
3. **중복되거나 불필요한 것** → 삭제

:::tip 비유
필기노트가 10페이지가 되면 핵심만 요약해서 1페이지 요약본을 만드는 것과 같습니다. CLAUDE.md는 요약본이고, docs/는 원본 노트입니다.
:::

---

## 문서 체계: 4개의 핵심 파일

자기 개선 시스템은 4개의 문서 파일로 구성됩니다.

```
docs/
├── MISTAKES.md              # 실수와 교훈 기록
├── PATTERNS.md              # 자주 쓰는 코드 패턴
├── ARCHITECTURE.md          # 아키텍처 결정 기록 (ADR)
└── CONVENTIONS.md           # 코딩 컨벤션
```

### MISTAKES.md — 실수 기록

```markdown
### [YYYY-MM-DD] 제목
- **scope**: universal | project-only
- **프로젝트**: {프로젝트명}
- **상황**: 무엇을 하다가 문제가 발생했는가
- **원인**: 근본 원인은 무엇이었는가
- **교훈**: ALWAYS/NEVER 형태로 작성
- **관련 파일**: 해당 파일 경로
```

`ALWAYS/NEVER` 형태로 교훈을 작성하면 Claude가 명확하게 규칙을 인식합니다.

- "ALWAYS hook timeout은 초 단위로 작성할 것"
- "NEVER `|| true`로 모든 에러를 삼키지 말 것"

### PATTERNS.md — 패턴 기록

```markdown
## 패턴 이름
- **scope**: universal | project-only
- **발견일**: YYYY-MM-DD
- **용도**: 언제 사용하는가
- **코드 예시**: (코드 블록)
- **주의사항**: 사용 시 유의할 점
```

반복적으로 사용하는 좋은 패턴을 기록합니다. 예를 들어 "도구 존재 여부 체크 후 실행" 패턴:

```bash
# 도구가 없으면 건너뛰고, 있으면 실행하는 표준 패턴
if command -v ruff >/dev/null 2>&1; then
  ruff format "$FILE"
fi
```

---

## 일관성 검증: validate.sh

자기 개선만큼 중요한 게 **일관성 유지**입니다. 하나를 바꿨는데 관련된 곳을 안 바꾸면 불일치가 생깁니다.

### 실수 사례: 버전 불일치

```json title="plugin.json"
{ "version": "2.0.0" }
```

```json title="marketplace.json"
{ "version": "1.5.0" }
```

"왜 업데이트가 안 되지?" 라고 헤매다가 버전이 달랐던 것을 발견. 이런 실수를 자동으로 잡기 위해 `validate.sh`를 만들었습니다.

### validate.sh가 검증하는 것들

```bash
./scripts/validate.sh
```

- plugin.json과 marketplace.json의 버전 일치 여부
- README.md에 기재된 스킬/커맨드 목록이 실제 파일과 일치하는지
- hooks.json의 timeout 값이 합리적인 범위인지
- 모든 스킬 파일에 필수 frontmatter가 있는지

**"하나 바꾸면 관련된 곳 전부 확인해야 합니다. 자동 검증 스크립트가 있으면 훨씬 편합니다."**

---

## 전체 프로젝트 리뷰: 부분만 보면 다 괜찮은데...

플러그인을 처음부터 끝까지 리뷰하면서 발견한 교훈들을 단계별로 정리합니다.

### Skills 리뷰

4개 언어(Python, TypeScript, Go, Rust) 표준 스킬의 구조가 제각각이었습니다.

**문제**: python-standards는 상세한데 go-standards는 간략하고, 각각 다른 형식을 씀
**해결**: 모든 언어 스킬의 구조를 통일

```
skills/<lang>-standards/
├── SKILL.md                    # 핵심 규칙 (동일 형식)
└── references/
    ├── claude-snippet.md       # CLAUDE.md용 조각
    ├── conventions-snippet.md  # 컨벤션 상세
    └── settings-snippet.json   # 설정 템플릿
```

### Commands 리뷰

**문제**: `/review` 커맨드 이름이 네이티브 명령어와 충돌
**해결**: `/code-review`로 변경 (2편에서 상세히 다룸)

### Hooks 리뷰

**문제**: `|| true` 패턴으로 진짜 에러까지 무시
**해결**: `if command -v; then ...; fi` 패턴으로 교체 (3편에서 상세히 다룸)

### 통합 리뷰

**문제**: 버전 불일치, README와 실제 파일 불일치, 경로 오류
**해결**: validate.sh로 자동 검증

:::warning 핵심 교훈
부분만 보면 괜찮아 보이는데, 전체를 보면 안 맞는 게 보입니다. 정기적인 전체 리뷰가 필요합니다.
:::

---

## CLAUDE.md에 자기 개선 규칙 넣기

AI가 자기 개선 루프를 자동으로 실행하게 만들려면, CLAUDE.md에 이런 규칙을 추가합니다:

```markdown title="CLAUDE.md"
## 자기 개선

- 세션 종료 전 `/reflect` 실행을 제안할 것
- 반복되는 실수 발견 시 CLAUDE.md 업데이트를 제안할 것
- 3회 이상 같은 파일 수정 시 설계 재검토를 제안할 것
```

이 세 줄이 전부입니다. 하지만 강력합니다.

AI가:
- 매 세션 마지막에 "지금 `/reflect` 실행해볼까요?"라고 제안
- 같은 실수를 반복하면 "이거 패턴인데, 규칙으로 만들까요?"라고 알림
- 같은 파일을 계속 수정하면 "설계부터 다시 봐야 할 것 같은데요?"라고 제안

---

## 자기 개선 사이클 전체 흐름

```
일상 개발
  │
  ├─ 세션 종료 → /reflect
  │    └─ MISTAKES.md, PATTERNS.md 업데이트
  │
  ├─ 주기적으로 → /harvest
  │    └─ universal 항목 수집 → 새 Skill, Hook, 규칙 제안
  │
  └─ CLAUDE.md 비대화 → /prune
       └─ 긴 내용 → docs/ 이동, 자동화 가능 → Hook 전환
```

이 사이클을 반복하면 Plugin은 점점 똑똑해집니다:

1. **1주차**: 기본 규칙만 있는 Plugin
2. **1개월 후**: 실수 10건 기록, 패턴 5개 발견
3. **3개월 후**: 반복 실수는 Hook으로 자동 방지, 핵심 패턴은 Skill로 정착

---

## 시리즈 마무리

4편에 걸쳐 Claude Code Plugin의 전체를 다뤘습니다.

| 편 | 제목 | 핵심 |
|---|------|------|
| 1편 | Plugin 입문 | Plugin 개념, 구조, 설치 |
| 2편 | 스킬과 커맨드 | SKILL.md 작성법, frontmatter, 호출 제어 |
| 3편 | 훅으로 자동화 | hooks.json, exit code, 실전 예시 |
| 4편 | 자기 개선 루프 | reflect/harvest/prune 사이클 |

### 핵심 메시지

**Plugin은 한 번 만들고 끝이 아니라, AI와 함께 계속 발전시키는 시스템입니다.**

처음에는 버그도 많고 규칙도 부족합니다. 하지만 `/reflect` → `/harvest` → `/prune` 사이클을 반복하면 점점 좋아집니다. 마치:

- 처음 배운 악기는 삑삑거립니다
- 연습하고, 실수를 기록하고, 반복하면
- 어느새 음악이 됩니다

AI도 그렇고, Plugin도 그렇습니다.

---

**Claude Code Plugin 만들기 시리즈**
- [1편: Plugin 입문](/blog/claude-code-plugin-part1)
- [2편: 스킬과 커맨드](/blog/claude-code-plugin-part2)
- [3편: 훅으로 자동화](/blog/claude-code-plugin-part3)
- [4편: 자기 개선 루프](/blog/claude-code-plugin-part4) ← 지금 읽는 글

GitHub: [github.com/namyoungkim/leo-claude-plugin](https://github.com/namyoungkim/leo-claude-plugin)
