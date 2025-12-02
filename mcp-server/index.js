#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import { GitManager } from './src/git-manager.js';
import { ContentParser } from './src/content-parser.js';

// Tools
import { listBlogPostsTool, handleListBlogPosts } from './src/tools/list-posts.js';
import { getBlogPostTool, handleGetBlogPost } from './src/tools/get-post.js';
import { listDocsTool, handleListDocs } from './src/tools/list-docs.js';
import { getDocTool, handleGetDoc } from './src/tools/get-doc.js';

/**
 * A1RTISAN MCP Server
 *
 * Provides access to blog posts and documentation from the A1RTISAN Dev Blog.
 * Uses GitHub repository as the single source of truth.
 */

// GitManager와 ContentParser 초기화
const gitManager = new GitManager({
  repoUrl: 'https://github.com/namyoungkim/a1rtisan.git',
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

/**
 * 서버 초기화 시 저장소 동기화
 */
async function initialize() {
  console.error('[MCP Server] Initializing...');

  try {
    await gitManager.sync();
    console.error('[MCP Server] Repository synced successfully');
  } catch (error) {
    console.error('[MCP Server] Failed to sync repository:', error);
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
    ],
  };
});

/**
 * CallTool 핸들러 - 도구 실행
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'list_blog_posts':
        return await handleListBlogPosts(args, contentParser);

      case 'get_blog_post':
        return await handleGetBlogPost(args, contentParser);

      case 'list_docs':
        return await handleListDocs(args, contentParser);

      case 'get_doc':
        return await handleGetDoc(args, contentParser);

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    console.error(`[MCP Server] Error executing tool "${name}":`, error);
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

    console.error('[MCP Server] A1RTISAN MCP Server is running');
    console.error('[MCP Server] Available tools:');
    console.error('  - list_blog_posts: Get blog post list');
    console.error('  - get_blog_post: Get specific blog post content');
    console.error('  - list_docs: Get documentation list');
    console.error('  - get_doc: Get specific documentation content');
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
