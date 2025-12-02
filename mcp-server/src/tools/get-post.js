/**
 * get_blog_post - 특정 블로그 포스트 전체 내용 조회
 */
export const getBlogPostTool = {
  name: 'get_blog_post',
  description: 'Get full content of a specific blog post by slug or date',
  inputSchema: {
    type: 'object',
    properties: {
      slug: {
        type: 'string',
        description: 'Blog post slug (e.g., "welcome", "bhattacharyya-distance")',
      },
      date: {
        type: 'string',
        description: 'Blog post date in YYYY-MM-DD format (optional, helps narrow down)',
      },
    },
    required: ['slug'],
  },
};

/**
 * get_blog_post 핸들러
 */
export async function handleGetBlogPost(args, contentParser) {
  const { slug, date } = args;

  // 블로그 포스트 목록 가져오기
  const posts = await contentParser.listBlogPosts();

  // 슬러그와 날짜로 필터링
  let targetPost = posts.find(post => post.slug === slug);

  if (!targetPost) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: Blog post with slug "${slug}" not found.`,
        },
      ],
      isError: true,
    };
  }

  // 날짜 필터 적용 (여러 개 있을 경우)
  if (date && targetPost.date !== date) {
    const matchingPost = posts.find(post => post.slug === slug && post.date === date);
    if (matchingPost) {
      targetPost = matchingPost;
    }
  }

  // 전체 내용 파싱
  const parsed = await contentParser.parseMarkdown(targetPost.path);

  // 결과 포맷팅
  const result = {
    slug: targetPost.slug,
    date: targetPost.date,
    url: `/blog/${targetPost.year}/${targetPost.month}/${targetPost.day}/${targetPost.slug}`,
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
}
