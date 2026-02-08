# 자주 쓰는 패턴

> 이 문서는 `/reflect` 명령으로 자동 업데이트됩니다.
> 프로젝트에서 반복 사용되는 코드 패턴을 기록합니다.
> universal 태그 항목은 `/harvest`로 글로벌 설정에 역수집됩니다.

## 작성 형식

각 패턴은 아래 형식을 따릅니다:

```
## 패턴 이름
- **scope**: universal | project-only
- **발견일**: YYYY-MM-DD
- **프로젝트**: a1rtisan-dev-blog
- **용도**: 언제 사용하는가
- **코드 예시**: (코드 블록)
- **주의사항**: 사용 시 유의할 점
```

역수집 완료 후 추가되는 필드:
```
- **harvested**: true
- **harvested_to**: 반영된 파일 경로
- **harvested_date**: YYYY-MM-DD
```

---

## 패턴 목록

### git reset --soft로 커밋 재구성
- **scope**: universal
- **발견일**: 2026-02-08
- **프로젝트**: a1rtisan-dev-blog
- **용도**: main 브랜치에 직접 커밋한 것을 feature 브랜치로 옮길 때
- **코드 예시**:
  ```bash
  git branch feature/my-work          # 현재 커밋을 브랜치로 보존
  git reset --soft origin/main        # main을 원래 상태로 되돌림 (변경사항 유지)
  git restore --staged .              # 스테이징 해제
  git checkout -- .                   # 변경사항 폐기 (브랜치에 이미 보존됨)
  git checkout feature/my-work        # 브랜치로 이동
  ```
- **주의사항**: `--hard` 대신 `--soft` 사용. 이미 push한 커밋은 이 방법 사용 불가

### 블로그 시리즈 구조화
- **scope**: project-only
- **발견일**: 2026-02-08
- **프로젝트**: a1rtisan-dev-blog
- **용도**: 연관된 여러 포스트를 시리즈로 작성할 때
- **코드 예시**:
  ```
  파일명: YYYY-MM-DD-topic-partN.md
  태그: 공통 태그 + 시리즈 태그
  하단: 시리즈 전체 링크 목록
  각 파트: 독립적으로 읽을 수 있도록 구성
  ```
- **주의사항**: 각 파트의 TL;DR 필수. 시리즈 내부 링크는 slug 기반 절대 경로 사용

### inbox/ 초안 검증 프로세스
- **scope**: universal
- **발견일**: 2026-02-08
- **프로젝트**: a1rtisan-dev-blog
- **용도**: 빠르게 작성한 초안을 공식 문서 기반으로 정확하게 재작성할 때
- **코드 예시**:
  ```
  1. inbox/에 빠른 초안 작성 (추측, 메모 포함 가능)
  2. 공식 문서/소스 코드로 기술적 정확성 검증
  3. blog/에 정제된 포스트 작성
  4. npm run build로 빌드 확인
  5. inbox/ 삭제
  ```
- **주의사항**: inbox/는 untracked 상태 유지. 추측성 내용은 반드시 검증 후 포함
