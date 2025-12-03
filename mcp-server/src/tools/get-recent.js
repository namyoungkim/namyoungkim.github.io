/**
 * get_recent_posts - 최신 콘텐츠 조회
 */
export const getRecentPostsTool = {
  name: 'get_recent_posts',
  description: 'Get the most recent blog posts and/or documentation. Returns items sorted by date (newest first).',
  inputSchema: {
    type: 'object',
    properties: {
      type: {
        type: 'string',
        enum: ['all', 'blog', 'docs'],
        description: 'Content type (default: all)',
      },
      limit: {
        type: 'number',
        description: 'Maximum number of items to return (default: 5)',
      },
    },
  },
};

/**
 * get_recent_posts 핸들러
 */
export async function handleGetRecentPosts(args, searchEngine, config) {
  const {
    type = 'all',
    limit = 5
  } = args;

  // 최신 콘텐츠 조회
  const items = searchEngine.getRecent({ type, limit });

  // URL 추가
  const results = items.map(item => {
    let url;
    if (item.type === 'blog') {
      url = `${config.siteUrl}${config.baseUrl}/blog/${item.slug}`;
    } else if (item.type === 'docs') {
      url = `${config.siteUrl}${config.baseUrl}/docs/${item.path}`;
    }

    return {
      ...item,
      url
    };
  });

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify({
          results,
          total: results.length,
          type
        }, null, 2),
      },
    ],
  };
}
