#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import { GitManager } from './src/git-manager.js';
import { ContentParser } from './src/content-parser.js';
import SearchEngine from './src/search-engine.js';
import CacheManager from './src/cache-manager.js';

// Tools
import { listBlogPostsTool, handleListBlogPosts } from './src/tools/list-posts.js';
import { getBlogPostTool, handleGetBlogPost } from './src/tools/get-post.js';
import { listDocsTool, handleListDocs } from './src/tools/list-docs.js';
import { getDocTool, handleGetDoc } from './src/tools/get-doc.js';
import { searchContentTool, handleSearchContent } from './src/tools/search-content.js';
import { getRecentPostsTool, handleGetRecentPosts } from './src/tools/get-recent.js';
import { getTagsTool, handleGetTags } from './src/tools/get-tags.js';
import { refreshContentTool, handleRefreshContent } from './src/tools/refresh-content.js';

/**
 * A1RTISAN MCP Server
 *
 * Provides access to blog posts and documentation from the A1RTISAN Dev Blog.
 * Uses GitHub repository as the single source of truth.
 */

// Debug logging (set DEBUG=1 to enable)
const DEBUG = process.env.DEBUG === '1';
const log = (...args) => DEBUG && console.error(...args);

// Site configuration (from docusaurus.config.js)
const SITE_URL = 'https://namyoungkim.github.io';
const BASE_URL = '';

// GitManager와 ContentParser 초기화
const gitManager = new GitManager({
  repoUrl: 'https://github.com/namyoungkim/namyoungkim.github.io.git',
  branch: 'main',
  debug: DEBUG,
});

const contentParser = new ContentParser(gitManager);
const searchEngine = new SearchEngine();
const cacheManager = new CacheManager({ debug: DEBUG });

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

/**
 * 서버 초기화 시 저장소 동기화 및 인덱스 빌드
 */
async function initialize() {
  log('[MCP Server] Initializing...');

  try {
    // 1. Git 저장소 동기화
    await gitManager.sync();
    const commitHash = await gitManager.getCurrentCommitHash();
    log('[MCP Server] Repository synced successfully');
    log(`[MCP Server] Current commit: ${commitHash.substring(0, 7)}`);

    // 2. 캐시 확인 및 로드
    const cached = await cacheManager.loadIndex();

    if (cached && await cacheManager.isValid(commitHash)) {
      // 캐시 유효 - 로드
      searchEngine.loadFromCache(cached);
      log('[MCP Server] Search index loaded from cache');
    } else {
      // 캐시 없음 또는 무효 - 재빌드
      log('[MCP Server] Building search index...');
      const repoPath = gitManager.getRepoPath();
      await searchEngine.buildIndex(repoPath);

      // 캐시 저장
      await cacheManager.saveIndex(searchEngine.exportIndex(), commitHash);
      log('[MCP Server] Search index cached');
    }

    log(`[MCP Server] Index: ${searchEngine.getStats()}`);
  } catch (error) {
    console.error('[MCP Server] Failed to initialize:', error.message);
    console.error('[MCP Server] Please check your network connection and repository access.');
    throw error;
  }
}

/**
 * ListTools 핸들러 - 사용 가능한 도구 목록 반환
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      listBlogPostsTool,
      getBlogPostTool,
      listDocsTool,
      getDocTool,
      searchContentTool,
      getRecentPostsTool,
      getTagsTool,
      refreshContentTool,
    ],
  };
});

/**
 * CallTool 핸들러 - 도구 실행
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  // 설정 객체
  const config = {
    siteUrl: SITE_URL,
    baseUrl: BASE_URL,
  };

  try {
    switch (name) {
      case 'list_blog_posts':
        return await handleListBlogPosts(args, contentParser, config);

      case 'get_blog_post':
        return await handleGetBlogPost(args, contentParser, config);

      case 'list_docs':
        return await handleListDocs(args, contentParser, config);

      case 'get_doc':
        return await handleGetDoc(args, contentParser, config);

      case 'search_content':
        return await handleSearchContent(args, searchEngine, config);

      case 'get_recent_posts':
        return await handleGetRecentPosts(args, searchEngine, config);

      case 'get_tags':
        return await handleGetTags(args, searchEngine);

      case 'refresh_content':
        return await handleRefreshContent(args, gitManager, searchEngine, cacheManager);

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    log(`[MCP Server] Error executing tool "${name}":`, error);
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

/**
 * 서버 시작
 */
async function main() {
  try {
    // 저장소 동기화
    await initialize();

    // Stdio transport 생성
    const transport = new StdioServerTransport();

    // 서버와 transport 연결
    await server.connect(transport);

    log('[MCP Server] A1RTISAN MCP Server is running');
    log('[MCP Server] Available tools (8):');
    log('  - list_blog_posts: Get blog post list');
    log('  - get_blog_post: Get specific blog post content');
    log('  - list_docs: Get documentation list');
    log('  - get_doc: Get specific documentation content');
    log('  - search_content: Search through blog posts and documentation');
    log('  - get_recent_posts: Get most recent content');
    log('  - get_tags: Get list of available tags');
    log('  - refresh_content: Manually sync repository and rebuild index');
  } catch (error) {
    console.error('[MCP Server] Fatal error:', error);
    process.exit(1);
  }
}

// 서버 시작
main().catch((error) => {
  console.error('[MCP Server] Unhandled error:', error);
  process.exit(1);
});
