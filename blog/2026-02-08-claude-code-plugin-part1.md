---
slug: claude-code-plugin-part1
title: "[Claude Code Plugin 만들기 #1] Plugin 입문 — AI 비서에게 업무 매뉴얼 만들어주기"
authors: namyoungkim
tags: [claude, claude-code, plugin, ai, dev-tools, tutorial]
---

> 이 글은 Claude Code Plugin 만들기 시리즈의 첫 번째 편입니다. Plugin이 무엇인지, 왜 필요한지, 그리고 어떤 구성 요소로 이루어져 있는지 알아봅니다.

---

## TL;DR

- Plugin은 Claude Code에 커스텀 기능을 추가하는 확장 시스템
- Skills(배경 지식), Commands/Skills(슬래시 명령어), Hooks(자동 규칙), Agents(전문가 팀) 4가지로 구성
- `plugin.json` 매니페스트 하나로 패키징하여 팀과 공유 가능
- 프로젝트별 `.claude/` 설정과 달리, Plugin은 여러 프로젝트에서 재사용 가능

<!-- truncate -->

---

## 들어가며: 반복 설명이 이렇게 싫다고?

Claude Code를 쓰다 보면 정말 좋은 AI 비서를 얻은 것 같은 기분이 듭니다. 코드 리뷰도 해주고, 버그도 찾아주고, 심지어 리팩토링까지 도와줍니다.

그런데 한 가지 문제가 있습니다. **매번 같은 설명을 반복해야 한다는 것입니다.**

"우리 프로젝트는 Python으로, 들여쓰기는 4칸으로, 변수명은 snake_case로..."

이런 말을 매번 반복하다 보면 지칩니다. 마치 새로 온 팀원에게 매일 같은 컨벤션을 설명하는 것처럼요.

**그렇다면 이렇게 하면 어떨까요?** 처음 한 번만 매뉴얼을 작성해놓고, 그 다음부터는 매뉴얼을 참고하게 하는 겁니다. Claude Code Plugin은 바로 이 역할을 합니다.

---

## Plugin이란? AI에게 주는 업무 매뉴얼

새로 온 팀원이 첫 날부터 일을 잘할 리가 없습니다.

- "코드 스타일은 뭐야?"
- "테스트는 어떻게 돌려?"
- "커밋 메시지 규칙이 있어?"
- "위험한 작업은 뭐야?"

이 모든 걸 매번 설명하는 건 비효율적입니다. 하지만 매뉴얼이 있다면?

**Claude도 똑같습니다.** 우리가 미리 알려줄 게 있으면, Claude는 훨씬 똑똑하게 일할 수 있습니다. **Plugin은 이 매뉴얼을 체계적으로 만들어서 패키징한 것**입니다.

### Plugin vs 프로젝트 설정

"`.claude/` 디렉토리에 직접 설정하면 되는 거 아니야?" 맞는 말입니다. 하지만 차이가 있습니다.

| 구분 | 프로젝트 설정 (`.claude/`) | Plugin |
|------|---------------------------|--------|
| 범위 | 해당 프로젝트만 | 여러 프로젝트에서 재사용 |
| 공유 | 프로젝트 저장소에 포함 | 별도 저장소로 배포 |
| 네이밍 | `/review` | `/plugin-name:review` |
| 적합한 경우 | 프로젝트 고유 설정 | 팀 표준, 커뮤니티 공유 |

하나의 프로젝트에서만 쓸 거라면 `.claude/`로 충분합니다. 하지만 여러 프로젝트에 같은 규칙을 적용하고 싶다면? Plugin으로 만들어야 합니다.

---

## 4가지 핵심 구성 요소

Plugin을 구성하는 네 가지 요소가 있습니다. 각각이 무엇을 하는지 알아봅시다.

### Skills = 배경 지식

**Skills는 Claude에게 미리 알려주는 배경 지식입니다.** SKILL.md 파일에 규칙을 작성하면, Claude가 관련 상황에서 자동으로 참고합니다.

예를 들어 Python 프로젝트를 다룰 때:
- "패키지 매니저는 uv를 사용해"
- "린터는 ruff를 써"
- "테스트는 pytest로 돌려"

이런 규칙을 SKILL.md에 적어두면, Claude는 Python 파일을 볼 때 자동으로 이 규칙들을 따릅니다.

:::info Skill의 두 가지 모드
- **자동 적용** (`user-invocable: false`): Claude가 알아서 참고하는 배경 지식
- **수동 호출** (기본값): 사용자가 `/skill-name`으로 직접 호출하는 명령어
:::

### Commands (= 호출 가능한 Skills)

공식 문서에서는 Commands와 Skills가 통합되었습니다. `.claude/commands/review.md`든 `.claude/skills/review/SKILL.md`든, 둘 다 `/review`로 호출할 수 있습니다.

**Commands는 사용자가 직접 호출하는 Skills입니다.** `/code-review`라고 입력하면 코드 리뷰 모드로 들어가고, `/reflect`라고 하면 세션 회고를 시작합니다.

```
/code-review     → 현재 변경사항 코드 리뷰
/reflect         → 세션 회고 및 교훈 기록
/init-project    → 새 프로젝트 초기화
```

### Hooks = 자동 규칙

**Hooks는 특정 이벤트가 발생하면 자동으로 실행되는 규칙입니다.** `hooks.json` 파일에 한 번만 정의해두면, 조건이 맞을 때 자동으로 동작합니다.

예를 들어:
- 파일을 저장할 때마다 → 자동으로 코드 포맷팅
- 위험한 명령어를 실행하려 할 때 → 자동으로 차단
- 커밋하기 직전 → 자동으로 린트 검사

내가 "해줘"라고 말할 필요가 없습니다. 조건만 맞으면 알아서 실행됩니다.

### Agents = 전문가 팀

**Agents는 특정 역할에 특화된 AI 분신입니다.** 각 Agent는 자신만의 컨텍스트 윈도우, 시스템 프롬프트, 도구 접근 권한을 갖습니다.

예를 들어:
- **code-reviewer**: 코드 품질, 보안, 성능 관점에서 리뷰
- **refactor-assistant**: SOLID 원칙에 따른 리팩토링 제안
- **reflector**: 세션 회고 및 실수 패턴 분석

코드가 복잡해 보이면 리팩토링 전문가를 부르고, 코드가 완성되면 리뷰 전문가를 부르는 식으로 역할을 분담합니다.

---

## 실제 Plugin 구조

실제로 Plugin 디렉토리가 어떻게 구성되는지 봅시다.

```
my-plugin/
├── .claude-plugin/
│   └── plugin.json           # Plugin 매니페스트 (필수)
├── skills/                   # 배경 지식 & 슬래시 명령어
│   ├── python-standards/
│   │   └── SKILL.md
│   ├── typescript-standards/
│   │   └── SKILL.md
│   └── git-workflow/
│       ├── SKILL.md
│       └── references/       # 부가 참고 자료
├── agents/                   # 전문가 팀
│   ├── code-reviewer.md
│   └── refactor-assistant.md
├── commands/                 # 슬래시 명령어 (skills/와 병행 가능)
│   ├── code-review.md
│   └── reflect.md
├── hooks/                    # 자동 규칙
│   └── hooks.json
├── scripts/                  # 유틸리티 스크립트
│   └── validate.sh
└── templates/                # 프로젝트 초기화 템플릿
    └── project/
```

### plugin.json: 매니페스트 파일

Plugin의 핵심은 `.claude-plugin/plugin.json`입니다. 이 파일이 있어야 Claude Code가 Plugin으로 인식합니다.

```json title=".claude-plugin/plugin.json"
{
  "name": "my-plugin",
  "version": "1.0.0",
  "description": "팀 개발 표준 및 워크플로우 자동화",
  "author": {
    "name": "Your Name"
  },
  "repository": "https://github.com/you/my-plugin",
  "license": "MIT"
}
```

필수 필드는 `name` 하나뿐입니다. 나머지는 선택사항이지만, 공유할 Plugin이라면 `version`과 `description`은 채워두는 게 좋습니다.

---

## Plugin 설치와 관리

### 설치

```bash
# GitHub 저장소에서 설치
claude plugin install github:namyoungkim/leo-claude-plugin

# 로컬 개발 중인 플러그인 테스트
claude --plugin-dir ./my-plugin
```

### 설치 범위

| 범위 | 설정 파일 | 용도 |
|------|----------|------|
| `user` | `~/.claude/settings.json` | 모든 프로젝트에 적용 (기본) |
| `project` | `.claude/settings.json` | 이 프로젝트만, 팀과 공유 가능 |
| `local` | `.claude/settings.local.json` | 이 프로젝트만, gitignore 대상 |

### 관리 명령어

```bash
claude plugin enable my-plugin     # 활성화
claude plugin disable my-plugin    # 비활성화
claude plugin update my-plugin     # 업데이트
claude plugin uninstall my-plugin  # 제거
```

---

## 환경 변수: `${CLAUDE_PLUGIN_ROOT}`

Plugin 개발에서 가장 중요한 환경 변수가 하나 있습니다.

**`${CLAUDE_PLUGIN_ROOT}`** 는 Plugin 디렉토리의 절대 경로를 담고 있습니다. hooks.json이나 스크립트에서 Plugin 내부 파일을 참조할 때 사용합니다.

```json title="hooks/hooks.json"
{
  "hooks": {
    "PostToolUse": [{
      "matcher": "Edit|Write",
      "hooks": [{
        "type": "command",
        "command": "${CLAUDE_PLUGIN_ROOT}/scripts/format.sh"
      }]
    }]
  }
}
```

:::warning 주의
`${CLAUDE_PLUGIN_ROOT}`는 hooks.json이나 셸 스크립트 등 **런타임 환경**에서만 동작합니다. SKILL.md 같은 Markdown 파일에서는 변수 치환이 되지 않습니다.
:::

---

## 정리: Plugin은 AI와의 계약서

Plugin이 무엇인지 정리하면:

| 구성 요소 | 역할 | 파일 위치 |
|-----------|------|----------|
| **Skills** | 배경 지식 & 슬래시 명령어 | `skills/*/SKILL.md` |
| **Commands** | 슬래시 명령어 (Skills와 통합) | `commands/*.md` |
| **Hooks** | 자동 실행 규칙 | `hooks/hooks.json` |
| **Agents** | 역할별 AI 전문가 | `agents/*.md` |
| **Templates** | 프로젝트 초기화 키트 | `templates/` |

이 다섯 가지가 모여서 하나의 Plugin이 됩니다. 한 번 만들어두면 여러 프로젝트에서 재사용할 수 있고, 팀원들과 공유할 수 있습니다.

---

## 다음 편 예고

다음 편에서는 **Skills과 Commands를 직접 만드는 방법**을 다룹니다. SKILL.md의 frontmatter 옵션, 호출 제어 방식, 그리고 실제로 만들면서 겪었던 실수들까지 이야기합니다.

---

**Claude Code Plugin 만들기 시리즈**
- [1편: Plugin 입문](/blog/claude-code-plugin-part1) ← 지금 읽는 글
- [2편: 스킬과 커맨드](/blog/claude-code-plugin-part2)
- [3편: 훅으로 자동화](/blog/claude-code-plugin-part3)
- [4편: 자기 개선 루프](/blog/claude-code-plugin-part4)
