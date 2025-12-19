---
slug: ai-agent-ecosystem-part2
title: "AI 에이전트 생태계 완전 정복 (2/3): Agent Skills 딥다이브"
authors: namyoungkim
tags: [ai, ai-agents, mcp, skills]
---

# AI 에이전트 생태계 완전 정복 (2/3): Agent Skills 딥다이브

> 이 글은 3부작 시리즈의 두 번째 글입니다. [1편](/blog/ai-agent-ecosystem-part1)을 먼저 읽어보세요.

[1편](/blog/ai-agent-ecosystem-part1)에서 AI를 돕는 4가지 도구(MCP, Skills, Subagents, Commands)를 알아봤어요. 이번 편에서는 **Skills**를 더 깊이 파봅니다. 왜 Skills가 MCP보다 토큰 효율적인지, 좋은 Skills는 어떻게 만드는지, 그리고 한 번 만든 Skills를 여러 도구에서 쓸 수 있는지 알아볼게요.

<!-- truncate -->

---

## 왜 Skills가 주목받을까?

### MCP의 문제: 가방이 너무 무거워!

1편에서 MCP는 "연결 케이블"이라고 했죠? 그런데 이 케이블에 문제가 있어요.

AI에게는 **가방**(컨텍스트 윈도우)이 있는데, 이 가방 크기가 정해져 있어요. MCP를 쓰면 연결할 수 있는 모든 도구 설명서를 가방에 **한꺼번에** 넣어야 해요.

```
+------------------------------------------------------------------+
|                                                                  |
|   MCP Approach: Put EVERYTHING in the bag first                  |
|                                                                  |
|   +----------------------------------------------------------+   |
|   |  AI's Backpack                                           |   |
|   |                                                          |   |
|   |  [Calendar Manual - 500 pages]                           |   |
|   |  [Drive Manual - 300 pages]                              |   |
|   |  [Slack Manual - 400 pages]                              |   |
|   |  [Database Manual - 600 pages]                           |   |
|   |  [Email Manual - 200 pages]                              |   |
|   |  [...20 more manuals...]                                 |   |
|   |                                                          |   |
|   |  "I just wanted to say hello..."                         |   |
|   |  But bag is already FULL!                                |   |
|   |                                                          |   |
|   +----------------------------------------------------------+   |
|                                                                  |
|   Result: Just saying "hello" = 46,000+ tokens (= money!)        |
|                                                                  |
+------------------------------------------------------------------+
```

실제로 "안녕"이라고만 해도 **46,000 토큰**이 소모된다는 연구 결과가 있어요. 토큰은 돈이에요!

### Skills의 해결책: 똑똑한 책장

Skills는 다르게 작동해요. **책 제목만 메모**해두고, 필요한 책만 그때그때 꺼내 읽어요.

```
+------------------------------------------------------------------+
|                                                                  |
|   Skills Approach: Smart Bookshelf                               |
|                                                                  |
|   +----------------------------------------------------+         |
|   |  Step 1: Only see book TITLES (very light!)        |         |
|   |                                                    |         |
|   |  [Cooking]  [Cleaning]  [Party]  [Travel]          |         |
|   |                                                    |         |
|   |  AI thinks: "User wants a party... let me check    |         |
|   |              the Party book"                       |         |
|   +----------------------------------------------------+         |
|                         |                                        |
|                         v  Only when needed!                     |
|   +----------------------------------------------------+         |
|   |  Step 2: Pull out ONLY the relevant book           |         |
|   |                                                    |         |
|   |  +----------------------------------+              |         |
|   |  | "Party Planning Guide"           |              |         |
|   |  |                                  |              |         |
|   |  |  - How to write invitations      |              |         |
|   |  |  - Cake ordering steps           |              |         |
|   |  |  - Decoration checklist          |              |         |
|   |  +----------------------------------+              |         |
|   |                                                    |         |
|   |  Other books stay on the shelf!                    |         |
|   +----------------------------------------------------+         |
|                                                                  |
|   Result: Use tokens only for what you actually need             |
|                                                                  |
+------------------------------------------------------------------+
```

이걸 **Progressive Disclosure**(점진적 공개)라고 불러요. 어려운 말 같지만, 그냥 "필요한 것만 꺼내 쓰기"예요.

---

## 사람들은 어떤 Skills를 만들까?

전 세계 개발자들이 다양한 Skills를 만들고 공유하고 있어요. 크게 7가지 카테고리로 나눌 수 있어요.

### 카테고리별 정리

| 카테고리 | 예시 | 비유 |
|----------|------|------|
| **문서 처리** | Word, Excel, PDF, PPT 만들기 | 문서 작성 도우미 |
| **개발/기술** | 코드 리뷰, 테스트, 디버깅 | 프로그래머 친구 |
| **크리에이티브** | 프레젠테이션, GIF, 디자인 | 예술가 친구 |
| **생산성** | 회의록 정리, 파일 관리, 일정 관리 | 비서 친구 |
| **과학/연구** | 논문 검색, 데이터 분석 | 연구원 친구 |
| **보안/테스트** | 웹사이트 테스트, 보안 점검 | 경비원 친구 |
| **기업/소통** | 브랜드 가이드, 내부 문서 | 회사 규칙책 |

### 인기 있는 Skills 예시

```
+------------------------------------------------------------------+
|                                                                  |
|   Popular Skills Examples                                        |
|                                                                  |
|   +-- Document Skills (Built-in) ---------------------------+    |
|   | - docx: Create Word documents with formatting           |    |
|   | - xlsx: Create Excel with formulas and charts           |    |
|   | - pptx: Create PowerPoint presentations                 |    |
|   | - pdf: Fill forms, merge, extract text                  |    |
|   +---------------------------------------------------------+    |
|                                                                  |
|   +-- Community Favorites --------------------------------+      |
|   | - youtube-transcript: Get video subtitles & summarize |      |
|   | - meeting-insights: Turn meetings into action items   |      |
|   | - test-driven-development: Write tests before code    |      |
|   | - webapp-testing: Test websites automatically         |      |
|   | - file-organizer: Clean up messy folders              |      |
|   +-------------------------------------------------------+      |
|                                                                  |
+------------------------------------------------------------------+
```

재미있는 점: **docx, xlsx, pptx, pdf** Skills는 이미 Claude에 내장되어 있어요. "엑셀 파일 만들어줘"라고 하면 자동으로 이 Skills가 작동해요!

---

## 좋은 Skills는 뭐가 다를까?

레고를 조립할 때 설명서가 잘 되어 있으면 쉽고, 엉망이면 어렵잖아요. Skills도 마찬가지예요.

### 1. 이름과 설명이 명확해야 해요

AI가 "이 Skills를 써야겠다"고 판단하는 건 **이름**과 **설명**을 보고 결정해요.

```
+------------------------------------------------------------------+
|                                                                  |
|   Good vs Bad Skill Names & Descriptions                         |
|                                                                  |
|   +-- BAD Example ------------------------------------+          |
|   |                                                   |          |
|   |   name: my-skill-v2-final-real                    |          |
|   |   description: Does stuff with documents          |          |
|   |                                                   |          |
|   |   AI thinks: "What does this even do?"            |          |
|   +---------------------------------------------------+          |
|                                                                  |
|   +-- GOOD Example -----------------------------------+          |
|   |                                                   |          |
|   |   name: birthday-invitation-writer                |          |
|   |   description: Creates personalized birthday      |          |
|   |                invitations. Use when writing      |          |
|   |                party invites or celebration       |          |
|   |                announcements.                     |          |
|   |                                                   |          |
|   |   AI thinks: "User wants invitations - perfect!"  |          |
|   +---------------------------------------------------+          |
|                                                                  |
+------------------------------------------------------------------+
```

**팁**: 설명에는 "무엇을 하는지" + "언제 쓰는지" 둘 다 적어야 해요.

### 2. AI가 이미 아는 건 적지 마세요

AI는 이미 똑똒해요! "1+1=2야"처럼 당연한 건 쓸 필요 없어요.

```
+------------------------------------------------------------------+
|                                                                  |
|   Don't Explain What AI Already Knows                            |
|                                                                  |
|   +-- BAD: Too much explanation ----------------------+          |
|   |                                                   |          |
|   |   "A birthday party is a celebration that         |          |
|   |    happens once a year on the day someone         |          |
|   |    was born. People usually have cake and..."     |          |
|   |                                                   |          |
|   |   AI: "I know what a birthday is..."              |          |
|   +---------------------------------------------------+          |
|                                                                  |
|   +-- GOOD: Just the unique stuff --------------------+          |
|   |                                                   |          |
|   |   "For our company's birthday invitations:        |          |
|   |    - Always use the blue brand color (#1E40AF)    |          |
|   |    - Include RSVP link: events.company.com        |          |
|   |    - Sign off with 'The Party Committee'"         |          |
|   |                                                   |          |
|   |   AI: "Got it, these are the special rules!"      |          |
|   +---------------------------------------------------+          |
|                                                                  |
+------------------------------------------------------------------+
```

### 3. 체크리스트를 넣으세요

좋은 Skills는 AI가 **스스로 점검**할 수 있게 체크리스트를 포함해요.

```markdown
## 완료 전 체크리스트

- [ ] 받는 사람 이름이 들어갔나요?
- [ ] 날짜와 시간이 명확한가요?
- [ ] 장소 주소가 정확한가요?
- [ ] RSVP 연락처가 있나요?
```

### 4. 실제로 5번 이상 쓸 일인가요?

Skills를 만들기 전에 스스로 물어보세요:

> "이 작업을 5번 이상 해봤고, 앞으로 10번 이상 할 것 같아?"

**YES** → Skills 만들기
**NO** → 그냥 대화로 해결

```
+------------------------------------------------------------------+
|                                                                  |
|   "Should I make a Skill?" Decision                              |
|                                                                  |
|        Have you done this task 5+ times?                         |
|                      |                                           |
|              +-------+-------+                                   |
|              |               |                                   |
|             YES              NO                                  |
|              |               |                                   |
|              v               v                                   |
|   Will you do it 10+ more?   Don't make a Skill.                 |
|              |               Just chat with AI.                  |
|       +------+------+                                            |
|       |             |                                            |
|      YES            NO                                           |
|       |             |                                            |
|       v             v                                            |
|   Make a Skill!    Maybe wait and see.                           |
|                                                                  |
+------------------------------------------------------------------+
```

---

## Skills는 어디서든 쓸 수 있을까?

여기서 좋은 소식이 있어요. Skills가 **오픈 스탠다드**가 됐어요!

### USB-C 같은 표준

예전에는 폰마다 충전기가 달랐죠? 이제는 USB-C 하나로 다 돼요. Skills도 비슷해요.

```
+------------------------------------------------------------------+
|                                                                  |
|   Skills = USB-C for AI Agents                                   |
|                                                                  |
|                    SKILL.md (Standard Format)                    |
|                           |                                      |
|       +-------------------+-------------------+                  |
|       |                   |                   |                  |
|       v                   v                   v                  |
|   +--------+         +--------+         +--------+               |
|   | Claude |         | Cursor |         | VS Code|               |
|   +--------+         +--------+         +--------+               |
|       |                   |                   |                  |
|       v                   v                   v                  |
|   +--------+         +--------+         +--------+               |
|   |LangChain|        | Goose  |         | GitHub |               |
|   +--------+         +--------+         +--------+               |
|                                                                  |
|   One Skill works (almost) everywhere!                           |
|                                                                  |
+------------------------------------------------------------------+
```

### 현재 Skills를 지원하는 도구들

| 도구 | 만든 곳 | 상태 |
|------|---------|------|
| Claude / Claude Code | Anthropic | ✅ 기본 지원 |
| Cursor | Cursor | ✅ 지원 |
| VS Code | Microsoft | ✅ 지원 |
| GitHub Copilot | GitHub | ✅ 지원 |
| LangChain Deep Agents | LangChain | ✅ 지원 |
| Goose | Block | ✅ 지원 |
| OpenCode | 커뮤니티 | ✅ 지원 |

Anthropic은 Skills를 **오픈 스탠다드**로 공개했어요. [agentskills.io](https://agentskills.io)에서 누구나 표준 문서를 보고, 기여할 수 있어요. 덕분에 Cursor, VS Code, LangChain 등 여러 도구들이 같은 형식을 지원하게 됐죠.

### 근데 진짜 수정 없이 쓸 수 있어?

솔직히 말하면: **거의 그렇지만, 100%는 아니에요.**

#### 공통인 것 (수정 없이 OK)
- SKILL.md 파일 형식
- 마크다운으로 쓴 설명
- 기본적인 지침들

#### 다를 수 있는 것 (약간 조정 필요)
- 폴더 위치 (Claude는 `.claude/skills/`, VS Code는 `.github/skills/`)
- 일부 고급 기능

```
+------------------------------------------------------------------+
|                                                                  |
|   Cross-Platform Reality Check                                   |
|                                                                  |
|   +-- Same Everywhere (Core) ----------------------------+       |
|   |                                                      |       |
|   |   ---                                                |       |
|   |   name: my-skill                                     |       |
|   |   description: What it does and when to use          |       |
|   |   ---                                                |       |
|   |   # Instructions                                     |       |
|   |   Your markdown content here...                      |       |
|   |                                                      |       |
|   +------------------------------------------------------+       |
|                                                                  |
|   +-- May Differ (Location) -----------------------------+       |
|   |                                                      |       |
|   |   Claude:   .claude/skills/my-skill/SKILL.md         |       |
|   |   VS Code:  .github/skills/my-skill/SKILL.md         |       |
|   |   Others:   .agent/skills/my-skill/SKILL.md          |       |
|   |                                                      |       |
|   +------------------------------------------------------+       |
|                                                                  |
|   Solution: Just copy the folder to the right location!          |
|                                                                  |
+------------------------------------------------------------------+
```

**실무 팁**: Skills 내용은 한 번 작성하고, 폴더만 각 도구에 맞게 복사하면 돼요.

---

## 나만의 Skills 만들기

Skills 만들기는 생각보다 쉬워요. 코딩 몰라도 돼요!

### 가장 쉬운 방법

Claude에게 그냥 말하세요:

> "나만의 Skill 만들고 싶어. 도와줘."

Claude가 질문하고, 답하면 알아서 만들어줘요!

### 직접 만들기

```
my-skill/
├── SKILL.md          <- 이것만 있으면 됨!
├── templates/        <- (선택) 템플릿 파일들
└── examples/         <- (선택) 예시들
```

**SKILL.md 기본 구조:**

```markdown
---
name: birthday-invitation-writer
description: Creates personalized birthday invitations.
             Use when writing party invites.
---

# Birthday Invitation Writer

## When to Use
- User asks for birthday invitation
- User mentions party planning

## Instructions
1. Ask for the birthday person's name
2. Ask for date, time, and location
3. Write a warm, friendly invitation
4. Include RSVP information

## Checklist Before Sending
- [ ] Name is correct
- [ ] Date and time are clear
- [ ] Location is included
- [ ] RSVP contact is provided
```

이게 끝이에요! 이 파일 하나면 Skills 완성이에요.

---

## 핵심 정리

1. **Skills가 주목받는 이유**: MCP보다 토큰 효율적 (필요한 것만 꺼내 씀)

2. **좋은 Skills의 조건**:
   - 이름과 설명이 명확
   - AI가 이미 아는 건 빼기
   - 체크리스트 포함
   - 5번 이상 쓸 일에만 만들기

3. **어디서든 사용 가능**: Skills는 오픈 스탠다드! Claude, Cursor, VS Code 등에서 (거의) 그대로 사용

4. **만들기 쉬움**: SKILL.md 파일 하나만 있으면 됨

---

## 다음 편 예고

Skills가 왜 좋은지, 어떻게 만드는지 알았어요.

그런데 궁금한 게 있죠?

> "MCP는 그럼 어떻게 되는 거야? 안 쓰는 건가?"
> "Anthropic은 왜 MCP를 Linux Foundation에 기부했을까?"
> "LangGraph나 Deep Agents 같은 것도 배워야 하나?"

다음 편에서 이 질문들에 답해볼게요. Anthropic의 진짜 전략을 파헤쳐 봅시다!

👉 **[3편: MCP vs Skills - Anthropic의 전략과 우리의 선택](/blog/ai-agent-ecosystem-part3)**

---

## 참고 자료

- [Skill authoring best practices - Claude Docs](https://docs.claude.com/en/docs/agents-and-tools/agent-skills/best-practices)
- [How to create Skills for Claude](https://claude.com/blog/how-to-create-skills-key-steps-limitations-and-examples)
- [Agent Skills 공식 사이트](https://agentskills.io)
- [Anthropic Skills GitHub](https://github.com/anthropics/skills)
- [Awesome Claude Skills](https://github.com/travisvn/awesome-claude-skills)
