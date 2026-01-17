---
slug: claude-code-series-part2
title: "[Claude Code 마스터하기 #2] Hooks & Headless Mode: 반복 작업을 자동화하는 법"
authors: namyoungkim
tags: [claude, claude-code, ai, dev-tools, automation, tutorial]
---

> 이 글은 Claude Code 시리즈의 두 번째 편입니다. Part 1에서 기본 기능을 익혔다면, 이제 자동화로 넘어갑니다.

---

## TL;DR

- **Hooks**: 특정 이벤트 발생 시 자동으로 스크립트 실행
- **Headless Mode**: 대화 없이 명령 실행 후 결과만 받기
- 조합하면 CI/CD, pre-commit, 자동 포맷팅 등 무한 자동화 가능

<!-- truncate -->

---

## 들어가며

Part 1에서 Claude Code의 기본 사용법을 익혔습니다. 하지만 매번 같은 작업을 반복하고 있진 않나요?

```
파일 수정 → ruff format 실행 → 잊어버림 → 린트 에러
파일 수정 → ruff format 실행 → 잊어버림 → 린트 에러
(무한 반복)
```

이런 반복을 자동화하는 두 가지 강력한 기능이 있습니다.

| 기능 | 비유 | 용도 |
|------|------|------|
| **Hooks** | 게임 매크로 | 이벤트 → 자동 실행 |
| **Headless Mode** | 쉘 스크립트 | 대화 없이 한 번 실행 |

---

## Part A: Hooks (훅)

### Hooks란?

**"특정 이벤트가 발생하면 자동으로 스크립트를 실행해라"**

게임에서 매크로를 설정하는 것과 비슷합니다:
- 적이 나타나면 → 자동으로 스킬 사용
- 체력이 30% 이하면 → 자동으로 포션 사용

Claude Code에서는:
- 파일 수정하면 → 자동으로 포맷팅
- Bash 실행 전 → 위험 명령 차단
- 작업 완료하면 → 자동으로 커밋

### Hook 이벤트 8가지

| 이벤트 | 발생 시점 | 주요 용도 |
|--------|----------|----------|
| `PreToolUse` | 도구 실행 **직전** | 위험 명령 차단, 파일 보호 |
| `PostToolUse` | 도구 실행 **직후** | 자동 포맷팅, 로깅 |
| `Notification` | 알림 발생 시 | 슬랙/디스코드 알림 |
| `Stop` | 작업 완료 시 | 자동 커밋, 리포트 생성 |
| `SubagentStop` | 서브에이전트 완료 시 | 결과 후처리 |
| `PreCompact` | 대화 압축 직전 | 중요 정보 백업 |

**가장 많이 쓰는 3개**: `PreToolUse`, `PostToolUse`, `Stop`

### Hook 설정 파일

```
~/.claude/settings.json          # 전역 (모든 프로젝트)
.claude/settings.json            # 프로젝트 (팀 공유)
.claude/settings.local.json      # 로컬 전용 (gitignore)
```

### Hook 기본 구조

```json
{
  "hooks": {
    "이벤트명": [
      {
        "matcher": "도구명 또는 패턴",
        "command": "실행할 명령어"
      }
    ]
  }
}
```

### Matcher 패턴

| Matcher | 의미 |
|---------|------|
| `Edit` | 파일 수정 (str_replace_editor) |
| `Write` | 파일 생성/덮어쓰기 |
| `Read` | 파일 읽기 |
| `Bash` | 쉘 명령 실행 |
| `Edit\|Write` | Edit 또는 Write |
| `*` | 모든 도구 |

### Exit Code 의미

| Exit Code | 의미 | 동작 |
|-----------|------|------|
| 0 | 성공 | 계속 진행 |
| 2 | 차단 | 도구 실행 중단, stderr 메시지 전달 |
| 그 외 | 에러 | 에러 로깅 후 계속 진행 |

---

## 실전 Hook 예제 5가지

### 예제 1: Python 파일 자동 포맷팅

**시나리오**: Claude가 Python 파일을 수정할 때마다 자동으로 ruff format 실행

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "command": "python3 ~/.claude/hooks/auto_format.py \"$CLAUDE_FILE_PATHS\""
      }
    ]
  }
}
```

**~/.claude/hooks/auto_format.py**:

```python
#!/usr/bin/env python3
import subprocess
import sys

file_paths = sys.argv[1] if len(sys.argv) > 1 else ""

for path in file_paths.split(":"):
    path = path.strip()
    if path.endswith(".py"):
        subprocess.run(["ruff", "format", path], capture_output=True)
        subprocess.run(["ruff", "check", "--fix", path], capture_output=True)
```

**결과**:
```
Claude: src/utils.py 파일을 수정했습니다.
(자동으로 ruff format + ruff check --fix 실행)
```

### 예제 2: 민감 파일 보호

**시나리오**: .env, secrets.py 등 민감 파일 수정 시도 시 차단

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Edit|Write|Read",
        "command": "python3 ~/.claude/hooks/protect_sensitive.py \"$CLAUDE_FILE_PATHS\""
      }
    ]
  }
}
```

**~/.claude/hooks/protect_sensitive.py**:

```python
#!/usr/bin/env python3
import sys
import os

PROTECTED_PATTERNS = [
    ".env",
    "secrets.py",
    "credentials",
    ".pem",
    "id_rsa",
    "private_key"
]

file_paths = sys.argv[1] if len(sys.argv) > 1 else ""

for path in file_paths.split(":"):
    path = path.strip().lower()
    for pattern in PROTECTED_PATTERNS:
        if pattern in path:
            print(f"🚫 보호된 파일입니다: {path}", file=sys.stderr)
            print(f"민감한 정보가 포함된 파일은 직접 수정하세요.", file=sys.stderr)
            sys.exit(2)  # Exit code 2 = 차단

sys.exit(0)  # 통과
```

**결과**:
```
나: .env 파일에 새 API 키 추가해줘
Claude: 🚫 보호된 파일입니다: .env
        민감한 정보가 포함된 파일은 직접 수정하세요.
```

### 예제 3: 위험 명령어 차단

**시나리오**: rm -rf, sudo 등 위험한 Bash 명령 차단

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "command": "python3 ~/.claude/hooks/block_dangerous.py \"$CLAUDE_TOOL_INPUT\""
      }
    ]
  }
}
```

**~/.claude/hooks/block_dangerous.py**:

```python
#!/usr/bin/env python3
import sys
import re
import json

DANGEROUS_PATTERNS = [
    r"rm\s+-rf\s+[/~]",      # rm -rf / 또는 ~
    r"rm\s+-rf\s+\*",        # rm -rf *
    r"sudo\s+",              # 모든 sudo
    r"chmod\s+777",          # 과도한 권한
    r">\s*/dev/sd",          # 디스크 직접 쓰기
    r"mkfs\.",               # 포맷
    r"dd\s+if=",             # 디스크 복사
    r":\(\)\{.*\}",          # fork bomb
]

try:
    tool_input = json.loads(sys.argv[1]) if len(sys.argv) > 1 else {}
    command = tool_input.get("command", "")
except:
    command = sys.argv[1] if len(sys.argv) > 1 else ""

for pattern in DANGEROUS_PATTERNS:
    if re.search(pattern, command, re.IGNORECASE):
        print(f"⛔ 위험한 명령어가 감지되었습니다!", file=sys.stderr)
        print(f"명령어: {command}", file=sys.stderr)
        print(f"매칭 패턴: {pattern}", file=sys.stderr)
        sys.exit(2)

sys.exit(0)
```

**결과**:
```
나: 임시 파일 정리해줘
Claude: (rm -rf /tmp/* 시도)
        ⛔ 위험한 명령어가 감지되었습니다!
        명령어: rm -rf /tmp/*
        더 안전한 방법으로 시도하겠습니다...
```

### 예제 4: 작업 완료 시 자동 커밋

**시나리오**: Claude 작업이 끝나면 자동으로 git commit

```json
{
  "hooks": {
    "Stop": [
      {
        "command": "bash ~/.claude/hooks/auto_commit.sh"
      }
    ]
  }
}
```

**~/.claude/hooks/auto_commit.sh**:

```bash
#!/bin/bash

# Git 저장소인지 확인
if ! git rev-parse --is-inside-work-tree > /dev/null 2>&1; then
    exit 0
fi

# 변경사항이 있는지 확인
if git diff --quiet && git diff --cached --quiet; then
    exit 0
fi

# 변경된 파일 목록
changed_files=$(git diff --name-only)

# 자동 커밋
git add -A
git commit -m "chore: Claude Code 자동 커밋

변경된 파일:
$changed_files

[auto-committed by Claude Code hook]"

echo "✅ 자동 커밋 완료"
```

**결과**:
```
Claude: 리팩토링을 완료했습니다. 3개 파일을 수정했습니다.
(자동으로 git commit 실행)
✅ 자동 커밋 완료
```

### 예제 5: 세션 시작 시 컨텍스트 로드

**시나리오**: Claude Code 시작할 때 현재 상태를 자동으로 보여주기

```json
{
  "hooks": {
    "SessionStart": [
      {
        "command": "bash ~/.claude/hooks/session_context.sh"
      }
    ]
  }
}
```

**~/.claude/hooks/session_context.sh**:

```bash
#!/bin/bash

echo "📋 현재 프로젝트 상태"
echo "===================="

# Git 상태
if git rev-parse --is-inside-work-tree > /dev/null 2>&1; then
    echo ""
    echo "🔀 Git 브랜치: $(git branch --show-current)"

    uncommitted=$(git status --porcelain | wc -l)
    if [ "$uncommitted" -gt 0 ]; then
        echo "📝 미커밋 변경: ${uncommitted}개 파일"
    fi
fi

# TODO 항목
if [ -f "TODO.md" ]; then
    echo ""
    echo "📌 TODO 항목:"
    grep -E "^- \[ \]" TODO.md | head -5
fi

# 최근 에러 로그
if [ -f "logs/error.log" ]; then
    recent_errors=$(tail -1 logs/error.log 2>/dev/null)
    if [ -n "$recent_errors" ]; then
        echo ""
        echo "⚠️ 최근 에러:"
        echo "$recent_errors"
    fi
fi

echo ""
echo "===================="
```

**결과**:
```
$ claude

📋 현재 프로젝트 상태
====================

🔀 Git 브랜치: feature/user-auth
📝 미커밋 변경: 2개 파일

📌 TODO 항목:
- [ ] 로그인 API 테스트 작성
- [ ] 비밀번호 재설정 기능

⚠️ 최근 에러:
2025-01-15 10:23:45 ERROR: Database connection timeout

====================

> 무엇을 도와드릴까요?
```

---

## Hook 환경 변수

Hook 스크립트에서 사용할 수 있는 환경 변수:

| 변수 | 설명 | 예시 |
|------|------|------|
| `CLAUDE_TOOL_NAME` | 실행된 도구 이름 | `Edit`, `Bash` |
| `CLAUDE_TOOL_INPUT` | 도구 입력 (JSON) | `{"command": "ls"}` |
| `CLAUDE_FILE_PATHS` | 대상 파일 경로 | `src/main.py:src/utils.py` |
| `CLAUDE_PROJECT_DIR` | 프로젝트 루트 | `/home/user/project` |
| `CLAUDE_SESSION_ID` | 세션 ID | `abc123` |

---

## Part B: Headless Mode

### Headless Mode란?

**"대화 없이 명령 실행하고 결과만 받기"**

일반 모드:
```
$ claude
> 안녕
Claude: 안녕하세요! 무엇을 도와드릴까요?
> (대화 계속...)
```

Headless 모드:
```
$ claude -p "이 파일의 버그를 찾아줘" --output-format json
{"result": "버그를 발견했습니다...", "cost": 0.003}
```

**대화형 UI 없이 결과만 받습니다.** 스크립트, CI/CD, 자동화에 필수입니다.

### 기본 사용법

```bash
# 기본 (텍스트 출력)
claude -p "프롬프트"

# JSON 출력
claude -p "프롬프트" --output-format json

# 스트리밍 JSON
claude -p "프롬프트" --output-format stream-json

# 모델 지정
claude -p "프롬프트" --model claude-sonnet-4-5-20250929

# 최대 턴 수 제한
claude -p "프롬프트" --max-turns 5

# 권한 모드
claude -p "프롬프트" --permission-mode accept-edits
```

### 권한 모드 옵션

| 모드 | 의미 | 용도 |
|------|------|------|
| `default` | 모든 작업 확인 요청 | 안전한 기본값 |
| `accept-edits` | 파일 수정 자동 승인 | 자동화 스크립트 |
| `bypass-permissions` | 모든 작업 자동 승인 | CI/CD (주의!) |

### 파이프 입력

```bash
# 에러 로그 분석
cat error.log | claude -p "이 에러의 원인을 분석해줘"

# 코드 리뷰
git diff | claude -p "이 변경사항을 리뷰해줘"

# 파일 내용 분석
cat src/main.py | claude -p "이 코드의 복잡도를 분석해줘"
```

---

## 실전 Headless 시나리오 5가지

### 시나리오 1: GitHub Actions 자동 코드 리뷰

**상황**: PR이 올라오면 자동으로 Claude가 코드 리뷰

**.github/workflows/claude-review.yml**:

```yaml
name: Claude Code Review

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install Claude Code
        run: npm install -g @anthropic-ai/claude-code

      - name: Run Claude Review
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: |
          git diff origin/main...HEAD > changes.diff

          claude -p "
          다음 코드 변경사항을 리뷰해주세요.

          중점 검토 항목:
          1. 버그 가능성
          2. 보안 취약점
          3. 성능 이슈
          4. 코드 스타일

          변경사항:
          $(cat changes.diff)
          " --output-format json > review.json

      - name: Post Review Comment
        uses: actions/github-script@v7
        with:
          script: |
            const review = require('./review.json');
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: `## 🤖 Claude Code Review\n\n${review.result}`
            });
```

**결과**: PR마다 자동으로 코드 리뷰 코멘트가 달림

### 시나리오 2: Git Pre-commit Hook

**상황**: 커밋 전 자동으로 버그 검사

**.git/hooks/pre-commit**:

```bash
#!/bin/bash

# 스테이징된 파일만 검사
staged_files=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(py|js|ts)$')

if [ -z "$staged_files" ]; then
    exit 0
fi

echo "🔍 Claude Code로 커밋 전 검사 중..."

# 각 파일 검사
for file in $staged_files; do
    result=$(claude -p "
    이 파일에서 명백한 버그나 에러를 찾아주세요.
    없으면 'OK'만 출력하세요.

    파일: $file
    $(cat "$file")
    " --output-format json 2>/dev/null)

    # OK가 아니면 경고
    if ! echo "$result" | grep -q '"result".*OK'; then
        echo "⚠️ $file 에서 문제 발견:"
        echo "$result" | jq -r '.result'
        echo ""
        echo "커밋을 계속하려면 'git commit --no-verify'를 사용하세요."
        exit 1
    fi
done

echo "✅ 검사 통과"
exit 0
```

**결과**:
```
$ git commit -m "feat: add user service"
🔍 Claude Code로 커밋 전 검사 중...
⚠️ src/user_service.py 에서 문제 발견:
- Line 45: division by zero 가능성 (users_count가 0일 수 있음)
- Line 78: SQL injection 취약점 (f-string으로 쿼리 생성)

커밋을 계속하려면 'git commit --no-verify'를 사용하세요.
```

### 시나리오 3: 자동 문서 생성 스크립트

**상황**: 소스 코드에서 API 문서 자동 생성

**scripts/generate_docs.sh**:

```bash
#!/bin/bash

OUTPUT_DIR="docs/api"
mkdir -p "$OUTPUT_DIR"

echo "📝 API 문서 생성 중..."

# 모든 라우터 파일 처리
for file in src/api/*.py; do
    filename=$(basename "$file" .py)

    echo "  처리 중: $file"

    claude -p "
    다음 FastAPI 라우터 코드를 분석하고 API 문서를 Markdown으로 작성해주세요.

    포함할 내용:
    - 엔드포인트 목록 (메서드, 경로)
    - 각 엔드포인트의 설명
    - 요청 파라미터
    - 응답 형식
    - 에러 케이스

    파일: $file
    $(cat "$file")
    " --output-format json | jq -r '.result' > "$OUTPUT_DIR/${filename}.md"
done

echo "✅ 문서 생성 완료: $OUTPUT_DIR/"
```

**실행**:
```
$ ./scripts/generate_docs.sh
📝 API 문서 생성 중...
  처리 중: src/api/users.py
  처리 중: src/api/orders.py
  처리 중: src/api/products.py
✅ 문서 생성 완료: docs/api/
```

### 시나리오 4: 일일 코드 품질 리포트 (Cron)

**상황**: 매일 아침 코드 품질 리포트를 슬랙으로 전송

**scripts/daily_report.sh**:

```bash
#!/bin/bash

# 리포트 생성
report=$(claude -p "
다음 정보를 바탕으로 일일 코드 품질 리포트를 작성해주세요.

1. 최근 커밋 (24시간):
$(git log --since='24 hours ago' --oneline)

2. 현재 TODO 항목:
$(grep -r 'TODO' src/ --include='*.py' | head -20)

3. 테스트 커버리지:
$(coverage report --format=total 2>/dev/null || echo '측정 불가')

4. 린트 경고:
$(ruff check src/ --output-format=concise 2>/dev/null | head -10)

간결하게 요약하고 우선순위 높은 항목 3개를 제안해주세요.
" --output-format json | jq -r '.result')

# 슬랙으로 전송
curl -X POST "$SLACK_WEBHOOK_URL" \
  -H 'Content-type: application/json' \
  --data "{
    \"text\": \"📊 일일 코드 품질 리포트\",
    \"blocks\": [
      {
        \"type\": \"section\",
        \"text\": {
          \"type\": \"mrkdwn\",
          \"text\": \"$report\"
        }
      }
    ]
  }"
```

**crontab 설정**:
```
0 9 * * 1-5 /path/to/scripts/daily_report.sh
```

### 시나리오 5: 에러 로그 자동 분석

**상황**: 프로덕션 에러 발생 시 자동 분석

**scripts/analyze_error.sh**:

```bash
#!/bin/bash

# 사용법: ./analyze_error.sh <error_log_file>

if [ -z "$1" ]; then
    echo "사용법: $0 <error_log_file>"
    exit 1
fi

ERROR_LOG="$1"

echo "🔍 에러 분석 중: $ERROR_LOG"

analysis=$(claude -p "
다음 에러 로그를 분석해주세요.

에러 로그:
$(tail -100 "$ERROR_LOG")

분석 항목:
1. 에러 원인 (root cause)
2. 영향 범위
3. 즉시 해결 방법
4. 장기적 개선 방안
5. 관련 있을 수 있는 코드 파일

JSON 형식으로 응답해주세요.
" --output-format json)

echo "$analysis" | jq '.'

# 심각도가 높으면 슬랙 알림
severity=$(echo "$analysis" | jq -r '.result' | grep -i "critical\|severe" && echo "high" || echo "low")

if [ "$severity" = "high" ]; then
    curl -X POST "$SLACK_WEBHOOK_URL" \
      -H 'Content-type: application/json' \
      --data "{\"text\": \"🚨 심각한 에러 감지!\n$(echo "$analysis" | jq -r '.result' | head -10)\"}"
fi
```

---

## Hooks + Headless 조합 패턴

### 패턴 1: 수정 → 검증 → 알림

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "command": "bash -c 'claude -p \"$(cat $CLAUDE_FILE_PATHS)를 빠르게 검증해줘\" --output-format json | jq -r .result'"
      }
    ]
  }
}
```

### 패턴 2: 위험 감지 → 상세 분석

```bash
# pre-commit hook
#!/bin/bash

# 1차: 빠른 패턴 매칭
if grep -r "password\|secret\|api_key" --include='*.py' $(git diff --cached --name-only); then
    # 2차: Claude로 상세 분석
    claude -p "
    다음 변경사항에서 하드코딩된 비밀 정보가 있는지 확인해주세요.
    $(git diff --cached)
    " --output-format json
fi
```

---

## 비용 관리 팁

Headless Mode는 자동으로 돌아가므로 비용이 빠르게 쌓일 수 있습니다.

### 1. 토큰 제한 설정

```bash
claude -p "분석해줘" --max-tokens 500
```

### 2. 조건부 실행

```bash
# 변경 파일이 있을 때만 실행
if [ -n "$(git diff --cached --name-only)" ]; then
    claude -p "리뷰해줘" ...
fi
```

### 3. 캐싱

```bash
# 같은 파일은 다시 분석하지 않음
hash=$(md5sum "$file" | cut -d' ' -f1)
cache_file=".claude_cache/$hash"

if [ ! -f "$cache_file" ]; then
    claude -p "분석해줘" ... > "$cache_file"
fi
cat "$cache_file"
```

### 4. 경량 모델 사용

```bash
# 간단한 작업은 Haiku로
claude -p "포맷 검사해줘" --model claude-haiku-4-5-20251001
```

### 월간 비용 예측

| 시나리오 | 일일 실행 | 토큰/회 | 월간 비용 |
|----------|----------|---------|----------|
| Pre-commit | 10회 | 2K | ~$3 |
| PR 리뷰 | 5회 | 10K | ~$15 |
| 일일 리포트 | 1회 | 5K | ~$3 |
| 에러 분석 | 3회 | 3K | ~$5 |
| **합계** | | | **~$26/월** |

---

## 트러블슈팅

### Hook이 실행되지 않음

```bash
# 1. 설정 파일 위치 확인
cat .claude/settings.json

# 2. JSON 문법 검증
python -m json.tool .claude/settings.json

# 3. 스크립트 실행 권한
chmod +x ~/.claude/hooks/*.sh
chmod +x ~/.claude/hooks/*.py
```

### Headless에서 권한 에러

```bash
# accept-edits 또는 bypass-permissions 사용
claude -p "수정해줘" --permission-mode accept-edits
```

### 타임아웃 발생

```bash
# max-turns 제한
claude -p "분석해줘" --max-turns 3

# 또는 timeout 명령
timeout 60 claude -p "분석해줘"
```

---

## 마무리

이번 글에서 다룬 내용:

- ✅ Hooks의 개념과 8가지 이벤트
- ✅ 실전 Hook 예제 5가지 (포맷팅, 보호, 차단, 커밋, 컨텍스트)
- ✅ Headless Mode 사용법
- ✅ 실전 Headless 시나리오 5가지 (CI/CD, pre-commit, 문서, 리포트, 에러분석)
- ✅ 비용 관리 팁

**다음 글 예고**: Part 3에서는 **Subagents, Skills, Agent SDK**를 다룹니다. 작업을 전문가에게 위임하고, 커스텀 스킬을 만들고, SDK로 더 복잡한 자동화를 구현하는 방법을 알아봅니다.

---

## 참고 자료

- [Claude Code Hooks 공식 문서](https://code.claude.com/docs/en/hooks)
- [Claude Code CLI Reference](https://code.claude.com/docs/en/cli-reference)
- [GitHub Actions with Claude](https://github.com/anthropics/claude-code-action)

---

*이 글이 도움이 되었다면 공유해주세요. 질문이나 피드백은 댓글로 남겨주세요!*
