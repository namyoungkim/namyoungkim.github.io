// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const {themes} = require('prism-react-renderer');
const lightCodeTheme = themes.github;
const darkCodeTheme = themes.dracula;

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: '개발 블로그',
  tagline: '기술과 코드, 그리고 배움을 기록합니다',
  favicon: 'img/favicon.ico',

  // 여기에 실제 배포 URL을 입력하세요
  url: 'https://A1rtisan-LAB.github.io',
  baseUrl: '/',

  // GitHub Pages 배포 설정
  organizationName: 'namyoungkim', // GitHub 사용자명 또는 조직명
  projectName: 'a1rtisan', // GitHub 저장소 이름

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // 한국어 설정
  i18n: {
    defaultLocale: 'ko',
    locales: ['ko', 'en'],
    localeConfigs: {
      ko: {
        label: '한국어',
        direction: 'ltr',
        htmlLang: 'ko-KR',
      },
      en: {
        label: 'English',
        direction: 'ltr',
        htmlLang: 'en-US',
      },
    },
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          // 문서 편집 링크 (선택사항)
          editUrl: 'https://github.com/namyoungkim/a1rtisan/tree/main/',
          showLastUpdateTime: true,
          showLastUpdateAuthor: true,
        },
        blog: {
          showReadingTime: true,
          // 블로그 포스트당 표시할 개수
          postsPerPage: 10,
          // 블로그 편집 링크 (선택사항)
          editUrl: 'https://github.com/namyoungkim/a1rtisan/tree/main/',
          blogTitle: '개발 블로그',
          blogDescription: '개발 경험과 지식을 공유합니다',
          blogSidebarTitle: '최근 포스트',
          blogSidebarCount: 10,
          feedOptions: {
            type: 'all',
            title: '개발 블로그',
            description: '개발 경험과 지식을 공유합니다',
            copyright: `Copyright © ${new Date().getFullYear()} Your Name`,
          },
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
        title: '개발 블로그',
        logo: {
          alt: 'Logo',
          src: 'img/logo.svg',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'tutorialSidebar',
            position: 'left',
            label: '📚 문서',
          },
          {
            to: '/blog', 
            label: '✍️ 블로그', 
            position: 'left'
          },
          {
            type: 'localeDropdown',
            position: 'right',
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
                to: '/docs/intro',
              },
              {
                label: '튜토리얼',
                to: '/docs/category/tutorial',
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
              {
                label: 'RSS',
                href: '/blog/rss.xml',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Your Name. Built with Docusaurus.`,
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
    // 외부 스타일시트가 필요한 경우
  ],
};

module.exports = config;
