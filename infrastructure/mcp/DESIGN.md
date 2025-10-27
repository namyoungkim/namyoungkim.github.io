# MCP Server Design

> Claude에서 개발 블로그 콘텐츠를 실시간으로 조회할 수 있도록 하는 MCP 서버 설계

## 목표

지속적으로 증가하는 블로그 포스트와 기술 문서를 Claude에서 효율적으로 조회하고 검색할 수 있도록 하는 MCP (Model Context Protocol) 서버를 구축합니다.

## 핵심 요구사항

1. **지속적 증가**: 블로그/문서가 계속 추가됨
2. **실시간 접근**: 새 콘텐츠가 즉시 Claude에서 사용 가능
3. **효율성**: 전체 콘텐츠를 매번 로드하는 것은 비효율적
4. **검색 가능**: 키워드로 필요한 콘텐츠를 찾을 수 있어야 함
5. **로컬 우선**: 인증 없이 사용 가능

## 아키텍처

### Git-based Approach

GitHub 저장소를 단일 진실 공급원(Single Source of Truth)으로 사용:

```
Claude Desktop
    ↓
MCP Server (로컬 프로세스)
    ↓
Git Manager → GitHub Repository (https://github.com/namyoungkim/a1rtisan.git)
    ↓
Content Parser → 마크다운 파싱 및 메타데이터 추출
    ↓
Search Engine → In-memory 인덱싱
    ↓
Tools → Claude에게 결과 반환
```

### 왜 Git 기반인가?

- ✅ **항상 최신 상태**: `git pull`로 자동 동기화
- ✅ **인증 불필요**: Public repository 활용
- ✅ **빠른 로컬 접근**: Clone 후 로컬 파일 시스템 사용
- ✅ **유연한 검색**: 모든 파일에 대한 full-text search 가능
- ✅ **오프라인 동작**: 캐시된 내용 사용 가능
- ✅ **버전 관리**: Git history를 통한 변경 추적

## 프로젝트 구조

```
a1rtisan-dev-blog/
├── mcp-server/
│   ├── package.json
│   ├── index.js                   # MCP 서버 진입점
│   ├── src/
│   │   ├── git-manager.js         # Git repository 동기화
│   │   ├── content-parser.js      # 마크다운 파싱
│   │   ├── search-engine.js       # 검색 엔진
│   │   ├── cache-manager.js       # 인덱스 캐싱
│   │   └── tools/                 # MCP Tools 구현
│   │       ├── list-posts.js
│   │       ├── get-post.js
│   │       ├── list-docs.js
│   │       ├── get-doc.js
│   │       ├── search.js
│   │       ├── get-recent.js
│   │       └── sync.js
│   └── .mcp-cache/                # Git clone 캐시 (gitignore)
│       └── repo/
```

## 핵심 컴포넌트

### 1. Git Manager

**책임**: GitHub 저장소와의 동기화 관리

```javascript
class GitManager {
  constructor(config) {
    this.repoUrl = 'https://github.com/namyoungkim/a1rtisan.git';
    this.localPath = '.mcp-cache/repo';
    this.lastSync = null;
    this.syncInterval = 300000; // 5분
  }

  async init() {
    // 첫 실행: git clone
    // 이후: 기존 repo 확인
  }

  async sync() {
    // git pull origin main
    // 변경사항 확인
    // 인덱스 재빌드 트리거
  }

  async autoSync() {
    // 5분마다 자동 동기화
    setInterval(() => this.sync(), this.syncInterval);
  }
}
```

### 2. Content Parser

**책임**: 마크다운 파일 파싱 및 메타데이터 추출

```javascript
class ContentParser {
  parseFrontmatter(content) {
    // YAML frontmatter 추출
    // { title, date, tags, authors, slug, ... }
  }

  parseMarkdown(filePath) {
    // 마크다운 본문 파싱
    // 코드 블록, 링크, 이미지 처리
    // HTML 제거
  }

  extractSummary(content, maxLength = 200) {
    // 요약 생성
    // <!-- truncate --> 태그 또는 처음 N글자
  }

  getMetadata(filePath) {
    // 파일 통계
    // { wordCount, readingTime, lastModified }
  }
}
```

### 3. Search Engine

**책임**: 콘텐츠 인덱싱 및 검색

```javascript
class SearchEngine {
  constructor() {
    this.index = {
      posts: new Map(),      // slug → post data
      docs: new Map(),       // path → doc data
      tags: new Map(),       // tag → [slugs]
      keywords: new Map(),   // keyword → [slugs]
    };
  }

  async buildIndex(repoPath) {
    // blog/ 및 docs/ 스캔
    // 각 파일 파싱 및 인덱싱
    // 키워드 추출 및 역인덱스 생성
  }

  search(query, options = {}) {
    // Full-text search
    // 옵션: type (blog/docs/all), tags, limit
    // 관련도 점수 계산
  }

  filter(options) {
    // 태그 필터링
    // 날짜 범위 필터링
    // 정렬 (date, relevance)
  }
}
```

### 4. Cache Manager

**책임**: 인덱스 캐싱 및 성능 최적화

```javascript
class CacheManager {
  constructor() {
    this.cacheFile = '.mcp-cache/index.json';
    this.ttl = 300000; // 5분
  }

  async loadCache() {
    // 캐시된 인덱스 로드
    // 유효성 검증 (Git commit hash)
  }

  async saveCache(index, commitHash) {
    // 인덱스를 JSON으로 저장
    // Git commit hash와 함께 저장
  }

  isValid(cachedCommitHash, currentCommitHash) {
    // 캐시 유효성 확인
  }
}
```

## MCP Tools

### 제공할 도구들

#### 1. `list_blog_posts`

블로그 포스트 목록 조회

```javascript
{
  name: "list_blog_posts",
  description: "블로그 포스트 목록을 가져옵니다. 최신순으로 정렬됩니다.",
  inputSchema: {
    type: "object",
    properties: {
      limit: {
        type: "number",
        description: "가져올 포스트 수 (기본: 10)"
      },
      tag: {
        type: "string",
        description: "특정 태그로 필터링"
      },
      offset: {
        type: "number",
        description: "페이지네이션용 오프셋"
      }
    }
  }
}
```

**반환 예시:**
```json
{
  "posts": [
    {
      "slug": "welcome-to-my-blog",
      "title": "개발 블로그를 시작합니다 🚀",
      "date": "2025-10-27",
      "tags": ["blog", "announcement"],
      "authors": ["namyoungkim"],
      "summary": "드디어 개발 블로그를 시작하게 되었습니다...",
      "readingTime": "3 min read",
      "url": "/blog/2025/10/27/welcome"
    }
  ],
  "total": 2,
  "hasMore": false
}
```

#### 2. `get_blog_post`

특정 블로그 포스트의 전체 내용 조회

```javascript
{
  name: "get_blog_post",
  description: "특정 블로그 포스트의 전체 내용을 가져옵니다.",
  inputSchema: {
    type: "object",
    properties: {
      slug: {
        type: "string",
        description: "포스트 슬러그"
      },
      includeMetadata: {
        type: "boolean",
        description: "메타데이터 포함 여부 (기본: true)"
      }
    },
    required: ["slug"]
  }
}
```

#### 3. `list_docs`

기술 문서 목록 조회

```javascript
{
  name: "list_docs",
  description: "기술 학습 문서 목록을 가져옵니다.",
  inputSchema: {
    type: "object",
    properties: {
      category: {
        type: "string",
        description: "카테고리로 필터링 (예: react, typescript)"
      }
    }
  }
}
```

#### 4. `get_doc`

특정 문서의 전체 내용 조회

```javascript
{
  name: "get_doc",
  description: "특정 기술 문서의 전체 내용을 가져옵니다.",
  inputSchema: {
    type: "object",
    properties: {
      path: {
        type: "string",
        description: "문서 경로 (예: react/hooks)"
      }
    },
    required: ["path"]
  }
}
```

#### 5. `search_content`

전체 콘텐츠 검색

```javascript
{
  name: "search_content",
  description: "블로그와 문서에서 키워드 검색을 수행합니다.",
  inputSchema: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "검색 키워드"
      },
      type: {
        type: "string",
        enum: ["all", "blog", "docs"],
        description: "검색 범위 (기본: all)"
      },
      limit: {
        type: "number",
        description: "결과 수 제한 (기본: 10)"
      }
    },
    required: ["query"]
  }
}
```

#### 6. `get_recent_posts`

최근 콘텐츠 조회

```javascript
{
  name: "get_recent_posts",
  description: "최근 작성된 콘텐츠를 가져옵니다.",
  inputSchema: {
    type: "object",
    properties: {
      limit: {
        type: "number",
        description: "가져올 개수 (기본: 5)"
      },
      type: {
        type: "string",
        enum: ["all", "blog", "docs"],
        description: "콘텐츠 타입"
      }
    }
  }
}
```

#### 7. `sync_content`

콘텐츠 동기화

```javascript
{
  name: "sync_content",
  description: "GitHub에서 최신 콘텐츠를 동기화합니다.",
  inputSchema: {
    type: "object",
    properties: {}
  }
}
```

## 인덱스 구조

```javascript
{
  "metadata": {
    "lastSync": "2025-10-27T15:30:00Z",
    "commitHash": "abc123...",
    "totalPosts": 2,
    "totalDocs": 2
  },
  "posts": [
    {
      "slug": "welcome-to-my-blog",
      "title": "개발 블로그를 시작합니다 🚀",
      "date": "2025-10-27",
      "tags": ["blog", "announcement", "introduction"],
      "authors": ["namyoungkim"],
      "summary": "드디어 개발 블로그를 시작하게...",
      "filePath": "blog/2025-10-27-welcome.md",
      "wordCount": 850,
      "readingTime": "4 min"
    }
  ],
  "docs": [
    {
      "path": "react/hooks",
      "title": "React Hooks 완벽 가이드",
      "category": "react",
      "summary": "React Hooks의 모든 것...",
      "filePath": "docs/react/hooks.md",
      "wordCount": 2400
    }
  ],
  "tags": {
    "react": ["react-performance-optimization"],
    "blog": ["welcome-to-my-blog"],
    "performance": ["react-performance-optimization"]
  }
}
```

## 최적화 전략

### 1. 동기화 전략

- **초기화 시**: 즉시 `git clone` 및 인덱스 빌드
- **이후**: 5분마다 `git pull` 실행
- **변경 감지**: Git commit hash 비교로 변경 확인
- **증분 업데이트**: 변경된 파일만 재파싱 (추후 구현)

### 2. 캐싱 전략

- **인덱스 캐싱**: `.mcp-cache/index.json`에 인덱스 저장
- **유효성 검증**: Git commit hash로 캐시 유효성 확인
- **Cold start**: 캐시가 유효하면 인덱스 빌드 스킵

### 3. 메모리 관리

- **요약 우선**: 목록 조회 시 요약만 반환
- **전체 내용 on-demand**: 특정 포스트 조회 시에만 전체 마크다운 로드
- **인덱스 크기 제한**: 포스트당 최대 500자 요약

### 4. 검색 최적화

- **역인덱스**: 키워드 → 문서 매핑
- **태그 인덱스**: 태그 → 문서 매핑
- **간단한 점수화**: 제목 매칭 > 태그 매칭 > 본문 매칭

## 보안 고려사항

- ✅ Public repository만 사용 (인증 불필요)
- ✅ Read-only 작업만 수행
- ✅ 로컬 파일 시스템만 접근
- ✅ 네트워크 요청은 GitHub만 (git pull)

## 제한사항 및 향후 개선

### 현재 제한사항

1. **단방향**: Claude → 블로그 (읽기 전용)
2. **로컬 전용**: 현재 사용자만 접근 가능
3. **기본 검색**: 단순 키워드 매칭
4. **수동 동기화**: 5분 간격 (실시간 아님)

### 향후 개선 (Phase 4+)

1. **AI 요약**: LLM을 사용한 지능형 요약
2. **의미론적 검색**: 벡터 임베딩 기반 검색
3. **관련 콘텐츠 추천**: 유사도 기반 추천
4. **통계 대시보드**: 조회수, 인기 태그 등
5. **HTTP MCP**: 다른 사용자도 접근 가능하도록

## 배포 및 사용

### Claude Desktop 설정

```json
// ~/.config/claude/config.json (macOS/Linux)
// %APPDATA%\Claude\config.json (Windows)
{
  "mcpServers": {
    "a1rtisan-blog": {
      "command": "node",
      "args": [
        "/Users/leo/project/a1rtisan-dev-blog/mcp-server/index.js"
      ],
      "env": {
        "REPO_URL": "https://github.com/namyoungkim/a1rtisan.git",
        "SYNC_INTERVAL": "300000",
        "CACHE_DIR": ".mcp-cache"
      }
    }
  }
}
```

### 사용 예시

```
사용자: "최근 블로그 포스트를 보여줘"
Claude: [get_recent_posts 호출]
→ "최근 포스트 2개를 찾았습니다:
   1. 개발 블로그를 시작합니다 (2025-10-27)
   2. React 성능 최적화 완벽 가이드 (2025-10-27)"

사용자: "React 성능에 대한 글을 읽고 싶어"
Claude: [search_content 호출, query="React 성능"]
→ "React 성능 최적화 완벽 가이드를 찾았습니다."
   [get_blog_post 호출, slug="react-performance-optimization"]
→ [전체 마크다운 내용 표시]

사용자: "이 블로그에 TypeScript 관련 문서가 있어?"
Claude: [search_content 호출, query="TypeScript", type="docs"]
→ 검색 결과 표시
```

## 참고

- **MCP 공식 문서**: https://modelcontextprotocol.io/
- **Anthropic MCP SDK**: https://github.com/anthropics/anthropic-sdk-typescript
- **Claude Desktop**: https://claude.ai/download
