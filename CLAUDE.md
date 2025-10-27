# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

이 프로젝트는 **Docusaurus 3.0 기반 개발 블로그 및 기술 학습 문서 사이트**입니다.

**현재 상태**: 배포 완료 (https://namyoungkim.github.io/a1rtisan/)
- GitHub Pages 자동 배포 설정 완료
- 예시 블로그 포스트 2개 작성
- 인프라 문서 작성 완료 (MCP 서버 설계 포함)

**주요 특징**:
- LLM 친화적 콘텐츠를 위한 llms.txt 자동 생성
- GitHub Actions를 통한 자동 배포
- 한국어 기본 설정, 영어 i18n 지원
- 콘텐츠와 인프라 명확히 분리된 구조
- MCP (Model Context Protocol) 서버 설계 완료 (구현 예정)

## 주요 명령어

### 개발
```bash
npm start                    # 개발 서버 실행 (localhost:3000)
npm start -- --port 3001     # 다른 포트로 실행
```

### 빌드 및 배포
```bash
npm run build                # 프로덕션 빌드 (./build/ 디렉토리 생성)
npm run serve                # 빌드된 사이트 로컬 미리보기
npm run generate:llms        # llms.txt 수동 생성
npm run clear                # Docusaurus 캐시 삭제
npm run deploy               # GitHub Pages 수동 배포
```

**중요**: `npm run build` 실행 시 `prebuild` 스크립트가 자동으로 `generate:llms`를 먼저 실행합니다.

## 프로젝트 구조 개념

이 프로젝트는 **콘텐츠**와 **인프라**를 명확히 구분합니다:

### 콘텐츠 (Content)
- `blog/` - 개인 블로그 포스트
- `docs/` - 기술 학습 문서 (React, TypeScript, 알고리즘 등)

### 인프라 (Infrastructure)
- `infrastructure/` - 인프라 설계 및 문서
- `mcp-server/` - MCP 서버 (추후 구현)
- `scripts/` - 빌드 스크립트
- `.github/` - CI/CD 워크플로우
- `src/` - Docusaurus 테마
- `static/` - 정적 파일
- 설정 파일들 (docusaurus.config.js, sidebars.js, package.json)

**참조**: `infrastructure/README.md`에 인프라 전체 개요가 있습니다.

## 프로젝트 아키텍처

### 디렉토리 구조

```
a1rtisan-dev-blog/
├── 📝 콘텐츠 (Content)
│   ├── blog/                      # 개인 블로그 포스트
│   │   ├── 2025-10-27-welcome.md
│   │   ├── 2025-10-27-react-performance.md
│   │   └── authors.yml            # 블로그 저자 정보
│   └── docs/                      # 기술 학습 문서
│       ├── intro.md
│       └── tutorial/
│           └── getting-started.md
│
├── 🏗️ 인프라 (Infrastructure)
│   ├── infrastructure/            # 인프라 문서
│   │   ├── README.md              # 인프라 개요
│   │   └── mcp/                   # MCP 서버 설계
│   │       ├── DESIGN.md          # 아키텍처 설계
│   │       └── ROADMAP.md         # 구현 로드맵
│   ├── mcp-server/                # MCP 서버 (추후 구현)
│   ├── scripts/
│   │   └── generate-llms.js       # llms.txt 생성 스크립트
│   ├── .github/
│   │   └── workflows/
│   │       └── deploy.yml         # GitHub Actions CI/CD
│   ├── src/
│   │   └── css/
│   │       └── custom.css         # 테마 커스터마이징
│   ├── static/
│   │   ├── img/                   # 이미지
│   │   └── llms.txt              # 자동 생성됨
│   ├── docusaurus.config.js       # 사이트 설정
│   ├── sidebars.js                # 사이드바 구조
│   └── package.json               # 의존성 및 스크립트
│
└── 📄 문서
    ├── README.md                  # 프로젝트 소개
    ├── CLAUDE.md                  # 이 파일
    ├── START-HERE.md              # 시작 가이드
    ├── QUICKSTART.md              # 빠른 시작
    └── FILE-PLACEMENT-GUIDE.md    # 파일 배치 가이드
```

### 핵심 설정 파일

#### docusaurus.config.js
메인 설정 파일로 다음을 포함합니다:
- **사이트 메타데이터**: title, tagline, url, favicon
- **배포 설정**: organizationName, projectName (GitHub Pages용)
- **i18n 설정**: 한국어(기본), 영어 지원
- **프리셋 설정**: docs, blog, theme (classic preset)
- **플러그인**: @docusaurus/plugin-ideal-image (이미지 최적화)
- **테마 설정**: navbar, footer, prism (코드 하이라이팅), colorMode (다크모드)
- **선택적 통합**: Algolia 검색, Google Analytics (플레이스홀더 상태)

**현재 설정**:
- `url`: `https://namyoungkim.github.io`
- `baseUrl`: `/a1rtisan/`
- `organizationName`: `namyoungkim`
- `projectName`: `a1rtisan`
- `onBrokenLinks`: `'warn'` (템플릿 링크 허용)
- GitHub Pages 배포 완료

#### sidebars.js
문서의 사이드바 구조를 정의합니다:
- **tutorialSidebar**: 현재 intro.md와 tutorial/getting-started.md만 포함
- docs/ 디렉토리는 기술 학습 문서용으로 준비됨 (React, TypeScript, 알고리즘 등)
- 필요시 `{type: 'autogenerated', dirName: 'folder'}` 방식으로 자동 생성 가능

#### generate-llms.js
docs/와 blog/를 스캔하여 LLM 친화적인 llms.txt 파일을 생성합니다:

**동작 방식**:
1. `docs/`와 `blog/` 디렉토리의 .md/.mdx 파일 재귀 스캔
2. frontmatter의 `title:` 또는 첫 H1(`# Title`)에서 제목 추출
3. 파일 경로를 URL로 변환:
   - 문서: `/docs/path/to/file`
   - 블로그: `/blog/YYYY/MM/DD/slug` (파일명의 날짜 부분 파싱)
4. `static/llms.txt`에 출력 (Documentation, Blog Posts 섹션)

**제한사항**:
- 문서: 상위 20개 (intro.md 우선 표시)
- 블로그: 최신 10개 (파일명 기준 역순 정렬)

**자동 실행**: `package.json`의 `prebuild` 스크립트로 빌드 전 자동 실행

#### deploy.yml
GitHub Actions 자동 배포 워크플로우:

**트리거 조건**:
- main 브랜치에 push
- docs/, blog/, src/, static/, 또는 설정 파일 변경 시
- 수동 실행 가능 (workflow_dispatch)

**빌드 단계**:
1. 저장소 체크아웃 (전체 git history)
2. Node.js 20 설치 및 npm 캐시
3. `npm ci` - 의존성 설치
4. `npm run generate:llms` - llms.txt 생성
5. `npm run build` - 프로덕션 빌드
6. GitHub Pages에 배포

**요구사항**:
- Node.js 20+ (Docusaurus 3.x 요구사항)
- GitHub 저장소 Settings → Pages에서 Source를 "GitHub Actions"로 설정
- 배포 완료: https://namyoungkim.github.io/a1rtisan/

## 콘텐츠 작성 가이드

### 블로그 포스트
- **파일명 형식**: `YYYY-MM-DD-slug.md` (날짜 접두사 **필수**)
- **위치**: `blog/` 디렉토리
- **frontmatter 필수 항목**: slug, title, authors, tags
- **미리보기 구분**: `<!-- truncate -->` 주석으로 미리보기와 본문 구분

### 문서
- **위치**: `docs/` 디렉토리 및 하위 폴더
- **순서 제어**: frontmatter의 `sidebar_position` (숫자가 작을수록 위에 표시)
- **경고창**: `:::tip`, `:::warning`, `:::info` 사용 가능
- **내부 링크**: 상대 경로 사용 (`[텍스트](./other-doc.md)`)

### 이미지
- **전역 이미지**: `static/img/`에 저장, 참조: `![설명](/img/filename.png)`
- **로컬 이미지**: 블로그/문서와 같은 폴더에 저장, 참조: `![설명](./image.png)`

## 일반적인 개발 워크플로우

```bash
# 1. 새 콘텐츠 작성 (블로그 또는 문서)
# 2. 로컬 확인
npm start

# 3. 변경사항 커밋 및 푸시
git add .
git commit -m "Add new content"
git push origin main

# 4. GitHub Actions가 자동으로 빌드 및 배포 (2-3분 소요)
```

## llms.txt 생성 메커니즘

### 제목 추출 순서
1. frontmatter의 `title:` 필드
2. 첫 번째 H1 헤딩 (`# Title`)
3. 파일명 (확장자 제거, `-`와 `_`를 공백으로 치환)

### URL 변환 규칙
**문서**:
- `docs/intro.md` → `/docs/intro`
- `docs/tutorial/getting-started.md` → `/docs/tutorial/getting-started`

**블로그**:
- `blog/2024-01-20-my-post.md` → `/blog/2024/01/20/my-post`
- 정규식으로 날짜 파싱: `^(\d{4})-(\d{2})-(\d{2})-(.+)$`

### 출력 형식
```
# 개발 블로그

> 개발 경험, 튜토리얼, API 문서를 공유하는 기술 블로그

## 📚 Documentation

- /docs/intro: 시작하기
- /docs/tutorial/getting-started: 튜토리얼

## ✍️ Blog Posts

- /blog/2024/01/15/react-performance: React 성능 최적화
- /blog/2024/01/01/welcome: 환영합니다
```

## 개발 참고사항

### 기술 스택
- **Node.js**: 20+ 필수 (Docusaurus 3.x 요구사항)
- **Docusaurus**: 3.0 (classic preset)
- **코드 하이라이팅**: Prism (라이트: GitHub 테마, 다크: Dracula 테마)
- **지원 언어**: bash, json, typescript, javascript, jsx, tsx
- **배포**: GitHub Pages + GitHub Actions

### 테스트
- 이 프로젝트에는 테스트 스크립트가 없습니다 (정적 사이트 생성기로 정상)
- 빌드 성공 여부가 주요 검증 방법: `npm run build`

### 다크 모드
- 사용자 시스템 설정 자동 반영 (`respectPrefersColorScheme: true`)
- 수동 토글 가능
- `src/css/custom.css`에서 색상 커스터마이징 가능

### 성능
- 정적 사이트 생성 (SSG)
- 이미지 최적화 플러그인 활성화 (ideal-image)
- 프로덕션 빌드 시 코드 스플리팅 자동 적용

## 참고 문서

- `START-HERE.md` - 전체 패키지 개요 및 체크리스트
- `FILE-PLACEMENT-GUIDE.md` - 파일 배치 상세 가이드
- `QUICKSTART.md` - 5분 빠른 시작 가이드
- `README.md` - 완벽한 프로젝트 가이드 (설치, 사용법, 배포, 문제 해결)
