// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const {themes} = require('prism-react-renderer');
const lightCodeTheme = themes.github;
const darkCodeTheme = themes.dracula;

// Math equation support
const math = require('remark-math').default;
const katex = require('rehype-katex').default;

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: '개발 블로그',
  tagline: '기술과 코드, 그리고 배움을 기록합니다',
  favicon: 'img/favicon.png',

  // 여기에 실제 배포 URL을 입력하세요
  url: 'https://namyoungkim.github.io',
  baseUrl: '/a1rtisan/',

  // GitHub Pages 배포 설정
  organizationName: 'namyoungkim', // GitHub 사용자명 또는 조직명
  projectName: 'a1rtisan', // GitHub 저장소 이름

  onBrokenLinks: 'warn',

  // Markdown 설정
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  // 한국어 설정
  i18n: {
    defaultLocale: 'ko',
    locales: ['ko'],  // 한국어만 지원 (영어 제거됨)
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          // 문서 편집 링크 비활성화 (개인 블로그)
          // editUrl: 'https://github.com/namyoungkim/a1rtisan/tree/main/',
          showLastUpdateTime: false,
          showLastUpdateAuthor: false,
          remarkPlugins: [math],
          rehypePlugins: [katex],
        },
        blog: {
          showReadingTime: true,
          // 블로그 포스트당 표시할 개수
          postsPerPage: 10,
          // 블로그 편집 링크 비활성화 (개인 블로그)
          // editUrl: 'https://github.com/namyoungkim/a1rtisan/tree/main/',
          blogTitle: '개발 블로그',
          blogDescription: '개발 경험과 지식을 공유합니다',
          blogSidebarTitle: '최근 포스트',
          blogSidebarCount: 10,
          feedOptions: {
            type: 'all',
            title: '개발 블로그',
            description: '개발 경험과 지식을 공유합니다',
            copyright: `Copyright © ${new Date().getFullYear()} Nam Young Kim`,
          },
          remarkPlugins: [math],
          rehypePlugins: [katex],
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
        // Google Analytics (선택사항)
        gtag: {
          trackingID: 'G-XXXXXXXXXX', // 실제 Google Analytics ID로 변경
          anonymizeIP: true,
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // SEO 메타 이미지
      image: 'img/docusaurus-social-card.jpg',
      
      // 네비게이션 바
      navbar: {
        title: '',
        logo: {
          alt: 'A1RTISAN',
          src: 'img/a1rtisan-logo.png',
        },
        items: [
          {
            to: '/blog',
            label: '✍️ 블로그',
            position: 'left'
          },
          {
            type: 'docSidebar',
            sidebarId: 'tutorialSidebar',
            position: 'left',
            label: '📚 문서',
          },
          {
            href: 'https://github.com/namyoungkim/a1rtisan',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      
      // 푸터
      footer: {
        style: 'dark',
        links: [
          {
            title: '문서',
            items: [
              {
                label: '시작하기',
                to: '/docs/',
              },
            ],
          },
          {
            title: '커뮤니티',
            items: [
              {
                label: 'GitHub',
                href: 'https://github.com/namyoungkim',
              },
              {
                label: 'LinkedIn',
                href: 'https://linkedin.com/in/liniar',
              },
            ],
          },
          {
            title: '더보기',
            items: [
              {
                label: '블로그',
                to: '/blog',
              },
            ],
          },
          {
            title: '지원',
            items: [
              {
                label: '☕ Buy Me A Coffee',
                href: 'https://buymeacoffee.com/a1rtisan',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Leo. Built with Docusaurus.`,
      },
      
      // 코드 하이라이팅 테마
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
        additionalLanguages: ['bash', 'json', 'typescript', 'javascript', 'jsx', 'tsx'],
      },
      
      // Algolia 검색 (선택사항 - 무료)
      // 설정하려면 https://docsearch.algolia.com/apply/ 에서 신청
      algolia: {
        appId: 'YOUR_APP_ID',
        apiKey: 'YOUR_SEARCH_API_KEY',
        indexName: 'YOUR_INDEX_NAME',
        contextualSearch: true,
      },
      
      // 다크 모드 설정
      colorMode: {
        defaultMode: 'light',
        disableSwitch: false,
        respectPrefersColorScheme: true,
      },
      
      // 목차 설정
      tableOfContents: {
        minHeadingLevel: 2,
        maxHeadingLevel: 4,
      },
    }),

  // 플러그인
  plugins: [
    // 이상적인 이미지 플러그인
    [
      '@docusaurus/plugin-ideal-image',
      {
        quality: 70,
        max: 1030,
        min: 640,
        steps: 2,
        disableInDev: false,
      },
    ],
  ],

  // 추가 스크립트 (선택사항)
  scripts: [
    // 외부 스크립트가 필요한 경우
  ],

  // 추가 스타일시트 (선택사항)
  stylesheets: [
    // KaTeX CSS for math equations
    {
      href: 'https://cdn.jsdelivr.net/npm/katex@0.13.24/dist/katex.min.css',
      type: 'text/css',
      integrity:
        'sha384-odtC+0UGzzFL/6PNoE8rX/SPcQDXBJ+uRepguP4QkPCm2LBxH3FA3y+fKSiJ+AmM',
      crossorigin: 'anonymous',
    },
  ],
};

module.exports = config;
