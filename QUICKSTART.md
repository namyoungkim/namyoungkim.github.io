# 🚀 빠른 시작 가이드

Docusaurus 개발 블로그를 5분 안에 시작하는 방법입니다.

## 📦 1단계: 파일 구성

다운로드한 파일들을 다음과 같이 배치하세요:

```
your-blog/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions 배포 설정
├── blog/
│   └── 2024-01-01-welcome.md  # 첫 블로그 포스트
├── docs/
│   ├── intro.md                # 문서 시작 페이지
│   └── tutorial/
│       └── getting-started.md  # 튜토리얼
├── scripts/
│   └── generate-llms.js        # llms.txt 생성 스크립트
├── src/
│   └── css/
│       └── custom.css          # 커스텀 스타일
├── static/
│   └── img/                    # 이미지 폴더 (생성 필요)
├── docusaurus.config.js        # 메인 설정 파일
├── sidebars.js                 # 사이드바 설정
├── package.json                # NPM 패키지 설정
└── README.md                   # 프로젝트 설명
```

## ⚙️ 2단계: 설정 파일 수정

### A. docusaurus.config.js 수정

파일을 열고 다음 항목들을 수정하세요:

```javascript
const config = {
  title: '나의 개발 블로그',              // ← 변경
  tagline: '개발 여정을 기록합니다',      // ← 변경
  
  // GitHub Pages 설정
  url: 'https://your-username.github.io',          // ← 변경
  organizationName: 'your-username',               // ← 변경
  projectName: 'your-repo-name',                   // ← 변경
  
  // ... 나머지는 그대로
};
```

### B. package.json 수정

프로젝트 이름만 변경하세요:

```json
{
  "name": "my-dev-blog",  // ← 원하는 이름으로 변경
  // ... 나머지는 그대로
}
```

## 🔧 3단계: 설치 및 실행

### 터미널 명령어

```bash
# 1. 프로젝트 디렉토리로 이동
cd your-blog

# 2. 의존성 설치 (시간이 조금 걸립니다)
npm install

# 3. 개발 서버 실행
npm start
```

브라우저가 자동으로 열리고 `http://localhost:3000`에서 사이트를 볼 수 있습니다!

## ✍️ 4단계: 첫 블로그 글 작성

### 새 블로그 포스트 만들기

`blog/` 폴더에 새 파일을 생성하세요:

**파일명 형식**: `YYYY-MM-DD-제목.md`

**예시**: `blog/2024-01-20-react-hooks.md`

```markdown
---
slug: react-hooks-guide
title: React Hooks 완벽 가이드
authors:
  name: 홍길동
  title: 프론트엔드 개발자
  url: https://github.com/your-username
  image_url: https://github.com/your-username.png
tags: [react, hooks, javascript]
---

# React Hooks 완벽 가이드

React Hooks에 대해 알아봅시다!

<!-- truncate -->

## useState란?

useState는 함수형 컴포넌트에서 state를 관리할 수 있게 해주는 Hook입니다.

```javascript
const [count, setCount] = useState(0);
```

더 많은 내용...
```

저장하면 즉시 사이트에 반영됩니다!

## 📚 5단계: 문서 작성

### 새 문서 만들기

`docs/` 폴더에 새 파일을 생성하세요:

**예시**: `docs/guides/react-best-practices.md`

```markdown
---
sidebar_position: 1
---

# React 모범 사례

React 개발 시 지켜야 할 모범 사례들을 알아봅시다.

## 1. 컴포넌트 분리

컴포넌트는 작고 재사용 가능하게 만드세요.

:::tip
하나의 컴포넌트는 하나의 역할만 해야 합니다!
:::

## 2. Props 검증

PropTypes나 TypeScript를 사용하여 props를 검증하세요.

```typescript
interface ButtonProps {
  label: string;
  onClick: () => void;
}
```
```

## 🎨 6단계: 디자인 커스터마이징

### 색상 변경

`src/css/custom.css` 파일을 열고 원하는 색상으로 변경하세요:

```css
:root {
  --ifm-color-primary: #2e8555;  /* ← 이 값을 변경 */
  /* 다른 색상 예시:
     파란색: #2563eb
     보라색: #7c3aed
     빨간색: #dc2626
  */
}
```

### 로고 추가

1. 로고 이미지를 `static/img/logo.svg`에 저장
2. `docusaurus.config.js`에서 자동으로 적용됨

## 🌐 7단계: GitHub에 배포

### A. GitHub 저장소 생성

1. [GitHub](https://github.com)에서 새 저장소 생성
2. 저장소 이름: `your-repo-name` (예: `dev-blog`)

### B. 코드 푸시

```bash
# Git 초기화
git init
git add .
git commit -m "Initial commit"

# GitHub 연결
git remote add origin https://github.com/your-username/your-repo-name.git
git branch -M main
git push -u origin main
```

### C. GitHub Pages 설정

1. GitHub 저장소 → **Settings** 탭
2. 왼쪽 메뉴에서 **Pages** 클릭
3. Source를 **GitHub Actions**로 선택
4. 자동으로 배포됩니다! (약 2-3분 소요)

✅ 완료! `https://your-username.github.io/your-repo-name`에서 확인하세요!

## 🔄 8단계: 업데이트하기

### 콘텐츠 업데이트 방법

```bash
# 1. 파일 수정 (블로그 글 작성, 문서 추가 등)

# 2. Git에 커밋
git add .
git commit -m "Add new blog post"

# 3. GitHub에 푸시
git push

# 자동으로 배포됩니다!
```

## 🛠️ 유용한 명령어

```bash
# 개발 서버 실행
npm start

# 프로덕션 빌드 (배포 전 테스트)
npm run build

# 빌드된 사이트 미리보기
npm run serve

# llms.txt 생성
npm run generate:llms

# 캐시 삭제
npm run clear
```

## ❓ 자주 묻는 질문

### Q: 포트 3000이 이미 사용 중이에요

```bash
npm start -- --port 3001
```

### Q: 변경사항이 반영되지 않아요

```bash
npm run clear
npm start
```

### Q: 이미지가 안 보여요

이미지는 다음 위치에 저장하세요:
- 블로그: `blog/이미지.png`
- 문서: `static/img/이미지.png`

사용법:
```markdown
![설명](./이미지.png)           # 같은 폴더
![설명](/img/이미지.png)        # static 폴더
```

### Q: 사이드바 순서를 바꾸고 싶어요

`sidebars.js` 파일을 수정하거나, 각 문서 파일의 `sidebar_position`을 변경하세요:

```markdown
---
sidebar_position: 1  # 숫자가 작을수록 위에 표시됨
---
```

## 🎯 다음 단계

축하합니다! 이제 다음을 시도해보세요:

- [ ] 첫 블로그 포스트 작성
- [ ] 문서 추가
- [ ] 색상 테마 변경
- [ ] GitHub Pages에 배포
- [ ] Algolia 검색 추가 (선택)
- [ ] Google Analytics 설정 (선택)

## 📖 더 알아보기

- [README.md](./README.md) - 상세 가이드
- [Docusaurus 문서](https://docusaurus.io/) - 공식 문서
- [Markdown 가이드](https://www.markdownguide.org/) - 마크다운 문법

## 💬 도움이 필요하신가요?

- [GitHub Issues](https://github.com/facebook/docusaurus/issues)
- [Discord 커뮤니티](https://discord.gg/docusaurus)

---

**Happy Coding! 🚀**
