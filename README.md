# 🚀 개발 블로그 & 문서 사이트

Docusaurus 기반의 개발 블로그와 문서 사이트입니다. llms.txt 자동 생성 기능을 포함하여 AI 친화적인 콘텐츠 제공을 지원합니다.

## ✨ 주요 기능

- 📚 **문서 시스템** - 체계적인 기술 문서 관리
- ✍️ **블로그** - 개발 경험과 지식 공유
- 🔍 **검색 기능** - Algolia 검색 지원
- 🌓 **다크 모드** - 사용자 선호도에 따른 테마
- 🌐 **다국어 지원** - 한국어/영어 지원
- 🤖 **llms.txt** - LLM 친화적 콘텐츠 제공
- 📱 **반응형 디자인** - 모든 기기에서 완벽한 경험
- ⚡ **빠른 성능** - 최적화된 정적 사이트

## 📋 사전 요구사항

- Node.js 18.0 이상
- npm 또는 yarn

## 🛠️ 설치 방법

### 1단계: 저장소 클론

```bash
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name
```

### 2단계: 의존성 설치

```bash
npm install
```

### 3단계: 개발 서버 실행

```bash
npm start
```

브라우저에서 `http://localhost:3000`을 열면 사이트를 확인할 수 있습니다.

## 📁 프로젝트 구조

```
my-dev-blog/
├── blog/                      # 블로그 포스트 (마크다운)
│   ├── 2024-01-01-welcome.md
│   └── 2024-01-15-langgraph-tutorial.md
├── docs/                      # 문서 (마크다운)
│   ├── intro.md
│   ├── tutorial/
│   │   ├── getting-started.md
│   │   ├── installation.md
│   │   └── first-project.md
│   ├── guides/
│   └── api/
├── src/
│   ├── components/            # React 컴포넌트
│   ├── css/                   # 커스텀 스타일
│   └── pages/                 # 커스텀 페이지
├── static/
│   ├── img/                   # 이미지 파일
│   └── llms.txt              # 자동 생성됨
├── scripts/
│   └── generate-llms.js      # llms.txt 생성 스크립트
├── docusaurus.config.js      # 메인 설정 파일
├── sidebars.js               # 사이드바 설정
└── package.json
```

## ✍️ 콘텐츠 작성하기

### 블로그 포스트 작성

`blog/` 디렉토리에 새 마크다운 파일을 생성합니다:

```markdown
<!-- blog/2024-01-20-my-post.md -->
---
slug: my-first-post
title: 내 첫 블로그 포스트
authors: 
  name: Your Name
  title: Developer
  url: https://github.com/your-username
  image_url: https://github.com/your-username.png
tags: [javascript, tutorial]
---

# 포스트 제목

포스트 미리보기에 표시될 내용...

<!-- truncate -->

여기부터는 "더 읽기" 클릭 후 보이는 내용입니다.

## 섹션 1

내용...

```javascript
// 코드 예시
const greeting = "Hello, World!";
console.log(greeting);
```
```

### 문서 작성

`docs/` 디렉토리에 새 마크다운 파일을 생성합니다:

```markdown
<!-- docs/my-doc.md -->
---
sidebar_position: 1
---

# 문서 제목

문서 내용...

## 주요 개념

설명...

:::tip 유용한 팁
이렇게 팁을 추가할 수 있습니다!
:::

:::warning 주의사항
주의해야 할 내용을 강조할 수 있습니다.
:::

:::info 정보
추가 정보를 제공할 수 있습니다.
:::
```

## 🔧 설정 커스터마이징

### 사이트 정보 변경

`docusaurus.config.js` 파일을 열고 다음 항목들을 수정하세요:

```javascript
const config = {
  title: '여기에 사이트 제목',
  tagline: '여기에 태그라인',
  url: 'https://your-username.github.io',
  organizationName: 'your-username',
  projectName: 'your-repo-name',
  // ...
};
```

### 네비게이션 메뉴 변경

`docusaurus.config.js`의 `navbar` 섹션을 수정합니다:

```javascript
navbar: {
  title: '사이트 이름',
  items: [
    {to: '/docs/intro', label: '문서', position: 'left'},
    {to: '/blog', label: '블로그', position: 'left'},
    // 더 많은 메뉴 항목 추가...
  ],
}
```

### 사이드바 구조 변경

`sidebars.js` 파일을 수정하여 문서 구조를 커스터마이징할 수 있습니다.

## 🤖 llms.txt 자동 생성

이 프로젝트는 빌드 시 자동으로 `llms.txt` 파일을 생성합니다.

### 수동 생성

```bash
npm run generate:llms
```

생성된 파일은 `static/llms.txt`에 저장되며, 빌드 후 `https://yoursite.com/llms.txt`에서 접근할 수 있습니다.

### 커스터마이징

`scripts/generate-llms.js` 파일을 수정하여 llms.txt 생성 방식을 변경할 수 있습니다.

## 🚀 배포하기

### GitHub Pages에 배포

#### 방법 1: GitHub Actions (자동 배포) - 권장

1. **GitHub 저장소 설정**

```bash
# 저장소 생성 후
git remote add origin https://github.com/your-username/your-repo-name.git
git branch -M main
git push -u origin main
```

2. **GitHub Pages 설정**
   - GitHub 저장소 → Settings → Pages
   - Source를 "GitHub Actions"로 선택

3. **자동 배포**
   - `.github/workflows/deploy.yml` 파일이 이미 포함되어 있습니다
   - main 브랜치에 push하면 자동으로 배포됩니다

```bash
git add .
git commit -m "Update content"
git push
```

#### 방법 2: 수동 배포

```bash
# docusaurus.config.js에서 설정 확인 후
npm run build
npm run deploy
```

### Vercel에 배포

1. [Vercel](https://vercel.com)에 가입
2. GitHub 저장소 연결
3. 자동으로 배포됨 (설정 불필요)

### Netlify에 배포

1. [Netlify](https://netlify.com)에 가입
2. GitHub 저장소 연결
3. Build command: `npm run build`
4. Publish directory: `build`

## 🔍 검색 기능 설정 (선택사항)

### Algolia DocSearch 신청

1. [Algolia DocSearch](https://docsearch.algolia.com/apply/)에서 신청
2. 승인되면 API 키를 받게 됩니다
3. `docusaurus.config.js`의 `algolia` 섹션에 API 키 입력:

```javascript
algolia: {
  appId: 'YOUR_APP_ID',
  apiKey: 'YOUR_SEARCH_API_KEY',
  indexName: 'YOUR_INDEX_NAME',
},
```

## 📊 Google Analytics 설정 (선택사항)

1. [Google Analytics](https://analytics.google.com/)에서 계정 생성
2. 측정 ID (G-XXXXXXXXXX) 받기
3. `docusaurus.config.js`에 추가:

```javascript
gtag: {
  trackingID: 'G-XXXXXXXXXX',
  anonymizeIP: true,
},
```

## 🎨 디자인 커스터마이징

### 색상 변경

`src/css/custom.css` 파일을 수정합니다:

```css
:root {
  --ifm-color-primary: #2e8555;
  --ifm-color-primary-dark: #29784c;
  /* 더 많은 색상... */
}
```

### 로고 변경

`static/img/` 디렉토리에 로고 이미지를 추가하고 `docusaurus.config.js`에서 경로를 변경합니다.

## 📝 유용한 명령어

```bash
# 개발 서버 실행
npm start

# 프로덕션 빌드
npm run build

# 빌드된 사이트 로컬에서 확인
npm run serve

# llms.txt 생성
npm run generate:llms

# 캐시 정리
npm run clear

# GitHub Pages에 배포
npm run deploy
```

## 🐛 문제 해결

### 포트가 이미 사용 중인 경우

```bash
# 다른 포트로 실행
npm start -- --port 3001
```

### 빌드 오류 발생 시

```bash
# 캐시와 node_modules 삭제 후 재설치
npm run clear
rm -rf node_modules package-lock.json
npm install
npm run build
```

### llms.txt가 생성되지 않는 경우

```bash
# scripts 디렉토리 확인
ls scripts/

# 수동으로 생성 스크립트 실행
node scripts/generate-llms.js
```

## 📚 추가 리소스

- [Docusaurus 공식 문서](https://docusaurus.io/)
- [Markdown 가이드](https://www.markdownguide.org/)
- [MDX 문서](https://mdxjs.com/)
- [LangGraph 문서](https://langchain-ai.github.io/langgraph/)

## 💬 지원 및 커뮤니티

- [GitHub Issues](https://github.com/your-username/your-repo/issues) - 버그 리포트 및 기능 요청
- [GitHub Discussions](https://github.com/your-username/your-repo/discussions) - 질문 및 토론

## 📄 라이선스

MIT License - 자유롭게 사용, 수정, 배포할 수 있습니다.

## 🙏 감사의 말

- [Docusaurus](https://docusaurus.io/) - 이 멋진 프레임워크를 만들어주신 Meta 팀에게
- [Algolia](https://www.algolia.com/) - 무료 검색 서비스 제공

---

⭐ 이 프로젝트가 도움이 되셨다면 GitHub에서 Star를 눌러주세요!

📧 문의: your-email@example.com

🌐 웹사이트: https://your-username.github.io
