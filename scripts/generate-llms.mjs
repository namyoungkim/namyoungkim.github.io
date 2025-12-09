/**
 * Docusaurus llms.txt 자동 생성 스크립트
 * 빌드 전에 자동으로 실행되어 docs와 blog를 스캔하여 llms.txt 생성
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 설정
const config = {
  projectName: '개발 블로그',
  description: '개발 경험, 튜토리얼, API 문서를 공유하는 기술 블로그',
  docsDir: path.join(__dirname, '../docs'),
  blogDir: path.join(__dirname, '../blog'),
  outputFile: path.join(__dirname, '../static/llms.txt'),
};

/**
 * 디렉토리를 재귀적으로 스캔하여 마크다운 파일 찾기
 */
function findMarkdownFiles(dir, baseDir = dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      findMarkdownFiles(filePath, baseDir, fileList);
    } else if (file.endsWith('.md') || file.endsWith('.mdx')) {
      const relativePath = path.relative(baseDir, filePath);
      fileList.push(relativePath);
    }
  });

  return fileList;
}

/**
 * 마크다운 파일에서 메타데이터 추출 (title, slug)
 */
function extractMetadata(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    let title = null;
    let slug = null;

    // Front matter 파싱
    const frontMatterMatch = content.match(/^---\s*\n([\s\S]*?)\n---/);
    if (frontMatterMatch) {
      const frontMatter = frontMatterMatch[1];

      // title 추출
      const titleMatch = frontMatter.match(/title:\s*['"]?([^'">\n]+)['"]?/);
      if (titleMatch) {
        title = titleMatch[1];
      }

      // slug 추출
      const slugMatch = frontMatter.match(/slug:\s*['"]?([^'">\n]+)['"]?/);
      if (slugMatch) {
        slug = slugMatch[1].trim();
      }
    }

    // title이 없으면 H1 헤딩 찾기
    if (!title) {
      const h1Match = content.match(/^#\s+(.+)$/m);
      if (h1Match) {
        title = h1Match[1];
      }
    }

    // title이 여전히 없으면 파일명으로 fallback
    if (!title) {
      const fileName = path.basename(filePath, path.extname(filePath));
      title = fileName.replace(/-/g, ' ').replace(/_/g, ' ');
    }

    return { title, slug };
  } catch (error) {
    console.warn(`Warning: Could not read ${filePath}`);
    return {
      title: path.basename(filePath, path.extname(filePath)),
      slug: null
    };
  }
}

/**
 * 마크다운 파일에서 제목 추출 (하위 호환성)
 */
function extractTitle(filePath) {
  return extractMetadata(filePath).title;
}

/**
 * 파일 경로를 URL로 변환
 */
function pathToUrl(filePath, type, frontmatterSlug = null) {
  const withoutExt = filePath.replace(/\.(md|mdx)$/, '');

  if (type === 'docs') {
    // frontmatter에 slug가 있으면 사용
    if (frontmatterSlug) {
      if (frontmatterSlug === '/') {
        return '/docs/';
      }
      // slug가 /로 시작하면 그대로, 아니면 /docs/ 붙임
      return frontmatterSlug.startsWith('/')
        ? `/docs${frontmatterSlug}`
        : `/docs/${frontmatterSlug}`;
    }
    // 없으면 파일 경로 기준
    return `/docs/${withoutExt}`;
  } else if (type === 'blog') {
    // blog/2024-01-01-post.md -> /blog/2024/01/01/post
    const parts = withoutExt.split(/[\\/]/);
    const fileName = parts[parts.length - 1];
    const match = fileName.match(/^(\d{4})-(\d{2})-(\d{2})-(.+)$/);

    if (match) {
      const [, , , , slug] = match;
      return `/blog/${slug}`;
    }

    return `/blog/${withoutExt}`;
  }

  return `/${withoutExt}`;
}

/**
 * llms.txt 내용 생성
 */
function generateLlmsTxt() {
  let content = [];

  // 헤더
  content.push(`# ${config.projectName}\n\n`);
  content.push(`> ${config.description}\n\n`);

  // 문서 섹션
  if (fs.existsSync(config.docsDir)) {
    console.log('📄 Scanning docs directory...');
    const docFiles = findMarkdownFiles(config.docsDir);

    if (docFiles.length > 0) {
      content.push('## 📚 Documentation\n\n');

      // intro를 먼저 표시
      const introFile = docFiles.find(f => f.includes('intro'));
      if (introFile) {
        const filePath = path.join(config.docsDir, introFile);
        const { title, slug } = extractMetadata(filePath);
        const url = pathToUrl(introFile, 'docs', slug);
        content.push(`- ${url}: ${title}\n`);
      }

      // 나머지 파일들
      docFiles
        .filter(f => !f.includes('intro'))
        .sort()
        .slice(0, 20) // 상위 20개만
        .forEach(file => {
          const filePath = path.join(config.docsDir, file);
          const { title, slug } = extractMetadata(filePath);
          const url = pathToUrl(file, 'docs', slug);
          content.push(`- ${url}: ${title}\n`);
        });

      content.push('\n');
      console.log(`  ✅ Found ${docFiles.length} documentation files`);
    }
  }

  // 블로그 섹션
  if (fs.existsSync(config.blogDir)) {
    console.log('📝 Scanning blog directory...');
    const blogFiles = findMarkdownFiles(config.blogDir);

    if (blogFiles.length > 0) {
      content.push('## ✍️ Blog Posts\n\n');

      // 최신 포스트부터 (파일명으로 정렬)
      blogFiles
        .sort()
        .reverse()
        .forEach(file => {
          const filePath = path.join(config.blogDir, file);
          const title = extractTitle(filePath);
          const url = pathToUrl(file, 'blog');
          content.push(`- ${url}: ${title}\n`);
        });

      content.push('\n');
      console.log(`  ✅ Found ${blogFiles.length} blog posts`);
    }
  }

  // Optional 섹션
  content.push('## Optional\n\n');
  content.push('- /blog/tags: All blog tags\n');
  content.push('- /blog/archive: Blog archive\n');

  return content.join('');
}

/**
 * 메인 실행
 */
function main() {
  console.log('🚀 Generating llms.txt...\n');

  try {
    const content = generateLlmsTxt();

    // static 디렉토리 확인
    const staticDir = path.dirname(config.outputFile);
    if (!fs.existsSync(staticDir)) {
      fs.mkdirSync(staticDir, { recursive: true });
    }

    // 파일 저장
    fs.writeFileSync(config.outputFile, content, 'utf-8');

    console.log(`\n✅ Successfully generated: ${config.outputFile}`);
    console.log(`📊 File size: ${(content.length / 1024).toFixed(2)} KB`);

    // 미리보기
    console.log('\n📝 Preview (first 20 lines):');
    console.log('═'.repeat(60));
    const lines = content.split('\n').slice(0, 20);
    console.log(lines.join('\n'));
    console.log('═'.repeat(60));

  } catch (error) {
    console.error('❌ Error generating llms.txt:', error.message);
    process.exit(1);
  }
}

// 스크립트 실행
main();
