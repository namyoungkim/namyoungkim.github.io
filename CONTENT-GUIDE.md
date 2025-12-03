# 콘텐츠 작성 가이드

이 문서는 블로그 포스트와 문서를 작성할 때 따라야 하는 가이드라인입니다.

## 📝 블로그 포스트 작성

### 파일명 규칙
- **형식**: `YYYY-MM-DD-slug.md` (날짜 접두사 **필수**)
- **예시**: `2025-12-02-bhattacharyya-distance.md`

### 위치
- `blog/` 디렉토리에 작성

### Frontmatter 필수 항목
```markdown
---
slug: post-slug
title: 포스트 제목
authors: namyoungkim
tags: [tag1, tag2, tag3]
---
```

### 미리보기 구분
`<!-- truncate -->` 주석을 사용하여 미리보기와 본문을 구분합니다:

```markdown
# 블로그 포스트 제목

미리보기에 표시될 내용...

<!-- truncate -->

본문 내용이 여기부터 시작됩니다...
```

---

## 📚 문서 작성

### 위치
- `docs/` 디렉토리 및 하위 폴더

### 순서 제어
Frontmatter의 `sidebar_position`으로 사이드바 순서를 제어합니다:

```markdown
---
sidebar_position: 1
---
```

숫자가 작을수록 위에 표시됩니다.

### 경고창 (Admonitions)
다음과 같은 경고창을 사용할 수 있습니다:

```markdown
:::tip 팁
유용한 팁을 여기에 작성합니다.
:::

:::warning 주의
주의사항을 여기에 작성합니다.
:::

:::info 정보
추가 정보를 여기에 작성합니다.
:::

:::danger 위험
위험한 작업에 대한 경고를 작성합니다.
:::
```

### 내부 링크
상대 경로를 사용하여 다른 문서를 링크합니다:

```markdown
[다른 문서 보기](./other-doc.md)
[튜토리얼](../tutorial/getting-started.md)
```

---

## 🖼️ 이미지 사용

### 전역 이미지
`static/img/`에 이미지를 저장하고 절대 경로로 참조합니다:

```markdown
![이미지 설명](/img/filename.png)
```

### 로컬 이미지
블로그 포스트나 문서와 같은 폴더에 이미지를 저장하고 상대 경로로 참조합니다:

```markdown
![이미지 설명](./image.png)
```

### 이미지 최적화
- 이 프로젝트는 `@docusaurus/plugin-ideal-image` 플러그인이 활성화되어 있습니다
- 자동으로 이미지 최적화 및 lazy loading이 적용됩니다

---

## 🔢 수식 작성 (LaTeX)

이 사이트는 **remark-math**와 **rehype-katex** 플러그인을 사용하여 LaTeX 수식을 지원합니다.

### 인라인 수식
달러 기호(`$`)로 감싸서 인라인 수식을 작성합니다:

```markdown
Einstein의 질량-에너지 등가 공식은 $E = mc^2$ 입니다.
```

**렌더링 결과**: Einstein의 질량-에너지 등가 공식은 $E = mc^2$ 입니다.

### 블록 수식
이중 달러 기호(`$$`)로 감싸서 블록 수식을 작성합니다:

```markdown
$$
x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}
$$
```

**렌더링 결과**:
$$
x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}
$$

### 수식 문법
- **LaTeX/KaTeX** 문법을 사용합니다
- KaTeX 지원 함수 목록: https://katex.org/docs/supported.html

### 수식 작성 예시

**제곱근과 분수**:
```markdown
$$
\sqrt{a^2 + b^2} = c
$$
```

**적분**:
```markdown
$$
\int_{a}^{b} f(x) \, dx
$$
```

**합 (Summation)**:
```markdown
$$
\sum_{i=1}^{n} i = \frac{n(n+1)}{2}
$$
```

**행렬**:
```markdown
$$
\begin{bmatrix}
a & b \\
c & d
\end{bmatrix}
$$
```

### 수식 사용 예시 블로그 포스트
- `blog/2025-12-02-bhattacharyya-distance.md` - Bhattacharyya Distance 수식
- `blog/2025-12-02-geometric-mean-intuition.md` - 기하평균 수식

---

## 🏷️ 태그 작성 규칙

블로그 포스트의 태그는 **일관성 있는 규칙**을 따라 작성해야 합니다.

### 필수 규칙

1. **모두 소문자 사용**
   - ✅ `python`, `machine-learning`
   - ❌ `Python`, `Machine Learning`, `ML`

2. **하이픈으로 단어 연결**
   - ✅ `data-science`, `github-pages`
   - ❌ `Data Science`, `github_pages`

3. **약어 지양, 전체 이름 사용**
   - ✅ `machine-learning`, `natural-language-processing`
   - ❌ `ml`, `nlp`
   - 예외: `api`, `sql`, `aws` 등 널리 알려진 약어는 허용

### 권장 사항

#### 개수
- **3-5개가 적당**합니다
- 너무 적으면 검색/필터링이 어렵고, 너무 많으면 의미가 희석됩니다

#### 우선순위
태그는 다음 순서로 추가하세요:
1. **주요 기술/언어** (python, javascript 등)
2. **주제/분야** (machine-learning, data-science 등)
3. **콘텐츠 유형** (tutorial, guide 등)

**예시**:
```markdown
tags: [python, machine-learning, statistics, tutorial]
     (언어)  (주제)            (분야)      (유형)
```

#### 일관성 유지
- 기존 포스트의 태그를 확인하고 재사용하세요
- 비슷한 주제라면 동일한 태그를 사용하세요
- 새 태그를 만들기 전에 기존 태그로 커버 가능한지 고민하세요

### 좋은 예시

```markdown
---
tags: [python, machine-learning, tutorial]
---
```
- 모두 소문자
- 하이픈으로 단어 연결
- 명확하고 간결

```markdown
---
tags: [data-science, statistics, mathematics]
---
```
- 일관된 형식
- 전체 이름 사용

### 나쁜 예시

```markdown
---
tags: [Python, Machine Learning, Tutorial]
---
```
❌ 대문자 사용, 띄어쓰기 사용

```markdown
---
tags: [ml, DL, NLP]
---
```
❌ 약어만 사용, 대문자 사용

```markdown
---
tags: [python, python-tutorial, python-programming, python-basics]
---
```
❌ 지나치게 세분화 (python, tutorial로 충분)

### 추천 태그 카테고리

**프로그래밍 언어**:
```
python, javascript, typescript, java, go, rust, kotlin, swift
```

**프레임워크 & 라이브러리**:
```
react, vue, django, flask, fastapi, spring, express, pytorch, tensorflow
```

**데이터 & AI**:
```
machine-learning, deep-learning, data-science, data-engineering
natural-language-processing, computer-vision, ai-agents, mlops
```

**개발 방법론**:
```
testing, ci-cd, devops, agile, tdd, clean-code, design-patterns
```

**콘텐츠 유형**:
```
tutorial, guide, review, opinion, case-study, best-practices
```

### 상세 가이드
더 자세한 태그 작성 가이드는 `TAG-GUIDELINES.md`를 참조하세요.

---

## 📋 코드 블록

### 기본 코드 블록
언어를 지정하여 신택스 하이라이팅을 활성화합니다:

\`\`\`python
def hello_world():
    print("Hello, World!")
\`\`\`

### 지원 언어
- bash, json, typescript, javascript, jsx, tsx
- python, java, go, rust, kotlin, swift
- 기타 Prism이 지원하는 모든 언어

### 코드 블록 제목
코드 블록에 제목을 추가할 수 있습니다:

\`\`\`python title="example.py"
def factorial(n):
    return 1 if n <= 1 else n * factorial(n - 1)
\`\`\`

### 라인 하이라이팅
특정 라인을 강조할 수 있습니다:

\`\`\`python {2,4-6}
def example():
    # 이 라인이 강조됩니다
    x = 1
    # 이 라인부터
    y = 2
    # 여기까지 강조됩니다
    return x + y
\`\`\`

---

## 📊 ASCII 아트 / 다이어그램

### 한글 깨짐 방지

ASCII 박스나 표에 한글을 직접 포함하면 정렬이 깨집니다. 한글(전각)과 영문(반각)의 문자폭이 다르기 때문입니다.

**❌ 잘못된 예시 (정렬 깨짐)**:
```
┌─────────────────┬───────────────┐
│      속성       │      값       │
├─────────────────┼───────────────┤
│ 대칭성          │      ✓        │
│ 계산 비용       │    낮음       │
└─────────────────┴───────────────┘
```

**✅ 올바른 예시**:
```
┌─────────────────┬───────────────┐
│    Property     │     Value     │
├─────────────────┼───────────────┤
│    Symmetric    │      ✓        │
│   Compute cost  │     Low       │
└─────────────────┴───────────────┘
```

| 속성 | 값 |
|------|-----|
| 대칭성 | ✓ |
| 계산 비용 | 낮음 |

### 권장 패턴

1. ASCII 박스/표 내부는 **영문만 사용**
2. 한글 설명은 박스 아래에 **별도 목록 또는 마크다운 표**로 작성
3. 복잡한 표는 ASCII 대신 **마크다운 표** 사용 권장

---

## ✅ 체크리스트

### 블로그 포스트 작성 전
- [ ] 파일명이 `YYYY-MM-DD-slug.md` 형식인가?
- [ ] Frontmatter에 slug, title, authors, tags가 모두 있는가?
- [ ] 태그가 소문자, 하이픈으로 작성되었는가?
- [ ] `<!-- truncate -->` 주석을 추가했는가?

### 문서 작성 전
- [ ] `docs/` 디렉토리에 적절한 위치에 작성했는가?
- [ ] 필요시 `sidebar_position`을 설정했는가?
- [ ] 내부 링크가 상대 경로로 작성되었는가?

### 수식 사용 시
- [ ] 인라인 수식은 `$...$`로 감쌌는가?
- [ ] 블록 수식은 `$$...$$`로 감쌌는가?
- [ ] KaTeX 지원 함수를 사용했는가?

---

## 🔗 관련 문서

- `TAG-GUIDELINES.md` - 태그 작성 상세 가이드
- `CLAUDE.md` - 프로젝트 전체 개요
- `CONFIGURATION.md` - 기술 설정 상세 가이드
