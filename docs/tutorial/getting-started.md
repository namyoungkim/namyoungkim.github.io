---
sidebar_position: 1
---

# 🚀 시작하기

이 페이지는 기술 문서 작성의 예시 페이지입니다.

## 문서 작성 가이드

이 `docs/` 디렉토리는 기술 학습 내용을 정리하는 공간입니다.

### 작성 형식

각 기술 문서는 다음과 같은 형식으로 작성할 수 있습니다:

```markdown
---
sidebar_position: 1
---

# 제목

## 개념 설명
기본 개념과 정의

## 사용 방법
실제 사용 예시와 코드

## 주의사항
알아두면 좋은 팁과 주의점

## 참고 자료
관련 링크와 레퍼런스
```

### 카테고리 구조

문서는 다음과 같은 카테고리로 구분됩니다:

- **Frontend**: React, TypeScript, CSS 등
- **Backend**: Node.js, API, Database 등
- **Algorithms**: 알고리즘과 자료구조
- **DevOps**: Git, CI/CD, Docker 등

### 코드 블록 예시

```javascript
// JavaScript 코드 예시
function example() {
  console.log("Hello, World!");
}
```

```typescript
// TypeScript 코드 예시
interface User {
  name: string;
  age: number;
}

const user: User = {
  name: "Kim",
  age: 25
};
```

## 다음 단계

이제 각 카테고리별로 학습한 내용을 정리하여 문서를 작성할 수 있습니다.

새로운 문서를 추가하려면:
1. 적절한 카테고리 디렉토리 생성 (예: `docs/react/`)
2. 마크다운 파일 작성 (예: `hooks.md`)
3. Frontmatter에 `sidebar_position` 설정
