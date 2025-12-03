# 블로그 UI 커스터마이징 가이드

이 문서는 블로그 사이드바, 레이아웃 등 UI 커스터마이징 방법을 설명합니다.

---

## 블로그 사이드바

### 주제 필터

블로그 포스트를 주제별로 필터링하는 기능입니다.

**파일**: `src/theme/BlogSidebar/TopicFilter/index.tsx`

**현재 주제 태그**:
| 태그 | 라벨 | 설명 |
|------|------|------|
| `ai` | AI | AI, LLM, MCP, 에이전트 |
| `data` | Data | 데이터 사이언스, 통계, 분석 |
| `dev-tools` | Dev Tools | 개발 환경, 도구 설정 |
| `devops` | DevOps | 배포, 인프라, CI/CD |
| `career` | Career | 경력, 자기소개, 회고 |

### 사이드바 토글

사이드바를 접고 펼 수 있는 기능입니다.

**파일**: `src/theme/BlogSidebar/Desktop/index.tsx`

**동작**:
- `◀` 버튼: 사이드바 접기
- `▶` 버튼: 사이드바 펼치기
- 상태는 `localStorage`에 저장되어 새로고침 후에도 유지됩니다.

---

## 레이아웃

### 반응형 컨테이너

화면 크기에 맞춰 컨테이너가 자동으로 조정됩니다.

**파일**: `src/css/custom.css`

**현재 설정** (997px 이상):
```css
.container {
  max-width: calc(100% - 2rem);  /* 좌우 1rem 여백만 유지 */
}

aside.col.col--3 {
  --ifm-col-width: calc(1.75 / 12 * 100%);  /* 사이드바: 14.6% */
}

main.col.col--7 {
  --ifm-col-width: calc(8.5 / 12 * 100%);   /* 콘텐츠: 70.8% */
}

.col.col--2 {
  --ifm-col-width: calc(1.75 / 12 * 100%);  /* TOC: 14.6% */
}
```

**레이아웃 비율 조정**:
- 사이드바/TOC 비율: `1.75 / 12` 값을 조정
- 콘텐츠 비율: `8.5 / 12` 값을 조정
- 세 값의 합이 12가 되어야 함

---

## 주제 태그 추가 방법

새로운 주제 태그를 추가하려면:

### 1. TAG-GUIDELINES.md 업데이트

주제 태그 테이블에 새 태그 추가:
```markdown
| `new-topic` | 새 주제 설명 |
```

### 2. TopicFilter 컴포넌트 업데이트

`src/theme/BlogSidebar/TopicFilter/index.tsx`:
```tsx
const TOPICS = [
  { id: null, label: '전체' },
  { id: 'ai', label: 'AI' },
  { id: 'data', label: 'Data' },
  { id: 'dev-tools', label: 'Dev Tools' },
  { id: 'devops', label: 'DevOps' },
  { id: 'career', label: 'Career' },
  { id: 'new-topic', label: 'New Topic' },  // 추가
] as const;
```

### 3. 태그 맵 재생성

```bash
npm run generate:tags
```

### 4. 블로그 포스트에 태그 적용

```markdown
---
tags: [new-topic, other-tags]
---
```

---

## 관련 파일

| 파일 | 설명 |
|------|------|
| `src/theme/BlogSidebar/Desktop/index.tsx` | 사이드바 메인 컴포넌트 (Swizzle) |
| `src/theme/BlogSidebar/Desktop/styles.module.css` | 사이드바 스타일 |
| `src/theme/BlogSidebar/TopicFilter/index.tsx` | 주제 필터 컴포넌트 |
| `src/theme/BlogSidebar/TopicFilter/styles.module.css` | 주제 필터 스타일 |
| `src/css/custom.css` | 전역 커스텀 스타일 |
| `scripts/generate-tag-map.js` | 태그 맵 생성 스크립트 |
| `static/blog-tags.json` | 생성된 태그 맵 (빌드 시 자동 생성) |

---

## 빌드 스크립트

### generate:tags

블로그 포스트의 태그 정보를 JSON으로 생성합니다.

```bash
npm run generate:tags
```

**출력**: `static/blog-tags.json`

**형식**:
```json
{
  "/a1rtisan/blog/post-slug": ["tag1", "tag2", "tag3"]
}
```

**자동 실행**: `npm run build` 시 `prebuild` 스크립트에서 자동 실행됩니다.
