---
slug: claude-code-plugin-part3
title: "[Claude Code Plugin 만들기 #3] 훅으로 자동화 — 규칙은 한 번 정하면 자동으로"
authors: namyoungkim
tags: [claude, claude-code, plugin, hooks, ai, dev-tools, tutorial]
---

> 이 글은 Claude Code Plugin 만들기 시리즈의 세 번째 편입니다. Hooks의 구조, 이벤트 종류, exit code의 정확한 의미, 그리고 실전 디버깅 사례를 다룹니다.

---

## TL;DR

- Hooks는 `hooks.json`에 정의하는 자동 실행 규칙
- 14가지 이벤트 중 `PreToolUse`, `PostToolUse`, `SessionStart`가 핵심
- **exit 0** = 성공, **exit 2** = 의도적 차단, **그 외** = 에러
- `exit 1`은 "차단"이 아니라 "에러" — 이 차이를 모르면 버그를 만든다
- hook 타입: `command`(셸 명령), `prompt`(LLM 평가), `agent`(다중 턴 검증) 3가지

<!-- truncate -->

---

## Hook이 뭔가요?

코드를 저장할 때마다 이런 말을 해야 한다고 생각해봅시다.

"들여쓰기가 이상한데 정리해줘. 그리고 이 파일은 .env니까 절대 수정하지 마."

매번 이런 말을 하는 건 비효율적입니다. **Hooks를 쓰면 이 모든 일을 자동으로 처리합니다.** 규칙을 한 번만 정하면, 앞으로는 조건이 맞을 때마다 자동으로 실행됩니다.

---

## 이벤트 전체 목록

Hook이 반응할 수 있는 이벤트는 총 14가지입니다. 공식 문서 기준으로 정리합니다.

| 이벤트 | 발생 시점 | 차단 가능 |
|--------|----------|-----------|
| `SessionStart` | 세션 시작/재개 시 | X |
| `UserPromptSubmit` | 사용자가 프롬프트 제출 시 | O |
| `PreToolUse` | 도구 실행 직전 | O |
| `PermissionRequest` | 권한 대화상자 표시 시 | O |
| `PostToolUse` | 도구 실행 성공 직후 | X |
| `PostToolUseFailure` | 도구 실행 실패 직후 | X |
| `Notification` | 알림 발생 시 | X |
| `SubagentStart` | 서브에이전트 생성 시 | X |
| `SubagentStop` | 서브에이전트 종료 시 | O |
| `Stop` | Claude 응답 완료 시 | O |
| `TeammateIdle` | 팀 멤버 대기 상태 시 | O |
| `TaskCompleted` | 작업 완료 표시 시 | O |
| `PreCompact` | 컨텍스트 압축 직전 | X |
| `SessionEnd` | 세션 종료 시 | X |

실무에서 가장 많이 쓰는 건 `PreToolUse`, `PostToolUse`, `SessionStart` 세 가지입니다.

---

## hooks.json 구조

hooks.json은 3단계 중첩으로 구성됩니다.

```
이벤트 → matcher 그룹 → hook 핸들러
```

```json title="hooks/hooks.json"
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "echo 'Bash 실행 전 검사'",
            "timeout": 10
          }
        ]
      }
    ]
  }
}
```

### matcher: 언제 실행할지 필터링

`matcher`는 정규표현식입니다. 이벤트별로 필터링 대상이 다릅니다.

| 이벤트 | matcher 대상 | 예시 |
|--------|-------------|------|
| `PreToolUse`, `PostToolUse` | 도구 이름 | `Bash`, `Edit\|Write`, `mcp__.*` |
| `SessionStart` | 시작 방식 | `startup`, `resume`, `clear` |
| `SessionEnd` | 종료 사유 | `clear`, `logout` |
| `SubagentStart` | 에이전트 타입 | `Explore`, `Plan` |
| `Stop`, `UserPromptSubmit` | 지원 안 함 | 항상 실행 |

`"*"`, `""`, 또는 matcher 자체를 생략하면 모든 경우에 실행됩니다.

### Hook 핸들러 필드

| 필드 | 필수 | 설명 |
|------|------|------|
| `type` | O | `"command"`, `"prompt"`, `"agent"` |
| `command` | type=command 시 | 실행할 셸 명령어 |
| `prompt` | type=prompt/agent 시 | LLM에 보낼 프롬프트 |
| `timeout` | X | 제한 시간 (초). command 기본값: 600초 |
| `statusMessage` | X | 실행 중 표시할 스피너 메시지 |
| `async` | X | `true`면 백그라운드 실행 (command만 지원) |
| `once` | X | `true`면 세션당 1회만 실행 (skills 전용) |

---

## Hook의 3가지 타입

### 1. command: 셸 명령 실행

가장 기본적인 타입입니다. 셸 명령어를 실행하고, exit code로 결과를 전달합니다.

```json
{
  "type": "command",
  "command": "bash -c 'ruff format \"$CLAUDE_FILE_PATH\"'",
  "timeout": 10
}
```

### 2. prompt: LLM 단일 턴 평가

Claude 모델(기본: Haiku)에게 판단을 맡깁니다. 모델은 `{"ok": true/false, "reason": "..."}` 형태로 응답합니다.

```json
{
  "type": "prompt",
  "prompt": "이 Bash 명령어가 안전한지 평가하세요: $ARGUMENTS"
}
```

### 3. agent: 다중 턴 서브에이전트

Read, Grep, Glob 도구를 사용하는 서브에이전트를 띄웁니다. 최대 50턴까지 실행됩니다. 복잡한 검증 로직에 적합합니다.

```json
{
  "type": "agent",
  "prompt": "이 코드 변경이 기존 테스트를 깨뜨리지 않는지 검증하세요"
}
```

---

## Exit Code: 가장 중요한 개념

**이 섹션이 이 글의 핵심입니다.** Hook의 exit code는 세 가지 의미를 가지며, 이를 정확히 이해하지 못하면 미묘한 버그를 만듭니다.

### exit 0 — 성공 (정상 완료)

Hook이 정상적으로 실행되었다는 뜻입니다. stdout에 JSON을 출력하면 Claude Code가 파싱합니다.

```bash title="SessionStart hook 예시"
# git 정보를 출력하여 Claude에게 컨텍스트 전달
echo "Branch: $(git branch --show-current)"
echo "Recent:"
git log --oneline -3
exit 0
```

`SessionStart`와 `UserPromptSubmit` 이벤트에서는 stdout이 Claude의 컨텍스트에 추가됩니다. 나머지 이벤트에서는 verbose 모드(`Ctrl+O`)에서만 보입니다.

### exit 2 — 의도적 차단 (블로킹)

**"이 동작을 막겠다"는 의도적 신호입니다.** stderr 내용이 Claude에게 에러 메시지로 전달됩니다.

```bash title="main 브랜치 커밋 차단 예시"
BRANCH=$(git branch --show-current)
if [ "$BRANCH" = "main" ]; then
  echo '{"decision":"block","reason":"main 브랜치 직접 커밋 금지"}' >&2
  exit 2
fi
```

차단 가능한 이벤트와 동작:

| 이벤트 | exit 2 효과 |
|--------|------------|
| `PreToolUse` | 도구 실행 차단 |
| `PermissionRequest` | 권한 거부 |
| `UserPromptSubmit` | 프롬프트 처리 차단 |
| `Stop` | Claude 종료 방지, 대화 계속 |
| `PostToolUse` | 차단 불가 (이미 실행됨), stderr만 Claude에게 표시 |

### exit 1 (또는 기타 non-zero) — 의도치 않은 에러

**exit 0도 아니고 exit 2도 아닌 모든 exit code는 "에러"로 취급됩니다.** stderr이 verbose 모드에서만 표시되고, 실행은 계속됩니다.

이것이 왜 중요할까요? 실제로 우리가 겪었던 버그를 봅시다.

---

## 실수 사례: `command -v` 실패와 exit 1의 함정

### 문제 상황

처음에 자동 포맷팅 hook을 이렇게 작성했습니다.

```bash
# "ruff가 있으면 포맷팅, 없으면 건너뛰기"라는 의도
command -v ruff >/dev/null 2>&1 && ruff format "$CLAUDE_FILE_PATH"
```

이 코드의 의도는 명확합니다: ruff가 설치되어 있으면 포맷팅하고, 없으면 조용히 넘어가라.

### 뭐가 문제였나

ruff가 설치되지 않은 환경에서 이 명령어를 실행하면:

```
command -v ruff    → 실패 (ruff 없음)
                   → && 뒤의 ruff format은 실행되지 않음
                   → 스크립트의 마지막 exit code = command -v의 exit code = 1
```

**exit 1은 "에러"입니다.** Claude Code는 이것을 "hook이 에러로 실패했다"고 판단합니다.

의도는 "도구가 없으니 건너뛰기"였지만, 실제로는 "에러 발생"으로 처리된 것입니다.

### 핵심: exit code 정리

```
exit 0  → 정상 (포맷터 실행 완료, 또는 정보 출력)
exit 2  → 의도적 차단 (보호 규칙 발동)
exit 1  → 의도치 않은 에러 (이번에 수정한 버그)
```

**exit 2만 "의도적 차단"이고, 그 외 non-zero는 전부 에러 취급**이라는 점이 핵심입니다.

### 해결 방법

```bash
# 수정 후: 도구가 없으면 정상 종료(exit 0)로 건너뛰기
if command -v ruff >/dev/null 2>&1; then
  ruff format "$CLAUDE_FILE_PATH"
fi
# if 블록 전체가 끝나면 exit 0
```

이렇게 하면:
- ruff가 **있으면** → 포맷팅 실행, 성공 시 exit 0
- ruff가 **없으면** → if 조건 불일치, 자연스럽게 exit 0
- ruff가 **있는데 포맷팅 실패하면** → exit 1 (진짜 에러), Claude에게 알림

---

## `|| true` 패턴의 위험성

비슷한 맥락에서, `|| true` 패턴도 주의가 필요합니다.

```bash
# 위험: 모든 에러를 삼켜버림
ruff format "$CLAUDE_FILE_PATH" || true
```

이 패턴은 "ruff가 없어도 OK, ruff가 있는데 실패해도 OK"가 됩니다. 진짜 에러까지 무시해버리는 것입니다.

올바른 패턴과 비교해봅시다:

| 패턴 | 도구 없음 | 도구 있고 성공 | 도구 있고 실패 |
|------|----------|-------------|-------------|
| `command -v X && X file` | exit 1 (에러!) | exit 0 | exit 1 (에러) |
| `X file \|\| true` | exit 0 (삼킴!) | exit 0 | exit 0 (삼킴!) |
| `if command -v X; then X file; fi` | exit 0 (정상) | exit 0 | exit 1 (에러) |

**세 번째 패턴이 정답입니다.** 도구가 없는 건 정상적으로 건너뛰고, 도구가 있는데 실패하면 에러를 보여줍니다.

---

## 실전 예시 4가지

우리 Plugin에서 실제로 사용하는 hook들을 공식 문서 기반으로 정리합니다.

### 1. SessionStart: 세션 시작 시 컨텍스트 주입

```json
{
  "matcher": "startup",
  "hooks": [{
    "type": "command",
    "command": "bash -c 'if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then echo \"Branch: $(git branch --show-current)\"; echo \"Recent:\"; git log --oneline -3; fi; exit 0'",
    "timeout": 5
  }]
}
```

세션이 시작되면 현재 브랜치와 최근 커밋 이력을 Claude에게 자동으로 알려줍니다. `SessionStart`에서 stdout은 Claude의 컨텍스트에 추가되므로, Claude가 프로젝트 상태를 바로 파악할 수 있습니다.

:::info matcher 값
`SessionStart`의 matcher는 세션 시작 방식을 필터링합니다: `startup`(처음 시작), `resume`(재개), `clear`(초기화), `compact`(압축 후).
:::

### 2. PostToolUse: 파일 저장 후 자동 포맷팅

```json
{
  "matcher": "Edit|Write",
  "hooks": [{
    "type": "command",
    "command": "bash -c 'if [[ \"$CLAUDE_FILE_PATH\" == *.py ]]; then if command -v ruff >/dev/null 2>&1; then ruff format \"$CLAUDE_FILE_PATH\"; fi; fi'",
    "timeout": 10
  }]
}
```

파일이 수정(`Edit`) 또는 생성(`Write`)될 때마다, 파일 확장자를 확인하고 해당 언어의 포맷터를 자동 실행합니다.

우리 Plugin에서는 4개 언어를 각각 처리합니다:
- `.py` → `ruff format`
- `.rs` → `rustfmt`
- `.go` → `gofmt -w`
- `.ts/.tsx/.js/.jsx` → `prettier --write`

### 3. PreToolUse: 민감한 파일 보호

```json
{
  "matcher": "Edit|Write",
  "hooks": [{
    "type": "command",
    "command": "bash -c 'echo \"$CLAUDE_FILE_PATH\" | grep -qiE \"(\\.env($|\\.)|\\.pem$|\\.key$|secrets/)\" && echo \"{\\\"decision\\\": \\\"block\\\", \\\"reason\\\": \\\"민감 파일 수정 차단\\\"}\" && exit 2 || true'"
  }]
}
```

`.env`, `.pem`, `.key`, `secrets/` 등 민감한 파일을 수정하려고 하면 `exit 2`로 차단합니다. 이때 `decision: "block"`과 `reason`을 JSON으로 전달하면, Claude가 차단 사유를 이해하고 대안을 제시합니다.

### 4. PreToolUse: 위험한 명령어 차단

```json
{
  "matcher": "Bash",
  "hooks": [{
    "type": "command",
    "command": "bash -c 'CMD=\"$CLAUDE_BASH_COMMAND\"; echo \"$CMD\" | grep -qE \"(rm\\s+-rf\\s+/|sudo\\s|chmod\\s+777)\" && echo \"{\\\"decision\\\": \\\"block\\\", \\\"reason\\\": \\\"위험 명령 차단: $CMD\\\"}\" && exit 2 || true'"
  }]
}
```

`rm -rf /`, `sudo`, `chmod 777` 같은 위험한 명령어를 Bash로 실행하려고 하면 차단합니다.

---

## PreToolUse의 고급 기능: permissionDecision

PreToolUse hook에서는 단순 차단 외에도 세밀한 제어가 가능합니다.

```json
{
  "hookSpecificOutput": {
    "permissionDecision": "allow",
    "permissionDecisionReason": "안전한 읽기 전용 명령어",
    "updatedInput": { "command": "ls -la" },
    "additionalContext": "이 명령어는 안전합니다"
  }
}
```

| 필드 | 설명 |
|------|------|
| `permissionDecision` | `allow`(허용), `deny`(거부), `ask`(사용자에게 물어보기) |
| `permissionDecisionReason` | 결정 사유 |
| `updatedInput` | 도구 입력을 수정 (명령어 변환 등) |
| `additionalContext` | Claude에게 추가 컨텍스트 전달 |

---

## 환경 변수

Hook 실행 시 사용할 수 있는 환경 변수들입니다.

| 변수 | 설명 |
|------|------|
| `$CLAUDE_PROJECT_DIR` | 프로젝트 루트 경로 |
| `${CLAUDE_PLUGIN_ROOT}` | Plugin 디렉토리 경로 |
| `$CLAUDE_FILE_PATH` | 현재 대상 파일 경로 (Edit/Write 시) |
| `$CLAUDE_BASH_COMMAND` | 실행하려는 Bash 명령어 (Bash 도구 시) |
| `$CLAUDE_ENV_FILE` | 환경 변수 영속화 파일 (SessionStart 전용) |

---

## timeout 설정 주의

timeout의 단위는 **초(seconds)** 입니다.

```json
{
  "timeout": 10
}
```

| 작업 | 권장 timeout |
|------|-------------|
| 포맷팅 | 10초 |
| 린트 검사 | 30초 |
| 빌드 검증 | 60초 |

:::danger 실수 사례
`timeout: 5000`이라고 쓰면 5000초 = **83분**입니다. 밀리초가 아닙니다! 이 실수로 hook이 1시간 넘게 대기한 적이 있습니다.
:::

---

## Hook 정의 위치

Hook은 여러 곳에서 정의할 수 있고, 모두 병합되어 실행됩니다.

| 위치 | 범위 | 공유 가능 |
|------|------|-----------|
| `~/.claude/settings.json` | 모든 프로젝트 | X (로컬 전용) |
| `.claude/settings.json` | 현재 프로젝트 | O (커밋 가능) |
| `.claude/settings.local.json` | 현재 프로젝트 | X (gitignore) |
| Plugin `hooks/hooks.json` | Plugin 활성 시 | O (Plugin에 포함) |
| Skill/Agent frontmatter | 컴포넌트 활성 시 | O (파일에 정의) |

---

## 디버깅

Hook이 예상대로 동작하지 않을 때:

```bash
# 디버그 모드로 Claude Code 실행
claude --debug
```

또는 실행 중에 `Ctrl+O`로 verbose 모드를 토글하면 hook 실행 로그를 볼 수 있습니다.

---

## 정리: exit code 한눈에 보기

| Exit Code | 의미 | 동작 |
|-----------|------|------|
| **0** | 성공 | stdout을 파싱, 정상 진행 |
| **2** | 의도적 차단 | stderr을 Claude에게 전달, 동작 차단 |
| **1 (기타)** | 에러 | stderr을 verbose에서만 표시, 진행 계속 |

**핵심: exit 2만 의도적 차단이고, 그 외 non-zero는 전부 에러 취급입니다.**

---

## 다음 편 예고

마지막 4편에서는 **자기 개선 루프**를 다룹니다. `/reflect`로 실수를 기록하고, `/harvest`로 여러 프로젝트의 지식을 수집하고, `/prune`으로 핵심만 남기는 사이클. 마치 오답노트를 정리하듯, AI도 계속 성장할 수 있습니다.

---

**Claude Code Plugin 만들기 시리즈**
- [1편: Plugin 입문](/blog/claude-code-plugin-part1)
- [2편: 스킬과 커맨드](/blog/claude-code-plugin-part2)
- [3편: 훅으로 자동화](/blog/claude-code-plugin-part3) ← 지금 읽는 글
- [4편: 자기 개선 루프](/blog/claude-code-plugin-part4)
