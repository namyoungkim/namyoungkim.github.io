---
slug: mcp-server-part1-design
title: "개발 블로그를 위한 MCP 서버 구축기 (1): Git 기반 설계와 기본 구현"
authors: namyoungkim
tags: [ai, mcp, nodejs, ai-agents, tutorial]
---

# 개발 블로그를 위한 MCP 서버 구축기 (1): Git 기반 설계와 기본 구현

> Claude Desktop에서 개발 블로그 콘텐츠를 실시간으로 조회할 수 있도록 하는 MCP 서버를 만들어보겠습니다.

## 🎯 들어가며

블로그 포스트와 기술 문서가 늘어나면서 한 가지 고민이 생겼습니다. **"Claude에게 내 블로그 내용을 어떻게 알려줄 수 있을까?"**

매번 대화할 때마다 복사-붙여넣기로 콘텐츠를 전달하는 건 비효율적입니다. 그래서 **MCP (Model Context Protocol)** 서버를 구축해서 Claude Desktop이 직접 블로그 콘텐츠에 접근할 수 있도록 만들기로 했습니다.

<!-- truncate -->

---

## 📚 MCP란 무엇인가?

**MCP (Model Context Protocol)**는 Anthropic이 공개한 프로토콜로, LLM이 외부 데이터 소스나 도구에 접근할 수 있게 해주는 표준입니다.

쉽게 말하면:
- **기존**: 사용자가 데이터를 복사해서 Claude에게 전달
- **MCP**: Claude가 직접 데이터 소스에 접근

```
사용자 ← 대화 → Claude Desktop ← MCP Protocol → MCP Server ← → 데이터 소스
```

MCP 서버를 만들면 Claude Desktop에서 "도구"처럼 사용할 수 있습니다. 예를 들어, "최근 블로그 포스트를 보여줘"라고 말하면 Claude가 MCP 서버를 호출해서 실제 포스트 목록을 가져옵니다.

---

## 🏗️ 아키텍처 설계

### Git 기반 접근 방식

가장 먼저 결정해야 할 것은 **"데이터를 어디서 가져올 것인가?"** 입니다.

여러 선택지가 있었습니다:
1. **파일 시스템 직접 접근**: 로컬 파일만 가능, 다른 환경에서 사용 불가
2. **GitHub API 사용**: 인증 필요, Rate limit 존재
3. **Git Clone 방식**: 인증 불필요(public repo), 로컬에서 빠른 검색 가능

**Git Clone 방식**을 선택했습니다. GitHub 저장소를 **Single Source of Truth**로 사용하는 거죠.

```
Claude Desktop
    ↓
MCP Server (Node.js)
    ├── GitManager → GitHub Repository (clone/pull)
    ├── ContentParser → Markdown 파싱
    └── Tools → Claude에게 결과 반환
```

### 왜 Git 기반인가?

| 장점 | 설명 |
|------|------|
| **인증 불필요** | Public repository는 인증 없이 clone 가능 |
| **빠른 로컬 접근** | Clone 후에는 파일 시스템 속도로 접근 |
| **오프라인 동작** | 네트워크 없이도 캐시된 내용 사용 가능 |
| **버전 관리** | Commit hash로 변경 감지 가능 |

---

## 📁 프로젝트 구조

```
mcp-server/
├── package.json
├── index.js                 # 서버 진입점
└── src/
    ├── git-manager.js       # Git 동기화
    ├── content-parser.js    # Markdown 파싱
    └── tools/               # MCP Tools
        ├── list-posts.js
        ├── get-post.js
        ├── list-docs.js
        └── get-doc.js
```

---

## 🔧 핵심 컴포넌트 구현

### 1. GitManager - 저장소 동기화

GitManager는 GitHub 저장소를 로컬에 clone하고 업데이트하는 역할을 합니다.

```javascript title="src/git-manager.js"
import simpleGit from 'simple-git';
import { promises as fs } from 'fs';
import path from 'path';

export class GitManager {
  constructor(options = {}) {
    this.repoUrl = options.repoUrl || 'https://github.com/username/repo.git';
    this.branch = options.branch || 'main';
    this.cacheDir = path.join(__dirname, '..', '.mcp-cache', 'repo');
  }

  // 저장소가 이미 클론되어 있는지 확인
  async isCloned() {
    try {
      await fs.access(path.join(this.cacheDir, '.git'));
      return true;
    } catch {
      return false;
    }
  }

  // Clone 또는 Pull
  async sync() {
    const cloned = await this.isCloned();

    if (!cloned) {
      await this.clone();
    } else {
      await this.pull();
    }
  }

  // 저장소 클론 (shallow clone으로 빠르게)
  async clone() {
    await fs.mkdir(path.dirname(this.cacheDir), { recursive: true });
    const git = simpleGit();
    await git.clone(this.repoUrl, this.cacheDir, [
      '--depth', '1',
      '--branch', this.branch
    ]);
  }

  // 저장소 업데이트
  async pull() {
    const git = simpleGit(this.cacheDir);
    await git.pull('origin', this.branch);
  }
}
```

핵심 포인트:
- **Shallow clone** (`--depth 1`): 전체 히스토리 대신 최신 커밋만 가져와서 빠르게 clone
- **캐시 디렉토리**: `.mcp-cache/repo`에 저장 (gitignore 처리)
- **자동 판단**: clone되어 있으면 pull, 없으면 clone

---

### 2. ContentParser - Markdown 파싱

ContentParser는 Markdown 파일을 읽고 frontmatter와 본문을 분리합니다.

```javascript title="src/content-parser.js"
import { promises as fs } from 'fs';
import path from 'path';
import matter from 'gray-matter';

export class ContentParser {
  constructor(gitManager) {
    this.gitManager = gitManager;
  }

  // Markdown 파일 파싱
  async parseMarkdown(filePath) {
    const fullPath = this.gitManager.resolvePath(filePath);
    const content = await fs.readFile(fullPath, 'utf-8');
    const { data: frontmatter, content: body } = matter(content);

    return {
      path: filePath,
      frontmatter,
      body,
    };
  }

  // 블로그 포스트 목록 가져오기
  async listBlogPosts() {
    const files = await this.findMarkdownFiles('blog');

    const posts = files
      .map(file => {
        const filename = path.basename(file);
        // 파일명에서 날짜와 slug 추출: YYYY-MM-DD-slug.md
        const match = filename.match(/^(\d{4})-(\d{2})-(\d{2})-(.+)\.(md|mdx)$/);

        if (match) {
          const [, year, month, day, slug] = match;
          return {
            path: file,
            slug,
            date: `${year}-${month}-${day}`,
          };
        }
        return null;
      })
      .filter(Boolean)
      .sort((a, b) => b.date.localeCompare(a.date)); // 최신순 정렬

    return posts;
  }
}
```

핵심 포인트:
- **gray-matter**: YAML frontmatter를 깔끔하게 파싱
- **파일명 규칙**: `YYYY-MM-DD-slug.md` 형식에서 날짜와 slug 추출
- **최신순 정렬**: 날짜 기준 내림차순

---

### 3. MCP 서버 설정

이제 MCP SDK를 사용해서 서버를 구성합니다.

```javascript title="index.js"
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import { GitManager } from './src/git-manager.js';
import { ContentParser } from './src/content-parser.js';

// 컴포넌트 초기화
const gitManager = new GitManager({
  repoUrl: 'https://github.com/namyoungkim/namyoungkim.github.io.git',
  branch: 'main',
});
const contentParser = new ContentParser(gitManager);

// MCP Server 생성
const server = new Server(
  {
    name: 'a1rtisan-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);
```

---

### 4. MCP Tools 구현

MCP 서버가 제공할 "도구"들을 정의합니다. Phase 1에서는 4개의 기본 도구를 구현했습니다.

#### list_blog_posts - 블로그 목록 조회

```javascript title="src/tools/list-posts.js"
export const listBlogPostsTool = {
  name: 'list_blog_posts',
  description: '블로그 포스트 목록을 가져옵니다. 최신순으로 정렬됩니다.',
  inputSchema: {
    type: 'object',
    properties: {
      limit: {
        type: 'number',
        description: '가져올 포스트 수 (기본: 10)',
      },
      offset: {
        type: 'number',
        description: '페이지네이션용 오프셋 (기본: 0)',
      },
    },
  },
};

export async function handleListBlogPosts(args, contentParser, config) {
  const { limit = 10, offset = 0 } = args;

  const posts = await contentParser.listBlogPostsWithMetadata();
  const paginatedPosts = posts.slice(offset, offset + limit);

  // URL 추가
  const postsWithUrls = paginatedPosts.map(post => ({
    ...post,
    url: `${config.siteUrl}${config.baseUrl}/blog/${post.slug}`,
  }));

  return {
    content: [{
      type: 'text',
      text: JSON.stringify({
        posts: postsWithUrls,
        total: posts.length,
        hasMore: offset + limit < posts.length,
      }, null, 2),
    }],
  };
}
```

#### get_blog_post - 블로그 포스트 상세 조회

```javascript title="src/tools/get-post.js"
export const getBlogPostTool = {
  name: 'get_blog_post',
  description: '특정 블로그 포스트의 전체 내용을 가져옵니다.',
  inputSchema: {
    type: 'object',
    properties: {
      slug: {
        type: 'string',
        description: '포스트 슬러그 (예: welcome-to-my-blog)',
      },
    },
    required: ['slug'],
  },
};

export async function handleGetBlogPost(args, contentParser, config) {
  const { slug } = args;

  const posts = await contentParser.listBlogPosts();
  const post = posts.find(p => p.slug === slug);

  if (!post) {
    return {
      content: [{
        type: 'text',
        text: `Error: Post not found: ${slug}`,
      }],
      isError: true,
    };
  }

  const parsed = await contentParser.parseMarkdown(post.path);

  return {
    content: [{
      type: 'text',
      text: JSON.stringify({
        slug: post.slug,
        date: post.date,
        title: parsed.frontmatter.title,
        tags: parsed.frontmatter.tags || [],
        url: `${config.siteUrl}${config.baseUrl}/blog/${post.slug}`,
        content: parsed.body,
      }, null, 2),
    }],
  };
}
```

---

### 5. Tool 핸들러 등록

마지막으로 MCP 서버에 도구 목록과 핸들러를 등록합니다.

```javascript title="index.js" {6-15,18-32}
// Tool 목록 반환
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      listBlogPostsTool,
      getBlogPostTool,
      listDocsTool,
      getDocTool,
    ],
  };
});

// Tool 실행
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  const config = {
    siteUrl: 'https://namyoungkim.github.io',
    baseUrl: '',
  };

  switch (name) {
    case 'list_blog_posts':
      return await handleListBlogPosts(args, contentParser, config);

    case 'get_blog_post':
      return await handleGetBlogPost(args, contentParser, config);

    // ... 다른 도구들

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});
```

---

## 🔗 Claude Desktop 연동

MCP 서버를 Claude Desktop에 연결하려면 설정 파일을 편집합니다.

### 설정 파일 위치

- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

### 설정 내용

```json title="claude_desktop_config.json"
{
  "mcpServers": {
    "a1rtisan-blog": {
      "command": "node",
      "args": ["/path/to/mcp-server/index.js"],
      "env": {}
    }
  }
}
```

Claude Desktop을 재시작하면 도구 목록에 MCP 서버가 나타납니다.

---

## 🧪 테스트

Claude Desktop에서 다음과 같이 테스트할 수 있습니다:

**사용자**: "최근 블로그 포스트를 보여줘"

**Claude**: `list_blog_posts` 도구 호출 → 포스트 목록 반환

```json
{
  "posts": [
    {
      "slug": "bhattacharyya-distance",
      "title": "Bhattacharyya Distance 쉽게 이해하기",
      "date": "2025-12-02",
      "tags": ["statistics", "machine-learning"],
      "url": "https://namyoungkim.github.io/blog/bhattacharyya-distance"
    }
  ],
  "total": 5,
  "hasMore": false
}
```

---

## 📊 Phase 1 결과

### 구현된 도구 (4개)

| 도구 | 설명 |
|------|------|
| `list_blog_posts` | 블로그 포스트 목록 조회 |
| `get_blog_post` | 특정 블로그 포스트 내용 조회 |
| `list_docs` | 기술 문서 목록 조회 |
| `get_doc` | 특정 기술 문서 내용 조회 |

### 주요 성과

- ✅ Git 기반 아키텍처로 인증 없이 사용 가능
- ✅ Shallow clone으로 빠른 초기화
- ✅ Frontmatter 파싱으로 메타데이터 추출
- ✅ URL 자동 생성 (클릭 가능)

---

## 🔜 다음 편 예고

Phase 1에서는 기본적인 목록 조회와 내용 읽기를 구현했습니다. 하지만 콘텐츠가 많아지면 원하는 내용을 찾기 어려워집니다.

**다음 편**에서는 **인메모리 역인덱스**를 구현해서 키워드 기반 검색 기능을 추가합니다:
- 역인덱스(Inverted Index) 설계
- 가중치 기반 검색 점수 시스템
- `search_content`, `get_recent_posts`, `get_tags` 도구 구현

---

## 참고 자료

- [MCP 공식 문서](https://modelcontextprotocol.io/)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [simple-git](https://github.com/steveukx/git-js) - Node.js Git 라이브러리
- [gray-matter](https://github.com/jonschlinkert/gray-matter) - Frontmatter 파싱 라이브러리
