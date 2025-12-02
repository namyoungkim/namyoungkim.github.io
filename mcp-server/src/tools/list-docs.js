/**
 * list_docs - 문서 목록 조회
 */
export const listDocsTool = {
  name: 'list_docs',
  description: 'Get a list of all documentation pages with metadata (title, path, description)',
  inputSchema: {
    type: 'object',
    properties: {
      limit: {
        type: 'number',
        description: 'Maximum number of documents to return (default: 20)',
      },
    },
  },
};

/**
 * list_docs 핸들러
 */
export async function handleListDocs(args, contentParser, config) {
  const { limit = 20 } = args;

  // 문서 목록 가져오기
  const docs = await contentParser.listDocsWithMetadata();

  // 제한 적용
  const limitedDocs = docs.slice(0, limit);

  // 결과 포맷팅
  const result = limitedDocs.map(doc => ({
    path: doc.relativePath,
    title: doc.title,
    sidebar_position: doc.sidebar_position,
    description: doc.description,
    url: `${config.siteUrl}${config.baseUrl}/docs/${doc.relativePath.replace(/\.(md|mdx)$/, '')}`,
  }));

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(result, null, 2),
      },
    ],
  };
}
