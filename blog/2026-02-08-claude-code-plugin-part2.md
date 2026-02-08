---
slug: claude-code-plugin-part2
title: "[Claude Code Plugin 만들기 #2] 스킬과 커맨드 — AI에게 새 능력 가르치기"
authors: namyoungkim
tags: [claude, claude-code, plugin, ai, dev-tools, tutorial]
---

> 이 글은 Claude Code Plugin 만들기 시리즈의 두 번째 편입니다. Skill과 Command를 직접 만드는 방법, SKILL.md frontmatter 옵션, 그리고 실수 사례를 다룹니다.

---

## TL;DR

- Skill = SKILL.md 파일 하나로 Claude에게 배경 지식을 가르치는 것
- Command와 Skill은 공식적으로 통합됨 — 둘 다 `/skill-name`으로 호출
- frontmatter의 `user-invocable`, `disable-model-invocation`으로 호출 방식 제어
- `references/` 패턴으로 긴 내용을 분리하여 컨텍스트 효율 극대화

<!-- truncate -->

---

## Skill 만들기: AI의 참고서

Skill은 Claude Code가 자동으로 참고하는 참고서입니다. 특정 상황에서 "이 규칙이 있었지"라고 Claude가 알아서 떠올리게 만듭니다.

### SKILL.md 기본 구조

모든 Skill은 디렉토리 안의 `SKILL.md` 파일로 정의됩니다.

```
skills/
└── python-standards/
    └── SKILL.md          # 필수
```

SKILL.md는 YAML frontmatter로 시작합니다.

```yaml title="skills/python-standards/SKILL.md"
---
name: python-standards
description: "Python 프로젝트 감지 시 uv + ruff + pytest 규칙 적용"
user-invocable: false
---

Python 프로젝트를 다룰 때는 항상:
- uv를 패키지 매니저로 사용합니다.
- ruff로 코드 스타일을 검사합니다.
- pytest를 테스트 프레임워크로 사용합니다.
```

`description`은 Claude가 "이 Skill을 언제 써야 하는지" 판단하는 기준입니다. 명확하게 작성할수록 적절한 시점에 적용됩니다.

---

## SKILL.md Frontmatter 완전 정복

공식 문서 기준으로, 사용 가능한 frontmatter 필드를 모두 정리합니다.

### 필드 목록

| 필드 | 필수 | 설명 |
|------|------|------|
| `name` | 아니오 | 스킬 이름. 생략하면 디렉토리명 사용. 소문자, 숫자, 하이픈만 |
| `description` | 권장 | 무엇을 하는 스킬인지, 언제 사용하는지 |
| `user-invocable` | 아니오 | `false`면 `/` 메뉴에서 숨김. 기본값: `true` |
| `disable-model-invocation` | 아니오 | `true`면 Claude가 자동 로딩하지 않음. 기본값: `false` |
| `argument-hint` | 아니오 | 자동완성 시 표시되는 힌트. 예: `[issue-number]` |
| `allowed-tools` | 아니오 | 스킬 활성 시 허용할 도구 목록 |
| `model` | 아니오 | 스킬 활성 시 사용할 모델 |
| `context` | 아니오 | `fork`으로 설정하면 서브에이전트에서 실행 |
| `agent` | 아니오 | `context: fork` 시 사용할 에이전트 타입 |
| `hooks` | 아니오 | 스킬 라이프사이클에 스코프된 hooks |

### 호출 제어: 3가지 모드

frontmatter 조합에 따라 Skill의 동작이 달라집니다.

| 설정 | 사용자 호출 | Claude 자동 호출 | 용도 |
|------|-----------|-----------------|------|
| 기본값 (설정 없음) | O | O | 범용 스킬 |
| `disable-model-invocation: true` | O | X | 수동 전용 워크플로우 |
| `user-invocable: false` | X | O | 배경 지식, 자동 규칙 |

#### 모드 1: 기본값 — 누구나 부를 수 있는 스킬

```yaml
---
name: code-review
description: "코드 변경사항에 대한 리뷰"
---
```

사용자가 `/code-review`로 호출할 수도 있고, Claude가 상황에 맞다고 판단하면 자동으로 참고할 수도 있습니다.

#### 모드 2: 수동 전용 — 명시적으로 불러야 하는 스킬

```yaml
---
name: product-planning
description: "인터뷰 기반 제품 기획 및 설계"
disable-model-invocation: true
---
```

복잡한 워크플로우처럼 "사용자가 의도적으로 시작해야 하는" 스킬에 적합합니다. Claude가 임의로 시작하지 않습니다.

#### 모드 3: 배경 지식 — Claude만 참고하는 스킬

```yaml
---
name: python-standards
description: "Python 프로젝트 감지 시 uv + ruff + pytest 규칙 적용"
user-invocable: false
---
```

`/python-standards`로 호출할 수 없고, Claude가 Python 코드를 다룰 때 자동으로 참고합니다. 우리 Plugin에서는 `python-standards`, `go-standards`, `rust-standards`, `typescript-standards` 4개 언어 표준 스킬이 모두 이 모드를 씁니다.

---

## 변수 치환: 동적 컨텍스트

SKILL.md에서 사용할 수 있는 변수들이 있습니다.

### 인자 치환

```yaml
---
name: coding-problem-solver
description: "코딩 문제 풀이 정리"
argument-hint: "[문제 URL 또는 이름]"
---

$ARGUMENTS를 분석하여 풀이를 정리합니다.
```

사용자가 `/coding-problem-solver https://leetcode.com/problems/two-sum`이라고 입력하면, `$ARGUMENTS`가 URL로 치환됩니다.

| 변수 | 설명 |
|------|------|
| `$ARGUMENTS` | 전달된 모든 인자 |
| `$0`, `$1`, ... | 인자를 인덱스로 접근 |
| `${CLAUDE_SESSION_ID}` | 현재 세션 ID |

### 동적 컨텍스트 주입: `` !`command` ``

셸 명령어의 결과를 스킬 컨텍스트에 직접 주입할 수 있습니다.

```yaml title="skills/git-master/SKILL.md"
---
name: git-master
description: "커밋 아키텍트 + 히스토리 전문가"
---

## 현재 상태
- 변경 파일: !`git status -s`
- 최근 커밋: !`git log --oneline -5`
- 현재 브랜치: !`git branch --show-current`
```

`` !`command` `` 구문은 스킬이 로딩될 때 실행되어 결과를 Claude에게 전달합니다. 이를 통해 매번 "git status 먼저 확인해줘"라고 말하지 않아도 됩니다.

---

## references/ 패턴: 길어지면 분리하기

SKILL.md가 너무 길어지면 `references/` 디렉토리에 분리합니다.

```
skills/
└── typescript-standards/
    ├── SKILL.md                           # 핵심 규칙 (간결하게)
    └── references/
        ├── claude-snippet.md              # CLAUDE.md용 코드 조각
        ├── conventions-snippet.md         # 컨벤션 상세
        └── settings-snippet.json          # 설정 파일 템플릿
```

Claude는 SKILL.md를 먼저 로딩하고, 필요할 때만 references/ 파일을 읽습니다. 이렇게 하면 **컨텍스트 윈도우를 효율적으로 사용**할 수 있습니다.

:::tip 컨텍스트 예산
Skill description은 컨텍스트 윈도우의 **2% 이내**로 제한됩니다. SKILL.md 본문은 500줄 이내로 유지하고, 나머지는 references/로 분리하는 것이 좋습니다.
:::

---

## 서브에이전트에서 실행하기

복잡한 스킬은 독립된 컨텍스트에서 실행할 수 있습니다.

```yaml
---
name: deep-research
description: "주제에 대한 깊은 리서치"
context: fork
agent: Explore
allowed-tools: Bash(gh *)
---

$ARGUMENTS에 대해 철저히 조사하세요.
```

`context: fork`를 설정하면 메인 대화와 분리된 서브에이전트에서 실행됩니다. 리서치가 끝나면 결과만 메인 대화에 반환합니다.

---

## 실수 사례 1: 네이티브 명령어 충돌

### 뭐가 문제였나

처음 Plugin을 만들 때 `/review`라고 커맨드 이름을 지었는데, Claude Code에 이미 같은 이름이 있었습니다.

### 어떻게 고쳤나

`/review` → `/code-review`로 이름을 변경했습니다. 하지만 한 파일만 바꾸면 되는 게 아니었습니다.

1. 커맨드 파일: `commands/code-review.md`
2. 에이전트 파일: `agents/code-reviewer.md`에서 커맨드 호출 부분
3. CLAUDE.md: 스킬 목록 업데이트
4. README.md: 사용법 업데이트

:::danger 교훈
새 커맨드를 만들기 전에 `/help`로 Claude Code 네이티브 명령어 목록을 먼저 확인하세요. 이미 존재하는 이름과 충돌하면 예상치 못한 동작이 발생합니다.
:::

---

## 실수 사례 2: 경로 참조 문제

### 뭐가 문제였나

Plugin 스킬은 "사용자의 프로젝트 폴더"에서 실행됩니다. 그런데 Plugin 파일 자체는 다른 경로에 있습니다.

```
사용자 프로젝트:  /home/leo/my-project/
Plugin 파일:     ~/.claude/plugins/cache/.../my-plugin/
```

SKILL.md에서 Plugin 내부 파일을 참조하려면 경로를 알아야 하는데, 하드코딩하면 안 됩니다.

### 해결 방법

**hooks.json이나 스크립트에서는** `${CLAUDE_PLUGIN_ROOT}` 환경 변수를 사용합니다.

```json
{
  "command": "${CLAUDE_PLUGIN_ROOT}/scripts/format.sh"
}
```

**SKILL.md에서는** 상대 경로로 references/ 파일을 참조합니다. Claude가 SKILL.md를 읽을 때, 같은 디렉토리의 파일을 자연스럽게 접근할 수 있습니다.

:::warning 주의
`${CLAUDE_PLUGIN_ROOT}`는 Markdown 파일 내에서 변수 치환이 되지 않습니다. 셸 환경(hooks.json, scripts/)에서만 동작합니다.
:::

---

## Skill vs Command 정리

공식 문서에서 Commands와 Skills는 통합되었습니다. 실제로 `.claude/commands/review.md`와 `.claude/skills/review/SKILL.md`는 동일하게 `/review`를 생성합니다.

| 구분 | Skills | Commands (레거시) |
|------|--------|------------------|
| 파일 위치 | `skills/name/SKILL.md` | `commands/name.md` |
| frontmatter | 전체 옵션 지원 | 기본 옵션 |
| references | `references/` 패턴 지원 | 지원 안 함 |
| 호출 방식 | 동일 (`/name`) | 동일 (`/name`) |

신규 개발 시에는 `skills/` 디렉토리에 SKILL.md로 만드는 것을 권장합니다. `commands/`도 계속 동작하지만, frontmatter 옵션이나 references 패턴을 활용하려면 skills가 더 유연합니다.

---

## 정리

- **Skill 파일**: `skills/<name>/SKILL.md` 하나면 충분
- **호출 제어**: `user-invocable`과 `disable-model-invocation` 조합으로 3가지 모드
- **변수 치환**: `$ARGUMENTS`, `` !`command` `` 로 동적 컨텍스트
- **references/**: 긴 내용은 분리하여 컨텍스트 효율 극대화
- **실수 방지**: 네이티브 명령어 충돌 확인, 경로는 `${CLAUDE_PLUGIN_ROOT}` 사용

---

## 다음 편 예고

다음 편에서는 **Hooks로 자동화**를 다룹니다. hooks.json의 구조, 이벤트 종류, 그리고 가장 중요한 **exit code의 의미**(exit 0, exit 1, exit 2의 차이)를 실제 디버깅 사례와 함께 설명합니다.

---

**Claude Code Plugin 만들기 시리즈**
- [1편: Plugin 입문](/blog/claude-code-plugin-part1)
- [2편: 스킬과 커맨드](/blog/claude-code-plugin-part2) ← 지금 읽는 글
- [3편: 훅으로 자동화](/blog/claude-code-plugin-part3)
- [4편: 자기 개선 루프](/blog/claude-code-plugin-part4)
