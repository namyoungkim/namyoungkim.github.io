# Infrastructure Documentation

> A1rtisan 개발 블로그의 인프라 설계 및 구현 문서

## 개요

이 디렉토리는 개발 블로그의 **인프라**와 관련된 모든 설계 문서, 구현 가이드, 배포 문서를 포함합니다.

**콘텐츠**(`blog/`, `docs/`)와 **인프라**(`infrastructure/`, `mcp-server/`, `scripts/`, `.github/`)를 명확히 분리하여 관리합니다.

## 디렉토리 구조

```
infrastructure/
├── README.md                      # 이 파일
├── mcp/                           # MCP 서버 관련 문서
│   ├── DESIGN.md                  # MCP 서버 설계
│   ├── ROADMAP.md                 # 구현 로드맵
│   └── API.md                     # API 스펙 (추후 작성)
├── deployment/                    # 배포 관련 문서
│   ├── github-pages.md           # GitHub Pages 배포 (추후 작성)
│   └── ci-cd.md                  # CI/CD 워크플로우 (추후 작성)
└── architecture.md               # 전체 아키텍처 (추후 작성)
```

## 주요 인프라 컴포넌트

### 1. Docusaurus 사이트

**위치**: 프로젝트 루트
**설명**: 정적 사이트 생성기로 블로그와 기술 문서를 웹사이트로 렌더링

**핵심 파일**:
- `docusaurus.config.js` - 사이트 설정
- `sidebars.js` - 문서 사이드바 구조
- `src/` - 테마 커스터마이징
- `static/` - 정적 파일

**문서**: [Docusaurus 공식 문서](https://docusaurus.io/)

### 2. llms.txt 생성기

**위치**: `scripts/generate-llms.js`
**설명**: 블로그와 문서를 스캔하여 LLM이 소비하기 쉬운 형식의 llms.txt 생성

**동작 방식**:
1. `blog/`와 `docs/` 디렉토리 스캔
2. 각 마크다운 파일에서 제목 추출 (frontmatter 또는 H1)
3. URL 매핑 및 `static/llms.txt` 생성
4. `prebuild` 스크립트로 빌드 전 자동 실행

**현재 제한**: 제목과 URL만 포함 (전체 콘텐츠는 미포함)

### 3. MCP 서버

**위치**: `mcp-server/` (추후 구현)
**설명**: Claude Desktop에서 블로그 콘텐츠를 실시간으로 조회할 수 있는 MCP (Model Context Protocol) 서버

**상세 문서**: [mcp/DESIGN.md](mcp/DESIGN.md)
**구현 계획**: [mcp/ROADMAP.md](mcp/ROADMAP.md)

**주요 기능**:
- 블로그 포스트 목록 조회
- 특정 포스트 전체 내용 조회
- 기술 문서 조회
- 키워드 검색
- Git 기반 자동 동기화

### 4. GitHub Actions

**위치**: `.github/workflows/deploy.yml`
**설명**: main 브랜치에 push 시 자동으로 빌드 및 GitHub Pages 배포

**워크플로우**:
1. Checkout 코드
2. Node.js 20 설치
3. 의존성 설치 (`npm ci`)
4. llms.txt 생성 (`npm run generate:llms`)
5. 사이트 빌드 (`npm run build`)
6. GitHub Pages 배포

**트리거 조건**:
- `docs/`, `blog/`, `src/`, `static/` 변경
- 설정 파일 변경 (`docusaurus.config.js`, `sidebars.js`, `package.json`)
- `.github/` 변경

## 프로젝트 전체 구조

```
a1rtisan-dev-blog/
├── 📝 CONTENT (공개 콘텐츠)
│   ├── blog/                      # 개인 블로그
│   └── docs/                      # 기술 학습 정리
│
├── 🏗️ INFRASTRUCTURE (인프라)
│   ├── infrastructure/            # 인프라 문서 (이 디렉토리)
│   ├── mcp-server/                # MCP 서버 (추후 구현)
│   ├── scripts/                   # 빌드 스크립트
│   ├── .github/                   # CI/CD
│   ├── src/                       # Docusaurus 테마
│   ├── static/                    # 정적 파일
│   ├── docusaurus.config.js       # 사이트 설정
│   ├── sidebars.js                # 사이드바 설정
│   ├── package.json               # 의존성
│   └── CLAUDE.md                  # Claude Code 가이드
│
└── 📄 문서
    ├── README.md                  # 프로젝트 소개
    ├── START-HERE.md              # 시작 가이드
    ├── QUICKSTART.md              # 빠른 시작
    └── FILE-PLACEMENT-GUIDE.md    # 파일 배치 가이드
```

## 기술 스택

### 사이트 생성
- **Docusaurus 3.0**: 정적 사이트 생성기
- **React 18**: UI 프레임워크
- **Node.js 20+**: 런타임 환경

### 배포
- **GitHub Pages**: 호스팅
- **GitHub Actions**: CI/CD

### MCP 서버 (계획)
- **Node.js 20+**: 런타임
- **@modelcontextprotocol/sdk**: MCP 프로토콜
- **simple-git**: Git 작업
- **gray-matter**: Frontmatter 파싱

## 개발 워크플로우

### 로컬 개발
```bash
# 의존성 설치
npm install

# 개발 서버 실행 (localhost:3000)
npm start

# 프로덕션 빌드
npm run build

# 빌드 결과 미리보기
npm run serve

# llms.txt 생성
npm run generate:llms
```

### 배포
```bash
# Git commit & push → 자동 배포
git add .
git commit -m "Update content"
git push origin main

# GitHub Actions가 자동으로 빌드 및 배포 (2-3분)
```

### MCP 서버 개발 (추후)
```bash
cd mcp-server
npm install
node index.js

# Claude Desktop 설정 후 테스트
```

## 주요 설정 파일

### docusaurus.config.js
- **url**: `https://namyoungkim.github.io`
- **baseUrl**: `/`
- **organizationName**: `namyoungkim`
- **projectName**: `namyoungkim.github.io`
- **i18n**: 한국어(기본), 영어
- **onBrokenLinks**: `'warn'` (빌드 통과 위해)

### package.json 주요 스크립트
- `start`: 개발 서버
- `build`: 프로덕션 빌드
- `generate:llms`: llms.txt 생성
- `prebuild`: 빌드 전 llms.txt 자동 생성

## 다음 단계

### 단기 (완료 예정)
- [ ] `infrastructure/deployment/` 문서 작성
- [ ] `infrastructure/architecture.md` 작성

### 중기 (MCP 서버 구현)
- [ ] Phase 1: 기본 MCP 서버 구축
- [ ] Phase 2: 검색 기능 추가
- [ ] Phase 3: 최적화 및 안정화

자세한 내용은 [mcp/ROADMAP.md](mcp/ROADMAP.md) 참조

### 장기 (고급 기능)
- [ ] AI 기반 콘텐츠 요약
- [ ] 의미론적 검색
- [ ] HTTP MCP 서버 (공개 API)

## 문제 해결

### 빌드 실패
```bash
# 캐시 삭제 및 재설치
npm run clear
rm -rf node_modules package-lock.json
npm install
npm run build
```

### 배포 실패
1. GitHub Actions 로그 확인: `https://github.com/namyoungkim/namyoungkim.github.io/actions`
2. Node.js 버전 확인 (20+ 필요)
3. 설정 파일 검증

### MCP 서버 연결 안 됨 (추후)
1. Claude Desktop 재시작
2. `config.json` 경로 확인
3. 서버 로그 확인

## 참고 자료

### Docusaurus
- [공식 문서](https://docusaurus.io/)
- [GitHub](https://github.com/facebook/docusaurus)

### MCP
- [MCP 공식 문서](https://modelcontextprotocol.io/)
- [MCP SDK](https://github.com/anthropics/anthropic-sdk-typescript)
- [Claude Desktop](https://claude.ai/download)

### GitHub
- [GitHub Pages 문서](https://docs.github.com/en/pages)
- [GitHub Actions 문서](https://docs.github.com/en/actions)

## 기여

이 프로젝트는 개인 블로그이지만, 인프라 개선에 대한 제안은 환영합니다!

**연락처**:
- GitHub: [@namyoungkim](https://github.com/namyoungkim)
- LinkedIn: [liniar](https://linkedin.com/in/liniar)
