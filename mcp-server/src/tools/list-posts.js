/**
 * list_blog_posts - 블로그 포스트 목록 조회
 */
export const listBlogPostsTool = {
  name: 'list_blog_posts',
  description: 'Get a list of all blog posts with metadata (title, date, tags, description)',
  inputSchema: {
    type: 'object',
    properties: {
      limit: {
        type: 'number',
        description: 'Maximum number of posts to return (default: 10)',
      },
      tag: {
        type: 'string',
        description: 'Filter posts by tag (optional)',
      },
    },
  },
};

/**
 * list_blog_posts 핸들러
 */
export async function handleListBlogPosts(args, contentParser, config) {
  const { limit = 10, tag } = args;

  // 블로그 포스트 목록 가져오기
  const posts = await contentParser.listBlogPostsWithMetadata();

  // 태그 필터링
  let filteredPosts = posts;
  if (tag) {
    filteredPosts = posts.filter(post =>
      post.tags && post.tags.includes(tag)
    );
  }

  // 제한 적용
  const limitedPosts = filteredPosts.slice(0, limit);

  // 결과 포맷팅
  const result = limitedPosts.map(post => ({
    slug: post.slug,
    title: post.title,
    date: post.date,
    tags: post.tags,
    authors: post.authors,
    description: post.description,
    url: `${config.siteUrl}${config.baseUrl}/blog/${post.slug}`,
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
