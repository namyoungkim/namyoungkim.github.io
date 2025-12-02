# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

이 프로젝트는 **Docusaurus 3.0 기반 개발 블로그 및 기술 학습 문서 사이트**입니다.

**현재 상태**: 배포 완료 (https://namyoungkim.github.io/a1rtisan/)
- GitHub Pages 자동 배포 설정 완료
- 블로그 포스트 작성 (Bhattacharyya Distance, 기하평균 등)
- 인프라 문서 작성 완료 (MCP 서버 설계 포함)
- 수식 렌더링 지원 (remark-math + rehype-katex)

**주요 특징**:
- LLM 친화적 콘텐츠를 위한 llms.txt 자동 생성
- GitHub Actions를 통한 자동 배포
- 한국어 단일 언어 지원
- LaTeX/KaTeX 수식 렌더링 지원
- 콘텐츠와 인프라 명확히 분리된 구조
- MCP (Model Context Protocol) 서버 설계 완료 (구현 예정)

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
npm run clear                # Docusaurus 캐시 삭제
npm run deploy               # GitHub Pages 수동 배포
```

**중요**: `npm run build` 실행 시 `prebuild` 스크립트가 자동으로 `generate:llms`를 먼저 실행합니다.

---

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

### 시작 가이드
- **`README.md`** - 프로젝트 소개 및 설치 가이드
- **`START-HERE.md`** - 전체 패키지 개요 및 체크리스트
- **`QUICKSTART.md`** - 5분 빠른 시작
- **`FILE-PLACEMENT-GUIDE.md`** - 파일 배치 상세 가이드

### 인프라
- **`infrastructure/README.md`** - 인프라 전체 개요
- **`infrastructure/mcp/DESIGN.md`** - MCP 서버 아키텍처 설계
- **`infrastructure/mcp/ROADMAP.md`** - MCP 서버 구현 로드맵
