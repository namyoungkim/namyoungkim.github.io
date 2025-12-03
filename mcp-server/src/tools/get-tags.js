/**
 * get_tags - 사용 가능한 태그 목록 조회
 */
export const getTagsTool = {
  name: 'get_tags',
  description: 'Get a list of all available tags with usage counts. Tags are sorted by frequency (most used first).',
  inputSchema: {
    type: 'object',
    properties: {
      limit: {
        type: 'number',
        description: 'Maximum number of tags to return (default: 20)',
      },
    },
  },
};

/**
 * get_tags 핸들러
 */
export async function handleGetTags(args, searchEngine) {
  const { limit = 20 } = args;

  // 태그 목록 조회
  const tags = searchEngine.getTags();

  // 제한 적용
  const limitedTags = tags.slice(0, limit);

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify({
          tags: limitedTags,
          total: tags.length,
          returned: limitedTags.length
        }, null, 2),
      },
    ],
  };
}
