# 코딩 컨벤션

> 이 문서의 언어별 섹션은 `/init-project` 실행 시 자동으로 추가됩니다.

## 공통 규칙

### 커밋 메시지
Conventional Commits: `<type>(<scope>): <description>`
타입: feat, fix, refactor, test, docs, chore, ci

### 브랜치 전략
- `main` — 안정 버전
- `feat/<기능명>` — 신규 기능
- `fix/<버그명>` — 버그 수정
- `refactor/<대상>` — 리팩토링

---

## 테스트 전략

### 테스트 피라미드 (권장 비율)

| 계층 | 비율 | 대상 |
|------|------|------|
| Unit | 50-60% | 비즈니스 로직 |
| Integration | 20-30% | API, DB 연동 |
| E2E | 10-20% | 핵심 사용자 시나리오만 |

### 커버리지 목표
- **전체: 70-80%** — 100%는 비현실적, 유지보수 비용만 높임
- **핵심 비즈니스 로직: 90% 이상**
- **UI, 설정 코드: 낮아도 괜찮음**

### TDD 적용 기준
- 새 기능 개발 → TDD 권장 (Red-Green-Refactor)
- 버그 수정 → 먼저 실패하는 테스트 작성
- 탐색적 프로토타입 → 구현 후 테스트 작성 가능
- 레거시 코드 → 변경하는 부분만 테스트 추가

### 좋은 테스트의 조건 (FIRST)
- **F**ast: 빠르게 실행
- **I**solated: 다른 테스트와 독립적
- **R**epeatable: 언제 실행해도 같은 결과
- **S**elf-validating: 성공/실패가 명확
- **T**imely: 적시에 작성

### 테스트 작성 패턴: Arrange-Act-Assert
```
Arrange: 테스트 데이터 준비
Act:     테스트 대상 실행
Assert:  결과 검증
```

---

## 코드 리뷰 체크리스트
- [ ] 함수/클래스 이름만 보고 역할을 알 수 있는가?
- [ ] 한 함수가 한 가지 일만 하는가?
- [ ] 에러 케이스가 명시적으로 처리되는가?
- [ ] 매직 넘버 없이 상수로 정의되어 있는가?
- [ ] 테스트가 핵심 로직을 커버하는가?
- [ ] 최적화된 코드는 문서화되어 있는가?

---

## 언어별 컨벤션

## 네이밍 규칙 (TypeScript)

| 대상 | 규칙 | 예시 |
|------|------|------|
| 파일명 (컴포넌트) | PascalCase | `UserService.ts`, `LoginForm.tsx` |
| 파일명 (유틸) | camelCase | `formatDate.ts`, `apiClient.ts` |
| 클래스 | PascalCase | `UserService` |
| 함수/변수 | camelCase | `getUserById` |
| 상수 | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT` |
| 타입/인터페이스 | PascalCase | `UserResponse`, `IUserRepository` |
| Enum | PascalCase | `UserRole` |

## Import 정렬 (TypeScript)
1. Node 표준 라이브러리
2. 외부 패키지
3. 내부 모듈 (절대 경로 `@/`)
4. 상대 경로 (`./`)

## 에러 핸들링 (TypeScript)
- 커스텀 에러: `class AppError extends Error`
- catch 절 타입: `catch (e: unknown)`
- 정리 로직: `try-finally` 사용
- API 에러: 표준 응답 형식으로 래핑

## 테스트 규칙 (TypeScript)
- 테스트 파일: `*.test.ts` 또는 `*.spec.ts`
- vitest: `describe`, `it`, `expect` 패턴
- 모킹: `vi.mock()`, `vi.spyOn()`
- 커버리지: `pnpm run test --coverage`

## 커밋 메시지
Conventional Commits: `<type>(<scope>): <description>`
타입: feat, fix, refactor, test, docs, chore, ci

## 프로젝트 구조
```
src/
├── index.ts          ← 엔트리포인트
├── types/            ← 타입 정의
├── utils/            ← 유틸리티 함수
├── services/         ← 비즈니스 로직
├── routes/ 또는 pages/ ← 라우팅
└── components/       ← UI 컴포넌트 (프론트엔드)
tests/
└── *.test.ts
```
