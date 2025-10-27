---
sidebar_position: 1
---

# 🚀 시작하기

이 튜토리얼에서는 프로젝트를 처음부터 설정하고 실행하는 방법을 배웁니다.

## 사전 요구사항

시작하기 전에 다음 항목들이 설치되어 있어야 합니다:

- [Node.js](https://nodejs.org/) (v18 이상)
- [npm](https://www.npmjs.com/) 또는 [yarn](https://yarnpkg.com/)
- 코드 에디터 (VS Code 권장)

## 5분 안에 시작하기

### 1단계: 프로젝트 생성

터미널을 열고 다음 명령어를 실행하세요:

```bash
npx create-my-app my-first-project
cd my-first-project
```

### 2단계: 개발 서버 실행

```bash
npm start
```

브라우저가 자동으로 열리고 `http://localhost:3000`에서 앱을 확인할 수 있습니다.

### 3단계: 코드 수정해보기

`src/App.js` 파일을 열고 내용을 수정해보세요. 저장하면 즉시 브라우저에 반영됩니다!

```jsx title="src/App.js"
function App() {
  return (
    <div>
      <h1>안녕하세요! 👋</h1>
      <p>첫 번째 앱을 만들었습니다!</p>
    </div>
  );
}

export default App;
```

## 프로젝트 구조

생성된 프로젝트는 다음과 같은 구조를 가집니다:

```
my-first-project/
├── node_modules/
├── public/
│   ├── index.html
│   └── favicon.ico
├── src/
│   ├── App.js
│   ├── App.css
│   └── index.js
├── package.json
└── README.md
```

### 주요 파일 설명

- `public/index.html` - HTML 템플릿
- `src/index.js` - 진입점 파일
- `src/App.js` - 메인 컴포넌트
- `package.json` - 프로젝트 설정 및 의존성

## 다음 단계

축하합니다! 🎉 첫 프로젝트를 성공적으로 실행했습니다.

이제 다음 단계로 넘어가봅시다:

- [설치 가이드](/docs/tutorial/installation) - 더 자세한 설치 옵션
- [첫 프로젝트 만들기](/docs/tutorial/first-project) - 실전 프로젝트 구축

## 문제가 발생했나요?

[문제 해결 가이드](/docs/guides/troubleshooting)를 확인하거나 [GitHub Issues](https://github.com/your-username/your-repo/issues)에 질문을 남겨주세요.
