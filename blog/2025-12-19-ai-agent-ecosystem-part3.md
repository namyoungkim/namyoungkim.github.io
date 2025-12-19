---
slug: ai-agent-ecosystem-part3
title: "AI 에이전트 확장 도구 이해하기 (3/3): MCP vs Skills의 전략적 선택"
authors: namyoungkim
tags: [ai, ai-agents, mcp, skills]
---

# AI 에이전트 확장 도구 이해하기 (3/3): MCP vs Skills의 전략적 선택

> 이 글은 3부작 시리즈의 마지막 글입니다. [1편](/blog/ai-agent-ecosystem-part1), [2편](/blog/ai-agent-ecosystem-part2)을 먼저 읽어보세요.

[1편](/blog/ai-agent-ecosystem-part1)에서는 AI를 돕는 4가지 도구를 알아봤고, [2편](/blog/ai-agent-ecosystem-part2)에서는 Skills를 깊이 파봤어요. 오늘은 좀 더 큰 그림을 볼 거예요: MCP의 토큰 문제가 얼마나 심각한지, Anthropic은 왜 MCP를 Linux Foundation에 기부했는지, 그리고 우리는 뭘 배워야 할지 알아봅니다.

<!-- truncate -->

---

## MCP 토큰 문제: 얼마나 심각해?

2편에서 MCP가 가방을 무겁게 만든다고 했죠? 실제 숫자를 볼게요.

### 실제 측정 결과

| 상황 | 토큰 소모 | 비유 |
|------|----------|------|
| "안녕"이라고만 말함 | 46,000+ | 편지 한 장 쓰려고 백과사전 들고 다님 |
| "회의 노트 요약해줘" | 240,000+ | 메모 하나 보려고 도서관 전체를 가방에 |
| 일반적인 MCP 연결 | 50,000+ | 시작도 전에 가방이 반쯤 참 |

```
+------------------------------------------------------------------+
|                                                                  |
|   MCP Token Problem - Real Numbers                               |
|                                                                  |
|   Your AI's backpack can hold: [====================] 100,000    |
|                                                                  |
|   After connecting MCP tools:                                    |
|                                                                  |
|   [################====] Already 80% full!                       |
|    ^                ^                                            |
|    |                |                                            |
|    Tool manuals     Room left for                                |
|    (50,000+)        actual work                                  |
|                                                                  |
|   Problem: Where do you put the actual task?                     |
|                                                                  |
+------------------------------------------------------------------+
```

### 왜 이런 일이 생길까?

MCP는 연결할 수 있는 **모든 도구의 설명서**를 미리 가방에 넣어요.

캘린더, 드라이브, 슬랙, 이메일, 데이터베이스... 각각 수백 페이지의 설명서가 있다고 생각해보세요. 10개만 연결해도 설명서만 수천 페이지!

```
+------------------------------------------------------------------+
|                                                                  |
|   Why MCP Uses So Many Tokens                                    |
|                                                                  |
|   You connect 10 MCP servers:                                    |
|                                                                  |
|   [Calendar]  -> 500 tokens (tool descriptions)                  |
|   [Drive]     -> 800 tokens                                      |
|   [Slack]     -> 600 tokens                                      |
|   [Email]     -> 400 tokens                                      |
|   [Database]  -> 1,200 tokens                                    |
|   [GitHub]    -> 2,000 tokens                                    |
|   [Notion]    -> 700 tokens                                      |
|   [Jira]      -> 900 tokens                                      |
|   [Figma]     -> 500 tokens                                      |
|   [Stripe]    -> 600 tokens                                      |
|                 ─────────────                                    |
|   TOTAL:        8,200 tokens BEFORE you even ask anything!       |
|                                                                  |
|   And this is a SMALL example...                                 |
|   Real enterprise setups: 50,000 - 100,000+ tokens               |
|                                                                  |
+------------------------------------------------------------------+
```

### 해결책들이 나오고 있어요

Anthropic도 이 문제를 알고 있어요. 그래서 해결책을 만들었어요:

| 해결책 | 설명 | 효과 |
|--------|------|------|
| **Tool Search** | 모든 도구 대신, 필요한 도구만 검색해서 로드 | 토큰 37% 감소 |
| **Programmatic Tool Calling** | AI가 코드를 짜서 도구를 효율적으로 호출 | 중간 결과 토큰 절약 |

하지만 이건 "반창고"예요. 근본적인 해결은 아니죠.

---

## MCP를 Linux Foundation에 기부한 이유

2025년 12월, 큰 뉴스가 있었어요.

> **Anthropic이 MCP를 Linux Foundation에 기부했습니다.**

Linux Foundation은 Linux, Kubernetes, Node.js 같은 유명한 오픈소스 프로젝트를 관리하는 비영리 단체예요.

### 같이 참여한 회사들

```
+------------------------------------------------------------------+
|                                                                  |
|   Agentic AI Foundation (AAIF)                                   |
|   Under Linux Foundation                                         |
|                                                                  |
|   +-- Founders ------------------------------------+             |
|   |                                                |             |
|   |   Anthropic    +    OpenAI    +    Block       |             |
|   |   (donated MCP)   (donated      (donated       |             |
|   |                    AGENTS.md)    Goose)        |             |
|   +------------------------------------------------+             |
|                                                                  |
|   +-- Supporters ----------------------------------+             |
|   |                                                |             |
|   |   Google   Microsoft   AWS   Cloudflare        |             |
|   |                                    Bloomberg   |             |
|   +------------------------------------------------+             |
|                                                                  |
+------------------------------------------------------------------+
```

Anthropic, OpenAI, Google, Microsoft, AWS... 경쟁사들이 다 모였어요!

### MCP의 성과 (기부 전)

| 지표 | 숫자 |
|------|------|
| 공개 MCP 서버 | 10,000개+ |
| 월간 SDK 다운로드 | 9,700만+ |
| 채택한 제품 | ChatGPT, Cursor, Gemini, VS Code 등 |

엄청난 성공이죠?

### 그런데 왜 기부했을까?

여기서 재미있는 질문이 나와요:

> "이렇게 성공했는데, 왜 남한테 줬어?"

---

## Anthropic의 진짜 전략은?

두 가지 해석이 가능해요.

### 해석 1: "너무 커져서 나눠 관리하자" (공식 입장)

```
+------------------------------------------------------------------+
|                                                                  |
|   Official Story                                                 |
|                                                                  |
|   "MCP is too successful for one company to manage"              |
|   "Neutral governance is better for the ecosystem"               |
|   "Linux Foundation has decades of experience"                   |
|                                                                  |
|   Translation: "We're being generous for everyone's benefit"     |
|                                                                  |
+------------------------------------------------------------------+
```

### 해석 2: "문제는 커뮤니티가 해결해" (현실적 해석)

```
+------------------------------------------------------------------+
|                                                                  |
|   Realistic Interpretation                                       |
|                                                                  |
|   MCP Problem: Token explosion, complex setup                    |
|                                                                  |
|   Anthropic's move:                                              |
|   - Donate MCP -> Community handles the problems                 |
|   - Focus on Skills -> Our platform advantage                    |
|                                                                  |
|   School Analogy:                                                |
|   +--------------------------------------------------+           |
|   |                                                  |           |
|   |  MCP = School Library                            |           |
|   |  "We built it, but now the city manages it"      |           |
|   |  -> Everyone shares maintenance burden           |           |
|   |                                                  |           |
|   |  Skills = Our Class's Special Study Method       |           |
|   |  "This is what WE teach best"                    |           |
|   |  -> Our competitive advantage                    |           |
|   |                                                  |           |
|   +--------------------------------------------------+           |
|                                                                  |
+------------------------------------------------------------------+
```

### 내 생각: 둘 다 맞아요

솔직히, 둘 다 사실인 것 같아요.

| 관점 | 사실인가? |
|------|----------|
| MCP가 성공해서 중립 관리가 필요 | ✅ 맞음 |
| MCP 토큰 문제가 골치 아픔 | ✅ 맞음 |
| Skills에 더 집중하고 싶음 | ✅ 아마도 |
| 유지보수 부담 분산 | ✅ 부분적으로 |

---

## 큰 그림: 누가 뭘 담당하나?

이제 AI 에이전트 세계의 역할 분담이 명확해졌어요.

```
+------------------------------------------------------------------+
|                                                                  |
|   AI Agent Ecosystem - Who Does What?                            |
|                                                                  |
|   +-- AAIF (Linux Foundation) ---------------------------+       |
|   |                                                      |       |
|   |   MCP         AGENTS.md        Goose                 |       |
|   |   (Connect)   (Instructions)   (Open Agent)          |       |
|   |                                                      |       |
|   |   = Industry Infrastructure (everyone shares)        |       |
|   +------------------------------------------------------+       |
|                                                                  |
|   +-- Individual Companies ------------------------------+       |
|   |                                                      |       |
|   |   Anthropic: Skills + Claude (competitive edge)      |       |
|   |   OpenAI: GPT + Custom Instructions                  |       |
|   |   Google: Gemini + Agent Development Kit             |       |
|   |                                                      |       |
|   |   = Company-specific Advantages                      |       |
|   +------------------------------------------------------+       |
|                                                                  |
+------------------------------------------------------------------+
```

### 비유: 도로와 자동차

- **MCP** = 도로 (모두가 공유하는 인프라)
- **Skills** = 자동차 브랜드별 특수 기능 (각 회사의 차별점)

도로는 정부(Linux Foundation)가 관리하고, 자동차 회사들은 각자의 차를 더 좋게 만드는 데 집중해요.

---

## LangGraph, Deep Agents... 배워야 할까?

여기서 많이들 궁금해하는 질문:

> "LangChain, LangGraph, Deep Agents 같은 것도 배워야 하나요?"

### 먼저, 이것들이 뭔지 알아보자

```
+------------------------------------------------------------------+
|                                                                  |
|   LangChain Ecosystem - Building Blocks                          |
|                                                                  |
|   +-- LangGraph (Runtime) ------------------------+              |
|   |   How AI thinks and makes decisions           |              |
|   |   Like: Brain's decision-making process       |              |
|   +-----------------------------------------------+              |
|                         ^                                        |
|                         |                                        |
|   +-- LangChain (Framework) ----------------------+              |
|   |   Tools and patterns for building AI apps     |              |
|   |   Like: Toolbox with many useful tools        |              |
|   +-----------------------------------------------+              |
|                         ^                                        |
|                         |                                        |
|   +-- Deep Agents (Harness) ----------------------+              |
|   |   Ready-to-use AI assistant (like Claude)     |              |
|   |   Like: Pre-built robot, just turn it on      |              |
|   +-----------------------------------------------+              |
|                                                                  |
+------------------------------------------------------------------+
```

### 선택 가이드

| 당신의 상황 | 추천 |
|-------------|------|
| Claude를 주로 쓸 예정 | **Skills + Claude Agent SDK** 집중 |
| 여러 AI 모델을 섞어 쓸 예정 | **LangGraph** 배워두면 좋음 |
| 복잡한 워크플로우가 많음 | **LangGraph** 강점 |
| 빨리 뭔가 만들고 싶음 | **Skills**로 시작 |
| 데이터 검색/분석이 주 업무 | **LangChain** 좋음 |

### 내 권장: 우선순위를 정하세요

```
+------------------------------------------------------------------+
|                                                                  |
|   Learning Priority (If you use Claude mainly)                   |
|                                                                  |
|   +-- Priority 1: HIGH ------------------------------------+     |
|   |                                                        |     |
|   |   Skills                                               |     |
|   |   - Token efficient                                    |     |
|   |   - Works across platforms (Cursor, VS Code, etc.)     |     |
|   |   - Easy to create (just markdown!)                    |     |
|   |                                                        |     |
|   +--------------------------------------------------------+     |
|                                                                  |
|   +-- Priority 2: MEDIUM ----------------------------------+     |
|   |                                                        |     |
|   |   LangGraph Concepts (not deep dive)                   |     |
|   |   - Understand state machines                          |     |
|   |   - Graph-based workflows                              |     |
|   |   - Useful knowledge everywhere                        |     |
|   |                                                        |     |
|   +--------------------------------------------------------+     |
|                                                                  |
|   +-- Priority 3: WAIT AND SEE ----------------------------+     |
|   |                                                        |     |
|   |   Deep Agents                                          |     |
|   |   - Still early stage                                  |     |
|   |   - "Claude Code clone" concept                        |     |
|   |   - Check back in 6 months                             |     |
|   |                                                        |     |
|   +--------------------------------------------------------+     |
|                                                                  |
+------------------------------------------------------------------+
```

---

## 실전 가이드: 뭘 언제 쓸까?

### 의사결정 플로우차트

```
+------------------------------------------------------------------+
|                                                                  |
|   "What should I learn/use?" Final Decision                      |
|                                                                  |
|                        START                                     |
|                          |                                       |
|                          v                                       |
|            +---------------------------+                         |
|            | Do you need to connect to |                         |
|            | external systems?         |                         |
|            | (DB, API, Calendar, etc.) |                         |
|            +-------------+-------------+                         |
|                          |                                       |
|                 YES      |      NO                               |
|                  |       |       |                               |
|                  v       |       v                               |
|             Use MCP      |   +------------------------+          |
|          (but minimize)  |   | Teaching AI "how to"   |          |
|                  |       |   | do something?          |          |
|                  |       |   +-----------+------------+          |
|                  |       |               |                       |
|                  |       |      YES      |      NO               |
|                  |       |       |       |       |               |
|                  v       |       v       |       v               |
|            +----------+  | +---------+   |  Just chat with AI    |
|            |Combine:  |  | | Skills  |   |  No special tools     |
|            |MCP for   |  | +---------+   |  needed               |
|            |connect + |  |               |                       |
|            |Skills for|  |               |                       |
|            |knowledge |  |               |                       |
|            +----------+  |               |                       |
|                                                                  |
+------------------------------------------------------------------+
```

### 조합 예시

| 하고 싶은 일 | 조합 |
|--------------|------|
| 캘린더 보고 회의 요약하기 | MCP(캘린더 연결) + Skills(요약 방법) |
| 초대장 잘 쓰는 법 가르치기 | Skills만 |
| 매주 보고서 자동 생성 | MCP(데이터 가져오기) + Skills(보고서 형식) + Subagent(병렬 처리) |
| 코드 리뷰 자동화 | Skills(리뷰 기준) |

### 핵심 원칙

```
+------------------------------------------------------------------+
|                                                                  |
|   Golden Rules                                                   |
|                                                                  |
|   1. "Knowledge" -> Skills                                       |
|      (How to do something, best practices, templates)            |
|                                                                  |
|   2. "Connection" -> MCP (minimize!)                             |
|      (Only when you MUST access external systems)                |
|                                                                  |
|   3. "Parallel work" -> Subagents                                |
|      (When tasks can be split and done simultaneously)           |
|                                                                  |
|   4. "Quick shortcut" -> Commands                                |
|      (Frequent tasks you want to trigger manually)               |
|                                                                  |
+------------------------------------------------------------------+
```

---

## 앞으로 주목할 것

### 1. Skills 생태계 폭발

Skills가 오픈 스탠다드가 되면서, 앞으로 엄청나게 많은 Skills가 공유될 거예요. 마치 스마트폰 앱스토어처럼요.

### 2. MCP 토큰 문제 개선

Linux Foundation 아래에서 여러 회사가 협력해서 토큰 문제를 해결해 나갈 거예요. 하지만 시간이 걸릴 거예요.

### 3. AI 에이전트 도구 통합

지금은 Skills, MCP, AGENTS.md가 따로따로지만, 점점 하나로 합쳐지는 방향으로 갈 수도 있어요.

---

## 시리즈 최종 정리

3편에 걸쳐 AI 에이전트 생태계를 살펴봤어요. 핵심만 정리하면:

### 도구 요약

| 도구 | 역할 | 비유 | 언제 쓰나 |
|------|------|------|----------|
| **Skills** | 노하우/방법론 | 레시피북 | AI에게 "이렇게 해"라고 가르칠 때 |
| **MCP** | 외부 연결 | USB 케이블 | 캘린더, DB 등에 접근할 때 (최소한으로!) |
| **Subagents** | 병렬 작업 | 조별 과제 | 여러 일을 동시에 할 때 |
| **Commands** | 단축키 | 버튼 | 자주 쓰는 작업 빠르게 |

### Anthropic 전략 요약

```
+------------------------------------------------------------------+
|                                                                  |
|   Anthropic's Bet                                                |
|                                                                  |
|   MCP:    "Let's make it industry standard"                      |
|           -> Donated to Linux Foundation                         |
|           -> Everyone maintains together                         |
|                                                                  |
|   Skills: "This is OUR competitive advantage"                    |
|           -> Open standard, but Claude does it best              |
|           -> Where they're really investing                      |
|                                                                  |
+------------------------------------------------------------------+
```

### 배움 우선순위 (Claude 사용자 기준)

1. **Skills** ⭐⭐⭐ - 가장 먼저, 가장 실용적
2. **MCP 기본 이해** ⭐⭐ - 연결이 필요할 때
3. **LangGraph 개념** ⭐ - 복잡한 워크플로우가 필요할 때
4. **Deep Agents** - 관망 (아직 초기 단계)

---

## 마무리

AI 에이전트 세계는 빠르게 변하고 있어요.

하지만 걱정 마세요. **Skills부터 시작**하면 돼요. 만들기 쉽고, 여러 플랫폼에서 쓸 수 있고, 토큰도 효율적이에요.

MCP가 필요하면 그때 배우고, LangGraph가 필요하면 그때 배우면 돼요.

중요한 건 **지금 당장 필요한 것부터** 배우는 거예요.

이 시리즈가 여러분의 AI 에이전트 여정에 도움이 됐으면 좋겠어요!

---

## 참고 자료

- [Anthropic - Donating MCP to Linux Foundation](https://www.anthropic.com/news/donating-the-model-context-protocol-and-establishing-of-the-agentic-ai-foundation)
- [Anthropic - Advanced Tool Use](https://www.anthropic.com/engineering/advanced-tool-use)
- [Agent Skills 공식 사이트](https://agentskills.io)
- [MCP 공식 사이트](https://modelcontextprotocol.io)
- [LangChain - Deep Agents](https://blog.langchain.com/deep-agents/)
- [LangChain - Using Skills with Deep Agents](https://blog.langchain.com/using-skills-with-deep-agents/)

---

## 시리즈 전체 목차

1. **[1편: AI 에이전트 확장 인터페이스 총정리](/blog/ai-agent-ecosystem-part1)** - Skills, MCP, Subagents 비교
2. **[2편: Agent Skills 딥다이브](/blog/ai-agent-ecosystem-part2)** - 만들고, 평가하고, 공유하기
3. **[3편: MCP vs Skills](/blog/ai-agent-ecosystem-part3)** - Anthropic의 전략과 우리의 선택 (현재 글)
