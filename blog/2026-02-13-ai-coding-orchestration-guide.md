---
slug: ai-coding-orchestration-guide
title: "AI 코딩 도구 3개를 동시에 쓰는 법 — Claude Code, Codex, Gemini CLI 오케스트레이션 완전 가이드"
authors: namyoungkim
tags: [ai-tools, orchestration, claude-code, codex, gemini]
---

> AI 코딩 도구가 하나만 있으면 좋겠지만, 현실에서는 **세 가지 도구를 적재적소에 배치**해야 최고의 결과를 얻을 수 있습니다.
> 이 글은 Claude Code, Codex, Gemini CLI를 **오케스트라처럼 조율하는 실전 전략**을 다룹니다.

## TL;DR (한 줄 요약)

- **Claude Code** = 팀장. 설계하고, 판단하고, 중요한 코드를 직접 쓴다
- **Codex** = 실행력 좋은 팀원. 여러 작업을 동시에 처리하고, 코드 리뷰도 잘한다
- **Gemini CLI** = 분석가. 방대한 자료를 읽고 정리해서 보고서를 만든다
- **핵심**: "뭐가 더 좋냐"가 아니라 **"이 작업에는 뭐가 맞냐"**

<!-- truncate -->

---

## 들어가며: 왜 AI 도구를 여러 개 써야 할까?

프로그래밍을 도와주는 AI 도구가 정말 많아졌습니다. Anthropic의 **Claude Code**, OpenAI의 **Codex**, Google의 **Gemini CLI**... 각각 "최고의 AI 코딩 도구"를 자처합니다.

그런데 한 가지 도구만 쓰면 안 되는 걸까요?

**비유로 설명하면 이렇습니다.**

축구팀을 생각해보세요. 메시가 아무리 뛰어나도 혼자서 골키퍼, 수비수, 미드필더, 공격수를 다 할 수는 없습니다. 각 포지션에 맞는 선수가 있어야 팀이 잘 굴러갑니다.

AI 코딩 도구도 마찬가지입니다:

- **Claude Code**는 메시 같은 존재입니다. 가장 똑똑하고, 복잡한 판단을 잘 합니다. 팀의 핵심이지만, 모든 걸 혼자 하면 비효율적입니다.
- **Codex**는 체력 좋은 미드필더입니다. 여러 군데를 동시에 뛰어다니며 일을 처리합니다.
- **Gemini CLI**는 데이터 분석관입니다. 상대팀 경기 영상 100개를 밤새 분석해서 보고서를 만들어줍니다.

이 세 도구를 **각각의 강점에 맞게 배치**하면, 혼자 쓸 때보다 훨씬 빠르고 정확하게 일할 수 있습니다.

이 글에서는 **어떤 상황에서 어떤 도구를 쓸지**, 그리고 **도구 사이에 어떻게 일을 넘길지**를 구체적으로 알려드리겠습니다.

---

## 이 글의 약속: 사실과 의견을 구분합니다

이 글에서는 세 가지 태그를 사용합니다:

| 태그 | 무슨 뜻? | 어떻게 받아들이면 되나? |
|------|----------|----------------------|
| **[FACT]** | 공식 문서에 적힌 **사실** | "이건 확실해" — 링크도 같이 달아놨어요 |
| **[REC]** | 써보니까 좋더라, **추천** | "이렇게 하면 효율적이야" — 팀 사정에 맞게 조정하세요 |
| **[VAR]** | 버전/설정에 따라 **바뀔 수 있음** | "지금은 이런데 나중에 달라질 수도 있어" |

왜 이렇게 구분할까요? AI 도구 세계는 변화가 빠르기 때문입니다. "이 도구가 이걸 할 수 있다"는 말이 다음 달에는 틀릴 수 있습니다. 그래서 **확실한 사실**과 **변할 수 있는 정보**를 명확히 나누는 것이 중요합니다.

---

## Part 1: 세 도구 소개 — 각각 뭘 잘하나?

### Claude Code (Anthropic) — "가장 똑똑한 팀장"

Claude Code는 Anthropic이 만든 AI 코딩 도구입니다. **생각하는 능력이 가장 뛰어나서**, 복잡한 설계 결정이나 보안 관련 코드를 맡기기에 적합합니다.

#### 어디서 쓸 수 있나? (서피스)

**[FACT]** Claude Code는 정말 다양한 곳에서 쓸 수 있습니다:
- **터미널(CLI)**: 명령어로 직접 대화
- **VS Code / JetBrains**: 에디터 안에서 바로 사용
- **데스크톱 앱**: 독립 앱으로 실행
- **웹(claude.ai/code)**: 브라우저에서 사용
- **모바일(iOS)**: 출퇴근 중에도 확인
- **Slack**: 팀 채팅에서 @Claude로 호출
- **GitHub Actions**: CI/CD 파이프라인에서 자동 실행
— [Overview](https://code.claude.com/docs/en/overview)

> **[REC]** 이렇게 서피스가 넓다는 건 큰 장점입니다. 예를 들어 "Slack에서 코드 리뷰 요청을 던지고, 출퇴근길에 모바일로 결과를 확인하고, GitHub Actions에서 자동으로 품질 검사를 돌리는" 워크플로우가 가능합니다.

#### 프로젝트 설정: CLAUDE.md

**[FACT]** 프로젝트 폴더에 `CLAUDE.md` 파일을 만들어두면, Claude Code가 세션을 시작할 때마다 자동으로 읽습니다. `/init` 명령어로 자동 생성할 수도 있습니다.
— [Overview](https://code.claude.com/docs/en/overview)

쉽게 말해 **"이 프로젝트는 이렇게 생겼고, 이런 규칙을 따라야 해"**라고 적어놓는 설명서입니다. 매번 "우리 프로젝트는 Python으로..."라고 반복할 필요가 없어집니다.

#### Skills — "전문 기술 카드"

**[FACT]** `.claude/skills/` 폴더에 스킬 파일을 만들어두면, Claude Code가 특정 상황에서 자동으로 또는 수동으로 꺼내 쓸 수 있습니다.
— [Skills](https://code.claude.com/docs/en/skills)

RPG 게임에서 캐릭터에게 기술을 장착하는 것과 비슷합니다. "코드 리뷰 스킬", "테스트 생성 스킬", "배포 스킬" 같은 것들을 미리 만들어두고, 필요할 때 호출하는 거죠.

**[FACT]** 주요 옵션:
- `context: fork` → 메인 작업을 방해하지 않고 따로 실행 (독립된 작업 공간)
- `agent` → 어떤 종류의 AI 에이전트가 실행할지 지정 (탐색용, 계획용, 범용 등)
- `allowed-tools` → 이 스킬이 사용할 수 있는 도구를 제한 (안전장치)
— [Skills](https://code.claude.com/docs/en/skills)

#### Sub-agents — "전문가 팀 구성"

**[FACT]** `.claude/agents/` 폴더에 에이전트를 정의하면, 메인 Claude Code가 **전문가를 고용해서 일을 시키는** 것처럼 작동합니다.
— [Sub-agents](https://code.claude.com/docs/en/sub-agents)

예를 들어:
- **탐색 에이전트** (model: haiku) — 저렴하고 빠른 모델로 코드베이스를 탐색
- **코드 리뷰 에이전트** (model: sonnet) — 중간 성능의 모델로 코드 리뷰
- **메인 세션** (Opus) — 가장 똑똑한 모델로 복잡한 판단

이렇게 하면 비싼 Opus 모델을 아끼면서도 효율적으로 일할 수 있습니다.

**[FACT]** Sub-agent는 독립된 공간에서 실행되고, 완료되면 **요약만** 메인에 돌려줍니다. 그래서 메인 대화가 지저분해지지 않습니다.
— [Sub-agents](https://code.claude.com/docs/en/sub-agents)

#### Hooks — "자동 품질 검사 장치"

Hooks는 **"어떤 일이 일어나면 자동으로 이것을 실행해라"**라는 규칙입니다.

**[FACT]** 주요 이벤트:
- **세션 시작/종료 시**: 환경 점검, 정리 작업
- **도구 사용 전/후**: 코드를 쓰기 전에 린트 검사, 쓴 후에 테스트 실행
- **작업 완료 시**: 빌드 결과물 확인
— [Hooks reference](https://code.claude.com/docs/en/hooks)

**[FACT]** 가장 강력한 포인트: **PreToolUse 훅이 권한 시스템보다 우선**합니다. 즉, "이 코드는 절대 쓰지 마"라는 규칙을 걸어놓으면, Claude Code가 아무리 쓰려고 해도 차단됩니다.
— [Hooks guide](https://code.claude.com/docs/en/hooks-guide)

이건 공장의 안전장치와 같습니다. 기계가 아무리 빨리 돌아가도, 위험한 상황에서는 자동으로 멈추는 거죠.

#### 그 밖의 기능들

- **[FACT]** **Plugins**: 스킬 + 에이전트 + 훅을 하나로 묶어서 `claude plugin install`로 설치. 마켓플레이스도 있습니다.
  — [Plugins](https://code.claude.com/docs/en/plugins-reference)
- **[FACT]** **Agent SDK**: 프로그램에서 Claude Code를 호출할 수 있는 도구. CI/CD 파이프라인에 통합 가능.
  — [Agent SDK](https://code.claude.com/docs/en/agent-sdk)
- **[FACT]** **자동 메모리**: 작업하면서 배운 것을 자동으로 기록하고, 다음에 다시 떠올립니다.
  — [Changelog](https://code.claude.com/docs/en/changelog)
- **[VAR]** **Agent Teams**: Lead + Teammates 구조로 여러 에이전트가 협업. 아직 연구 프리뷰 단계라 정식 기능은 아닙니다.
  — [Agent Teams](https://code.claude.com/docs/en/agent-teams)

---

### Codex (OpenAI) — "체력 좋은 만능 실행자"

Codex는 OpenAI가 만든 AI 코딩 도구입니다. **여러 작업을 동시에 처리하는 능력**과 **end-to-end로 작업을 완수하는 능력**이 뛰어납니다.

#### 핵심 모델: GPT-5.3-Codex

**[FACT]** GPT-5.3-Codex (2026년 2월 5일 출시)는 단순한 "코딩 모델"이 아니라 **"범용 에이전트 모델"**입니다. 코드 작성뿐 아니라 터미널 명령어 실행, 문서 작성, 배포 파이프라인 관리까지 처음부터 끝까지(end-to-end) 혼자 해냅니다.
— [Introducing GPT-5.3-Codex](https://openai.com/index/introducing-gpt-5-3-codex/)

이전 버전(5.2)과 비교하면:

| 벤치마크 | GPT-5.2-Codex | GPT-5.3-Codex | 변화 |
|----------|--------------|--------------|------|
| SWE-Bench Pro (코딩) | — | 56.8% | — |
| Terminal-Bench 2.0 (터미널 작업) | 64% | **77.3%** | 대폭 상승 |
| OSWorld-Verified (OS 작업) | — | 64.7% | — |
| 응답 속도 | 기준 | **25% 빠름** | 개선 |

**[FACT]** 이 모든 걸 이전보다 **더 적은 토큰**(= 더 적은 비용)으로 달성합니다.
— [Introducing GPT-5.3-Codex](https://openai.com/index/introducing-gpt-5-3-codex/)

> **핵심 변화**: 오케스트레이션에서 Codex의 역할이 "시킨 것만 하는 일꾼"에서 **"독립적으로 판단하고 실행하는 엔지니어"**로 격상되었습니다.

**[FACT]** 또한 **실시간 스티어링** 기능이 추가되었습니다. 작업이 끝날 때까지 기다리지 않고, 진행 중인 작업에 실시간으로 질문하거나 방향을 바꿀 수 있습니다.
— [Introducing GPT-5.3-Codex](https://openai.com/index/introducing-gpt-5-3-codex/)

이건 마치 택시를 탔을 때 "가던 길 말고 여기서 우회전해주세요"라고 말할 수 있는 것과 같습니다. 예전에는 목적지까지 가서야 "아 여기 말고요..."라고 말할 수 있었는데, 이제는 중간에 경로를 바꿀 수 있는 거죠.

#### 모델 라인업

Codex에는 여러 모델이 있고, 용도에 따라 골라 쓸 수 있습니다:

```
GPT-5.3-Codex       → "메인 엔진". 복잡한 구현, 터미널 작업, 장시간 태스크
GPT-5.3-Codex-Spark → "경량 엔진". 실시간 프로토타이핑, 일상 편집. 1000+ tokens/sec [VAR: 연구 프리뷰]
GPT-5.2-Codex       → "리뷰 전문가". 코드 리뷰에 특화된 훈련을 받은 모델
```

**[FACT]** GPT-5.3-Codex-Spark는 Cerebras 하드웨어에서 초당 1000개 이상의 토큰을 생성합니다. 정말 빠릅니다.
— [Introducing GPT-5.3-Codex-Spark](https://openai.com/index/introducing-gpt-5-3-codex-spark/)

#### Codex의 킬러 기능: Worktree & Cloud

**Worktree**는 Codex의 가장 독특한 기능입니다.

**[FACT]** Git worktree를 기반으로 **완전히 독립된 작업 공간**을 만듭니다. 한 에이전트가 A 기능을 만드는 동안, 다른 에이전트는 B 기능을 만들 수 있습니다. 서로 간섭하지 않습니다.
— [Worktrees](https://developers.openai.com/codex/app/worktrees/)

이건 마치 평행 우주 같은 겁니다. 같은 코드에서 출발하지만, 각각 다른 세계에서 작업하다가 나중에 합칩니다.

**[FACT]** **Cloud** 모드에서는 GitHub 연동 클라우드 환경에서 백그라운드로 작업이 돌아갑니다. `--attempts 1-4` 옵션을 쓰면 **같은 문제를 최대 4가지 방법으로** 풀어보고 비교할 수 있습니다(best-of-N).
— [Cloud environments](https://developers.openai.com/codex/cloud/environments/), [CLI features](https://developers.openai.com/codex/cli/features/)

#### 코드 리뷰: Codex의 숨은 강점

**[FACT]** GPT-5.2-Codex는 **코드 리뷰에 특화된 훈련**을 받았습니다. 일반적인 코딩 모델과는 다르게, "이 코드에서 뭐가 잘못됐는지" 찾는 능력이 특별히 강화되어 있습니다.
— [Introducing GPT-5.2-Codex](https://openai.com/index/introducing-gpt-5-2-codex/)

리뷰 방법도 여러 가지입니다:

- **[FACT]** **CLI에서**: `/review` 명령어로 로컬에서 바로 리뷰 (코드를 수정하지 않고 읽기만 함)
  — [CLI features](https://developers.openai.com/codex/cli/features/)
- **[FACT]** **GitHub PR에서**: `@codex review`를 댓글에 쓰면 PR을 자동 리뷰. P0(심각)/P1(중요) 등급으로 이슈를 분류합니다.
  — [Code Review](https://developers.openai.com/codex/cloud/code-review)
- **[FACT]** **포커스 리뷰**: `@codex review for security regressions`처럼 특정 관점을 지정할 수 있습니다.
  — [Code Review](https://developers.openai.com/codex/cloud/code-review)

#### 자동화 기능

- **[FACT]** **Automations**: 반복 태스크를 스케줄링해서 백그라운드에서 자동 실행
  — [App features](https://developers.openai.com/codex/app/features/)
- **[FACT]** **Autofix CI**: CI가 실패하면 자동으로 수정 시도
  — [Codex home](https://developers.openai.com/codex/)
- **[FACT]** **@codex 멘션**: GitHub 이슈에 @codex를 태그하면 자동으로 Cloud 태스크가 생성됩니다
  — [Changelog](https://developers.openai.com/codex/changelog)

#### 어디서 쓸 수 있나?

**[FACT]** Codex App (macOS), CLI, VS Code/Cursor/Windsurf, 웹(Codex Cloud), iOS, Slack, Linear, GitHub.
— [Codex home](https://developers.openai.com/codex/)

#### 프로젝트 설정: AGENTS.md

Claude Code의 CLAUDE.md와 비슷하게, Codex는 **AGENTS.md**를 읽습니다.

**[FACT]** 글로벌 설정(`~/.codex/AGENTS.md`)과 프로젝트 설정(repo root)을 병합하며, 더 구체적인 쪽(하위 디렉토리)이 우선합니다.
— [AGENTS.md guide](https://developers.openai.com/codex/guides/agents-md/)

---

### Gemini CLI (Google) — "방대한 자료를 소화하는 분석가"

Gemini CLI는 Google이 만든 AI 코딩 도구입니다. **엄청나게 긴 문서를 한 번에 읽고 분석하는 능력**이 최고입니다.

#### 핵심 모델: Gemini 3 Pro

**[FACT]** Gemini 3 Pro는 **1M(100만) 토큰 컨텍스트**를 지원합니다. 64K 출력.
— [Vertex AI docs](https://docs.cloud.google.com/vertex-ai/generative-ai/docs/models/gemini/3-pro)

"100만 토큰"이 얼마나 큰지 감이 안 올 수 있는데, 대략 **책 10권 분량**입니다. 프로젝트의 소스 코드 수백 개 파일을 한 번에 읽고 분석할 수 있다는 뜻입니다.

비교하면:
- Claude Code: 최대 1M (베타, 조건부) **[VAR]**
- Codex(GPT-5.2): 400K **[FACT]**
- **Gemini 3 Pro: 1M (안정적)** **[FACT]**

#### 모델 라인업

```
Gemini 3 Pro   → "대용량 분석기". 1M 컨텍스트, 대규모 분석/리서치
Gemini 3 Flash → "빠른 스캐너". 200K 컨텍스트, 빠른 탐색/요약/CI 파이프라인
```

**[VAR]** 현재 3 Pro/Flash 모두 preview 상태입니다. GA(정식 출시)되면 모델 ID가 바뀔 수 있습니다.

#### 킬러 기능: Headless Mode

이것이 Gemini CLI의 가장 독특한 강점입니다.

**[FACT]** `--output-format text/json/jsonl` 옵션으로 **프로그래밍 가능한 출력**을 생성합니다.
— [Headless](https://geminicli.com/docs/cli/headless/)

무슨 말이냐면, 다른 AI 도구들은 "사람이 읽기 좋은" 형태로 결과를 주는데, Gemini CLI는 **"다른 프로그램이 바로 처리할 수 있는"** 형태로 줄 수 있다는 겁니다.

실전 예시:
```bash
# 코드 변경사항을 자동 요약
git diff | gemini -p "이 변경사항을 한국어로 요약해줘" --output-format json

# 릴리스 노트 자동 생성
git log --since="2026-02-01" | gemini -p "릴리스 노트로 정리해줘" --output-format text

# 대규모 코드베이스 분석
gemini --model gemini-3-pro -p "전체 코드의 의존성 구조와 순환 참조를 분석해줘" --output-format text > report.md
```

CI/CD 파이프라인에 넣으면, **커밋할 때마다 자동으로 변경사항 요약**을 만들거나, **릴리스할 때마다 릴리스 노트**를 생성할 수 있습니다.

#### 어디서 쓸 수 있나?

**[FACT]** CLI, VS Code, JetBrains, Positron IDE.
— [Docs](https://geminicli.com/docs/)

> **[REC]** Claude Code나 Codex에 비해 서피스가 좁습니다 (웹/모바일/Slack/데스크톱 앱 없음). 그래서 "대규모 분석 + 파이프라인 자동화" 역할에 집중시키는 게 좋습니다.

#### 그 밖의 기능들

- **[FACT]** **오픈소스**: 전체 소스 코드가 공개되어 있습니다. — [GitHub](https://github.com/google-gemini/gemini-cli)
- **[FACT]** **Google Search 내장**: 웹 검색 결과를 바로 활용할 수 있습니다.
- **[FACT]** **Extensions**: 스킬 + MCP + 훅 + 에이전트를 하나로 묶은 번들. GitHub URL로 설치. — [Extensions](https://geminicli.com/docs/extensions/)
- **[FACT]** **Token caching**: 같은 컨텍스트를 반복 사용할 때 비용을 절약합니다.

#### 프로젝트 설정: GEMINI.md

**[FACT]** 프로젝트 루트에 `GEMINI.md`를 놓으면 됩니다. `.geminiignore`로 특정 파일을 제외할 수도 있습니다.
— [Docs](https://geminicli.com/docs/)

---

## Part 2: 한눈에 비교 — 누가 뭘 잘하나?

### 병렬 실행 (여러 작업을 동시에)

| 도구 | 어떻게? | 얼마나 안정적? |
|------|---------|-------------|
| Claude Code | Sub-agents (독립 공간에서 실행) | 안정적 |
| **Codex** | **Worktree (Git 기반 완전 격리) + Cloud 백그라운드 + best-of-N** | **가장 성숙** |
| Gemini CLI | 단일 세션 + 셸 스크립트로 병렬화 | 상대적으로 약함 |

> **승자: Codex.** Worktree 기반 격리가 가장 성숙하고, Cloud에서 백그라운드 실행 + best-of-N까지 지원합니다.

### 자동화 (알아서 검사하고 처리하기)

| 도구 | 어떻게? | 강점 |
|------|---------|------|
| **Claude Code** | **Hooks (PreToolUse > 권한 시스템)** | **가장 세밀한 품질 검사** |
| Codex | Automations + Autofix CI + @codex 멘션 | 가장 실용적인 워크플로우 |
| Gemini CLI | Hooks + Headless (JSON 출력) | 파이프라인 통합 가장 유연 |

> **승자: 용도에 따라 다름.** 품질 게이트는 Claude Code, 워크플로우 자동화는 Codex, CI/CD 파이프라인은 Gemini CLI.

### 코드 리뷰

| 도구 | 어떻게? | 강점 |
|------|---------|------|
| Claude Code | Sub-agent 기반 커스텀 리뷰어 | 아키텍처/설계 의도 리뷰 |
| **Codex** | **/review (CLI) + @codex review (PR) + 5.2 리뷰 특화** | **가장 완성된 리뷰 시스템** |
| Gemini CLI | Headless 파이프라인으로 구성 가능 | 내장 리뷰 프리셋 없음 |

> **승자: Codex.** GPT-5.2-Codex가 코드 리뷰에 특화 훈련을 받았고, CLI/GitHub PR 양쪽에서 모두 쓸 수 있습니다.

### 확장성/커스터마이징

| 도구 | 어떻게? | 강점 |
|------|---------|------|
| **Claude Code** | **Skills + Sub-agents + Hooks + Plugins + MCP + Output Styles** | **가장 풍부한 에이전트 제어** |
| Codex | AGENTS.md + Skills + MCP Server + Agents SDK | SDK 기반 외부 오케스트레이션 |
| Gemini CLI | Extensions (올인원 번들) + Skills + Hooks + MCP | 오픈소스 + 번들 배포 |

> **승자: Claude Code.** 커스터마이징할 수 있는 요소가 가장 많습니다.

---

## Part 3: 라우팅 룰 — "이 작업은 누구한테 맡길까?"

이제 핵심입니다. **어떤 작업이 왔을 때 어떤 도구에 맡길지** 결정하는 규칙입니다.

4가지 기준(축)으로 판단하며, **위에 있는 축이 우선**합니다.

### 축 1: Risk (위험도) → Claude Code

**"이거 잘못하면 큰일나는 작업"은 Claude Code에게.**

이런 작업이 해당됩니다:
- 아키텍처 설계 결정 (시스템 구조를 바꾸는 것)
- 보안 민감 구현 (로그인, 결제, 비밀키 관리)
- 복잡한 멀티파일 리팩토링 (파일 여러 개를 동시에 바꾸는 것)
- 미묘한 논리 버그 디버깅 (재현이 어려운 버그)
- 새 기능의 핵심 인터페이스 설계

**왜 Claude Code?**

두 가지 이유입니다:

1. **[FACT]** Hooks로 위험한 행동에 자동 제동을 걸 수 있습니다. 예를 들어 "production 데이터베이스에 접근하는 코드를 쓰면 무조건 차단"같은 규칙을 강제할 수 있습니다. — [Hooks guide](https://code.claude.com/docs/en/hooks-guide)

2. **[FACT]** Sub-agent에 모델/도구/권한을 분리할 수 있어서, 보안 감사 에이전트에는 "코드 읽기만 가능, 수정 불가"같은 제한을 걸 수 있습니다. — [Sub-agents](https://code.claude.com/docs/en/sub-agents)

비유하면, **중요한 수술은 가장 숙련된 의사에게 맡기고, 수술실에 안전장치(Hooks)를 최대로 가동하는 것**과 같습니다.

### 축 2: Input Size (분석할 양) → Gemini CLI

**"읽어야 할 게 산더미인 작업"은 Gemini CLI에게.**

이런 작업이 해당됩니다:
- 파일 50개 이상을 동시에 분석
- 대용량 로그 파일 요약
- 전체 코드베이스의 의존성/패턴/순환 참조 스캔
- 기술 옵션 비교 리서치 (Google Search 활용)

**왜 Gemini CLI?**

- **[FACT]** Gemini 3 Pro의 1M 컨텍스트는 현재 가장 안정적인 대용량 입력 지원입니다. — [Vertex AI docs](https://docs.cloud.google.com/vertex-ai/generative-ai/docs/models/gemini/3-pro)
- **[FACT]** Headless 모드의 JSON/JSONL 출력으로, 분석 결과를 다른 도구가 바로 사용할 수 있습니다. — [Headless](https://geminicli.com/docs/cli/headless/)

비유하면, **서류 1000장을 분석해야 할 때, 속독 능력이 가장 뛰어난 분석가에게 맡기는 것**과 같습니다.

**[REC] 분석 결과는 항상 파일로 저장합니다:**
```
저장 위치: .ai/notes/10_analysis.md
포맷: TL;DR / Findings / Evidence(file:line) / Recommendations / Next actions
```

### 축 3: Parallelism (동시 실행) → Codex

**"동시에 여러 개를 해야 하는 작업"은 Codex에게.**

이런 작업이 해당됩니다:
- 같은 패턴을 3개 이상의 파일에 반복 적용
- 독립적인 작업 2개 이상을 동시 진행
- Cloud 백그라운드 실행 (장시간 마이그레이션)
- 여러 가지 풀이를 비교하고 싶을 때 (`--attempts`로 best-of-N)
- 터미널/OS 작업이 포함된 end-to-end 태스크 (배포, 환경 설정)
- 빠른 프로토타이핑 (실시간 스티어링 활용)

**왜 Codex?**

- **[FACT]** Worktree로 Git 기반 완전 격리가 가능합니다. — [Worktrees](https://developers.openai.com/codex/app/worktrees/)
- **[FACT]** Cloud에서 백그라운드로 병렬 실행하며, best-of-N(최대 4)을 지원합니다. — [CLI features](https://developers.openai.com/codex/cli/features/)
- **[FACT]** GPT-5.3-Codex는 Terminal-Bench 2.0에서 77.3%를 달성했습니다. 터미널/OS 작업을 처음부터 끝까지 혼자 완수하는 능력이 최고입니다. — [Introducing GPT-5.3-Codex](https://openai.com/index/introducing-gpt-5-3-codex/)

비유하면, **공사 현장에서 여러 팀이 동시에 각각의 구역을 작업하는 것**과 같습니다. A팀은 1층, B팀은 2층, C팀은 3층을 동시에 짓되, 서로 간섭하지 않습니다.

### 축 4: Repetition (반복) → Codex + Gemini

**"같은 종류의 일을 반복하는 작업"은 Codex와 Gemini에게.**

**Codex가 담당하는 반복:**
- PR 코드 리뷰: `/review` (로컬) 또는 `@codex review` (GitHub)
- 반복 태스크: Automations (매일 에러 분석, 변경 리포트)
- CI 실패 자동 수정: Autofix CI
- 이슈에서 자동 작업: @codex 멘션 → Cloud 태스크

**Gemini가 담당하는 반복:**
- CI/CD 파이프라인 내 자동 분석 (headless)
- 커밋마다 변경사항 자동 요약
- 릴리스마다 릴리스 노트 자동 생성

### 라우팅 요약 다이어그램

새 작업이 도착하면 이 순서대로 판단합니다:

```
새 작업 도착
    │
    ├─ 설계/보안/복잡한 판단이 필요? ──→ Claude Code (메인)
    │
    ├─ 파일 50개+ 분석이 필요? ────────→ Gemini CLI (Headless)
    │                                     → .ai/notes/ 에 저장
    │                                     → Claude Code가 읽고 활용
    │
    ├─ 여러 작업을 동시에? ────────────→ Codex (Worktree/Cloud)
    │
    ├─ 터미널/OS 작업 end-to-end? ─────→ Codex (GPT-5.3)
    │
    ├─ 빠른 프로토타이핑? ─────────────→ Codex (Spark, 실시간 스티어링)
    │
    ├─ 코드 리뷰? ─────────────────────→ Codex (GPT-5.2, 리뷰 특화)
    │                                     + Claude Code (아키텍처 리뷰)
    │
    ├─ 반복 자동화? ───────────────────→ Codex Automations
    │                                     + Gemini Headless (CI/CD)
    │
    └─ 위에 해당하지 않는 나머지 전부? ──→ Claude Code (기본값)
```

**우선순위: Risk > Input Size > Parallelism > Repetition**

축이 겹치면 위에 있는 축이 우선합니다. 예를 들어, "보안 관련 대규모 리팩토링"은 Risk(축 1)에 해당하므로 Claude Code가 맡습니다.

---

## Part 4: 라우팅 브리핑 — "누가 뭘 할지 먼저 정하기"

### 언제 브리핑이 필요한가?

모든 작업에 브리핑이 필요한 건 아닙니다.

```
브리핑 필요 없음 (그냥 시작):
  - 파일 하나 버그 수정
  - 작은 기능 추가
  - 단순한 코드 리뷰
  - 일상적인 디버깅
  → Claude Code에서 바로 시작하면 됨

브리핑 필요 (먼저 계획 세우기):
  - 도구 2개 이상이 관여할 것 같을 때
  - 작업이 반나절 이상 걸릴 것 같을 때
  - 도구 사이에 일을 넘기는 과정(핸드오프)이 있을 때
  - 처음 해보는 유형의 작업일 때
```

### 브리핑은 어떻게 하나?

**코디네이터는 Claude Code(Opus)**가 담당합니다. 가장 똑똑한 모델이 라우팅 결정을 주도합니다.

```
① 작업 쪼개기
   "이 작업을 완수하려면 어떤 하위 작업들이 필요한가?"

② 각 작업을 4축에 대입
   - 위험한 작업? → Claude Code
   - 분석할 양이 많은 작업? → Gemini CLI
   - 동시 실행 가능한 작업? → Codex
   - 반복 작업? → Codex + Gemini

③ 각 도구 안에서 모델 선택
   - Claude: Opus (복잡) / Sonnet (일상) / Haiku (탐색)
   - Codex: 5.3 (복잡) / 5.3-Spark (빠른) / 5.2 (리뷰)
   - Gemini: 3 Pro (대규모) / 3 Flash (경량)

④ 실행 순서와 넘기는 조건 정하기
   "누가 먼저 하고, 결과물은 뭐고, 다음 도구가 시작하려면 뭐가 준비돼야 하나?"

⑤ 기록
   → .ai/notes/00_routing-decision.md 에 저장
```

### 실제 예시: OAuth2 인증 기능 추가

```markdown
# Routing Decision — OAuth2 인증 추가
Date: 2026-02-13

## 하위 작업 & 라우팅

| # | 하위 작업 | 도구 | 모델 | 이유 |
|---|-----------|------|------|------|
| 1 | 코드베이스 영향 분석 | Gemini CLI | 3 Pro | 파일 80개 이상 분석 필요 (축 2) |
| 2 | 인터페이스 설계 | Claude Code | Opus | 아키텍처 결정 (축 1) |
| 3 | 병렬 구현 (3 모듈) | Codex | 5.3 | 독립적인 3개 작업 동시 (축 3) |
| 4 | 코드 리뷰 | Codex | 5.2 | 리뷰 특화 모델 (축 4) |
| 5 | 최종 통합 리뷰 | Claude Code | Opus | 보안/확장성 검증 (축 1) |

## 실행 순서
Gemini (분석) → Claude (설계) → Codex (병렬 구현) → Codex (리뷰) → Claude (최종 리뷰)

## 넘기는 조건
- 1→2: 분석 보고서 완성 + 근거(file:line) 포함
- 2→3: 인터페이스 확정 + 완료 조건 명시
- 3→4: PR 생성 + 테스트 통과
- 4→5: 심각한 이슈(P0) 없음
```

> **[REC]** 브리핑이 작업보다 무거우면 안 됩니다. **5분 이내**에 결정하세요. 자주 나오는 패턴이면 "패턴 A 적용"이라고만 적어도 충분합니다.

---

## Part 5: 실전 워크플로우 패턴 4가지

### 패턴 A: 새 기능 개발 (풀 사이클)

가장 일반적인 패턴입니다. 분석 → 설계 → 구현 → 리뷰의 전체 사이클을 거칩니다.

```
① Gemini CLI — 코드베이스 전체 분석
   "현재 인증 시스템의 구조, 확장 포인트, 리스크를 분석해줘"
   → .ai/notes/10_analysis.md 에 저장

② Claude Code — 설계 + 핵심 구현
   분석 보고서를 참조해서 OAuth2 모듈을 설계하고 핵심 코드를 구현
   Hooks로 자동 린트/테스트/권한 검사

③ Codex (Worktree) — 병렬 구현
   Thread 1: 테스트 작성
   Thread 2: 기존 엔드포인트에 미들웨어 적용
   Thread 3: 데이터베이스 마이그레이션 스크립트
   (세 작업이 동시에 진행!)

④ Codex — 코드 리뷰 (GPT-5.2 리뷰 특화)
   GitHub PR에서 @codex review for security regressions

⑤ Claude Code — 최종 아키텍처 리뷰
   "이 PR이 확장성/보안 관점에서 적절한지 검토해줘"
```

### 패턴 B: 대규모 리팩토링

코드 구조를 크게 바꿔야 할 때 사용합니다.

```
① Gemini CLI — 영향 범위 분석
   1M 컨텍스트로 전체 코드베이스를 읽고, 어디가 영향받는지 분석

② Claude Code — 전략 수립 + 핵심 인터페이스 변경
   가장 중요하고 위험한 부분을 직접 처리

③ Codex Cloud — 나머지 파일 마이그레이션
   best-of-3로 여러 방법을 시도하고, 가장 좋은 것을 선택

④ Gemini CLI — 크로스 검증
   변경된 전체 코드를 다시 읽어서 동시성 문제나 엣지케이스 확인
```

### 패턴 C: 크로스 검증 (관점 분리)

중요한 코드 변경을 여러 관점에서 검증할 때 사용합니다.

**[REC]** 핵심은 **"같은 질문을 2개 모델에"가 아니라 "각자 다른 관점으로"**입니다:

```
Codex:  diff 기반으로 버그/보안 취약점/테스트 누락 확인 (/review)
Gemini: 엣지케이스/성능 문제/의존성 충돌/운영 리스크 확인 (headless 스캔)
Claude: 아키텍처 일관성/설계 의도 부합/향후 리팩터 방향 검토 (subagent)
```

같은 코드를 보지만 각자 다른 안경을 끼고 보는 겁니다.

### 패턴 D: 반복 자동화

매일/매 커밋/매 PR마다 자동으로 돌아가는 루틴입니다.

```
Codex Automations:
  - 매일: 에러 로그 분석 → 수정 PR 자동 생성
  - PR마다: @codex review 자동 트리거
  - 이슈 생성 시: @codex → Cloud 태스크 자동 생성

Gemini Headless (CI/CD 파이프라인):
  - 커밋마다: git diff를 읽어서 변경사항 자동 요약
  - 릴리스마다: git log를 읽어서 릴리스 노트 자동 생성

Claude Code Hooks:
  - 코드 수정 후: 자동 포매팅 + 린트 (command hook)
  - 작업 완료 시: 테스트 통과 여부 자동 검증 (agent hook)
  - 배포 완료 시: 빌드 결과물 존재 확인 (command hook)
```

---

## Part 6: 모델이 업데이트되면 어떻게 하나?

AI 모델은 계속 발전합니다. 지금은 "Claude가 추론 최강"이지만, 내일 GPT-6가 나오면 달라질 수 있습니다. 그래서 **정기적으로 라우팅 규칙을 재검토**하는 프로세스가 필요합니다.

### 언제 재검토하나?

```
즉시 재검토 (새 모델 출시 시):
  - Anthropic: Claude 새 모델 (예: Opus 5)
  - OpenAI: Codex 새 모델 (예: GPT-5.4-Codex)
  - Google: Gemini 새 모델 (예: Gemini 3.5 Pro)

정기 재검토 (3개월마다):
  - 모델이 안 바뀌어도, 실제 사용 경험을 바탕으로 재평가
```

### 재검토 프로세스 (약 반나절)

```
① 스펙/벤치마크 수집 (1시간)
   공식 발표와 벤치마크를 비교

② 라우팅 근거 검증 (30분)
   - 축 1: Claude가 여전히 추론 최강?
   - 축 2: Gemini가 여전히 대용량 컨텍스트 최고?
   - 축 3: Codex가 여전히 병렬/end-to-end 최고?
   - 축 4: 리뷰/자동화 최적 도구는?

③ 실제 태스크로 비교 (2-4시간)
   같은 작업을 새/구 모델로 실행해서 비교

④ 문서 업데이트 (30분)
   라우팅 룰 변경 여부를 결정하고, 이 문서를 갱신
```

### 라우팅이 뒤집히는 시나리오

지금의 라우팅은 **4가지 핵심 가정** 위에 세워져 있습니다. 이 가정이 무너지면 라우팅도 바뀌어야 합니다:

```
가정 1: "Claude가 추론 최강"
  → 무너지는 조건: 경쟁 모델이 주요 벤치마크에서 Opus를 확실히 초월
  → 대응: Risk 축의 기본 도구를 재평가

가정 2: "Gemini가 대용량 컨텍스트 최적"
  → 무너지는 조건: Claude/Codex가 1M+ 컨텍스트를 안정적으로 지원
  → 대응: Input 축에서 Gemini의 독점 근거가 사라짐

가정 3: "Codex가 병렬/end-to-end 최강"
  → 무너지는 조건: Claude Agent Teams가 정식 출시 + Worktree급 격리 지원
  → 대응: Parallel 축에서 Claude가 Codex를 대체할 수 있는지 평가

가정 4: "도구 사이의 연결은 파일로"
  → 무너지는 조건: MCP/A2A로 도구 간 실시간 연동이 안정화
  → 대응: 파일 기반 핸드오프에서 실시간 연동으로 전환
```

---

## Part 7: 프로젝트 설정하기

### 추천 폴더 구조

```
project-root/
├── CLAUDE.md          ← 프로젝트의 "헌법". 모든 규칙의 원본
├── AGENTS.md          ← Codex용 설정 (CLAUDE.md를 참조)
├── GEMINI.md          ← Gemini용 설정 (CLAUDE.md를 참조)
│
├── .claude/
│   ├── agents/        ← Claude Code 전문가 팀
│   │   ├── code-reviewer.md   (model: sonnet)
│   │   ├── security-auditor.md (읽기전용 도구만)
│   │   └── explorer.md        (model: haiku, 저비용 탐색)
│   └── skills/        ← Claude Code 기술 카드
│       ├── repo-scout/SKILL.md  (코드베이스 스캔)
│       ├── test-gen/SKILL.md    (테스트 생성)
│       └── deploy/SKILL.md      (배포 워크플로우)
│
├── .gemini/
│   └── settings.json
│
├── .ai/               ← 도구 사이의 "공유 게시판"
│   ├── routing.md     ← 라우팅 룰 요약 (A4 한 장)
│   ├── handoff.md     ← 일 넘기기 템플릿
│   └── notes/         ← 분석/결정/태스크 기록 (.gitignore에 추가)
│       ├── 00_routing-decision.md
│       ├── 10_analysis.md
│       ├── 20_decisions.md
│       └── 90_handoff.md
│
└── .gitignore         ← .ai/notes/ 포함
```

핵심 규칙: **CLAUDE.md가 Single Source of Truth(유일한 진실의 원천)**입니다. AGENTS.md와 GEMINI.md는 "CLAUDE.md를 참조하라"고만 적고, 규칙을 복사하지 않습니다. 복사하면 나중에 불일치가 생기기 때문입니다.

### 각 설정 파일 예시

#### CLAUDE.md (프로젝트의 "헌법")

```markdown
# Project: 내 서비스

## Tech Stack
- Python 3.12, FastAPI, SQLAlchemy 2.0
- uv + ruff + ty + pytest
- PostgreSQL, Redis

## Conventions
- src/ 레이아웃
- Type hints 필수
- 함수 20-50줄, 단일 책임
- Explicit over Clever (영리한 코드보다 명확한 코드)
- 에러 처리: 구체적 예외, 절대 bare except 금지
- 시크릿 하드코딩 금지

## Commands
- Format: `uv run ruff format .`
- Lint:   `uv run ruff check .`
- Type:   `uv run ty check`
- Test:   `uv run pytest`

## Do NOT
- print() 디버깅 금지 (logging 사용)
- Any 타입 금지
- 테스트 없는 기능 금지
```

#### AGENTS.md (Codex용)

```markdown
# Instructions

CLAUDE.md의 컨벤션을 따른다.

## Working agreements
- 파일 수정 후 반드시 린트 + 타입체크 + 테스트 실행
- 새 의존성 추가 전 확인 요청
- 커밋 메시지: conventional commits (feat/fix/refactor/test/docs)

## Review guidelines
- 보안 취약점 (SQL injection, 인증 우회, 시크릿 노출): P0 (치명적)
- 타입 힌트 누락: P1 (중요)
- bare except: P1
- 테스트 누락 (핵심 로직): P1
```

#### GEMINI.md (Gemini용)

```markdown
# Context

이 프로젝트의 컨벤션과 아키텍처는 CLAUDE.md를 참조하라.
중복 복사 금지 — CLAUDE.md가 Single Source of Truth.

## Model Policy
- 대규모 분석/리서치: Gemini 3 Pro (1M 컨텍스트)
- CI/CD 파이프라인/빠른 요약: Gemini 3 Flash (200K)

## Output Format (분석 작업 시)
### TL;DR → Findings → Evidence(file:line) → Recommendations → Next Actions

## Save Location
분석 결과는 `.ai/notes/` 에 마크다운으로 저장.
```

#### .ai/handoff.md (일 넘기기 템플릿)

도구 사이에 일을 넘길 때 이 형식을 씁니다:

```markdown
# Handoff Template

## Goal
(한 줄: 무엇을 달성해야 하는가)

## Context
- Source tool: (이전에 누가 했나)
- Source artifacts: (이전 도구가 만든 파일 경로)
- Related files: (소스 코드 경로)
- Constraints: (제약 조건)

## Deliverables
- [ ] (산출물 1)
- [ ] (산출물 2)

## Acceptance Criteria
- [ ] 린트 통과
- [ ] 타입체크 통과
- [ ] 테스트 통과

## Non-goals
- (명시적으로 하지 말 것)
```

---

## Part 8: 비용 관리 — 똑똑하게 돈 쓰기

AI 도구는 사용량에 따라 비용이 발생합니다. 모델이 비쌀수록 좋은 결과를 내지만, 모든 작업에 가장 비싼 모델을 쓸 필요는 없습니다.

**[REC]** 가격은 수시로 변하므로 "얼마"라고 단정하지 않고, **정책으로 관리**합니다.

### 정책 1: 작업 난이도에 따라 모델을 나누자

```
쉬운 작업 (탐색/요약/스캔)
  → 가장 저렴한 모델
  → Gemini 3 Flash, Claude Haiku, GPT-5.3-Codex-Spark

보통 작업 (일상 구현/디버깅)
  → 중간 모델
  → Claude Sonnet, GPT-5.3-Codex, Gemini 3 Pro

어려운 작업 (복잡한 설계/판단)
  → 최고 모델 (여기에만 투자!)
  → Claude Opus, GPT-5.3-Codex (장시간 에이전틱)
```

이건 마치 **이동할 때 교통수단을 고르는 것**과 같습니다. 옆 편의점 갈 때는 걸어가고(Haiku), 시내 출퇴근은 지하철(Sonnet), 해외 출장은 비행기(Opus)를 타는 거죠.

### 정책 2: Claude Code에서 Sub-agent 모델 분리

**[FACT]** Claude Code 서브에이전트에 `model:` 필드로 모델을 지정할 수 있습니다.
— [Sub-agents](https://code.claude.com/docs/en/sub-agents)

```
탐색 에이전트 (explorer.md)      → model: haiku   (저렴하고 빠름)
코드 리뷰 에이전트 (reviewer.md) → model: sonnet  (균형)
메인 세션                         → Opus           (복잡한 판단만)
```

> **[REC]** 이 분리만으로 Opus 토큰 소비를 **50% 이상** 줄일 수 있습니다. 코드베이스 탐색 같은 단순 작업을 Haiku에게 맡기면, Opus는 진짜 중요한 판단에만 집중할 수 있습니다.

### 정책 3: Codex 모델도 용도별로

```
GPT-5.3-Codex       → 복잡한 구현, 장시간 태스크, 터미널/OS 작업
GPT-5.3-Codex-Spark → 빠른 반복, 프로토타이핑, 일상 디버깅 [VAR: 연구 프리뷰]
GPT-5.2-Codex       → 코드 리뷰 전용
```

**[FACT]** GPT-5.3-Codex는 이전 모델 대비 25% 빠르고, 더 적은 토큰으로 동일 성과를 달성합니다.
— [Introducing GPT-5.3-Codex](https://openai.com/index/introducing-gpt-5-3-codex/)

### 정책 4: 주간 비용 리뷰

- **[REC]** 매주 모델별 사용량을 확인합니다
- **[REC]** Opus 사용이 과도하면 Sonnet으로 전환할 수 있는지 검토합니다
- **[REC]** 저렴한 모델(Gemini 3 Flash, Haiku 등)로 처리 가능한 작업에 고급 모델을 쓰고 있지 않은지 확인합니다

---

## Part 9: 최종 정리

### 세 줄 요약

| 도구 | 한 줄 역할 |
|------|-----------|
| **Claude Code** | **팀장.** 설계/구현/디버깅/통합. Hooks로 품질 게이트. 특별한 이유가 없으면 전부 여기서. |
| **Codex** | **실행자.** 병렬 처리(Worktree/Cloud) + end-to-end 완수(5.3) + 코드 리뷰(5.2) + 반복 자동화. |
| **Gemini CLI** | **분석가.** 대규모 분석(1M 컨텍스트) + Headless 파이프라인 자동화 + 크로스 검증. |

### 5가지 핵심 원칙

1. **파일이 API** — 도구 사이에 일을 넘길 때는 `.ai/notes/`에 마크다운이나 JSON을 쓴다. 도구끼리 직접 대화하지 않고, **파일을 통해 소통**한다.

2. **CLAUDE.md = Single Source of Truth** — 프로젝트 규칙은 CLAUDE.md에 한 번만 쓴다. AGENTS.md와 GEMINI.md는 "CLAUDE.md를 참조하라"고만 적는다.

3. **[FACT]와 [VAR]을 엄격히 구분** — 베타/프리뷰 기능에 의존할 때는 반드시 대안을 준비한다.

4. **비용은 정책으로 관리** — 금액을 단정하지 말고, "이 난이도면 이 등급 모델"이라는 정책을 세운다.

5. **강점 극대화** — 세 도구의 약점을 보완하려 하지 말고, **각자의 강점을 극대화**하는 방향으로 조합한다.

---

*Last updated: 2026-02-13*
*Primary sources: [code.claude.com/docs](https://code.claude.com/docs), [developers.openai.com/codex](https://developers.openai.com/codex), [geminicli.com/docs](https://geminicli.com/docs)*
