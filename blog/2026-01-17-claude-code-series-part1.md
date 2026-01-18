---
slug: claude-code-series-part1
title: "[Claude Code 마스터하기 #1] 핵심 기능 총정리: 이것만 알면 시작할 수 있다"
authors: namyoungkim
tags: [claude, claude-code, ai, dev-tools, tutorial]
---

> 이 글은 Claude Code 시리즈의 첫 번째 편입니다. 기본 기능부터 차근차근 다루며, 실제 개발 시나리오에서 어떻게 활용하는지 보여드립니다.

---

## TL;DR

- Claude Code는 터미널에서 동작하는 AI 코딩 어시스턴트
- 파일 읽기/수정, 명령 실행, Git 작업까지 직접 수행
- `CLAUDE.md`로 프로젝트 컨텍스트를 주면 더 똑똑해짐
- 슬래시 커맨드(`/help`, `/init`, `/compact`)로 효율적 작업

<!-- truncate -->

---

## 들어가며

GitHub Copilot이 "코드 자동완성"이라면, Claude Code는 "AI 페어 프로그래머"입니다.

차이가 뭘까요?

```
Copilot: 커서 위치에서 다음 줄 제안
Claude Code: "이 버그 찾아서 고쳐줘" → 파일 열고, 분석하고, 수정하고, 테스트까지
```

저는 최근 AI Agent 개발에 집중하고 있습니다. Claude Code를 실무에 도입하면서 반복 작업이 크게 줄었고, 이 경험을 시리즈로 정리합니다.

---

## 1. Claude Code란?

### 한 줄 정의

**터미널에서 동작하는 AI 코딩 에이전트.** 대화하면서 실제로 파일을 읽고, 수정하고, 명령을 실행합니다.

### Claude.ai vs API vs Claude Code

| 제품 | 형태 | 주요 용도 |
|------|------|----------|
| Claude.ai | 웹 채팅 | 일반 대화, 문서 분석 |
| Claude API | HTTP API | 앱/서비스에 Claude 통합 |
| **Claude Code** | CLI 도구 | 코딩 작업 자동화 |

### 왜 Claude Code인가?

기존 AI 어시스턴트의 한계:

```
나: "src/utils.py 파일의 버그를 고쳐줘"
ChatGPT: "네, 코드를 보여주시면 수정해드릴게요"
나: (파일 열고, 복사하고, 붙여넣고...)
ChatGPT: "이렇게 수정하세요" (코드 블록 출력)
나: (다시 복사하고, 파일에 붙여넣고...)
```

Claude Code는 다릅니다:

```
나: "src/utils.py 파일의 버그를 고쳐줘"
Claude Code: (파일 읽음) → (분석) → (수정) → "고쳤습니다. 확인해보세요."
```

**복사-붙여넣기 지옥에서 해방됩니다.**

---

## 2. 설치하기

### 요구사항

- Node.js 18+
- macOS, Linux, 또는 Windows (WSL2)
- Claude Pro/Max 구독 또는 API 키

### 설치 명령

```bash
npm install -g @anthropic-ai/claude-code
```

### 첫 실행

```bash
cd your-project
claude
```

처음 실행하면 인증 과정을 거칩니다. Claude.ai 계정으로 로그인하거나 API 키를 입력합니다.

---

## 3. 인터페이스 살펴보기

### CLI (기본)

```bash
claude                    # 대화형 모드
claude -p "질문"          # 한 번만 질문 (headless)
claude --help             # 도움말
```

### VS Code 확장

1. VS Code 마켓플레이스에서 "Claude Code" 설치
2. 사이드바에서 Claude 아이콘 클릭
3. 에디터 컨텍스트와 연동된 대화 가능

### 어떤 걸 쓸까?

| 상황 | 추천 |
|------|------|
| 터미널 중심 작업 | CLI |
| 코드 보면서 대화 | VS Code |
| CI/CD 연동 | CLI (headless) |

저는 평소엔 터미널 CLI, 복잡한 리팩토링은 VS Code를 씁니다.

---

## 4. 핵심 슬래시 커맨드

Claude Code에서 `/`로 시작하는 명령어들입니다.

### 필수 5개

| 커맨드 | 설명 | 사용 시점 |
|--------|------|----------|
| `/help` | 도움말 | 명령어가 기억 안 날 때 |
| `/init` | CLAUDE.md 생성 | 새 프로젝트 시작 |
| `/compact` | 대화 압축 | 컨텍스트가 길어졌을 때 |
| `/clear` | 대화 초기화 | 새 주제 시작 |
| `/cost` | 토큰 사용량 확인 | 비용 관리 |

### 자주 쓰는 5개

| 커맨드 | 설명 | 사용 시점 |
|--------|------|----------|
| `/plan` | 계획 모드 진입 | 복잡한 작업 전 설계 |
| `/review` | 코드 리뷰 요청 | PR 전 점검 |
| `/bug` | 버그 찾기 | 에러 발생 시 |
| `/add-dir` | 작업 디렉토리 추가 | 여러 폴더 작업 |
| `/terminal-setup` | 터미널 연동 | 쉘 출력 공유 |

### 실제 사용 예시

```bash
# 시나리오: 새 프로젝트에서 Claude Code 시작

$ cd my-new-project
$ claude

> /init
# → CLAUDE.md 파일 생성됨
# → 프로젝트 구조 자동 분석

> /plan
# 계획 모드로 전환
# 읽기만 하고 수정은 안 함

> 이 프로젝트의 아키텍처를 분석해줘

# (분석 결과 출력)

> /compact
# 긴 대화 내용을 요약하여 컨텍스트 절약
```

---

## 5. 파일 참조하기: @ 와 !

### @ - 파일/폴더 컨텍스트 추가

```bash
> @src/main.py 이 파일 설명해줘

> @src/ 이 폴더의 구조를 분석해줘

> @package.json @tsconfig.json 설정 검토해줘
```

**팁**: 탭 자동완성 지원됩니다.

### ! - 쉘 명령 직접 실행

```bash
> !git status
# git status 결과를 Claude에게 보여줌

> !cat error.log
# 에러 로그를 Claude에게 전달

> !npm test
# 테스트 결과를 Claude가 확인
```

### 조합 활용

```bash
# 시나리오: 테스트 실패 원인 분석

> !npm test
# (테스트 실패 로그 출력)

> @src/calculator.test.js @src/calculator.js
> 테스트가 왜 실패하는지 분석하고 고쳐줘

# Claude가 두 파일을 읽고, 에러 분석 후 수정
```

---

## 6. CLAUDE.md - 프로젝트 컨텍스트의 핵심

### CLAUDE.md란?

프로젝트 루트에 두는 특수 파일입니다. Claude Code가 세션 시작 시 자동으로 읽습니다.

**마치 신입 개발자에게 프로젝트 온보딩 문서를 주는 것과 같습니다.**

### 기본 구조

````markdown
# 프로젝트: 주식 스크리너

## 개요
한국/미국 주식의 가치투자 지표를 분석하는 웹 애플리케이션

## 기술 스택
- Backend: FastAPI, Python 3.11
- Frontend: React 18, TypeScript
- Database: PostgreSQL, Redis
- Infra: Docker, AWS ECS

## 디렉토리 구조
```
src/
├── api/          # FastAPI 라우터
├── services/     # 비즈니스 로직
├── models/       # SQLAlchemy 모델
└── utils/        # 유틸리티 함수
```

## 코딩 컨벤션
- 타입 힌트 필수
- 함수는 20-50줄 이내
- 테스트 파일은 `*_test.py` 형식

## 자주 쓰는 명령어
- `make dev`: 개발 서버 실행
- `make test`: 테스트 실행
- `make lint`: 린트 검사

## 주의사항
- .env 파일은 절대 커밋하지 않음
- API 키는 환경변수로만 관리
````

### /init으로 자동 생성

```bash
> /init

# Claude가 프로젝트를 분석하고 CLAUDE.md 초안을 생성합니다
# 이후 필요에 맞게 수정하면 됩니다
```

### CLAUDE.md가 있으면 달라지는 점

**없을 때:**
```
나: API 엔드포인트 추가해줘
Claude: 어떤 프레임워크를 쓰시나요? 파일 구조는 어떻게 되나요?
```

**있을 때:**
```
나: API 엔드포인트 추가해줘
Claude: src/api/에 새 라우터를 만들겠습니다.
        기존 패턴대로 타입 힌트를 추가하고...
```

---

## 7. 설정 파일 이해하기

### 설정 파일 위치

| 파일 | 위치 | 용도 |
|------|------|------|
| `~/.claude/settings.json` | 홈 디렉토리 | 전역 설정 |
| `.claude/settings.json` | 프로젝트 루트 | 프로젝트 설정 |
| `.claude/settings.local.json` | 프로젝트 루트 | 로컬 전용 (gitignore) |

### 기본 설정 예시

```json
{
  "model": "claude-sonnet-4-5-20250929",
  "permissions": {
    "allow": [
      "Read",
      "Write(src/*)",
      "Write(tests/*)",
      "Bash(git *)",
      "Bash(npm *)",
      "Bash(make *)"
    ],
    "deny": [
      "Read(.env)",
      "Read(**/secrets/**)",
      "Bash(rm -rf *)",
      "Bash(sudo *)"
    ]
  }
}
```

### 설정 의미

| 설정 | 의미 |
|------|------|
| `Read` | 모든 파일 읽기 허용 |
| `Write(src/*)` | src 폴더 내 파일만 수정 허용 |
| `Bash(git *)` | git 명령만 실행 허용 |
| `deny` 섹션 | 명시적 차단 (보안) |

---

## 8. 실전 시나리오

### 시나리오 1: 새 프로젝트 온보딩

**상황**: 처음 보는 오픈소스 프로젝트에 기여하려 함

```bash
$ git clone https://github.com/example/project.git
$ cd project
$ claude

> /init
# CLAUDE.md 자동 생성

> 이 프로젝트가 뭘 하는 건지 설명해줘

> 기여 가이드라인이 있어?

> @CONTRIBUTING.md 요약해줘

> 초보자가 시작하기 좋은 이슈 유형은?
```

**결과**: 30분이면 프로젝트 구조와 기여 방법 파악 완료

### 시나리오 2: 버그 디버깅

**상황**: 프로덕션에서 500 에러 발생

```bash
$ claude

> !cat logs/error.log | tail -50
# 최근 에러 로그 확인

> 이 에러의 원인이 뭘까?

> @src/api/users.py 이 파일에서 문제가 있는 것 같은데 찾아줘

> 수정해줘

> !make test
# 테스트 통과 확인

> 이 수정사항 커밋 메시지 작성해줘
```

**결과**: 에러 분석부터 수정, 커밋까지 한 흐름으로 처리

### 시나리오 3: 리팩토링

**상황**: 500줄짜리 God Object를 분리하고 싶음

```bash
$ claude

> /plan
# 계획 모드로 시작 (수정 없이 분석만)

> @src/services/order_service.py
> 이 파일이 너무 커졌어. 어떻게 분리하면 좋을까?

# (분석 및 제안)

> 좋아, 그 방향으로 진행하자

# 계획 모드 해제 후 실제 리팩토링 진행

> 각 파일 분리하고 import도 정리해줘

> !make test
# 테스트로 검증
```

**결과**: 500줄 → 3개 파일(각 100-150줄)로 분리, 테스트 통과

### 시나리오 4: 문서 작성

**상황**: README와 API 문서를 작성해야 함

```bash
$ claude

> @src/api/ 이 폴더의 모든 엔드포인트를 분석해서
> API 문서를 docs/api.md로 작성해줘

> @README.md
> 설치 방법과 퀵스타트 섹션을 추가해줘
> 이 프로젝트의 실제 구조를 반영해서

> 영어로 번역해서 README.en.md로도 만들어줘
```

**결과**: 코드 기반의 정확한 문서 자동 생성

---

## 9. 추천 초기 설정

처음 시작할 때 이 설정을 추천합니다.

### ~/.claude/settings.json (전역)

```json
{
  "model": "claude-sonnet-4-5-20250929",
  "theme": "dark",
  "verbose": false
}
```

### .claude/settings.json (프로젝트)

```json
{
  "permissions": {
    "allow": [
      "Read",
      "Write(src/*)",
      "Write(tests/*)",
      "Write(docs/*)",
      "Bash(git *)",
      "Bash(npm *)",
      "Bash(make *)",
      "Bash(pytest *)"
    ],
    "deny": [
      "Read(.env*)",
      "Read(**/*secret*)",
      "Bash(rm -rf *)",
      "Bash(sudo *)"
    ]
  }
}
```

### 첫 번째 CLAUDE.md

프로젝트 루트에 최소한 이 정도는 작성하세요:

```markdown
# 프로젝트명

## 기술 스택
- 언어:
- 프레임워크:
- 데이터베이스:

## 주요 디렉토리
- src/: 소스 코드
- tests/: 테스트

## 개발 명령어
- 실행:
- 테스트:
- 빌드:
```

---

## 10. 자주 묻는 질문

### Q: 무료로 쓸 수 있나요?

Claude Pro($20/월) 또는 Max($100/월) 구독, 혹은 API 키가 필요합니다.

### Q: 인터넷에 코드가 전송되나요?

네, Claude API로 전송됩니다. 민감한 코드는 `.claude/settings.json`의 deny 규칙으로 차단하세요.

### Q: Copilot과 뭐가 달라요?

Copilot은 "자동완성", Claude Code는 "자율 에이전트"입니다.

| | Copilot | Claude Code |
|---|---------|-------------|
| 동작 | 타이핑 중 제안 | 명령 받고 실행 |
| 범위 | 현재 파일 | 전체 프로젝트 |
| 액션 | 코드 제안 | 파일 수정, 명령 실행 |

둘을 함께 쓰는 것도 좋습니다.

### Q: 내 코드를 학습에 사용하나요?

API 사용 시 기본적으로 학습에 사용되지 않습니다. 자세한 내용은 Anthropic의 데이터 정책을 확인하세요.

---

## 마무리

이번 글에서 다룬 내용:

- ✅ Claude Code의 정체와 기존 도구와의 차이
- ✅ 설치 및 기본 사용법
- ✅ 핵심 슬래시 커맨드 10가지
- ✅ @ 와 ! 로 파일/명령 참조
- ✅ CLAUDE.md로 컨텍스트 제공
- ✅ 4가지 실전 시나리오

**다음 글 예고**: Part 2에서는 **Hooks와 Headless Mode**를 다룹니다. 자동 포맷팅, 위험 명령 차단, CI/CD 연동 등 반복 작업을 자동화하는 방법을 알아봅니다.

---

## 참고 자료

- [Claude Code 공식 문서](https://code.claude.com/docs/en/overview)
- [Claude Code 제품 페이지](https://claude.com/product/claude-code)

---

*이 글이 도움이 되었다면 공유해주세요. 질문이나 피드백은 댓글로 남겨주세요!*
