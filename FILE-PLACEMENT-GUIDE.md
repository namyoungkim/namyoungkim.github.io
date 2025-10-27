# 📂 파일 배치 가이드

다운로드한 모든 파일을 올바른 위치에 배치하는 방법입니다.

## 🗂️ 전체 프로젝트 구조

```
my-dev-blog/                          # 프로젝트 루트 디렉토리
│
├── .github/                          # GitHub 설정 (생성)
│   └── workflows/                    # GitHub Actions
│       └── deploy.yml               # ← deploy.yml 파일
│
├── blog/                            # 블로그 포스트 (생성)
│   ├── 2024-01-01-welcome.md       # ← blog-welcome.md 파일
│   └── 2024-01-15-react-performance.md  # ← blog-react-performance.md 파일
│
├── docs/                            # 문서 (생성)
│   ├── intro.md                     # ← docs-intro.md 파일
│   └── tutorial/                    # 튜토리얼 폴더 (생성)
│       └── getting-started.md       # ← tutorial-getting-started.md 파일
│
├── scripts/                         # 스크립트 (생성)
│   └── generate-llms.js            # ← generate-llms.js 파일
│
├── src/                             # 소스 코드 (생성)
│   ├── components/                  # React 컴포넌트 (비워둠)
│   ├── css/                         # 스타일 (생성)
│   │   └── custom.css              # ← custom.css 파일
│   └── pages/                       # 커스텀 페이지 (비워둠)
│
├── static/                          # 정적 파일 (생성)
│   ├── img/                         # 이미지 폴더 (생성, 비워둠)
│   │   ├── logo.svg                # 로고 파일 (나중에 추가)
│   │   └── favicon.ico             # 파비콘 (나중에 추가)
│   └── llms.txt                    # 자동 생성됨 (빌드 시)
│
├── docusaurus.config.js            # ← docusaurus.config.js 파일
├── sidebars.js                     # ← sidebars.js 파일
├── package.json                    # ← package.json 파일
├── README.md                       # ← README.md 파일
├── QUICKSTART.md                   # ← QUICKSTART.md 파일 (이 가이드)
│
└── .gitignore                      # Git 무시 파일 (생성 필요)
```

## 📋 파일별 배치 위치

### 필수 설정 파일 (루트 디렉토리)

| 다운로드 파일 | 배치 위치 | 설명 |
|--------------|----------|------|
| `docusaurus.config.js` | `./docusaurus.config.js` | 메인 설정 |
| `sidebars.js` | `./sidebars.js` | 사이드바 설정 |
| `package.json` | `./package.json` | NPM 패키지 |
| `README.md` | `./README.md` | 프로젝트 설명 |
| `QUICKSTART.md` | `./QUICKSTART.md` | 빠른 시작 가이드 |

### 블로그 파일 (blog/ 폴더)

| 다운로드 파일 | 배치 위치 | 파일명 변경 |
|--------------|----------|------------|
| `blog-welcome.md` | `./blog/2024-01-01-welcome.md` | 날짜 형식 필수 |
| `blog-react-performance.md` | `./blog/2024-01-15-react-performance.md` | 날짜 형식 필수 |

### 문서 파일 (docs/ 폴더)

| 다운로드 파일 | 배치 위치 |
|--------------|----------|
| `docs-intro.md` | `./docs/intro.md` |
| `tutorial-getting-started.md` | `./docs/tutorial/getting-started.md` |

### 스크립트 (scripts/ 폴더)

| 다운로드 파일 | 배치 위치 |
|--------------|----------|
| `generate-llms.js` | `./scripts/generate-llms.js` |

### 스타일 (src/css/ 폴더)

| 다운로드 파일 | 배치 위치 |
|--------------|----------|
| `custom.css` | `./src/css/custom.css` |

### GitHub Actions (.github/workflows/ 폴더)

| 다운로드 파일 | 배치 위치 |
|--------------|----------|
| `deploy.yml` | `./.github/workflows/deploy.yml` |

## 🔨 명령어로 디렉토리 생성

### Windows (PowerShell)

```powershell
# 프로젝트 루트에서 실행
New-Item -ItemType Directory -Path .github\workflows, blog, docs\tutorial, scripts, src\css, src\components, src\pages, static\img
```

### macOS/Linux (Terminal)

```bash
# 프로젝트 루트에서 실행
mkdir -p .github/workflows blog docs/tutorial scripts src/css src/components src/pages static/img
```

## 📝 추가 생성 필요한 파일

### .gitignore 파일

루트 디렉토리에 `.gitignore` 파일 생성:

```gitignore
# Dependencies
/node_modules
/.pnp
.pnp.js

# Production
/build
.docusaurus
.cache-loader

# Misc
.DS_Store
.env.local
.env.development.local
.env.test.local
.env.production.local

npm-debug.log*
yarn-debug.log*
yarn-error.log*

# IDE
.idea/
.vscode/
*.swp
*.swo
*~
```

## ✅ 설치 체크리스트

파일 배치 후 다음을 확인하세요:

### 1단계: 디렉토리 구조 확인
```bash
# 다음 명령어로 구조 확인
tree -L 2
# 또는 Windows에서
dir /s /b
```

### 2단계: 필수 파일 확인
- [ ] `docusaurus.config.js` 있음
- [ ] `package.json` 있음
- [ ] `sidebars.js` 있음
- [ ] `blog/` 폴더에 최소 1개 포스트
- [ ] `docs/intro.md` 있음
- [ ] `src/css/custom.css` 있음
- [ ] `.github/workflows/deploy.yml` 있음

### 3단계: 의존성 설치 및 실행
```bash
npm install
npm start
```

## 🚨 흔한 오류 해결

### "Cannot find module" 오류

**원인**: 파일이 잘못된 위치에 있음

**해결**:
```bash
# 프로젝트 구조 다시 확인
ls -la
```

### "Unexpected token" 오류

**원인**: 파일 인코딩 문제

**해결**:
- 모든 파일을 UTF-8 인코딩으로 저장
- Windows 메모장 대신 VS Code 사용

### 빌드 오류

**원인**: 설정 파일 문법 오류

**해결**:
```bash
# 캐시 삭제
npm run clear
rm -rf node_modules
npm install
```

## 📱 VS Code에서 파일 이동

VS Code를 사용하면 더 쉽게 파일을 배치할 수 있습니다:

1. **폴더 열기**: VS Code에서 프로젝트 폴더 열기
2. **탐색기**: 왼쪽 사이드바의 파일 탐색기 사용
3. **드래그 앤 드롭**: 파일을 올바른 폴더로 드래그
4. **새 폴더**: 우클릭 → "New Folder"

## 🎯 완료 확인

모든 파일 배치가 완료되면:

```bash
# 1. 의존성 설치
npm install

# 2. 개발 서버 실행
npm start

# 3. 브라우저에서 확인
# http://localhost:3000
```

다음이 정상 작동하면 성공입니다:
- ✅ 홈페이지 로딩
- ✅ 문서 메뉴 작동
- ✅ 블로그 메뉴 작동
- ✅ 다크 모드 토글 작동
- ✅ 검색 바 표시 (Algolia 설정 전까지는 비활성)

## 📞 도움이 필요하신가요?

문제가 계속되면:

1. **QUICKSTART.md** 다시 읽기
2. **README.md**의 문제 해결 섹션 확인
3. **GitHub Issues** 확인
4. 새 Issue 생성

---

**설치 완료! 이제 [QUICKSTART.md](./QUICKSTART.md)의 3단계부터 계속하세요!** 🚀
