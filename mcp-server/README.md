# A1RTISAN MCP Server

**Model Context Protocol (MCP) 서버** - A1RTISAN 개발 블로그의 콘텐츠에 접근할 수 있는 MCP 서버입니다.

Claude Desktop에서 이 MCP 서버를 연결하면, Claude가 블로그 포스트와 문서를 검색하고 읽을 수 있습니다.

## 기능

이 MCP 서버는 **8개의 도구**를 제공합니다:

**Phase 1 (MVP)**: 기본 조회 기능 (4개 도구)
**Phase 2**: 검색 및 필터링 기능 (3개 도구)
**Phase 3**: 최적화 및 안정화 (1개 도구 + 성능 개선)

**🔗 URL 정책**: 모든 도구는 **전체 URL**을 반환합니다 (클릭 가능).
- 블로그: `https://namyoungkim.github.io/a1rtisan/blog/...`
- 문서: `https://namyoungkim.github.io/a1rtisan/docs/...`

---

### Phase 1: 기본 조회 도구

### 1. `list_blog_posts`
블로그 포스트 목록을 조회합니다.

**파라미터:**
- `limit` (number, optional): 반환할 최대 포스트 개수 (기본값: 10)
- `tag` (string, optional): 특정 태그로 필터링

**응답 예시:**
```json
[
  {
    "slug": "bhattacharyya-distance",
    "title": "Bhattacharyya Distance 쉽게 이해하기",
    "date": "2025-12-02",
    "tags": ["statistics", "machine-learning", "mathematics"],
    "authors": ["namyoungkim"],
    "description": "Bhattacharyya Distance는...",
    "url": "https://namyoungkim.github.io/a1rtisan/blog/bhattacharyya-distance"
  }
]
```

### 2. `get_blog_post`
특정 블로그 포스트의 전체 내용을 가져옵니다.

**파라미터:**
- `slug` (string, required): 포스트 슬러그 (예: "bhattacharyya-distance")
- `date` (string, optional): 날짜 (YYYY-MM-DD 형식, 동일 슬러그가 여러 개일 경우)

**응답 예시:**
```json
{
  "slug": "bhattacharyya-distance",
  "date": "2025-12-02",
  "url": "https://namyoungkim.github.io/a1rtisan/blog/bhattacharyya-distance",
  "frontmatter": {
    "title": "Bhattacharyya Distance 쉽게 이해하기",
    "tags": ["statistics", "machine-learning"],
    "authors": "namyoungkim"
  },
  "body": "# Bhattacharyya Distance...",
  "fullContent": "---\ntitle: ...\n---\n\n# Bhattacharyya Distance..."
}
```

### 3. `list_docs`
문서 목록을 조회합니다.

**파라미터:**
- `limit` (number, optional): 반환할 최대 문서 개수 (기본값: 20)

**응답 예시:**
```json
[
  {
    "path": "intro.md",
    "title": "시작하기",
    "sidebar_position": 1,
    "description": "문서에 오신 것을 환영합니다...",
    "url": "https://namyoungkim.github.io/a1rtisan/docs/intro"
  }
]
```

### 4. `get_doc`
특정 문서의 전체 내용을 가져옵니다.

**파라미터:**
- `path` (string, required): 문서 경로 (예: "intro.md", "tutorial/getting-started.md")

**응답 예시:**
```json
{
  "path": "docs/intro.md",
  "url": "https://namyoungkim.github.io/a1rtisan/docs/intro",
  "frontmatter": {
    "sidebar_position": 1
  },
  "body": "# 시작하기\n\n환영합니다...",
  "fullContent": "---\nsidebar_position: 1\n---\n\n# 시작하기..."
}
```

---

### Phase 2: 검색 및 필터링 도구

### 5. `search_content`
키워드로 블로그 포스트와 문서를 검색합니다.

**파라미터:**
- `query` (string, required): 검색 키워드
- `type` (string, optional): 검색 범위 - `all`, `blog`, `docs` (기본값: `all`)
- `tag` (string, optional): 태그 필터 (블로그 포스트만)
- `limit` (number, optional): 최대 결과 수 (기본값: 10)
- `offset` (number, optional): 페이지네이션 오프셋 (기본값: 0)

**응답 예시:**
```json
{
  "query": "bhattacharyya",
  "results": [
    {
      "type": "blog",
      "slug": "bhattacharyya-distance",
      "title": "Bhattacharyya Distance 쉽게 이해하기",
      "date": "2025-12-02",
      "tags": ["statistics", "machine-learning"],
      "excerpt": "Bhattacharyya Distance는...",
      "url": "https://namyoungkim.github.io/a1rtisan/blog/bhattacharyya-distance"
    }
  ],
  "total": 1,
  "hasMore": false,
  "returned": 1
}
```

**검색 알고리즘:**
- 키워드 가중치: 제목 (3점) > 태그 (2점) > 본문 (1점)
- 관련도순 정렬

### 6. `get_recent_posts`
최신 블로그 포스트 및 문서를 가져옵니다.

**파라미터:**
- `type` (string, optional): 콘텐츠 타입 - `all`, `blog`, `docs` (기본값: `all`)
- `limit` (number, optional): 최대 결과 수 (기본값: 5)

**응답 예시:**
```json
{
  "results": [
    {
      "type": "blog",
      "slug": "bhattacharyya-distance",
      "title": "Bhattacharyya Distance 쉽게 이해하기",
      "date": "2025-12-02",
      "tags": ["statistics", "machine-learning"],
      "excerpt": "Bhattacharyya Distance는...",
      "url": "https://namyoungkim.github.io/a1rtisan/blog/bhattacharyya-distance"
    }
  ],
  "total": 5,
  "type": "all"
}
```

### 7. `get_tags`
사용 가능한 태그 목록을 가져옵니다.

**파라미터:**
- `limit` (number, optional): 최대 태그 수 (기본값: 20)

**응답 예시:**
```json
{
  "tags": [
    {
      "tag": "machine-learning",
      "count": 3,
      "posts": 3,
      "docs": 0
    },
    {
      "tag": "statistics",
      "count": 2,
      "posts": 2,
      "docs": 0
    }
  ],
  "total": 15,
  "returned": 20
}
```

---

### Phase 3: 최적화 및 안정화

### 8. `refresh_content`
저장소를 수동으로 동기화하고 검색 인덱스를 재빌드합니다.

**파라미터:**
- `force` (boolean, optional): commit hash가 변경되지 않았어도 인덱스 재빌드 (기본값: false)

**응답 예시:**
```json
{
  "success": true,
  "updated": true,
  "oldCommit": "92bfa11",
  "newCommit": "a3e5f2c",
  "hasChanges": true,
  "forced": false,
  "stats": "6 posts, 2 docs, 20 tags",
  "message": "Repository updated and index rebuilt successfully"
}
```

**사용 시기:**
- 새 블로그 포스트를 게시한 후
- 문서를 업데이트한 후
- 최신 콘텐츠를 확인하고 싶을 때

## 설치 및 설정

### 1. 의존성 설치

이미 완료되었습니다. 만약 재설치가 필요하다면:

```bash
cd /Users/leo/project/a1rtisan-dev-blog/mcp-server
npm install
```

### 2. Claude Desktop 설정

Claude Desktop 설정 파일에 이 서버를 추가하세요:

**macOS 경로:** `~/Library/Application Support/Claude/claude_desktop_config.json`

설정 파일 내용 (`claude_desktop_config.example.json` 참조):

```json
{
  "mcpServers": {
    "a1rtisan-blog": {
      "command": "node",
      "args": [
        "/Users/leo/project/a1rtisan-dev-blog/mcp-server/index.js"
      ],
      "env": {}
    }
  }
}
```

**주의:** `args` 배열의 경로는 **절대 경로**를 사용해야 합니다.

### 3. Claude Desktop 재시작

설정 파일을 수정한 후, Claude Desktop을 완전히 종료하고 다시 시작하세요.

### 4. 연결 확인

Claude Desktop에서 다음과 같이 질문해보세요:

```
블로그 포스트 목록을 보여줘
```

또는

```
"bhattacharyya-distance" 포스트를 읽어줘
```

## 테스트 (로컬)

MCP 서버를 로컬에서 직접 실행하여 테스트할 수 있습니다:

**일반 모드 (조용함):**
```bash
cd /Users/leo/project/a1rtisan-dev-blog/mcp-server
node index.js
```

**예상 출력:** (로그 없음)

---

**디버그 모드 (로그 출력):**
```bash
cd /Users/leo/project/a1rtisan-dev-blog/mcp-server
DEBUG=1 node index.js
```

**예상 출력:**
```
[MCP Server] Initializing...
[GitManager] Updating repository: https://github.com/namyoungkim/a1rtisan.git
[GitManager] Repository synced at: /Users/leo/project/a1rtisan-dev-blog/mcp-server/.mcp-cache/repo
[MCP Server] Repository synced successfully
[SearchEngine] Building index...
[SearchEngine] Index built: 5 posts, 1 docs
[MCP Server] Search index built successfully
[MCP Server] A1RTISAN MCP Server is running
[MCP Server] Available tools:
  - list_blog_posts: Get blog post list
  - get_blog_post: Get specific blog post content
  - list_docs: Get documentation list
  - get_doc: Get specific documentation content
  - search_content: Search through blog posts and documentation
  - get_recent_posts: Get most recent content
  - get_tags: Get list of available tags
```

## 아키텍처

```
mcp-server/
├── index.js                      # MCP 서버 진입점
├── package.json                  # 의존성 및 메타데이터
├── src/
│   ├── git-manager.js            # Git 저장소 클론/업데이트
│   ├── content-parser.js         # Markdown 파싱
│   ├── search-engine.js          # 검색 엔진 및 인덱싱 (Phase 2)
│   └── tools/
│       ├── list-posts.js         # list_blog_posts 도구
│       ├── get-post.js           # get_blog_post 도구
│       ├── list-docs.js          # list_docs 도구
│       ├── get-doc.js            # get_doc 도구
│       ├── search-content.js     # search_content 도구 (Phase 2)
│       ├── get-recent.js         # get_recent_posts 도구 (Phase 2)
│       └── get-tags.js           # get_tags 도구 (Phase 2)
└── .mcp-cache/
    └── repo/                     # GitHub 저장소 클론 (gitignored)
```

### 데이터 흐름

#### 서버 초기화 (시작 시) - Phase 3 개선
1. **MCP Server** → GitManager로 저장소 동기화
2. **GitManager** → GitHub에서 최신 코드 pull, commit hash 확인
3. **CacheManager** → 캐시 확인 및 유효성 검증
   - 캐시 유효 (commit hash 일치) → SearchEngine에 로드
   - 캐시 무효 (commit hash 불일치) 또는 없음 → 4번으로
4. **SearchEngine** → 전체 콘텐츠 인덱싱 (캐시 없을 때만)
   - 블로그 포스트 파싱 및 인덱싱
   - 문서 파싱 및 인덱싱
   - 키워드 역인덱스 생성
   - 태그 인덱스 생성
5. **CacheManager** → 인덱스 캐시 저장 (commit hash와 함께)

#### 도구 호출 시 (Phase 1)
1. **Claude Desktop** → MCP Server 요청 (예: `list_blog_posts`)
2. **MCP Server** → ContentParser로 Markdown 파일 스캔/파싱
3. **ContentParser** → gray-matter로 frontmatter 추출
4. **MCP Server** → Claude Desktop으로 결과 반환

#### 검색 호출 시 (Phase 2)
1. **Claude Desktop** → MCP Server 검색 요청 (예: `search_content`)
2. **MCP Server** → SearchEngine 쿼리
3. **SearchEngine** → 인덱스에서 키워드 매칭
4. **SearchEngine** → 관련도 점수 계산 및 정렬
5. **MCP Server** → Claude Desktop으로 결과 반환

### URL 구성 정책

**중요**: 모든 도구는 **전체 URL**을 반환합니다 (상대 경로 아님).

**URL 형식:**
```
${SITE_URL}${BASE_URL}/${content_type}/${path}
```

**설정 값:**
- `SITE_URL`: `https://namyoungkim.github.io` (index.js:31)
- `BASE_URL`: `/a1rtisan` (index.js:32)

**결과 예시:**
- 블로그: `https://namyoungkim.github.io/a1rtisan/blog/bhattacharyya-distance`
- 문서: `https://namyoungkim.github.io/a1rtisan/docs/intro`

**이점:**
- ✅ Claude Desktop에서 URL을 클릭하면 **실제 블로그로 바로 이동**
- ✅ 브라우저 북마크 가능
- ✅ 외부 공유 가능

**변경이 필요한 경우:**
- `docusaurus.config.js`의 `url`과 `baseUrl`이 변경되면
- `index.js`의 `SITE_URL`과 `BASE_URL`도 함께 업데이트 필요

## 문제 해결

### 서버가 시작되지 않음

1. Node.js 버전 확인:
```bash
node --version  # v18 이상 권장
```

2. 의존성 재설치:
```bash
cd /Users/leo/project/a1rtisan-dev-blog/mcp-server
rm -rf node_modules package-lock.json
npm install
```

### 캐시 관련 문제

1. 캐시가 손상되었거나 오류가 발생할 경우:
```bash
rm -rf /Users/leo/project/a1rtisan-dev-blog/mcp-server/.mcp-cache/index.json
```

2. Claude Desktop에서 `refresh_content` 도구 사용:
   - `force: true` 옵션으로 강제 재빌드 가능

3. 캐시 위치:
   - `.mcp-cache/index.json` (gitignored)

### Claude Desktop에서 도구가 보이지 않음

1. 설정 파일 경로 확인:
   - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`

2. 절대 경로 사용 확인:
   ```json
   "args": ["/Users/leo/project/a1rtisan-dev-blog/mcp-server/index.js"]
   ```

3. Claude Desktop 완전히 재시작 (Cmd+Q로 종료 후 재실행)

### Git 클론 실패

1. 인터넷 연결 확인
2. GitHub 저장소 접근 가능 여부 확인:
   ```bash
   git ls-remote https://github.com/namyoungkim/a1rtisan.git
   ```

3. 캐시 삭제 후 재시도:
   ```bash
   rm -rf /Users/leo/project/a1rtisan-dev-blog/mcp-server/.mcp-cache
   ```

## 로그 확인

MCP 서버의 로그는 **stderr**로 출력됩니다. Claude Desktop의 로그를 확인하세요:

**macOS:**
```bash
tail -f ~/Library/Logs/Claude/mcp*.log
```

## 현재 상태

- ✅ **Phase 1 (MVP)**: 기본 조회 기능 완료
  - `list_blog_posts`, `get_blog_post`, `list_docs`, `get_doc`

- ✅ **Phase 2**: 검색 및 필터링 완료
  - `search_content`: 키워드 검색 (가중치 기반 관련도 점수)
  - `get_recent_posts`: 최신 콘텐츠 조회
  - `get_tags`: 태그 목록 및 통계
  - SearchEngine: 인덱싱 시스템 구현

- ✅ **Phase 3**: 최적화 및 안정화 완료
  - `refresh_content`: 수동 동기화 도구
  - CacheManager: Git commit hash 기반 인덱스 캐싱
  - 에러 복구: Git 작업 재시도 로직 (최대 3회)
  - 성능 개선: Cold start < 3초 (캐시 사용 시)

## 성능 메트릭

**Phase 3 최적화 결과:**
- ✅ Cold start (캐시 없음): ~5-10초
- ✅ Cold start (캐시 유효): **< 1초**
- ✅ 검색 응답 시간: < 1초
- ✅ 메모리 사용량: ~335KB (캐시 파일)
- ✅ 안정성: Git 작업 자동 재시도

## 다음 단계 (향후 확장)

MCP 서버는 현재 **프로덕션 준비 완료** 상태입니다.

향후 확장 가능 항목 (선택사항):
- 전문 검색 (Full-text search)
- 태그 기반 추천
- 관련 포스트 추천
- 통계 및 분석 도구

자세한 로드맵은 `infrastructure/mcp/ROADMAP.md`를 참조하세요.

## 참고 문서

- [MCP 설계 문서](../infrastructure/mcp/DESIGN.md)
- [MCP 로드맵](../infrastructure/mcp/ROADMAP.md)
- [Model Context Protocol 공식 문서](https://modelcontextprotocol.io)
