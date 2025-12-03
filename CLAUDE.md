# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

이 프로젝트는 **Docusaurus 3.0 기반 개발 블로그 및 기술 학습 문서 사이트**입니다.

**현재 상태**: 배포 완료 (https://namyoungkim.github.io/a1rtisan/)
- GitHub Pages 자동 배포 설정 완료
- 블로그 포스트 작성 (Bhattacharyya Distance, 기하평균 등)
- 인프라 문서 작성 완료 (MCP 서버 설계 포함)
- MCP 서버 Phase 3 구현 완료 (최적화 및 안정화, 프로덕션 준비 완료)
- 수식 렌더링 지원 (remark-math + rehype-katex)

**주요 특징**:
- LLM 친화적 콘텐츠를 위한 llms.txt 자동 생성
- GitHub Actions를 통한 자동 배포
- 한국어 단일 언어 지원
- LaTeX/KaTeX 수식 렌더링 지원
- 콘텐츠와 인프라 명확히 분리된 구조
- MCP (Model Context Protocol) 서버 Phase 3 구현 완료 (프로덕션 준비 완료)
- 블로그 사이드바 커스터마이징 (주제 필터, 토글, 반응형 레이아웃)

---

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
npm run generate:tags        # blog-tags.json 생성 (주제 필터용)
npm run clear                # Docusaurus 캐시 삭제
npm run deploy               # GitHub Pages 수동 배포
```

### MCP 서버
```bash
cd mcp-server
node index.js                    # MCP 서버 실행 (일반 모드)
DEBUG=1 node index.js            # MCP 서버 실행 (디버그 모드)
```

**중요**: `npm run build` 실행 시 `prebuild` 스크립트가 `generate:llms`와 `generate:tags`를 자동 실행합니다.

---

## 프로젝트 구조 개념

이 프로젝트는 **콘텐츠**와 **인프라**를 명확히 구분합니다:

### 콘텐츠 (Content)
- `blog/` - 개인 블로그 포스트
- `docs/` - 기술 학습 문서 (React, TypeScript, 알고리즘 등)

### 인프라 (Infrastructure)
- `infrastructure/` - 인프라 설계 및 문서
- `mcp-server/` - MCP 서버 (Phase 3 완료, 프로덕션 준비 완료)
- `scripts/` - 빌드 스크립트
- `.github/` - CI/CD 워크플로우
- `src/` - Docusaurus 테마
- `static/` - 정적 파일
- 설정 파일들 (docusaurus.config.js, sidebars.js, package.json)

**참조**: `infrastructure/README.md`에 인프라 전체 개요가 있습니다.

---

## MCP 서버

이 프로젝트는 **Model Context Protocol (MCP) 서버**를 포함합니다. MCP 서버를 사용하면 Claude Desktop에서 블로그 콘텐츠와 기술 문서를 실시간으로 조회할 수 있습니다.

### 주요 기능

**Phase 1 (기본 조회)** - 4개 도구:
- **블로그 포스트 조회**: 목록 조회 및 전체 내용 읽기
- **기술 문서 조회**: docs/ 디렉토리의 문서 접근

**Phase 2 (검색 및 필터링)** - 3개 도구:
- **키워드 검색**: 제목, 태그, 본문에서 가중치 기반 검색
- **최신 콘텐츠**: 날짜순 정렬된 최신 포스트/문서 조회
- **태그 통계**: 사용 가능한 태그 목록 및 사용 빈도

**Phase 3 (최적화 및 안정화)** - 1개 도구 + 성능 개선:
- **수동 동기화**: `refresh_content` 도구로 저장소 업데이트 및 인덱스 재빌드
- **캐싱 시스템**: Git commit hash 기반 인덱스 캐싱 (Cold start < 1초)
- **에러 복구**: Git 작업 자동 재시도 (최대 3회)
- **성능 최적화**: 메모리 < 1MB, 검색 < 1초

**공통**:
- **Git 기반 동기화**: GitHub 저장소를 단일 진실 공급원으로 사용
- **로컬 실행**: 인증 없이 로컬에서 실행되는 MCP 서버
- **인덱싱 시스템**: 서버 시작 시 전체 콘텐츠 자동 인덱싱

### 빠른 시작

MCP 서버를 Claude Desktop에 연결하려면:

1. Claude Desktop 설정 파일 편집:
   - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`

2. 서버 설정 추가:
   ```json
   {
     "mcpServers": {
       "a1rtisan-blog": {
         "command": "node",
         "args": ["/Users/leo/project/a1rtisan-dev-blog/mcp-server/index.js"],
         "env": {}
       }
     }
   }
   ```

3. Claude Desktop 재시작

### MCP 개발 작업 시

MCP 서버 개발 작업을 할 때는 다음 문서를 참조하세요:

- **설계 문서**: `infrastructure/mcp/DESIGN.md` - 전체 아키텍처, 컴포넌트 설계, 최적화 전략
- **구현 로드맵**: `infrastructure/mcp/ROADMAP.md` - Phase별 구현 계획 및 체크리스트
- **사용자 가이드**: `mcp-server/README.md` - 설치, 설정, 사용 방법, 문제 해결

**현재 상태**: Phase 3 완료 (8개 도구, 프로덕션 준비 완료)
- Phase 1: `list_blog_posts`, `get_blog_post`, `list_docs`, `get_doc`
- Phase 2: `search_content`, `get_recent_posts`, `get_tags`
- Phase 3: `refresh_content` + 캐싱 (commit hash 기반) + 에러 복구

**성능 메트릭**: Cold start < 1초 (캐시), 검색 < 1초, 메모리 < 1MB

**향후 확장**: 전문 검색, 태그 기반 추천, 관련 포스트 추천 등 (선택사항)

---

## 빠른 시작

### 1. 블로그 포스트 작성
```bash
# 1. blog/ 디렉토리에 새 파일 생성
# 파일명: YYYY-MM-DD-slug.md

# 2. Frontmatter 작성
---
slug: post-slug
title: 포스트 제목
authors: namyoungkim
tags: [python, machine-learning, tutorial]
---

# 3. 내용 작성 및 미리보기 구분
<!-- truncate -->

# 4. 로컬 확인
npm start
```

**상세 가이드**: `CONTENT-GUIDE.md` 참조

### 2. 문서 작성
```bash
# 1. docs/ 디렉토리에 새 파일 생성

# 2. Frontmatter 작성 (선택사항)
---
sidebar_position: 1
---

# 3. 로컬 확인
npm start
```

**상세 가이드**: `CONTENT-GUIDE.md` 참조

### 3. 배포
```bash
# main 브랜치에 push하면 자동 배포
git add .
git commit -m "Add new content"
git push origin main

# GitHub Actions가 자동으로 빌드 및 배포 (2-3분 소요)
```

---

## 디렉토리 구조 (간략)

```
a1rtisan-dev-blog/
├── 📝 콘텐츠 (Content)
│   ├── blog/                      # 블로그 포스트
│   │   └── YYYY-MM-DD-slug.md
│   └── docs/                      # 기술 문서
│       └── tutorial/
│
├── 🏗️ 인프라 (Infrastructure)
│   ├── infrastructure/            # 인프라 문서
│   ├── scripts/                   # 빌드 스크립트
│   │   └── generate-llms.js
│   ├── .github/workflows/         # CI/CD
│   │   └── deploy.yml
│   ├── src/css/                   # 테마
│   ├── static/                    # 정적 파일
│   ├── docusaurus.config.js       # 사이트 설정
│   ├── sidebars.js                # 사이드바 구조
│   └── package.json               # 의존성
│
└── 📄 가이드 문서
    ├── README.md                  # 프로젝트 소개
    ├── CLAUDE.md                  # 이 파일 (프로젝트 개요)
    ├── CONTENT-GUIDE.md           # 콘텐츠 작성 가이드
    ├── CONFIGURATION.md           # 기술 설정 가이드
    ├── TAG-GUIDELINES.md          # 태그 작성 가이드
    ├── START-HERE.md              # 시작 가이드
    ├── QUICKSTART.md              # 5분 빠른 시작
    └── FILE-PLACEMENT-GUIDE.md    # 파일 배치 가이드
```

---

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

---

## 주요 기능

### 수식 렌더링 (LaTeX/KaTeX)
- **인라인 수식**: `$E = mc^2$`
- **블록 수식**: `$$ ... $$`
- **지원**: remark-math + rehype-katex 플러그인
- **상세 가이드**: `CONTENT-GUIDE.md` 참조

### 태그 작성 규칙
- 모두 소문자: `python`, `machine-learning`
- 하이픈으로 단어 연결: `data-science`
- 약어 지양: `machine-learning` (O), `ml` (X)
- **상세 가이드**: `TAG-GUIDELINES.md` 참조

### llms.txt 자동 생성
- docs/와 blog/를 스캔하여 LLM 친화적 목록 생성
- 빌드 시 자동 실행 (prebuild 스크립트)
- **상세 가이드**: `CONFIGURATION.md` 참조

---

## 개발 참고사항

### 기술 스택
- **Node.js**: 20+ 필수 (Docusaurus 3.x 요구사항)
- **Docusaurus**: 3.0 (classic preset)
- **코드 하이라이팅**: Prism (GitHub/Dracula 테마)
- **수식 렌더링**: remark-math + rehype-katex
- **배포**: GitHub Pages + GitHub Actions

### 테스트
- 빌드 성공 여부가 주요 검증 방법: `npm run build`

### 다크 모드
- 사용자 시스템 설정 자동 반영
- 수동 토글 가능

### 성능
- 정적 사이트 생성 (SSG)
- 이미지 최적화 플러그인 활성화
- 프로덕션 빌드 시 코드 스플리팅 자동 적용

---

## 📚 참고 문서

### 콘텐츠 작성
- **`CONTENT-GUIDE.md`** - 블로그 포스트, 문서, 이미지, 수식, 태그 작성 가이드
- **`TAG-GUIDELINES.md`** - 태그 작성 상세 가이드 (카테고리별 추천 태그 포함)

### 기술 설정
- **`CONFIGURATION.md`** - docusaurus.config.js, sidebars.js, deploy.yml 등 상세 설명
- **`THEME-CUSTOMIZATION.md`** - 블로그 UI 커스터마이징 가이드 (사이드바, 레이아웃)

### 시작 가이드
- **`README.md`** - 프로젝트 소개 및 설치 가이드
- **`START-HERE.md`** - 전체 패키지 개요 및 체크리스트
- **`QUICKSTART.md`** - 5분 빠른 시작
- **`FILE-PLACEMENT-GUIDE.md`** - 파일 배치 상세 가이드

### 인프라
- **`infrastructure/README.md`** - 인프라 전체 개요
- **`infrastructure/mcp/DESIGN.md`** - MCP 서버 아키텍처 설계
- **`infrastructure/mcp/ROADMAP.md`** - MCP 서버 구현 로드맵
