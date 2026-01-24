---
description: 새 기술 문서 생성
user-invocable: true
allowed-tools:
  - Write
  - Read
  - Glob
---

# 새 기술 문서 생성

docs/ 디렉토리에 새 기술 문서를 생성합니다.

## 작업 순서

1. 문서 카테고리 확인 (기존 디렉토리 구조 참조)
2. 사용자에게 다음 정보 요청 (제공되지 않은 경우):
   - 카테고리/경로
   - 파일명
   - 제목
   - sidebar_position (선택)
3. 적절한 경로에 .md 파일 생성

## Frontmatter 템플릿

```markdown
---
sidebar_position: {position}
---

# {title}

문서 개요를 여기에 작성합니다.

## 목차

내용을 구조화하여 작성합니다.
```

## 디렉토리 구조 참조

```
docs/
├── tutorial/          # 튜토리얼
├── algorithms/        # 알고리즘
├── infrastructure/    # 인프라
└── ...
```
