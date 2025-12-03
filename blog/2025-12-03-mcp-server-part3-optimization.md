---
slug: mcp-server-part3-optimization
title: "개발 블로그를 위한 MCP 서버 구축기 (3): Cold Start 1초 미만을 위한 캐싱과 에러 복구"
authors: namyoungkim
tags: [mcp, performance, caching, nodejs, tutorial]
---

# 개발 블로그를 위한 MCP 서버 구축기 (3): Cold Start 1초 미만을 위한 캐싱과 에러 복구

> Git Commit Hash 기반 캐싱으로 서버 시작 시간을 1초 미만으로 줄이고, 에러 복구 전략을 구현합니다.

## 🎯 들어가며

[1편](/blog/mcp-server-part1-design)에서 Git 기반 아키텍처를, [2편](/blog/mcp-server-part2-search)에서 역인덱스 검색 기능을 구현했습니다. 하지만 실제로 사용해보면 한 가지 불편함이 있습니다.

**"서버 시작이 너무 느려요"**

매번 Claude Desktop을 열 때마다 Git clone과 인덱스 빌드가 발생합니다. 콘텐츠가 늘어날수록 점점 더 오래 걸리죠.

이번 편에서는 **캐싱 시스템**을 구현해서 Cold Start를 1초 미만으로 줄이고, **에러 복구 전략**으로 안정성을 높입니다.

<!-- truncate -->

---

## 📚 문제 분석

### 현재 시작 프로세스

```
서버 시작
    ↓
Git Clone (첫 실행) 또는 Git Pull (5-10초)
    ↓
인덱스 빌드: 모든 파일 파싱 (1-3초)
    ↓
서비스 준비 완료
```

### 문제점

1. **매번 인덱스 재빌드**: 콘텐츠가 변경되지 않아도 전체 인덱스를 다시 빌드
2. **네트워크 의존성**: Git 작업 실패 시 서버 시작 불가
3. **느린 Cold Start**: 초기 시작에 5-15초 소요

### 목표

| 항목 | 현재 | 목표 |
|------|------|------|
| Cold Start (캐시 있음) | ~10초 | **< 1초** |
| Cold Start (캐시 없음) | ~10초 | ~5초 |
| 네트워크 실패 시 | 서버 시작 실패 | 재시도 후 복구 |

---

## 🏗️ 캐싱 전략 설계

### Git Commit Hash 기반 검증

캐시 무효화 전략에서 가장 중요한 건 **"언제 캐시를 버릴 것인가?"** 입니다.

여러 방법이 있습니다:

| 방식 | 장점 | 단점 |
|------|------|------|
| **시간 기반 (TTL)** | 구현 간단 | 변경 없어도 갱신, 변경 있어도 캐시 사용 가능 |
| **파일 수정 시간** | 정확한 감지 | 모든 파일 검사 필요, clone 시 시간 변경됨 |
| **Git Commit Hash** | 정확하고 빠름 | Git 저장소 필요 |

**Git Commit Hash**를 선택했습니다. 저장소가 업데이트될 때만 commit hash가 바뀌므로 완벽한 무효화 키가 됩니다.

### 캐시 흐름

```
서버 시작
    ↓
Git Pull (저장소 동기화)
    ↓
현재 Commit Hash 조회
    ↓
캐시 파일에서 저장된 Commit Hash 비교
    ↓
[일치] 캐시 로드 → 서비스 준비 (< 1초)
[불일치] 인덱스 재빌드 → 캐시 저장 → 서비스 준비
```

---

## 🔧 CacheManager 구현

### 캐시 파일 구조

```json
{
  "commitHash": "b07fdb6abc123...",
  "timestamp": "2025-12-03T15:30:00Z",
  "index": {
    "posts": { ... },
    "docs": { ... },
    "tags": { ... },
    "keywords": { ... }
  }
}
```

### CacheManager 클래스

```javascript title="src/cache-manager.js"
import { promises as fs } from 'fs';
import path from 'path';

export class CacheManager {
  constructor(options = {}) {
    this.cacheDir = options.cacheDir || path.join(__dirname, '..', '.mcp-cache');
    this.cacheFile = path.join(this.cacheDir, 'index.json');
  }

  // 인덱스 저장
  async saveIndex(index, commitHash) {
    try {
      await fs.mkdir(this.cacheDir, { recursive: true });

      const cacheData = {
        commitHash,
        timestamp: new Date().toISOString(),
        index,
      };

      await fs.writeFile(
        this.cacheFile,
        JSON.stringify(cacheData, null, 2),
        'utf-8'
      );
    } catch (error) {
      console.error('[CacheManager] Failed to save cache:', error);
      // 캐시 저장 실패는 치명적이지 않으므로 에러를 던지지 않음
    }
  }

  // 인덱스 로드
  async loadIndex() {
    try {
      const content = await fs.readFile(this.cacheFile, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      if (error.code === 'ENOENT') {
        return null; // 캐시 없음
      }
      throw error;
    }
  }

  // 캐시 유효성 확인
  async isValid(currentCommitHash) {
    const cacheData = await this.loadIndex();
    if (!cacheData) return false;

    return cacheData.commitHash === currentCommitHash;
  }
}
```

핵심 포인트:
- **캐시 저장 실패 허용**: 캐시 저장이 실패해도 서버는 정상 동작
- **Commit Hash 비교**: 단 한 번의 문자열 비교로 유효성 검증
- **JSON 직렬화**: Map 객체는 JSON으로 직접 변환 불가, 별도 처리 필요

---

## 📊 인덱스 직렬화와 복원

JavaScript의 `Map` 객체는 `JSON.stringify`로 직접 변환할 수 없습니다:

```javascript
const map = new Map([['key', 'value']]);
JSON.stringify(map);  // "{}"  ← 빈 객체!
```

### 직렬화 (Map → Object)

```javascript title="src/search-engine.js"
exportIndex() {
  return {
    posts: Object.fromEntries(this.index.posts),
    docs: Object.fromEntries(this.index.docs),
    tags: Object.fromEntries(this.index.tags),
    keywords: Object.fromEntries(this.index.keywords),
  };
}
```

`Object.fromEntries()`로 Map을 일반 객체로 변환합니다.

### 복원 (Object → Map)

```javascript title="src/search-engine.js"
loadFromCache(cachedData) {
  if (!cachedData || !cachedData.index) {
    throw new Error('Invalid cache data');
  }

  const { index } = cachedData;

  // Object를 Map으로 변환
  this.index.posts = new Map(Object.entries(index.posts));
  this.index.docs = new Map(Object.entries(index.docs));
  this.index.tags = new Map(Object.entries(index.tags));
  this.index.keywords = new Map(Object.entries(index.keywords));
}
```

`Object.entries()`와 `new Map()`으로 다시 Map 객체로 복원합니다.

---

## 🔄 서버 초기화 흐름

이제 CacheManager를 서버 초기화에 통합합니다:

```javascript title="index.js" {11-15,17-22}
async function initialize() {
  // 1. Git 저장소 동기화
  await gitManager.sync();
  const commitHash = await gitManager.getCurrentCommitHash();

  // 2. 캐시 확인 및 로드
  const cached = await cacheManager.loadIndex();

  if (cached && await cacheManager.isValid(commitHash)) {
    // 캐시 유효 → 로드 (< 1초)
    searchEngine.loadFromCache(cached);
    console.error('[MCP Server] Index loaded from cache');
  } else {
    // 캐시 없음 또는 무효 → 재빌드
    console.error('[MCP Server] Building search index...');
    const repoPath = gitManager.getRepoPath();
    await searchEngine.buildIndex(repoPath);

    // 캐시 저장 (다음 시작을 위해)
    await cacheManager.saveIndex(searchEngine.exportIndex(), commitHash);
  }

  console.error(`[MCP Server] Index: ${searchEngine.getStats()}`);
}
```

---

## 🛡️ 에러 복구: Git Pull 재시도

네트워크 작업은 언제든 실패할 수 있습니다. 일시적인 네트워크 문제로 서버 시작이 실패하면 안 됩니다.

### 재시도 로직 구현

```javascript title="src/git-manager.js"
async pull(retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const git = simpleGit(this.cacheDir);
      await git.pull('origin', this.branch);
      return; // 성공
    } catch (error) {
      if (i === retries - 1) {
        // 마지막 시도 실패
        throw new Error(
          `Failed to pull repository after ${retries} attempts: ${error.message}`
        );
      }

      console.error(`[GitManager] Pull failed (attempt ${i + 1}/${retries}), retrying...`);

      // 지수 백오프: 1초, 2초, 3초...
      await new Promise(resolve =>
        setTimeout(resolve, 1000 * (i + 1))
      );
    }
  }
}
```

### 지수 백오프(Exponential Backoff)

재시도 간격을 점점 늘립니다:

| 시도 | 대기 시간 |
|------|----------|
| 1회 실패 | 1초 |
| 2회 실패 | 2초 |
| 3회 실패 | 에러 발생 |

네트워크가 일시적으로 불안정할 때 복구 확률을 높입니다.

---

## 🔄 수동 동기화: refresh_content

사용자가 새 콘텐츠를 발행한 후 즉시 반영하고 싶을 때를 위한 도구입니다.

```javascript title="src/tools/refresh-content.js"
export const refreshContentTool = {
  name: 'refresh_content',
  description: 'Manually sync repository and rebuild search index.',
  inputSchema: {
    type: 'object',
    properties: {
      force: {
        type: 'boolean',
        description: 'Force rebuild even if no changes (default: false)',
      },
    },
  },
};

export async function handleRefreshContent(args, gitManager, searchEngine, cacheManager) {
  const { force = false } = args;

  // 현재 commit hash 저장
  const oldCommitHash = await gitManager.getCurrentCommitHash();

  // Git pull 실행
  await gitManager.pull();

  // 새 commit hash 확인
  const newCommitHash = await gitManager.getCurrentCommitHash();
  const hasChanges = oldCommitHash !== newCommitHash;

  // 변경이 있거나 force=true인 경우 인덱스 재빌드
  if (hasChanges || force) {
    const repoPath = gitManager.getRepoPath();
    await searchEngine.buildIndex(repoPath);
    await cacheManager.saveIndex(searchEngine.exportIndex(), newCommitHash);

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          success: true,
          updated: true,
          oldCommit: oldCommitHash.substring(0, 7),
          newCommit: newCommitHash.substring(0, 7),
          hasChanges,
          message: 'Index rebuilt successfully',
        }, null, 2),
      }],
    };
  }

  return {
    content: [{
      type: 'text',
      text: JSON.stringify({
        success: true,
        updated: false,
        message: 'Already up to date. Use force=true to rebuild anyway.',
      }, null, 2),
    }],
  };
}
```

### 사용 예시

**사용자**: "블로그에 새 글을 올렸는데 반영해줘"

**Claude**: `refresh_content` 호출

```json
{
  "success": true,
  "updated": true,
  "oldCommit": "abc1234",
  "newCommit": "def5678",
  "hasChanges": true,
  "message": "Index rebuilt successfully"
}
```

---

## 📊 성능 측정 결과

### 실제 측정 (5개 포스트, 3개 문서 기준)

| 시나리오 | 시간 |
|----------|------|
| **첫 실행 (Clone + Build)** | ~8초 |
| **재시작 (캐시 없음, Pull + Build)** | ~3초 |
| **재시작 (캐시 유효)** | **< 1초** |
| **검색 쿼리** | < 10ms |

### 캐시 파일 크기

```
$ ls -lh .mcp-cache/index.json
-rw-r--r--  1 user  staff  335K Dec  3 15:30 index.json
```

약 335KB로 메모리 부담이 거의 없습니다.

---

## 📊 Phase 3 결과

### 구현된 도구 (1개 추가)

| 도구 | 설명 |
|------|------|
| `refresh_content` | 수동 저장소 동기화 및 인덱스 재빌드 |

### 성능 개선

| 항목 | 개선 전 | 개선 후 |
|------|---------|---------|
| Cold Start (캐시) | ~10초 | **< 1초** |
| 메모리 사용 | - | ~335KB |
| 네트워크 에러 | 서버 실패 | 자동 재시도 |

### 최종 MCP 도구 목록 (8개)

| Phase | 도구 |
|-------|------|
| **Phase 1** | `list_blog_posts`, `get_blog_post`, `list_docs`, `get_doc` |
| **Phase 2** | `search_content`, `get_recent_posts`, `get_tags` |
| **Phase 3** | `refresh_content` |

---

## 💡 개발 회고

### 잘된 점

1. **Git 기반 설계**: 인증 없이 사용 가능하고, commit hash로 캐시 무효화가 깔끔
2. **단순한 검색**: 복잡한 알고리즘 없이 가중치 기반 점수만으로 충분한 품질
3. **점진적 구현**: Phase별로 나눠서 각 단계를 확실히 완성

### 배운 점

1. **Map 직렬화**: JSON으로 직접 변환 안 되는 문제, `Object.entries/fromEntries` 활용
2. **캐시 설계**: 무효화 전략이 핵심, Commit hash가 완벽한 키
3. **에러 복구**: 재시도 로직은 선택이 아닌 필수

### 향후 개선 아이디어

- **시맨틱 검색**: 벡터 임베딩 기반 유사도 검색
- **관련 포스트 추천**: 태그와 키워드 기반 추천
- **통계 대시보드**: 자주 조회되는 콘텐츠 분석

---

## 🔗 전체 소스 코드

이 시리즈에서 구현한 MCP 서버의 전체 소스 코드는 GitHub에서 확인할 수 있습니다:

- **저장소**: [mcp-server 디렉토리](https://github.com/namyoungkim/a1rtisan/tree/main/mcp-server)

---

## 참고 자료

- [MCP 공식 문서](https://modelcontextprotocol.io/)
- [Exponential Backoff - AWS Architecture Blog](https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/)
- [JSON serialization of Map objects - MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map#relation_with_objects)
