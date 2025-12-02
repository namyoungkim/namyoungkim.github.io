/**
 * get_doc - 특정 문서 전체 내용 조회
 */
export const getDocTool = {
  name: 'get_doc',
  description: 'Get full content of a specific documentation page by path',
  inputSchema: {
    type: 'object',
    properties: {
      path: {
        type: 'string',
        description: 'Document path relative to docs/ directory (e.g., "intro.md", "tutorial/getting-started.md")',
      },
    },
    required: ['path'],
  },
};

/**
 * get_doc 핸들러
 */
export async function handleGetDoc(args, contentParser, config) {
  const { path: docPath } = args;

  // docs/ 접두사 추가 (입력에 없을 경우)
  const normalizedPath = docPath.startsWith('docs/')
    ? docPath
    : `docs/${docPath}`;

  try {
    // 문서 파싱
    const parsed = await contentParser.parseMarkdown(normalizedPath);

    // URL 생성 (.md/.mdx 확장자 제거)
    const urlPath = normalizedPath
      .replace(/^docs\//, '')
      .replace(/\.(md|mdx)$/, '');

    // 결과 포맷팅
    const result = {
      path: normalizedPath,
      url: `${config.siteUrl}${config.baseUrl}/docs/${urlPath}`,
      frontmatter: parsed.frontmatter,
      body: parsed.body,
      fullContent: parsed.fullContent,
    };

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: Document "${docPath}" not found or failed to parse.\n${error.message}`,
        },
      ],
      isError: true,
    };
  }
}
