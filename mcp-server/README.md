# A1RTISAN MCP Server

**Model Context Protocol (MCP) 서버** - A1RTISAN 개발 블로그의 콘텐츠에 접근할 수 있는 MCP 서버입니다.

Claude Desktop에서 이 MCP 서버를 연결하면, Claude가 블로그 포스트와 문서를 검색하고 읽을 수 있습니다.

## 기능

이 MCP 서버는 4개의 도구를 제공합니다:

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
    "url": "/blog/2025/12/02/bhattacharyya-distance"
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
  "url": "/blog/2025/12/02/bhattacharyya-distance",
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
    "url": "/docs/intro"
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
  "url": "/docs/intro",
  "frontmatter": {
    "sidebar_position": 1
  },
  "body": "# 시작하기\n\n환영합니다...",
  "fullContent": "---\nsidebar_position: 1\n---\n\n# 시작하기..."
}
```

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

```bash
cd /Users/leo/project/a1rtisan-dev-blog/mcp-server
node index.js
```

**예상 출력:**
```
[MCP Server] Initializing...
[GitManager] Cloning repository: https://github.com/namyoungkim/a1rtisan.git
[GitManager] Repository synced at: /Users/leo/project/a1rtisan-dev-blog/mcp-server/.mcp-cache/repo
[MCP Server] Repository synced successfully
[MCP Server] A1RTISAN MCP Server is running
[MCP Server] Available tools:
  - list_blog_posts: Get blog post list
  - get_blog_post: Get specific blog post content
  - list_docs: Get documentation list
  - get_doc: Get specific documentation content
```

## 아키텍처

```
mcp-server/
├── index.js                      # MCP 서버 진입점
├── package.json                  # 의존성 및 메타데이터
├── src/
│   ├── git-manager.js            # Git 저장소 클론/업데이트
│   ├── content-parser.js         # Markdown 파싱
│   └── tools/
│       ├── list-posts.js         # list_blog_posts 도구
│       ├── get-post.js           # get_blog_post 도구
│       ├── list-docs.js          # list_docs 도구
│       └── get-doc.js            # get_doc 도구
└── .mcp-cache/
    └── repo/                     # GitHub 저장소 클론 (gitignored)
```

### 데이터 흐름

1. **Claude Desktop** → MCP Server 요청 (예: `list_blog_posts`)
2. **MCP Server** → GitManager로 저장소 동기화 (첫 실행 시 클론, 이후 pull)
3. **GitManager** → ContentParser로 Markdown 파일 스캔/파싱
4. **ContentParser** → gray-matter로 frontmatter 추출
5. **MCP Server** → Claude Desktop으로 결과 반환

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

## 다음 단계 (Phase 2)

Phase 1 MVP가 정상 작동하면, 다음 기능을 추가할 수 있습니다:

- `search_content`: 콘텐츠 전문 검색
- `get_tags`: 사용 가능한 태그 목록
- `get_recent_posts`: 최신 포스트 (RSS 방식)
- 캐싱 최적화 (GitHub API 사용 + ETag)

자세한 로드맵은 `infrastructure/mcp/ROADMAP.md`를 참조하세요.

## 참고 문서

- [MCP 설계 문서](../infrastructure/mcp/DESIGN.md)
- [MCP 로드맵](../infrastructure/mcp/ROADMAP.md)
- [Model Context Protocol 공식 문서](https://modelcontextprotocol.io)
