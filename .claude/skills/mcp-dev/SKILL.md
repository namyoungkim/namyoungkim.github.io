---
description: MCP 서버 개발 가이드
user-invocable: true
allowed-tools:
  - Read
  - Glob
  - Grep
  - Bash
---

# MCP 서버 개발 가이드

MCP 서버 관련 작업 시 필요한 컨텍스트를 제공합니다.

## 필수 참조 문서

작업 전 다음 문서를 확인하세요:

1. **설계 문서**: `infrastructure/mcp/DESIGN.md`
   - 전체 아키텍처
   - 컴포넌트 설계
   - 최적화 전략

2. **구현 로드맵**: `infrastructure/mcp/ROADMAP.md`
   - Phase별 구현 계획
   - 체크리스트

3. **사용자 가이드**: `mcp-server/README.md`
   - 설치 및 설정
   - 문제 해결

## 현재 구현 상태

**Phase 3 완료** (8개 도구, 프로덕션 준비):
- Phase 1: `list_blog_posts`, `get_blog_post`, `list_docs`, `get_doc`
- Phase 2: `search_content`, `get_recent_posts`, `get_tags`
- Phase 3: `refresh_content` + 캐싱 + 에러 복구

## 개발 명령어

```bash
cd mcp-server
node index.js              # 일반 모드
DEBUG=1 node index.js      # 디버그 모드
```

## 성능 메트릭

- Cold start: < 1초 (캐시)
- 검색: < 1초
- 메모리: < 1MB
