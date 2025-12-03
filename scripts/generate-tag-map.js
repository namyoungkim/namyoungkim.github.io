/**
 * 블로그 포스트의 permalink → tags 매핑 JSON 파일 생성
 * 사이드바 필터링에 사용됩니다.
 */

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const BLOG_DIR = path.join(process.cwd(), 'blog');
const OUTPUT_FILE = path.join(process.cwd(), 'static', 'blog-tags.json');
const BASE_URL = '/a1rtisan/blog';

function generateTagMap() {
  console.log('🏷️  Generating blog tag map...\n');

  const tagMap = {};
  const files = fs.readdirSync(BLOG_DIR);

  for (const file of files) {
    if (!file.endsWith('.md') && !file.endsWith('.mdx')) continue;

    const filePath = path.join(BLOG_DIR, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const { data: frontmatter } = matter(content);

    // slug 추출 (frontmatter에서 또는 파일명에서)
    let slug = frontmatter.slug;
    if (!slug) {
      // 파일명에서 날짜 제거하고 slug 추출: YYYY-MM-DD-slug.md
      const match = file.match(/^\d{4}-\d{2}-\d{2}-(.+)\.(md|mdx)$/);
      if (match) {
        slug = match[1];
      }
    }

    if (!slug) continue;

    const permalink = `${BASE_URL}/${slug}`;
    const tags = frontmatter.tags || [];

    tagMap[permalink] = tags.map(tag => tag.toLowerCase());

    console.log(`  ✅ ${slug}: [${tags.join(', ')}]`);
  }

  // JSON 파일 저장
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(tagMap, null, 2), 'utf-8');

  console.log(`\n✅ Generated: ${OUTPUT_FILE}`);
  console.log(`📊 Total posts: ${Object.keys(tagMap).length}`);
}

generateTagMap();
