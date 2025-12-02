---
slug: vscode-python-ruff-setup
title: VSCode Python 개발환경 완벽 설정 가이드 (2025)
authors: namyoungkim
tags: [python, vscode, ruff, development, tutorial]
---

# VSCode Python 개발환경 완벽 설정 가이드 (2025)

> Black, isort, Flake8을 Ruff 하나로 통합하고, 생산성을 극대화하는 VSCode 설정

## 들어가며

Python 개발을 하다 보면 코드 포맷팅, 린팅, import 정리 등 여러 도구를 조합해서 사용하게 됩니다. 기존에는 Black + isort + Flake8 조합이 일반적이었지만, 이제는 **Ruff** 하나로 이 모든 것을 대체할 수 있습니다.

이 글에서는 Ruff를 중심으로 한 VSCode Python 개발환경 설정을 정리합니다.

<!-- truncate -->

---

## 1. 왜 Ruff인가?

### 기존 방식의 문제점

- **여러 도구 관리**: Black, isort, Flake8, pyupgrade 등 각각 설치하고 설정해야 함
- **속도**: 대규모 프로젝트에서 린팅/포맷팅에 시간 소요
- **설정 파일 분산**: 각 도구마다 별도 설정 필요

### Ruff의 장점

| 특징 | 설명 |
|------|------|
| **속도** | Rust로 작성되어 Black/Flake8 대비 10~100배 빠름 |
| **올인원** | Linter + Formatter + import 정리를 하나로 통합 |
| **800+ 규칙** | Flake8 플러그인 대부분을 내장 |
| **자동 수정** | `--fix` 옵션으로 자동 오류 수정 |
| **캐싱** | 변경되지 않은 파일은 재분석하지 않음 |

### 도구 대체 관계

```
Black          → ruff format
isort          → ruff check --select I
Flake8         → ruff check
pyupgrade      → ruff check --select UP
autoflake      → ruff check --select F401,F841
```

---

## 2. VSCode Extensions

### 필수 Extensions

| Extension | ID | 용도 |
|-----------|-----|------|
| Python | `ms-python.python` | Python 기본 지원 |
| Pylance | `ms-python.vscode-pylance` | 타입 체킹, IntelliSense |
| Ruff | `charliermarsh.ruff` | Linter + Formatter |
| Jupyter | `ms-toolsai.jupyter` | 노트북 지원 |

### Git & 협업

| Extension | ID | 용도 |
|-----------|-----|------|
| GitLens | `eamodio.gitlens` | Git 히스토리, blame |
| Git Graph | `mhutchie.git-graph` | 브랜치 시각화 |

### 인프라 & DevOps

| Extension | ID | 용도 |
|-----------|-----|------|
| YAML | `redhat.vscode-yaml` | YAML 스키마 지원 (k8s, Kubeflow) |
| Docker | `ms-azuretools.vscode-docker` | Docker 관리 |
| Remote - SSH | `ms-vscode-remote.remote-ssh` | 원격 서버 개발 |

### 생산성

| Extension | ID | 용도 |
|-----------|-----|------|
| Error Lens | `usernamehw.errorlens` | 에러 인라인 표시 |
| Prettier | `esbenp.prettier-vscode` | JSON/Markdown 포맷팅 |
| Material Icon Theme | `PKief.material-icon-theme` | 파일 아이콘 |
| Thunder Client | `rangav.vscode-thunder-client` | API 테스트 |

### 설치 명령어 (CLI)

```bash
code --install-extension ms-python.python
code --install-extension ms-python.vscode-pylance
code --install-extension charliermarsh.ruff
code --install-extension ms-toolsai.jupyter
code --install-extension eamodio.gitlens
code --install-extension mhutchie.git-graph
code --install-extension redhat.vscode-yaml
code --install-extension ms-azuretools.vscode-docker
code --install-extension usernamehw.errorlens
code --install-extension esbenp.prettier-vscode
code --install-extension PKief.material-icon-theme
```

---

## 3. settings.json 전체 설정

`Cmd + Shift + P` → `Preferences: Open User Settings (JSON)`

```jsonc
{
    // ===== 에디터 기본 =====
    "editor.fontSize": 16,
    "editor.fontVariations": false,
    "editor.autoClosingBrackets": "never",
    "editor.autoClosingQuotes": "never",
    "editor.inlineSuggest.enabled": true,
    "editor.parameterHints.enabled": true,
    "editor.quickSuggestions": {
        "other": true,
        "comments": false,
        "strings": false
    },
    "editor.quickSuggestionsDelay": 10,
    "editor.suggestOnTriggerCharacters": true,
    "editor.suggest.localityBonus": true,
    "editor.wordBasedSuggestions": "matchingDocuments",
    "editor.acceptSuggestionOnCommitCharacter": true,
    "editor.acceptSuggestionOnEnter": "on",
    "editor.bracketPairColorization.enabled": true,
    "editor.guides.bracketPairs": true,
    "editor.stickyScroll.enabled": true,
    "editor.minimap.enabled": false,
    "editor.renderWhitespace": "boundary",
    "editor.cursorBlinking": "smooth",
    "editor.cursorSmoothCaretAnimation": "on",
    "editor.smoothScrolling": true,

    // ===== 파일 =====
    "files.autoSave": "afterDelay",
    "files.trimTrailingWhitespace": true,
    "files.insertFinalNewline": true,
    "files.trimFinalNewlines": true,
    "files.exclude": {
        "**/__pycache__": true,
        "**/.pytest_cache": true,
        "**/*.pyc": true,
        "**/.ipynb_checkpoints": true,
        "**/.DS_Store": true,
        "**/.ruff_cache": true
    },

    // ===== 검색 제외 =====
    "search.exclude": {
        "**/node_modules": true,
        "**/__pycache__": true,
        "**/.git": true,
        "**/venv": true,
        "**/.venv": true,
        "**/dist": true,
        "**/*.egg-info": true,
        "**/.ruff_cache": true
    },

    // ===== 탐색기 =====
    "explorer.confirmDelete": false,
    "explorer.compactFolders": false,
    "explorer.confirmDragAndDrop": false,
    "explorer.confirmPasteNative": false,

    // ===== 워크벤치 =====
    "workbench.startupEditor": "none",
    "breadcrumbs.enabled": false,

    // ===== 보안 =====
    "security.workspace.trust.untrustedFiles": "open",

    // ===== 터미널 =====
    "terminal.integrated.fontSize": 20,
    "terminal.integrated.inheritEnv": false,
    "terminal.integrated.defaultProfile.osx": "zsh",
    "terminal.integrated.scrollback": 10000,
    "terminal.integrated.enableMultiLinePasteWarning": "never",

    // ===== Git =====
    "git.autofetch": true,
    "git.confirmSync": false,
    "git.enableSmartCommit": true,

    // ===== Python + Ruff =====
    "python.analysis.typeCheckingMode": "basic",
    "python.analysis.autoImportCompletions": true,
    "python.analysis.inlayHints.functionReturnTypes": true,
    "python.analysis.inlayHints.variableTypes": false,

    "[python]": {
        "editor.defaultFormatter": "charliermarsh.ruff",
        "editor.formatOnSave": true,
        "editor.codeActionsOnSave": {
            "source.fixAll.ruff": "explicit",
            "source.organizeImports.ruff": "explicit"
        }
    },

    // ===== Jupyter =====
    "jupyter.themeMatplotlibPlots": true,
    "jupyter.askForKernelRestart": false,
    "jupyter.widgetScriptSources": [
        "jsdelivr.com",
        "unpkg.com"
    ],
    "notebook.output.wordWrap": true,
    "notebook.formatOnSave.enabled": true,
    "notebook.output.scrolling": true,
    "notebook.lineNumbers": "on",

    // ===== YAML =====
    "[yaml]": {
        "editor.defaultFormatter": "redhat.vscode-yaml",
        "editor.tabSize": 2,
        "editor.autoIndent": "advanced"
    },
    "yaml.schemas": {
        "kubernetes": "/*.yaml"
    },

    // ===== JSON =====
    "[json]": {
        "editor.defaultFormatter": "esbenp.prettier-vscode",
        "editor.tabSize": 2
    },
    "[jsonc]": {
        "editor.defaultFormatter": "esbenp.prettier-vscode"
    },

    // ===== Markdown =====
    "markdown.preview.fontSize": 20,
    "[markdown]": {
        "editor.defaultFormatter": "esbenp.prettier-vscode",
        "editor.wordWrap": "on",
        "editor.quickSuggestions": {
            "comments": "off",
            "strings": "off",
            "other": "off"
        },
        "files.trimTrailingWhitespace": false
    },

    // ===== CSS =====
    "css.lint.emptyRules": "ignore",

    // ===== SCM =====
    "scm.inputFontSize": 20,

    // ===== 디버깅 =====
    "debug.console.fontSize": 16,
    "debug.internalConsoleOptions": "neverOpen",

    // ===== Copilot (선택) =====
    "github.copilot.enable": {
        "*": true,
        "yaml": true,
        "markdown": true,
        "plaintext": false
    }
}
```

---

## 4. 주요 설정 해설

### 에디터 설정

| 설정 | 값 | 설명 |
|------|-----|------|
| `stickyScroll.enabled` | true | 스크롤 시 함수/클래스명이 상단에 고정 |
| `bracketPairColorization` | true | 괄호 쌍을 색상으로 구분 |
| `minimap.enabled` | false | 미니맵 끄기 (화면 공간 확보) |
| `renderWhitespace` | boundary | 경계 공백만 표시 |

### Python + Ruff 설정

| 설정 | 설명 |
|------|------|
| `defaultFormatter: charliermarsh.ruff` | Ruff를 기본 포맷터로 지정 |
| `formatOnSave: true` | 저장 시 자동 포맷팅 |
| `source.fixAll.ruff` | 저장 시 lint 오류 자동 수정 |
| `source.organizeImports.ruff` | 저장 시 import 자동 정리 |
| `typeCheckingMode: basic` | Pylance 타입 체크 활성화 |

### 파일 관리

| 설정 | 설명 |
|------|------|
| `trimTrailingWhitespace` | 저장 시 trailing whitespace 제거 |
| `insertFinalNewline` | 파일 끝에 빈 줄 추가 |
| `files.exclude` | 탐색기에서 불필요한 파일 숨김 |
| `search.exclude` | 검색에서 제외 (성능 향상) |

---

## 5. pyproject.toml - Ruff 프로젝트 설정

프로젝트 루트에 `pyproject.toml` 파일을 생성하고 아래 내용을 추가합니다.

```toml
[tool.ruff]
line-length = 88
indent-width = 4
target-version = "py311"  # 사용 중인 Python 버전

exclude = [
    ".venv",
    "venv",
    "__pycache__",
    ".ipynb_checkpoints",
    "build",
    "dist",
]

[tool.ruff.lint]
select = [
    "E",      # pycodestyle errors
    "F",      # Pyflakes
    "B",      # flake8-bugbear (버그 가능성 패턴)
    "I",      # isort (import 정렬)
    "UP",     # pyupgrade (최신 문법)
    "SIM",    # flake8-simplify (코드 단순화)
    "ASYNC",  # async 패턴 (FastAPI용)
    "RUF",    # Ruff 자체 규칙
]
ignore = [
    "E501",   # line too long (formatter가 처리)
    "B008",   # FastAPI Depends() 패턴 허용
]
fixable = ["ALL"]

[tool.ruff.lint.isort]
known-first-party = ["your_project"]  # 본인 프로젝트 패키지명

[tool.ruff.lint.per-file-ignores]
"tests/*" = ["B011"]      # assert 허용
"__init__.py" = ["F401"]  # unused import 허용

[tool.ruff.format]
quote-style = "double"
indent-style = "space"
docstring-code-format = true  # docstring 내 코드도 포맷팅
```

### 주요 Lint 규칙 설명

| 코드 | 출처 | 설명 |
|------|------|------|
| E | pycodestyle | PEP 8 스타일 에러 |
| F | Pyflakes | 미사용 import, 정의되지 않은 변수 등 |
| B | flake8-bugbear | 버그 가능성이 있는 패턴 |
| I | isort | import 정렬 |
| UP | pyupgrade | 최신 Python 문법으로 업그레이드 |
| SIM | flake8-simplify | 코드 단순화 제안 |
| ASYNC | flake8-async | async/await 관련 규칙 |
| RUF | Ruff | Ruff 자체 규칙 |

---

## 6. Ruff CLI 사용법

### 설치

```bash
# pip
pip install ruff

# uv (권장)
uv add ruff --dev

# pipx (전역 설치)
pipx install ruff
```

### 자주 쓰는 명령어

```bash
# 린트 체크
ruff check .

# 린트 + 자동 수정
ruff check --fix .

# 포맷팅
ruff format .

# 포맷팅 체크만 (실제 변경 안 함)
ruff format --check .

# import 정렬만
ruff check --select I --fix .

# 특정 규칙만 체크
ruff check --select E,F,B .

# watch 모드 (파일 변경 시 자동 체크)
ruff check --watch .
```

---

## 7. 마이그레이션 가이드

### 기존 Black + isort + Flake8에서 전환하기

**Step 1: 기존 도구 제거 (선택)**

```bash
pip uninstall black isort flake8
```

**Step 2: Ruff 설치**

```bash
pip install ruff
```

**Step 3: VSCode Extension 정리**

- 제거: `ms-python.black-formatter`, `ms-python.isort`
- 설치: `charliermarsh.ruff`

**Step 4: settings.json 수정**

```jsonc
// Before
"[python]": {
    "editor.defaultFormatter": "ms-python.black-formatter",
    "editor.codeActionsOnSave": {
        "source.organizeImports": "explicit"
    }
}

// After
"[python]": {
    "editor.defaultFormatter": "charliermarsh.ruff",
    "editor.codeActionsOnSave": {
        "source.fixAll.ruff": "explicit",
        "source.organizeImports.ruff": "explicit"
    }
}
```

**Step 5: 설정 파일 통합**

기존 `.flake8`, `setup.cfg`, `pyproject.toml`에 분산된 설정을 `pyproject.toml`의 `[tool.ruff]` 섹션으로 통합합니다.

---

## 8. 트러블슈팅

### Ruff가 동작하지 않을 때

1. Ruff extension이 설치되어 있는지 확인
2. `charliermarsh.ruff` 버전이 2024.32.0 이상인지 확인
3. `Cmd + Shift + P` → `Ruff: Restart Server` 실행

### 포맷팅이 적용되지 않을 때

1. `[python]` 섹션의 `defaultFormatter`가 `charliermarsh.ruff`인지 확인
2. `formatOnSave`가 `true`인지 확인
3. 다른 Python formatter extension이 충돌하는지 확인

### import 정리가 안 될 때

1. `source.organizeImports.ruff`가 `"explicit"`인지 확인
2. `pyproject.toml`에서 `"I"` 규칙이 select에 포함되어 있는지 확인

---

## 마무리

이 설정을 적용하면 저장할 때마다 자동으로 코드 포맷팅, import 정리, lint 수정이 적용됩니다. Ruff의 빠른 속도 덕분에 대규모 프로젝트에서도 저장 시 딜레이 없이 깔끔한 코드를 유지할 수 있습니다.

설정 파일은 GitHub Gist나 dotfiles 저장소에 백업해두면 새 환경에서도 빠르게 세팅할 수 있습니다.

---

## 참고 자료

- [Ruff 공식 문서](https://docs.astral.sh/ruff/)
- [Ruff GitHub](https://github.com/astral-sh/ruff)
- [VSCode Ruff Extension](https://marketplace.visualstudio.com/items?itemName=charliermarsh.ruff)
