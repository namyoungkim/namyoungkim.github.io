---
slug: mcp-server-part2-search
title: "개발 블로그를 위한 MCP 서버 구축기 (2): 인메모리 역인덱스로 검색 기능 구현"
authors: namyoungkim
tags: [ai, mcp, search, algorithm, nodejs, tutorial]
---

# 개발 블로그를 위한 MCP 서버 구축기 (2): 인메모리 역인덱스로 검색 기능 구현

> 키워드 기반 검색을 위한 역인덱스(Inverted Index)를 설계하고 가중치 기반 점수 시스템을 구현합니다.

## 🎯 들어가며

[1편](/blog/mcp-server-part1-design)에서는 Git 기반 MCP 서버의 기본 구조와 콘텐츠 조회 기능을 구현했습니다. 하지만 블로그 포스트가 늘어나면 문제가 생깁니다.

**"Python에 대한 글이 있나요?"**

목록을 일일이 확인하는 건 비효율적입니다. 검색 기능이 필요합니다.

<!-- truncate -->

---

## 📚 검색 시스템 설계

### 문제 정의

검색 기능을 구현하는 방법은 여러 가지가 있습니다:

| 방식 | 장점 | 단점 |
|------|------|------|
| **전체 스캔** | 구현 간단 | 파일이 많으면 느림 |
| **외부 검색 엔진** | 강력한 기능 | 복잡한 설정, 추가 인프라 |
| **인메모리 인덱스** | 빠른 검색, 로컬 실행 | 메모리 사용 |

MCP 서버는 **로컬에서 실행**되고, 콘텐츠 규모가 수백 개 수준이므로 **인메모리 인덱스**가 적합합니다.

### 역인덱스(Inverted Index)란?

일반적인 인덱스는 "문서 → 단어" 매핑입니다:
```
문서1: [python, machine, learning]
문서2: [react, javascript, frontend]
```

**역인덱스**는 이를 뒤집어서 "단어 → 문서" 매핑으로 만듭니다:
```
python: [문서1]
react: [문서2]
javascript: [문서2]
machine: [문서1]
learning: [문서1]
frontend: [문서2]
```

검색할 때 키워드로 바로 문서를 찾을 수 있어서 **O(1)** 시간에 검색이 가능합니다.

---

## 🏗️ 인덱스 구조 설계

MCP 서버의 인덱스는 4개의 Map으로 구성됩니다:

```javascript title="src/search-engine.js"
export class SearchEngine {
  constructor() {
    this.index = {
      posts: new Map(),      // slug → post data
      docs: new Map(),       // path → doc data
      tags: new Map(),       // tag → [{type, id}]
      keywords: new Map(),   // keyword → [{type, id, weight}]
    };
  }
}
```

| Map | Key | Value | 용도 |
|-----|-----|-------|------|
| **posts** | slug | 포스트 전체 데이터 | 블로그 포스트 저장 |
| **docs** | path | 문서 전체 데이터 | 기술 문서 저장 |
| **tags** | tag | 참조 배열 | 태그로 필터링 |
| **keywords** | keyword | 참조 + 가중치 배열 | 검색 |

---

## 🔧 인덱스 빌드 구현

### 전체 빌드 흐름

```javascript title="src/search-engine.js"
async buildIndex(repoPath) {
  console.error('[SearchEngine] Building index...');

  const blogDir = path.join(repoPath, 'blog');
  const docsDir = path.join(repoPath, 'docs');

  // 블로그 포스트 인덱싱
  await this.indexBlogPosts(blogDir);

  // 문서 인덱싱
  await this.indexDocs(docsDir);

  console.error(`[SearchEngine] Index built: ${this.index.posts.size} posts, ${this.index.docs.size} docs`);
}
```

### 블로그 포스트 인덱싱

각 마크다운 파일을 읽고, 메타데이터를 추출해서 인덱스에 저장합니다:

```javascript title="src/search-engine.js"
async indexBlogPosts(blogDir) {
  const files = await fs.readdir(blogDir);
  const mdFiles = files.filter(f => f.endsWith('.md'));

  for (const file of mdFiles) {
    const filePath = path.join(blogDir, file);
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const parsed = matter(fileContent);

    // 파일명에서 날짜와 slug 추출: YYYY-MM-DD-slug.md
    const filename = path.basename(file, '.md');
    const match = filename.match(/^(\d{4})-(\d{2})-(\d{2})-(.+)$/);

    let date, slug;
    if (match) {
      date = `${match[1]}-${match[2]}-${match[3]}`;
      slug = match[4];
    }

    const post = {
      slug: parsed.data.slug || slug,
      title: parsed.data.title || 'Untitled',
      date: parsed.data.date || date,
      tags: parsed.data.tags || [],
      excerpt: this.extractExcerpt(parsed.content),
      content: parsed.content,
      type: 'blog'
    };

    // 1. 포스트 저장
    this.index.posts.set(post.slug, post);

    // 2. 태그 인덱싱
    for (const tag of post.tags) {
      if (!this.index.tags.has(tag)) {
        this.index.tags.set(tag, []);
      }
      this.index.tags.get(tag).push({ type: 'blog', id: post.slug });
    }

    // 3. 키워드 인덱싱
    this.indexKeywords(post.slug, 'blog', post.title, post.content, post.tags);
  }
}
```

---

## 📊 가중치 기반 키워드 인덱싱

검색에서 중요한 건 **관련도(relevance)**입니다. 제목에 나오는 키워드가 본문에만 나오는 키워드보다 더 중요하죠.

### 가중치 시스템

| 위치 | 가중치 | 이유 |
|------|--------|------|
| **제목** | 3 | 문서의 핵심 주제 |
| **태그** | 2 | 저자가 선택한 분류 |
| **본문** | 1 | 일반적인 언급 |

### 키워드 인덱싱 구현

```javascript title="src/search-engine.js" {3,10,17}
indexKeywords(id, type, title, content, tags = []) {
  // 제목 키워드 (가중치 3)
  const titleWords = this.extractWords(title);
  for (const word of titleWords) {
    this.addKeyword(word, { type, id, weight: 3 });
  }

  // 태그 키워드 (가중치 2)
  for (const tag of tags) {
    const tagWords = this.extractWords(tag);
    for (const word of tagWords) {
      this.addKeyword(word, { type, id, weight: 2 });
    }
  }

  // 본문 키워드 (가중치 1)
  const contentWords = this.extractWords(content);
  for (const word of contentWords) {
    this.addKeyword(word, { type, id, weight: 1 });
  }
}
```

### 단어 추출

텍스트에서 검색 가능한 단어만 추출합니다:

```javascript title="src/search-engine.js"
extractWords(text) {
  if (!text) return [];

  const words = text
    .toLowerCase()                              // 소문자 변환
    .replace(/[^\w\sㄱ-ㅎㅏ-ㅣ가-힣-]/g, ' ')     // 특수문자 제거 (한글 유지)
    .split(/\s+/)                               // 공백으로 분리
    .filter(w => w.length >= 2);                // 2글자 이상만

  return [...new Set(words)];                   // 중복 제거
}
```

:::tip 한글 지원
정규식 `ㄱ-ㅎㅏ-ㅣ가-힣`로 한글 자음, 모음, 완성형을 모두 유지합니다.
:::

### 키워드 추가 (가중치 누적)

같은 문서에서 같은 키워드가 여러 번 나오면 가중치를 **누적**합니다:

```javascript title="src/search-engine.js"
addKeyword(word, item) {
  if (!this.index.keywords.has(word)) {
    this.index.keywords.set(word, []);
  }

  // 중복 확인
  const existing = this.index.keywords.get(word).find(
    i => i.type === item.type && i.id === item.id
  );

  if (!existing) {
    this.index.keywords.get(word).push(item);
  } else {
    // 가중치 누적
    existing.weight += item.weight;
  }
}
```

예를 들어, "Python"이 제목(3)과 태그(2)와 본문(1)에 모두 나오면 총 가중치는 **6**이 됩니다.

---

## 🔍 검색 알고리즘 구현

### 검색 흐름

```
사용자 쿼리: "Python 머신러닝"
    ↓
1. 키워드 추출: ["python", "머신러닝"]
    ↓
2. 각 키워드로 역인덱스 조회
    ↓
3. 문서별 점수 합산
    ↓
4. 점수순 정렬 + 페이지네이션
```

### 검색 함수 구현

```javascript title="src/search-engine.js"
search(query, options = {}) {
  const {
    type = 'all',    // all, blog, docs
    tag = null,      // 태그 필터
    limit = 10,
    offset = 0
  } = options;

  // 1. 쿼리 키워드 추출
  const queryWords = this.extractWords(query);
  if (queryWords.length === 0) {
    return { results: [], total: 0 };
  }

  // 2. 관련도 점수 계산
  const scores = new Map(); // "type:id" → {type, id, score}

  for (const word of queryWords) {
    const matches = this.index.keywords.get(word) || [];

    for (const match of matches) {
      // 타입 필터 적용
      if (type !== 'all' && match.type !== type) continue;

      const key = `${match.type}:${match.id}`;
      if (!scores.has(key)) {
        scores.set(key, { type: match.type, id: match.id, score: 0 });
      }
      scores.get(key).score += match.weight;
    }
  }

  // 3. 결과 수집
  let results = [];

  for (const { type: itemType, id, score } of scores.values()) {
    const item = itemType === 'blog'
      ? this.index.posts.get(id)
      : this.index.docs.get(id);

    if (!item) continue;

    // 태그 필터 적용 (블로그만)
    if (tag && itemType === 'blog') {
      if (!item.tags?.includes(tag)) continue;
    }

    results.push({
      ...item,
      score,
      content: undefined  // 검색 결과에서 본문 제외
    });
  }

  // 4. 점수순 정렬
  results.sort((a, b) => b.score - a.score);

  // 5. 페이지네이션
  const total = results.length;
  const paginatedResults = results.slice(offset, offset + limit);

  return {
    results: paginatedResults,
    total,
    hasMore: offset + limit < total
  };
}
```

---

## 🛠️ 검색 관련 MCP Tools

### search_content - 키워드 검색

```javascript title="src/tools/search-content.js"
export const searchContentTool = {
  name: 'search_content',
  description: '블로그와 문서에서 키워드 검색을 수행합니다.',
  inputSchema: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: '검색 키워드',
      },
      type: {
        type: 'string',
        enum: ['all', 'blog', 'docs'],
        description: '검색 범위 (기본: all)',
      },
      tag: {
        type: 'string',
        description: '태그로 필터링',
      },
      limit: {
        type: 'number',
        description: '결과 수 제한 (기본: 10)',
      },
    },
    required: ['query'],
  },
};

export async function handleSearchContent(args, searchEngine, config) {
  const { query, type = 'all', tag, limit = 10, offset = 0 } = args;

  const result = searchEngine.search(query, { type, tag, limit, offset });

  // URL 추가
  const resultsWithUrls = result.results.map(item => ({
    ...item,
    url: item.type === 'blog'
      ? `${config.siteUrl}${config.baseUrl}/blog/${item.slug}`
      : `${config.siteUrl}${config.baseUrl}/docs/${item.path}`,
  }));

  return {
    content: [{
      type: 'text',
      text: JSON.stringify({
        query,
        results: resultsWithUrls,
        total: result.total,
        hasMore: result.hasMore,
      }, null, 2),
    }],
  };
}
```

### get_recent_posts - 최신 콘텐츠 조회

```javascript title="src/tools/get-recent.js"
export const getRecentPostsTool = {
  name: 'get_recent_posts',
  description: '최근 작성된 콘텐츠를 가져옵니다.',
  inputSchema: {
    type: 'object',
    properties: {
      limit: {
        type: 'number',
        description: '가져올 개수 (기본: 5)',
      },
      type: {
        type: 'string',
        enum: ['all', 'blog', 'docs'],
        description: '콘텐츠 타입 (기본: all)',
      },
    },
  },
};

export async function handleGetRecentPosts(args, searchEngine, config) {
  const { limit = 5, type = 'all' } = args;

  const recent = searchEngine.getRecent({ type, limit });

  const resultsWithUrls = recent.map(item => ({
    ...item,
    url: item.type === 'blog'
      ? `${config.siteUrl}${config.baseUrl}/blog/${item.slug}`
      : `${config.siteUrl}${config.baseUrl}/docs/${item.path}`,
  }));

  return {
    content: [{
      type: 'text',
      text: JSON.stringify(resultsWithUrls, null, 2),
    }],
  };
}
```

### get_tags - 태그 통계 조회

```javascript title="src/tools/get-tags.js"
export const getTagsTool = {
  name: 'get_tags',
  description: '사용 가능한 태그 목록과 각 태그의 사용 빈도를 가져옵니다.',
  inputSchema: {
    type: 'object',
    properties: {},
  },
};

export async function handleGetTags(args, searchEngine) {
  const tags = searchEngine.getTags();

  return {
    content: [{
      type: 'text',
      text: JSON.stringify(tags, null, 2),
    }],
  };
}
```

---

## 🧪 검색 테스트

Claude Desktop에서 테스트해봅니다:

**사용자**: "Python에 대한 글을 찾아줘"

**Claude**: `search_content` 호출 (query: "Python")

```json
{
  "query": "Python",
  "results": [
    {
      "slug": "vscode-python-ruff-setup",
      "title": "VSCode Python 개발환경 완벽 설정 가이드",
      "date": "2025-12-01",
      "tags": ["python", "vscode", "ruff"],
      "score": 15,
      "url": "https://namyoungkim.github.io/a1rtisan/blog/vscode-python-ruff-setup"
    }
  ],
  "total": 1,
  "hasMore": false
}
```

점수 15는 어떻게 계산됐을까요?
- 제목에 "Python" 1회: 3점
- 태그에 "python" 1회: 2점
- 본문에 "python" 약 10회: 10점
- **합계: 15점**

---

## 📊 Phase 2 결과

### 구현된 도구 (3개 추가)

| 도구 | 설명 |
|------|------|
| `search_content` | 키워드 기반 콘텐츠 검색 |
| `get_recent_posts` | 최신 콘텐츠 조회 |
| `get_tags` | 태그 목록 및 통계 |

### 성능 특성

| 항목 | 성능 |
|------|------|
| **인덱스 빌드** | ~1초 (50개 문서 기준) |
| **검색 쿼리** | < 10ms |
| **메모리 사용** | ~수 MB (콘텐츠 양에 비례) |

---

## 💡 최적화 포인트

### 1. 검색 결과에서 본문 제외

검색 결과에는 메타데이터만 포함하고, 본문은 `get_blog_post`로 따로 조회합니다:

```javascript
results.push({
  ...item,
  score,
  content: undefined  // 본문 제외
});
```

### 2. 요약 우선

목록 조회 시 전체 본문 대신 요약(excerpt)만 반환합니다:

```javascript
extractExcerpt(content, maxLength = 200) {
  const truncateIndex = content.indexOf('<!-- truncate -->');
  if (truncateIndex !== -1) {
    return content.substring(0, truncateIndex).trim();
  }
  return content.substring(0, maxLength).trim() + '...';
}
```

### 3. 중복 키워드 가중치 누적

같은 키워드가 여러 번 나오면 점수가 누적되어 더 관련성 높은 문서가 상위에 노출됩니다.

---

## 🔜 다음 편 예고

검색 기능은 잘 동작하지만 한 가지 문제가 있습니다. **서버를 시작할 때마다 인덱스를 다시 빌드**해야 합니다.

콘텐츠가 늘어나면 시작 시간이 점점 길어집니다. 어떻게 해결할 수 있을까요?

**다음 편**에서는 **캐싱과 에러 복구 전략**을 다룹니다:
- Git Commit Hash 기반 캐시 무효화
- 인덱스 직렬화와 복원
- 네트워크 에러 재시도 로직
- Cold Start를 1초 미만으로 줄이기

---

## 참고 자료

- [역인덱스 - Wikipedia](https://en.wikipedia.org/wiki/Inverted_index)
- [Information Retrieval - Stanford NLP](https://nlp.stanford.edu/IR-book/)
- [Lucene Scoring](https://lucene.apache.org/core/8_0_0/core/org/apache/lucene/search/package-summary.html#scoring)
