# MCP Server Implementation Roadmap

> MCP 서버 구현 로드맵 및 Phase별 체크리스트

## 전체 개요

```
Phase 1: 기본 MCP 서버 (MVP)           [1-2일]
    ↓
Phase 2: 검색 기능                      [1일]
    ↓
Phase 3: 최적화 및 안정화               [1일]
    ↓
Phase 4: 고급 기능 (선택사항)           [추후]
```

---

## Phase 1: 기본 MCP 서버 (MVP)

**목표**: 블로그 포스트와 문서를 조회할 수 있는 기본 MCP 서버 구축

**예상 소요 시간**: 1-2일

### 작업 목록

#### 1.1 프로젝트 초기 설정
- [ ] `mcp-server/` 디렉토리 생성
- [ ] `package.json` 초기화
  ```bash
  npm init -y
  npm install @modelcontextprotocol/sdk simple-git gray-matter
  ```
- [ ] `.gitignore`에 `.mcp-cache/` 추가
- [ ] 기본 프로젝트 구조 생성

#### 1.2 Git Manager 구현
- [ ] `src/git-manager.js` 생성
- [ ] Git clone 기능
  - [ ] 첫 실행 시 repository clone
  - [ ] 이미 clone된 경우 skip
- [ ] Git pull 기능
  - [ ] `git pull origin main` 실행
  - [ ] 변경사항 확인 (commit hash 비교)
- [ ] 에러 처리
  - [ ] Network 에러 핸들링
  - [ ] 로컬 변경사항 충돌 처리

#### 1.3 Content Parser 구현
- [ ] `src/content-parser.js` 생성
- [ ] Frontmatter 파싱
  - [ ] YAML frontmatter 추출 (gray-matter 사용)
  - [ ] 필수 필드 검증 (title, date, etc.)
- [ ] 마크다운 본문 파싱
  - [ ] HTML 태그 제거
  - [ ] 코드 블록 처리
- [ ] 요약 생성
  - [ ] `<!-- truncate -->` 태그 인식
  - [ ] 없으면 처음 200자 추출
- [ ] 메타데이터 추출
  - [ ] 단어 수 계산
  - [ ] 예상 독서 시간 계산

#### 1.4 기본 MCP Tools 구현
- [ ] `src/tools/list-posts.js`
  - [ ] `blog/` 디렉토리 스캔
  - [ ] 날짜순 정렬
  - [ ] limit/offset 파라미터 지원
- [ ] `src/tools/get-post.js`
  - [ ] slug로 포스트 찾기
  - [ ] 전체 마크다운 반환
  - [ ] 메타데이터 포함
- [ ] `src/tools/list-docs.js`
  - [ ] `docs/` 디렉토리 스캔
  - [ ] 카테고리별 그룹핑
- [ ] `src/tools/get-doc.js`
  - [ ] 경로로 문서 찾기
  - [ ] 전체 내용 반환

#### 1.5 MCP 서버 진입점
- [ ] `index.js` 생성
- [ ] MCP SDK 초기화
- [ ] Tools 등록
- [ ] 서버 시작 로직

#### 1.6 테스트 및 디버깅
- [ ] Claude Desktop 설정
  - [ ] `config.json` 작성
  - [ ] 경로 확인
- [ ] 수동 테스트
  - [ ] Claude Desktop 재시작
  - [ ] 각 Tool 호출 테스트
  - [ ] 에러 메시지 확인
- [ ] 로깅 추가
  - [ ] 요청/응답 로깅
  - [ ] 에러 로깅

### 완료 기준 (Definition of Done)

- ✅ Claude Desktop에서 MCP 서버 연결 확인
- ✅ `list_blog_posts` 호출 시 포스트 목록 반환
- ✅ `get_blog_post` 호출 시 전체 내용 반환
- ✅ `list_docs` 호출 시 문서 목록 반환
- ✅ `get_doc` 호출 시 전체 내용 반환
- ✅ 에러 발생 시 적절한 에러 메시지 반환

---

## Phase 2: 검색 기능

**목표**: 키워드로 블로그와 문서를 검색할 수 있는 기능 추가

**예상 소요 시간**: 1일

### 작업 목록

#### 2.1 Search Engine 구현
- [ ] `src/search-engine.js` 생성
- [ ] 인덱스 구조 설계
  ```javascript
  {
    posts: Map<slug, postData>,
    docs: Map<path, docData>,
    tags: Map<tag, [slugs]>,
    keywords: Map<keyword, [slugs]>
  }
  ```
- [ ] 인덱스 빌드 로직
  - [ ] 모든 마크다운 파일 스캔
  - [ ] 키워드 추출 (제목, 본문, 태그)
  - [ ] 역인덱스 생성

#### 2.2 검색 알고리즘
- [ ] 키워드 매칭
  - [ ] 제목 매칭 (가중치 높음)
  - [ ] 태그 매칭 (중간 가중치)
  - [ ] 본문 매칭 (낮은 가중치)
- [ ] 관련도 점수 계산
- [ ] 결과 정렬
- [ ] 필터링 옵션
  - [ ] 타입별 필터 (blog/docs/all)
  - [ ] 태그 필터
  - [ ] 날짜 범위 필터

#### 2.3 Search Tool 구현
- [ ] `src/tools/search.js`
- [ ] 검색 쿼리 파싱
- [ ] Search Engine 호출
- [ ] 결과 포맷팅

#### 2.4 추가 Tools
- [ ] `get_recent_posts` 구현
  - [ ] 최신 N개 포스트 반환
  - [ ] 타입 필터 지원
- [ ] `sync_content` 구현
  - [ ] 수동 Git pull 트리거
  - [ ] 인덱스 재빌드

#### 2.5 테스트
- [ ] 다양한 검색 쿼리 테스트
  - [ ] 단일 키워드
  - [ ] 복합 키워드
  - [ ] 특수문자 포함
- [ ] 필터링 테스트
- [ ] 성능 테스트 (큰 블로그 시뮬레이션)

### 완료 기준

- ✅ `search_content` 호출 시 관련 결과 반환
- ✅ 검색 결과가 관련도순으로 정렬됨
- ✅ 필터가 정상 작동
- ✅ 50개+ 포스트에서도 1초 이내 응답

---

## Phase 3: 최적화 및 안정화

**목표**: 성능 최적화 및 프로덕션 준비

**예상 소요 시간**: 1일

### 작업 목록

#### 3.1 캐싱 구현
- [ ] `src/cache-manager.js` 생성
- [ ] 인덱스 캐싱
  - [ ] `.mcp-cache/index.json`에 저장
  - [ ] Git commit hash와 함께 저장
- [ ] 캐시 유효성 검증
  - [ ] commit hash 비교
  - [ ] 유효하면 인덱스 로드
  - [ ] 무효하면 재빌드
- [ ] Cold start 최적화
  - [ ] 서버 시작 시 캐시 확인
  - [ ] 인덱스 빌드 시간 단축

#### 3.2 자동 동기화
- [ ] 백그라운드 동기화
  - [ ] 5분마다 자동 `git pull`
  - [ ] setInterval 사용
- [ ] 변경 감지
  - [ ] commit hash 변경 확인
  - [ ] 변경 시에만 인덱스 재빌드
- [ ] 에러 복구
  - [ ] Network 에러 시 재시도
  - [ ] 최대 3회 재시도

#### 3.3 메모리 최적화
- [ ] 인덱스 크기 제한
  - [ ] 요약 길이 제한 (최대 500자)
  - [ ] 불필요한 데이터 제거
- [ ] 메모리 프로파일링
  - [ ] 큰 블로그 시뮬레이션
  - [ ] 메모리 사용량 확인

#### 3.4 에러 처리 강화
- [ ] 모든 에러 케이스 처리
  - [ ] Git clone 실패
  - [ ] Git pull 실패
  - [ ] 파싱 에러
  - [ ] 파일 읽기 에러
- [ ] 사용자 친화적 에러 메시지
- [ ] 로깅 개선
  - [ ] 구조화된 로그
  - [ ] 로그 레벨 (debug, info, warn, error)

#### 3.5 문서화
- [ ] `mcp-server/README.md` 작성
  - [ ] 설치 방법
  - [ ] 설정 방법
  - [ ] 사용 예시
  - [ ] 문제 해결
- [ ] 코드 주석 추가
- [ ] API 문서 작성 (`infrastructure/mcp/API.md`)

#### 3.6 테스트
- [ ] 통합 테스트
  - [ ] 전체 워크플로우 테스트
  - [ ] 에지 케이스 테스트
- [ ] 성능 테스트
  - [ ] Cold start 시간
  - [ ] 검색 응답 시간
  - [ ] 메모리 사용량
- [ ] 스트레스 테스트
  - [ ] 연속 요청 처리
  - [ ] 동시 요청 처리

### 완료 기준

- ✅ Cold start 시간 < 3초
- ✅ 검색 응답 시간 < 1초
- ✅ 메모리 사용량 < 100MB
- ✅ 24시간 안정적 작동
- ✅ 모든 에러 케이스 처리
- ✅ 문서 완성

---

## Phase 4: 고급 기능 (선택사항)

**목표**: 사용자 경험 개선 및 고급 기능 추가

**예상 소요 시간**: TBD

### 작업 목록 (우선순위순)

#### 4.1 AI 기반 요약 (높음)
- [ ] OpenAI/Anthropic API 통합
- [ ] 긴 포스트 자동 요약
- [ ] 요약 캐싱
- [ ] 비용 최적화

#### 4.2 의미론적 검색 (높음)
- [ ] 벡터 임베딩 생성
  - [ ] OpenAI embeddings API
  - [ ] 로컬 임베딩 모델
- [ ] 벡터 DB 통합
  - [ ] 간단한 in-memory 벡터 저장소
  - [ ] 또는 ChromaDB/Pinecone
- [ ] 유사도 기반 검색

#### 4.3 관련 콘텐츠 추천 (중간)
- [ ] 태그 기반 유사도
- [ ] 내용 기반 유사도
- [ ] "이것도 읽어보세요" 기능

#### 4.4 통계 및 분석 (중간)
- [ ] Tool 추가: `get_stats`
  - [ ] 총 포스트 수
  - [ ] 총 문서 수
  - [ ] 태그 분포
  - [ ] 카테고리 분포
- [ ] 인기 태그 분석
- [ ] 시계열 통계 (월별 포스트 수)

#### 4.5 HTTP MCP 서버 (낮음)
- [ ] HTTP 엔드포인트 추가
- [ ] 인증/인가
- [ ] Rate limiting
- [ ] Cloudflare Workers 배포
- [ ] 공개 API 문서

#### 4.6 증분 업데이트 (낮음)
- [ ] Git diff 분석
- [ ] 변경된 파일만 재파싱
- [ ] 부분 인덱스 업데이트
- [ ] 성능 개선

---

## 마일스톤

### Milestone 1: MVP (Phase 1)
- **목표 날짜**: 시작 후 2일
- **핵심 기능**: 기본 조회 기능
- **Demo**: Claude에서 블로그 읽기

### Milestone 2: 검색 (Phase 1 + 2)
- **목표 날짜**: 시작 후 3일
- **핵심 기능**: 키워드 검색
- **Demo**: Claude에서 검색하여 원하는 포스트 찾기

### Milestone 3: Production Ready (Phase 1 + 2 + 3)
- **목표 날짜**: 시작 후 4일
- **핵심 기능**: 안정적이고 최적화된 서버
- **Demo**: 24시간 안정 작동, 문서 완성

### Milestone 4: Advanced (Phase 1 + 2 + 3 + 4)
- **목표 날짜**: TBD
- **핵심 기능**: AI 기반 고급 기능
- **Demo**: 의미론적 검색, 추천 시스템

---

## 리스크 및 대응 방안

### 리스크 1: MCP SDK 학습 곡선
- **영향**: 높음
- **대응**: MCP 공식 예제 코드 참조, 간단한 예제부터 시작

### 리스크 2: Git 동기화 에러
- **영향**: 중간
- **대응**: 에러 재시도 로직, 로컬 캐시 활용

### 리스크 3: 메모리 사용량 증가
- **영향**: 중간
- **대응**: 인덱스 크기 제한, 페이지네이션

### 리스크 4: 검색 성능 저하 (큰 블로그)
- **영향**: 낮음 (현재는 포스트가 적음)
- **대응**: 캐싱, 인덱싱 최적화, 필요시 외부 검색 엔진

---

## 진행 상황 추적

### Week 1
- [ ] Phase 1 완료
- [ ] Phase 2 시작

### Week 2
- [ ] Phase 2 완료
- [ ] Phase 3 완료
- [ ] MVP 배포

### Week 3+
- [ ] Phase 4 기능 선택적 구현
- [ ] 피드백 수집 및 개선

---

## 다음 단계

1. **Phase 1 시작**: `mcp-server/` 프로젝트 초기화
2. **Git Manager 구현**: 첫 번째 핵심 컴포넌트
3. **간단한 Tool 구현**: `list_blog_posts`로 빠른 성공 경험
4. **반복 개선**: 작동하는 버전을 먼저 만들고 점진적 개선

**시작 명령어**:
```bash
cd mcp-server
npm init -y
npm install @modelcontextprotocol/sdk simple-git gray-matter
mkdir -p src/tools
touch index.js src/git-manager.js src/content-parser.js
```

---

## 참고 자료

- [MCP Quickstart](https://modelcontextprotocol.io/quickstart)
- [MCP SDK Documentation](https://github.com/anthropics/anthropic-sdk-typescript)
- [simple-git Documentation](https://github.com/steveukx/git-js)
- [gray-matter Documentation](https://github.com/jonschlinkert/gray-matter)
