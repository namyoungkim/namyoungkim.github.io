/**
 * 문서 사이드바 설정
 * 자동 생성 또는 수동 설정 가능
 */

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  // 기본 튜토리얼 사이드바
  tutorialSidebar: [
    {
      type: 'doc',
      id: 'intro',
      label: '👋 시작하기',
    },
    {
      type: 'category',
      label: '📖 튜토리얼',
      collapsed: false,
      items: [
        'tutorial/getting-started',
      ],
    },
  ],

  // 추가 사이드바 (필요시)
  // 새로운 문서를 추가하면 여기에 항목을 추가하세요
  // 예시:
  // {
  //   type: 'category',
  //   label: '📚 가이드',
  //   items: [
  //     'guides/best-practices',
  //     'guides/troubleshooting',
  //   ],
  // },
};

module.exports = sidebars;
