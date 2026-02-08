# 실수와 교훈 기록

> 이 문서는 `/reflect` 명령으로 자동 업데이트됩니다.
> Claude는 새 세션 시작 시 이 문서를 참조하여 같은 실수를 반복하지 않습니다.
> universal 태그 항목은 `/harvest`로 글로벌 설정에 역수집됩니다.

## 작성 형식

각 항목은 아래 형식을 따릅니다:

```
### [YYYY-MM-DD] 제목
- **scope**: universal | project-only
- **프로젝트**: a1rtisan-dev-blog
- **상황**: 무엇을 하다가 문제가 발생했는가
- **원인**: 근본 원인은 무엇이었는가
- **교훈**: 앞으로 어떻게 해야 하는가 (ALWAYS/NEVER 형태)
- **관련 파일**: 해당 파일 경로
```

역수집 완료 후 추가되는 필드:
```
- **harvested**: true
- **harvested_to**: 반영된 파일 경로
- **harvested_date**: YYYY-MM-DD
```

---

## 기록

### [2026-02-08] rm -rf 절대 경로 Hook 오탐
- **scope**: universal
- **프로젝트**: a1rtisan-dev-blog
- **상황**: `rm -rf /Users/leo/project/a1rtisan-dev-blog/inbox/` 실행 시 Hook이 차단
- **원인**: deny 패턴이 절대 경로 `/Users/...`를 `rm -rf /` 패턴으로 오탐
- **교훈**: ALWAYS 상대 경로로 rm 명령 실행 (예: `rm -r inbox/`). NEVER 절대 경로로 rm -rf 실행
- **관련 파일**: ~/.claude/settings.json (permissions.deny)

### [2026-02-08] /init-project 실행 후 main 브랜치 직접 커밋
- **scope**: universal
- **프로젝트**: a1rtisan-dev-blog
- **상황**: /init-project로 파일 생성 후 main 브랜치에 직접 커밋 3개 생성
- **원인**: 프로젝트 초기화 작업이라 브랜치 생성을 간과
- **교훈**: ALWAYS 작업 시작 전 브랜치 확인. NEVER main/master에 직접 커밋. 실수 시 `git reset --soft` + 브랜치 이동으로 복구
- **관련 파일**: .claude/settings.json (hooks.PreToolUse)
