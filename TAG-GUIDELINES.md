# 블로그 태그 작성 가이드라인

이 문서는 블로그 포스트의 태그를 일관성 있게 작성하기 위한 가이드라인입니다.

## 📋 기본 규칙

### 1. 대소문자 규칙
- **모든 태그는 소문자로 작성합니다**
- 예시: `python`, `machine-learning`, `data-science`

### 2. 단어 연결 규칙
- **여러 단어는 하이픈(-)으로 연결합니다**
- 띄어쓰기나 밑줄(_) 사용 금지
- 예시: `machine-learning` (O), `Machine Learning` (X), `machine_learning` (X)

### 3. 약어 사용 규칙
- **가능한 전체 이름을 사용합니다**
- 약어는 일반적으로 잘 알려진 경우에만 사용
- 예시:
  - `machine-learning` (O), `ml` (X)
  - `api` (O, 널리 알려진 약어)
  - `sql` (O, 널리 알려진 약어)

---

## 🏷️ 태그 구조

태그는 **주제 + 기술 + 유형** 구조로 작성합니다.

```
tags: [주제태그, 기술태그1, 기술태그2, 유형태그]
```

### 🎯 주제 태그 (필수, 1개 선택)

모든 포스트에 아래 중 하나를 포함합니다:

| 태그 | 설명 |
|------|------|
| `ai` | AI, LLM, MCP, 에이전트 관련 |
| `data` | 데이터 사이언스, 통계, 분석 |
| `dev-tools` | 개발 환경, 도구 설정 |
| `devops` | 배포, 인프라, CI/CD |

### 💻 기술 태그 (선택, 여러 개 가능)

#### 프로그래밍 언어
```
python, javascript, typescript, java, go, rust, nodejs
```

#### 프레임워크 & 도구
```
react, vue, django, fastapi, pytorch, tensorflow
docker, kubernetes, vscode, github-actions, github-pages
mcp, docusaurus, ruff
```

#### 데이터 & AI
```
machine-learning, deep-learning, data-science, data-engineering
ai-agents, llm, mlops
statistics, mathematics, algorithm
```

#### 성능 & 최적화
```
performance, caching, search
```

### 📝 유형 태그 (선택)

```
tutorial, guide, troubleshooting
```

---

## ✅ 좋은 예시 vs 나쁜 예시

### ✅ 좋은 예시

```markdown
---
tags: [ai, mcp, nodejs, tutorial]
---
```
- 주제 태그(`ai`) 포함
- 기술 태그 명시
- 유형 태그 포함

```markdown
---
tags: [data, statistics, machine-learning, mathematics]
---
```
- 주제 태그(`data`) 포함
- 관련 기술 태그들

### ❌ 나쁜 예시

```markdown
---
tags: [Python, Machine Learning, Tutorial]
---
```
- 대문자 사용 (X)
- 띄어쓰기 사용 (X)

```markdown
---
tags: [ml, DL, NLP]
---
```
- 약어만 사용 (X)
- 대문자 사용 (X)

```markdown
---
tags: [python, python-tutorial, python-programming, python-basics]
---
```
- 지나치게 세분화 (X)
- `python`, `tutorial`로 충분

---

## 📌 태그 선정 가이드

### 1. 개수
- **3-5개가 적당합니다**
- 너무 적으면: 검색/필터링이 어려움
- 너무 많으면: 의미가 희석됨

### 2. 우선순위
태그는 다음 순서로 추가하세요:
1. **주제 태그** (ai, data, dev-tools, devops 중 1개)
2. **기술 태그** (python, mcp, statistics 등)
3. **유형 태그** (tutorial, guide 등 - 선택)

예시:
```markdown
tags: [ai, mcp, nodejs, performance, tutorial]
     (주제) (기술)  (기술)   (기술)     (유형)
```

### 3. 너무 세분화하지 말기
- `python-pandas` → `python`, `data-science`로 충분
- `react-hooks-tutorial` → `react`, `tutorial`로 충분
- 특정 라이브러리는 본문에서 다루면 됨

### 4. 일관성 유지
- 기존 포스트의 태그를 확인하고 재사용하세요
- 비슷한 주제라면 동일한 태그를 사용하세요
- 새 태그를 만들기 전에 기존 태그로 커버 가능한지 고민하세요

---

## 🔍 자주 하는 실수

### 1. 대소문자 혼용
```markdown
❌ tags: [Python, VSCode, ML]
✅ tags: [python, vscode, machine-learning]
```

### 2. 띄어쓰기 사용
```markdown
❌ tags: [Machine Learning, Data Science]
✅ tags: [machine-learning, data-science]
```

### 3. 약어 남용
```markdown
❌ tags: [ml, dl, nlp, cv]
✅ tags: [machine-learning, deep-learning, natural-language-processing, computer-vision]
```

### 4. 지나친 세분화
```markdown
❌ tags: [python-3.11, fastapi-0.100, pydantic-v2]
✅ tags: [python, fastapi, tutorial]
```

---

## 🔄 기존 태그 마이그레이션

이미 작성된 포스트의 태그를 수정할 때:

1. **대소문자 변환**
   - `Python` → `python`
   - `Machine Learning` → `machine-learning`

2. **띄어쓰기 → 하이픈**
   - `Data Science` → `data-science`
   - `GitHub Pages` → `github-pages`

3. **약어 → 전체 이름**
   - `ml` → `machine-learning`
   - `dl` → `deep-learning`

---

## 💡 팁

1. **태그 페이지 확인**
   - 블로그의 태그 페이지(/tags)를 정기적으로 확인하세요
   - 중복되거나 유사한 태그가 있는지 체크하세요

2. **SEO 최적화**
   - 소문자 + 하이픈 형식은 URL에 친화적입니다
   - 명확한 태그는 검색 엔진에 도움이 됩니다

3. **독자 관점**
   - 독자가 관련 포스트를 쉽게 찾을 수 있도록 태그를 작성하세요
   - 너무 기술적이거나 전문적인 용어는 피하세요

---

## 📚 참고

- 이 가이드라인은 `CLAUDE.md`에도 요약되어 있습니다
- Claude Code가 블로그 포스트 작성 시 자동으로 이 규칙을 따릅니다
- 가이드라인 개선 제안은 언제든 환영합니다!
