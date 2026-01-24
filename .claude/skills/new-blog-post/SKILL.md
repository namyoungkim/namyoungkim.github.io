---
description: 새 블로그 포스트 생성
user-invocable: true
allowed-tools:
  - Write
  - Read
  - Glob
---

# 새 블로그 포스트 생성

사용자가 제공한 주제로 새 블로그 포스트를 생성합니다.

## 작업 순서

1. 오늘 날짜를 YYYY-MM-DD 형식으로 확인
2. 사용자에게 다음 정보 요청 (제공되지 않은 경우):
   - slug (URL 경로)
   - title (제목)
   - tags (태그 목록)
3. `blog/YYYY-MM-DD-{slug}.md` 파일 생성

## Frontmatter 템플릿

```markdown
---
slug: {slug}
title: {title}
authors: namyoungkim
tags: [{tags}]
---

포스트 요약 (2-3문장)

<!-- truncate -->

## 본문 시작

내용을 여기에 작성합니다.
```

## 태그 규칙

- 모두 소문자 사용
- 하이픈으로 단어 연결: `machine-learning`
- 약어 지양: `ml` (X) → `machine-learning` (O)
- TAG-GUIDELINES.md 참조
