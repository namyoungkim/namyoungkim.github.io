---
slug: llms-txt-introduction
title: "llms.txt란? AI를 위한 웹사이트 목차 표준"
authors: namyoungkim
tags: [ai, llm, web-standard]
---

# llms.txt란? AI를 위한 웹사이트 목차 표준

> robots.txt가 검색 엔진을 위한 것이라면, llms.txt는 AI를 위한 것입니다.

## 🎯 들어가며

웹사이트에 `robots.txt`가 있듯이, 이제 `llms.txt`도 등장했습니다. 2024년 9월 **Jeremy Howard**가 제안한 이 표준은 LLM(Large Language Model)이 웹사이트 콘텐츠를 쉽게 이해할 수 있도록 돕는 파일입니다.

<!-- truncate -->

---

## 📚 llms.txt란?

**llms.txt**는 웹사이트의 `/llms.txt` 경로에 위치하는 마크다운 파일입니다. 사이트의 구조와 주요 콘텐츠를 AI가 이해하기 쉬운 형태로 정리해둡니다.

```
https://example.com/llms.txt
```

### 기본 구조

```markdown
# 사이트 이름

> 사이트에 대한 간단한 설명

## 📚 Documentation
- /docs/intro: 소개 문서
- /docs/getting-started: 시작 가이드

## ✍️ Blog Posts
- /blog/2025/01/01/post-title: 포스트 제목

## Optional
- /blog/tags: 태그 목록
```

---

## 💡 왜 필요한가?

### HTML의 문제점

웹페이지는 사람을 위해 만들어졌습니다. 네비게이션, 광고, JavaScript, CSS... LLM 입장에서는 전부 **노이즈**입니다.

```html
<!-- LLM이 보는 웹페이지 -->
<nav>메뉴1 메뉴2 메뉴3...</nav>
<aside>광고 배너...</aside>
<script>복잡한 JavaScript...</script>
<main>드디어 본문!</main>
<footer>저작권 정보...</footer>
```

### LLM 컨텍스트 한계

LLM의 컨텍스트 윈도우는 제한적입니다. 전체 웹사이트를 한 번에 처리할 수 없죠. **llms.txt**는 "여기 중요한 것만 정리해뒀어"라고 알려주는 역할을 합니다.

---

## 📄 두 가지 파일

| 파일 | 용도 | 비유 |
|------|------|------|
| `llms.txt` | 목차와 요약 | 책의 목차 |
| `llms-full.txt` | 전체 콘텐츠를 하나로 | 책 전체 |

**llms.txt**는 가볍게 구조만, **llms-full.txt**는 모든 문서를 하나의 마크다운으로 합친 파일입니다.

---

## 📊 채택 현황

| 수치 | 내용 |
|------|------|
| **84만+ 사이트** | 2025년 10월 기준 llms.txt 구현 (BuiltWith) |
| **주요 기업** | Anthropic, Cloudflare, Stripe, Cursor |
| **LLM 트래픽** | 2024년 0.25% → 2025년 말 10% 예상 |

2024년 11월 **Mintlify**(문서 플랫폼)가 기본 지원을 시작하면서 급격히 확산됐습니다.

---

## 🤔 실제로 활용되나?

### 확인된 것

- Microsoft, OpenAI 등의 크롤러가 llms.txt를 **수집하고 있음** (Profound 데이터)
- 학습 데이터나 RAG 시스템에 활용될 가능성

### 아직 불확실한 것

> "어떤 주요 AI 플랫폼도 공식적으로 llms.txt를 읽는다고 발표하지 않았습니다"

SEO처럼 즉각적인 효과를 기대하기는 어렵습니다. 하지만 AI 시대를 준비하는 차원에서 도입하는 사이트가 늘고 있습니다.

---

## ⚖️ llms.txt vs MCP

이 블로그는 **llms.txt**와 **MCP 서버**를 모두 제공합니다. 차이점은:

| 구분 | llms.txt | MCP 서버 |
|------|----------|----------|
| **방식** | AI가 URL을 fetch | Claude가 직접 호출 |
| **정보** | 목록 + URL (정적) | 전체 콘텐츠 + 검색 (동적) |
| **기능** | 목차만 | 검색, 필터링, 실시간 조회 |
| **대상** | 모든 LLM | Claude Desktop |

**llms.txt**: "여기 목록이야, 가서 봐"
**MCP**: "뭐 필요해? 내가 가져다줄게"

MCP를 지원하지 않는 환경에서는 llms.txt가 유용한 대안이 됩니다.

---

## 🔗 이 블로그의 llms.txt

이 블로그도 llms.txt를 제공합니다:

**URL**: https://namyoungkim.github.io/llms.txt

`npm run build` 시 자동으로 `docs/`와 `blog/`를 스캔해서 생성됩니다.

---

## 마무리

llms.txt는 아직 초기 단계의 표준입니다. 공식적인 효과는 불확실하지만, AI 친화적인 웹을 만들기 위한 첫걸음으로 볼 수 있습니다.

robots.txt가 검색 엔진 최적화의 기본이 되었듯이, llms.txt가 AI 최적화의 기본이 될지도 모릅니다.

---

## 참고 자료

- [llms.txt 공식 사이트](https://llmstxt.org/)
- [Meet llms.txt - Search Engine Land](https://searchengineland.com/llms-txt-proposed-standard-453676)
- [The value of llms.txt - Mintlify](https://www.mintlify.com/blog/the-value-of-llms-txt-hype-or-real)
