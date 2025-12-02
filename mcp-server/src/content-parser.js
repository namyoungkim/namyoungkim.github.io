import { promises as fs } from 'fs';
import path from 'path';
import matter from 'gray-matter';

/**
 * ContentParser - Markdown 파일 파싱 및 메타데이터 추출
 */
export class ContentParser {
  constructor(gitManager) {
    this.gitManager = gitManager;
  }

  /**
   * 디렉토리 내 모든 .md/.mdx 파일 재귀 탐색
   * @param {string} dir - 탐색할 디렉토리 (저장소 루트 기준 상대 경로)
   */
  async findMarkdownFiles(dir) {
    const fullPath = this.gitManager.resolvePath(dir);
    const files = [];

    try {
      const entries = await fs.readdir(fullPath, { withFileTypes: true });

      for (const entry of entries) {
        const entryPath = path.join(dir, entry.name);
        const fullEntryPath = path.join(fullPath, entry.name);

        if (entry.isDirectory()) {
          // 재귀적으로 하위 디렉토리 탐색
          const subFiles = await this.findMarkdownFiles(entryPath);
          files.push(...subFiles);
        } else if (entry.isFile() && /\.(md|mdx)$/.test(entry.name)) {
          files.push(entryPath);
        }
      }
    } catch (error) {
      console.error(`[ContentParser] Failed to read directory ${dir}:`, error);
    }

    return files;
  }

  /**
   * Markdown 파일 파싱
   * @param {string} filePath - 파일 경로 (저장소 루트 기준 상대 경로)
   */
  async parseMarkdown(filePath) {
    const fullPath = this.gitManager.resolvePath(filePath);

    try {
      const content = await fs.readFile(fullPath, 'utf-8');
      const { data: frontmatter, content: body } = matter(content);

      return {
        path: filePath,
        frontmatter,
        body,
        fullContent: content,
      };
    } catch (error) {
      console.error(`[ContentParser] Failed to parse ${filePath}:`, error);
      throw error;
    }
  }

  /**
   * 블로그 포스트 목록 가져오기
   */
  async listBlogPosts() {
    const files = await this.findMarkdownFiles('blog');

    // 날짜 추출 및 정렬
    const posts = files
      .map(file => {
        const filename = path.basename(file);
        const match = filename.match(/^(\d{4})-(\d{2})-(\d{2})-(.+)\.(md|mdx)$/);

        if (match) {
          const [, year, month, day, slug] = match;
          return {
            path: file,
            filename,
            slug,
            date: `${year}-${month}-${day}`,
            year,
            month,
            day,
          };
        }

        return null;
      })
      .filter(Boolean)
      .sort((a, b) => b.date.localeCompare(a.date)); // 최신순 정렬

    return posts;
  }

  /**
   * 블로그 포스트 메타데이터와 함께 가져오기
   */
  async listBlogPostsWithMetadata() {
    const posts = await this.listBlogPosts();
    const postsWithMeta = [];

    for (const post of posts) {
      try {
        const parsed = await this.parseMarkdown(post.path);
        postsWithMeta.push({
          ...post,
          title: parsed.frontmatter.title || post.slug,
          tags: parsed.frontmatter.tags || [],
          authors: parsed.frontmatter.authors || [],
          description: this.extractDescription(parsed.body),
        });
      } catch (error) {
        console.error(`[ContentParser] Failed to parse metadata for ${post.path}:`, error);
      }
    }

    return postsWithMeta;
  }

  /**
   * 문서 목록 가져오기
   */
  async listDocs() {
    const files = await this.findMarkdownFiles('docs');

    const docs = files.map(file => {
      const filename = path.basename(file, path.extname(file));
      const relativePath = file.replace(/^docs\//, '');

      return {
        path: file,
        filename,
        relativePath,
      };
    });

    return docs;
  }

  /**
   * 문서 메타데이터와 함께 가져오기
   */
  async listDocsWithMetadata() {
    const docs = await this.listDocs();
    const docsWithMeta = [];

    for (const doc of docs) {
      try {
        const parsed = await this.parseMarkdown(doc.path);
        docsWithMeta.push({
          ...doc,
          title: parsed.frontmatter.title || this.extractTitle(parsed.body) || doc.filename,
          sidebar_position: parsed.frontmatter.sidebar_position,
          description: this.extractDescription(parsed.body),
        });
      } catch (error) {
        console.error(`[ContentParser] Failed to parse metadata for ${doc.path}:`, error);
      }
    }

    // sidebar_position으로 정렬 (없으면 끝으로)
    docsWithMeta.sort((a, b) => {
      if (a.sidebar_position === undefined) return 1;
      if (b.sidebar_position === undefined) return -1;
      return a.sidebar_position - b.sidebar_position;
    });

    return docsWithMeta;
  }

  /**
   * 본문에서 첫 문단 추출 (설명용)
   */
  extractDescription(body, maxLength = 150) {
    // <!-- truncate --> 이전 내용 추출 시도
    const truncateMatch = body.match(/^(.+?)<!-- truncate -->/s);
    if (truncateMatch) {
      const text = truncateMatch[1].trim();
      return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    }

    // 첫 문단 추출
    const firstParagraph = body
      .split('\n\n')[0]
      .replace(/^#+\s+.+$/gm, '') // 헤딩 제거
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // 링크 텍스트만 추출
      .trim();

    return firstParagraph.length > maxLength
      ? firstParagraph.substring(0, maxLength) + '...'
      : firstParagraph;
  }

  /**
   * 본문에서 첫 H1 헤딩 추출
   */
  extractTitle(body) {
    const match = body.match(/^#\s+(.+)$/m);
    return match ? match[1] : null;
  }
}
