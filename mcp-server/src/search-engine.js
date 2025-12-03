import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';

/**
 * SearchEngine - 콘텐츠 인덱싱 및 검색
 */
export class SearchEngine {
  constructor() {
    this.index = {
      posts: new Map(),      // slug → post data
      docs: new Map(),       // path → doc data
      tags: new Map(),       // tag → [slugs/paths]
      keywords: new Map(),   // keyword → [slugs/paths]
    };
  }

  /**
   * 전체 인덱스 빌드
   */
  async buildIndex(repoPath) {
    console.error('[SearchEngine] Building index...');

    const blogDir = path.join(repoPath, 'blog');
    const docsDir = path.join(repoPath, 'docs');

    // 블로그 포스트 인덱싱
    await this.indexBlogPosts(blogDir);

    // 문서 인덱싱
    await this.indexDocs(docsDir);

    console.error(`[SearchEngine] Index built: ${this.index.posts.size} posts, ${this.index.docs.size} docs`);
  }

  /**
   * 블로그 포스트 인덱싱
   */
  async indexBlogPosts(blogDir) {
    try {
      const files = await fs.readdir(blogDir);
      const mdFiles = files.filter(f => f.endsWith('.md') && !f.startsWith('.'));

      for (const file of mdFiles) {
        const filePath = path.join(blogDir, file);
        const fileContent = await fs.readFile(filePath, 'utf-8');
        const parsed = matter(fileContent);

        // 파일명에서 날짜와 slug 추출: YYYY-MM-DD-slug.md
        const filename = path.basename(file, '.md');
        const match = filename.match(/^(\d{4})-(\d{2})-(\d{2})-(.+)$/);

        let date, slug;
        if (match) {
          date = `${match[1]}-${match[2]}-${match[3]}`;
          slug = match[4];
        } else {
          date = null;
          slug = filename;
        }

        const post = {
          slug: parsed.data.slug || slug,
          title: parsed.data.title || 'Untitled',
          date: parsed.data.date || date,
          tags: parsed.data.tags || [],
          authors: parsed.data.authors || [],
          excerpt: this.extractExcerpt(parsed.content),
          content: parsed.content,
          filePath: filePath,
          type: 'blog'
        };

        // 포스트 저장
        this.index.posts.set(post.slug, post);

        // 태그 인덱싱
        if (post.tags && Array.isArray(post.tags)) {
          for (const tag of post.tags) {
            if (!this.index.tags.has(tag)) {
              this.index.tags.set(tag, []);
            }
            this.index.tags.get(tag).push({ type: 'blog', id: post.slug });
          }
        }

        // 키워드 인덱싱
        this.indexKeywords(post.slug, 'blog', post.title, post.content, post.tags);
      }
    } catch (error) {
      console.error('[SearchEngine] Error indexing blog posts:', error);
    }
  }

  /**
   * 요약 추출 (<!-- truncate --> 태그 또는 처음 200자)
   */
  extractExcerpt(content, maxLength = 200) {
    const truncateIndex = content.indexOf('<!-- truncate -->');
    if (truncateIndex !== -1) {
      return content.substring(0, truncateIndex).trim();
    }

    const excerpt = content.substring(0, maxLength);
    return excerpt.trim() + '...';
  }

  /**
   * 문서 인덱싱
   */
  async indexDocs(docsDir) {
    try {
      await this.scanDocsDir(docsDir, docsDir);
    } catch (error) {
      console.error('[SearchEngine] Error indexing docs:', error);
    }
  }

  /**
   * 문서 디렉토리 재귀 스캔
   */
  async scanDocsDir(dir, docsRoot) {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        await this.scanDocsDir(fullPath, docsRoot);
      } else if (entry.isFile() && /\.mdx?$/.test(entry.name)) {
        const fileContent = await fs.readFile(fullPath, 'utf-8');
        const parsed = matter(fileContent);

        // docs/ 기준 상대 경로 계산
        const relativePath = path.relative(docsRoot, fullPath);
        const docPath = relativePath.replace(/\.mdx?$/, '');

        // 첫 H1 추출 (제목 없을 경우)
        const extractTitle = (content) => {
          const match = content.match(/^#\s+(.+)$/m);
          return match ? match[1] : null;
        };

        // 카테고리 추출 (경로의 첫 번째 부분)
        const extractCategory = (docPath) => {
          const parts = docPath.split(path.sep);
          return parts.length > 1 ? parts[0] : 'general';
        };

        const doc = {
          path: docPath,
          title: parsed.data.title || extractTitle(parsed.content) || 'Untitled',
          category: extractCategory(docPath),
          excerpt: this.extractExcerpt(parsed.content),
          content: parsed.content,
          filePath: fullPath,
          type: 'docs'
        };

        // 문서 저장
        this.index.docs.set(doc.path, doc);

        // 키워드 인덱싱
        this.indexKeywords(doc.path, 'docs', doc.title, doc.content, []);
      }
    }
  }

  /**
   * 키워드 인덱싱 (제목, 본문, 태그)
   */
  indexKeywords(id, type, title, content, tags = []) {
    // 제목 키워드 (가중치 높음)
    const titleWords = this.extractWords(title);
    for (const word of titleWords) {
      this.addKeyword(word, { type, id, weight: 3 });
    }

    // 태그 키워드 (중간 가중치)
    if (tags && Array.isArray(tags)) {
      for (const tag of tags) {
        const tagWords = this.extractWords(tag);
        for (const word of tagWords) {
          this.addKeyword(word, { type, id, weight: 2 });
        }
      }
    }

    // 본문 키워드 (낮은 가중치)
    const contentWords = this.extractWords(content);
    for (const word of contentWords) {
      this.addKeyword(word, { type, id, weight: 1 });
    }
  }

  /**
   * 키워드 추가
   */
  addKeyword(word, item) {
    if (!this.index.keywords.has(word)) {
      this.index.keywords.set(word, []);
    }

    // 중복 방지 (같은 id + type)
    const existing = this.index.keywords.get(word).find(
      i => i.type === item.type && i.id === item.id
    );

    if (!existing) {
      this.index.keywords.get(word).push(item);
    } else {
      // 가중치 누적
      existing.weight += item.weight;
    }
  }

  /**
   * 텍스트에서 단어 추출 (소문자, 2글자 이상)
   */
  extractWords(text) {
    if (!text) return [];

    // 특수문자 제거, 공백으로 분리
    const words = text
      .toLowerCase()
      .replace(/[^\w\sㄱ-ㅎㅏ-ㅣ가-힣-]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length >= 2);

    return [...new Set(words)]; // 중복 제거
  }

  /**
   * 검색 수행
   */
  search(query, options = {}) {
    const {
      type = 'all',        // all, blog, docs
      tag = null,          // 태그 필터
      limit = 10,
      offset = 0
    } = options;

    console.error(`[SearchEngine] Searching for: "${query}" (type: ${type}, tag: ${tag})`);

    // 쿼리 키워드 추출
    const queryWords = this.extractWords(query);
    if (queryWords.length === 0) {
      return { results: [], total: 0 };
    }

    console.error(`[SearchEngine] Query words:`, queryWords);

    // 관련도 점수 계산
    const scores = new Map(); // id → { type, score }

    for (const word of queryWords) {
      const matches = this.index.keywords.get(word) || [];

      for (const match of matches) {
        // 타입 필터
        if (type !== 'all' && match.type !== type) continue;

        const key = `${match.type}:${match.id}`;
        if (!scores.has(key)) {
          scores.set(key, { type: match.type, id: match.id, score: 0 });
        }
        scores.get(key).score += match.weight;
      }
    }

    console.error(`[SearchEngine] Found ${scores.size} matching items`);

    // 결과 수집 및 태그 필터링
    let results = [];

    for (const [key, { type: itemType, id, score }] of scores) {
      let item;

      if (itemType === 'blog') {
        item = this.index.posts.get(id);
      } else if (itemType === 'docs') {
        item = this.index.docs.get(id);
      }

      if (!item) continue;

      // 태그 필터 적용 (블로그만)
      if (tag && itemType === 'blog') {
        if (!item.tags || !item.tags.includes(tag)) {
          continue;
        }
      }

      results.push({
        ...item,
        score,
        content: undefined // 검색 결과에서 본문 제외 (메타데이터만)
      });
    }

    // 점수순 정렬
    results.sort((a, b) => b.score - a.score);

    const total = results.length;
    const paginatedResults = results.slice(offset, offset + limit);

    console.error(`[SearchEngine] Returning ${paginatedResults.length} results (total: ${total})`);

    return {
      results: paginatedResults,
      total,
      hasMore: offset + limit < total
    };
  }

  /**
   * 태그 목록 조회
   */
  getTags() {
    const tagList = [];

    for (const [tag, items] of this.index.tags) {
      tagList.push({
        tag,
        count: items.length,
        posts: items.filter(i => i.type === 'blog').length,
        docs: items.filter(i => i.type === 'docs').length
      });
    }

    // 사용 빈도순 정렬
    tagList.sort((a, b) => b.count - a.count);

    return tagList;
  }

  /**
   * 최신 콘텐츠 조회
   */
  getRecent(options = {}) {
    const {
      type = 'all',  // all, blog, docs
      limit = 5
    } = options;

    let items = [];

    // 블로그 포스트
    if (type === 'all' || type === 'blog') {
      for (const post of this.index.posts.values()) {
        items.push({
          ...post,
          content: undefined // 본문 제외
        });
      }
    }

    // 문서
    if (type === 'all' || type === 'docs') {
      for (const doc of this.index.docs.values()) {
        items.push({
          ...doc,
          content: undefined // 본문 제외
        });
      }
    }

    // 날짜순 정렬 (최신 우선)
    items.sort((a, b) => {
      const dateA = a.date || '';
      const dateB = b.date || '';
      return dateB.localeCompare(dateA);
    });

    return items.slice(0, limit);
  }

  /**
   * 인덱스를 직렬화 가능한 형태로 내보내기 (캐싱용)
   * Map 객체를 일반 객체로 변환
   */
  exportIndex() {
    return {
      posts: Object.fromEntries(this.index.posts),
      docs: Object.fromEntries(this.index.docs),
      tags: Object.fromEntries(this.index.tags),
      keywords: Object.fromEntries(this.index.keywords),
    };
  }

  /**
   * 캐시에서 인덱스 로드
   * @param {Object} cachedData - 캐시된 인덱스 데이터
   */
  loadFromCache(cachedData) {
    if (!cachedData || !cachedData.index) {
      throw new Error('Invalid cache data');
    }

    const { index } = cachedData;

    // Object를 Map으로 변환
    this.index.posts = new Map(Object.entries(index.posts));
    this.index.docs = new Map(Object.entries(index.docs));
    this.index.tags = new Map(Object.entries(index.tags));
    this.index.keywords = new Map(Object.entries(index.keywords));

    console.error('[SearchEngine] Index loaded from cache');
  }

  /**
   * 인덱스 통계 반환
   * @returns {string} - 인덱스 통계 (예: "5 posts, 3 docs, 12 tags")
   */
  getStats() {
    return `${this.index.posts.size} posts, ${this.index.docs.size} docs, ${this.index.tags.size} tags`;
  }
}

export default SearchEngine;
