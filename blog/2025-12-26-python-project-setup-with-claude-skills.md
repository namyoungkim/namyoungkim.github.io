---
slug: python-project-setup-with-claude-skills
title: "나만의 Python 프로젝트 표준 만들기: Claude Skills로 자동화하기"
authors: namyoungkim
tags: [python, dev-tools, claude, skills, uv, ruff]
---

# 나만의 Python 프로젝트 표준 만들기: Claude Skills로 자동화하기

Python 프로젝트를 시작할 때마다 매번 같은 설정을 반복하고 있지 않나요? pyproject.toml 작성, 린터 설정, 디렉토리 구조 만들기... 이번 글에서는 2025년 기준 최신 Python 도구 스택을 정리하고, Claude Skills로 이 과정을 자동화하는 방법을 공유합니다.

<!-- truncate -->

---

## 왜 표준화가 필요한가?

프로젝트마다 설정이 다르면 이런 문제가 생깁니다:

- "이 프로젝트는 black 쓰고, 저 프로젝트는 ruff 쓰고..."
- "mypy 설정이 어디 있더라?"
- "테스트는 pytest? unittest?"

한 번 정해두면 모든 프로젝트에서 일관된 개발 경험을 얻을 수 있어요.

---

## 2025년 Python 도구 스택

### 최종 선택

| 역할 | 도구 | 이유 |
|------|------|------|
| 패키지 매니저 | **uv** | pip보다 10-100배 빠름, 가상환경 통합 관리 |
| Linter + Formatter | **ruff** | Black + isort + Flake8 통합, 압도적 속도 |
| Type Checker (CLI) | **ty** | Astral의 새 타입 체커, mypy 대비 10-100배 빠름 |
| Type Checker (IDE) | **Pylance** | VSCode에서 안정적인 LSP 경험 |
| 테스트 | **pytest** | 사실상 표준 |

### ty에 대한 참고

ty는 Astral(ruff, uv 만든 회사)에서 2025년 12월에 공개한 새로운 타입 체커예요. 아직 Beta(v0.0.7)지만 속도가 압도적입니다:

```
mypy:  18초
ty:    0.5초
```

다만 아직 Beta라서 **IDE는 Pylance를 유지**하고, **ty는 CLI/CI용**으로만 사용하는 게 안전해요.

---

## pyproject.toml 템플릿

모든 설정을 한 파일에 모아둡니다:

```toml
[project]
name = "my-project"
version = "0.1.0"
description = "프로젝트 설명"
readme = "README.md"
requires-python = ">=3.11"
dependencies = []

[dependency-groups]
dev = [
    "ruff>=0.14",
    "ty>=0.0.7",
    "pytest>=8.0",
    "pytest-cov>=6.0",
]

[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"

# ============================================
# Ruff 설정
# ============================================
[tool.ruff]
line-length = 88
target-version = "py311"
src = ["src", "tests"]

[tool.ruff.lint]
select = [
    "E",      # pycodestyle errors
    "F",      # Pyflakes
    "B",      # flake8-bugbear
    "I",      # isort
    "UP",     # pyupgrade
    "SIM",    # flake8-simplify
    "ASYNC",  # flake8-async
    "RUF",    # Ruff-specific
]
ignore = [
    "E501",   # line too long (formatter handles)
    "B008",   # function call in default argument
]

[tool.ruff.lint.isort]
known-first-party = ["my_project"]

[tool.ruff.format]
quote-style = "double"
docstring-code-format = true

# ============================================
# ty 설정 (타입 체커)
# ============================================
[tool.ty]
# requires-python을 자동 감지

# ============================================
# pytest 설정
# ============================================
[tool.pytest.ini_options]
testpaths = ["tests"]
addopts = "-v --tb=short"
```

---

## 프로젝트 구조

src 레이아웃을 사용합니다:

```
my-project/
├── pyproject.toml
├── README.md
├── src/
│   └── my_project/
│       ├── __init__.py
│       └── main.py
└── tests/
    ├── __init__.py
    └── test_main.py
```

### 왜 src 레이아웃인가?

- 설치된 패키지와 로컬 코드 혼동 방지
- import 경로가 명확
- 패키징 시 실수 방지

---

## 코드 철학

프로젝트 세팅만큼 중요한 건 코드 작성 원칙이에요. 제가 따르는 5가지 원칙입니다:

### 1. Explicit over Clever
```python
# ❌ 너무 clever
result = [x for x in data if x and hasattr(x, 'value') and x.value > 0]

# ✅ 명시적
def is_valid_item(item: Item | None) -> bool:
    if item is None:
        return False
    return item.value > 0

result = [x for x in data if is_valid_item(x)]
```

### 2. Type Hints 필수
```python
# ❌ 타입 없음
def process(data):
    return data.transform()

# ✅ 타입 명시
def process(data: DataFrame) -> DataFrame:
    return data.transform()
```

### 3. 함수 크기: 20-50줄 목표
- 100줄 넘으면 리팩토링
- 한 함수 = 한 가지 일

### 4. 네이밍 (PEP 8)
```python
# 변수/함수: snake_case
user_count = 10
def calculate_total(): ...

# 클래스: PascalCase
class DataProcessor: ...

# 상수: SCREAMING_SNAKE_CASE
MAX_RETRIES = 3

# Boolean: is_, has_, can_ 접두사
is_active = True
has_permission = False
```

### 5. 주석은 "왜(Why)"만
```python
# ❌ What (코드가 이미 말해줌)
# user_count에 1을 더한다
user_count += 1

# ✅ Why (의도 설명)
# 현재 사용자도 포함해야 하므로 +1
user_count += 1
```

---

## Claude Skills로 자동화하기

이 모든 설정을 Claude가 기억하도록 Skills 파일을 만들었어요.

### Skills란?

Claude에게 "이런 상황에서는 이렇게 해"라고 가르치는 문서예요. 프로젝트 생성을 요청하면 Claude가 자동으로 이 Skills를 참조합니다.

### Skills 구조

```
leo-claude-skills/
├── python-project/
│   └── SKILL.md          # Python 프로젝트 세팅 가이드
├── coding-problem-solver/
│   ├── SKILL.md          # 코딩 문제 풀이 스킬
│   └── references/
│       └── output-template.md
└── scripts/
    └── sync-to-claude-code.sh
```

### SKILL.md 예시

```markdown
---
name: python-project-setup
description: Python 프로젝트 초기화. "파이썬 프로젝트 만들어줘", 
             "새 Python 패키지 세팅해줘" 등의 요청 시 사용.
---

# Python Project Setup

## 도구 스택
- uv: 패키지 매니저
- ruff: Linter + Formatter
- ty: Type Checker (CLI)
- pytest: 테스트

## 프로젝트 구조
src 레이아웃 사용...

## pyproject.toml
(전체 템플릿)...
```

---

## GitHub으로 Skills 관리하기

Skills를 GitHub 저장소로 관리하면 여러 장점이 있어요:

1. **버전 관리**: 변경 이력 추적
2. **백업**: GitHub에 자동 백업
3. **이식성**: 다른 컴퓨터에서도 동일하게 사용
4. **팀 공유**: 팀원들과 공유 가능

### 설정 방법 (Mac)

```bash
# 1. 저장소 클론
git clone https://github.com/username/leo-claude-skills.git ~/leo-claude-skills

# 2. Claude Code에 심볼릭 링크 생성
cd ~/leo-claude-skills
./scripts/sync-to-claude-code.sh
```

### 동기화 스크립트

```bash
#!/bin/bash
# sync-to-claude-code.sh

SKILLS_REPO="$HOME/leo-claude-skills"
CLAUDE_SKILLS="$HOME/.claude/skills"

mkdir -p "$CLAUDE_SKILLS"

for skill_dir in "$SKILLS_REPO"/*/; do
    skill_name=$(basename "$skill_dir")
    if [[ -f "$skill_dir/SKILL.md" ]]; then
        ln -sf "$skill_dir" "$CLAUDE_SKILLS/$skill_name"
        echo "✅ Linked: $skill_name"
    fi
done
```

---

## 스킬 활성화/비활성화

Claude Code에서 특정 스킬만 사용하고 싶을 때가 있어요. 동기화 스크립트에 활성화/비활성화 기능을 추가했습니다:

```bash
# 스킬 상태 확인
./scripts/sync-to-claude-code.sh list

# 출력:
# ✅ Active:
#    python-project
#    coding-problem-solver
#
# 💤 Disabled:
#    (none)

# 특정 스킬 비활성화
./scripts/sync-to-claude-code.sh disable coding-problem-solver

# 다시 활성화
./scripts/sync-to-claude-code.sh enable coding-problem-solver
```

비활성화된 스킬은 `~/.claude/skills-disabled/` 폴더로 이동되어 Claude Code가 인식하지 못합니다.

---

## 일상 워크플로우

### 스킬 수정 시
```bash
cd ~/leo-claude-skills
# SKILL.md 수정...
git commit -am "Update python-project skill"
git push
# Claude Code는 심볼릭 링크라 자동 반영!
```

### 새 스킬 추가 시
```bash
mkdir ~/leo-claude-skills/new-skill
# SKILL.md 작성...
./scripts/sync-to-claude-code.sh sync
git add new-skill
git commit -m "Add new-skill"
git push
```

### 다른 Mac에서 동기화
```bash
git clone https://github.com/username/leo-claude-skills.git ~/leo-claude-skills
cd ~/leo-claude-skills
./scripts/sync-to-claude-code.sh
```

---

## 마무리

이제 "파이썬 프로젝트 만들어줘"라고 하면 Claude가 자동으로:
- src 레이아웃 구조 생성
- pyproject.toml 설정 (uv, ruff, ty, pytest)
- VSCode 설정 파일 생성
- README.md 템플릿 생성

을 해줍니다. 한 번 세팅해두면 모든 프로젝트에서 일관된 경험을 얻을 수 있어요!

---

## 참고 자료

- [uv 공식 문서](https://docs.astral.sh/uv/)
- [ruff 공식 문서](https://docs.astral.sh/ruff/)
- [ty 공식 문서](https://docs.astral.sh/ty/)
- [Agent Skills 공식 사이트](https://agentskills.io)
- [Claude Code Skills 가이드](https://code.claude.com/docs/en/skills)
