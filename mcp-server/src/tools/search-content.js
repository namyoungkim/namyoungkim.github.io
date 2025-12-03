/**
 * search_content - 콘텐츠 전체 검색
 */
export const searchContentTool = {
  name: 'search_content',
  description: 'Search through blog posts and documentation by keywords. Returns relevant results sorted by relevance.',
  inputSchema: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'Search query (keywords)',
      },
      type: {
        type: 'string',
        enum: ['all', 'blog', 'docs'],
        description: 'Content type to search (default: all)',
      },
      tag: {
        type: 'string',
        description: 'Filter by tag (blog posts only)',
      },
      limit: {
        type: 'number',
        description: 'Maximum number of results (default: 10)',
      },
      offset: {
        type: 'number',
        description: 'Pagination offset (default: 0)',
      },
    },
    required: ['query'],
  },
};

/**
 * search_content 핸들러
 */
export async function handleSearchContent(args, searchEngine, config) {
  const {
    query,
    type = 'all',
    tag = null,
    limit = 10,
    offset = 0
  } = args;

  // 검색 수행
  const searchResult = searchEngine.search(query, { type, tag, limit, offset });

  // URL 추가
  const results = searchResult.results.map(item => {
    let url;
    if (item.type === 'blog') {
      url = `${config.siteUrl}${config.baseUrl}/blog/${item.slug}`;
    } else if (item.type === 'docs') {
      url = `${config.siteUrl}${config.baseUrl}/docs/${item.path}`;
    }

    return {
      ...item,
      url,
      score: undefined // 점수는 내부용이므로 결과에서 제외
    };
  });

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify({
          query,
          results,
          total: searchResult.total,
          hasMore: searchResult.hasMore,
          returned: results.length
        }, null, 2),
      },
    ],
  };
}
