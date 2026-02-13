---
slug: tmux-practical-guide
title: "터미널이 꺼져도 작업은 살아있다 — tmux 실전 가이드"
authors: namyoungkim
tags: [dev-tools, tmux, terminal, ssh, guide]
---

> 노트북 덮었는데 3시간짜리 작업이 날아간 적 있나요?
> SSH 연결이 끊겼는데 서버에서 돌리던 스크립트가 중단된 적은요?
> **tmux**를 쓰면 이런 일은 다시는 일어나지 않습니다.

## TL;DR

- **tmux**는 터미널을 "저장"할 수 있게 해주는 도구
- 노트북을 덮어도, SSH가 끊겨도, 작업이 그대로 살아있음
- 화면 분할로 여러 작업을 동시에 볼 수 있음
- AI 코딩 도구(Claude Code 등)와 함께 쓰면 생산성이 크게 올라감

<!-- truncate -->

---

## tmux가 뭔가요?

**tmux**는 "Terminal Multiplexer"의 줄임말입니다.

이름이 어렵게 느껴지지만, 하는 일은 단순합니다:

> **터미널 창을 "저장"하고, 나중에 다시 열 수 있게 해주는 도구**

비유로 설명해볼게요.

### 게임 세이브 포인트

게임을 하다가 저녁밥 먹으러 가야 할 때, **세이브**하고 나가죠? 나중에 돌아오면 **정확히 그 지점**부터 다시 할 수 있습니다.

tmux는 터미널의 세이브 포인트입니다:

- **tmux 없이**: 터미널을 닫으면 → 하던 작업 다 사라짐 (세이브 없이 게임 끈 것)
- **tmux 있으면**: 터미널에서 나가도 → 작업이 계속 돌아감 → 돌아오면 이어서 할 수 있음

### 언제 쓰면 좋을까?

| 상황 | tmux 없이 | tmux 있으면 |
|------|-----------|------------|
| 노트북 덮었다 열었을 때 | 터미널 다 꺼져있음 | 그대로 살아있음 |
| WiFi가 끊겼을 때 | SSH 연결 끊김, 작업 중단 | 서버에서 계속 돌아감 |
| 화면 하나에 여러 작업 보고 싶을 때 | 터미널 창 여러 개 열어야 함 | 한 창 안에서 분할 가능 |
| 6시간짜리 빌드 돌릴 때 | 컴퓨터 앞에 계속 앉아있어야 함 | 시작하고 퇴근해도 됨 |

---

## 설치하기

```bash
# macOS (Homebrew가 설치되어 있다면)
brew install tmux

# Ubuntu / Debian
sudo apt install tmux

# 설치 확인
tmux -V
```

---

## 핵심 개념: 세션, 윈도우, 패인

tmux에는 세 가지 개념이 있습니다. **건물**에 비유하면 이해하기 쉽습니다:

```
건물(Session)
├── 방 1(Window) "코딩"
│   ├── 책상 왼쪽(Pane): 에디터
│   └── 책상 오른쪽(Pane): 터미널
└── 방 2(Window) "서버"
    └── 책상(Pane): 서버 로그
```

| 개념 | 비유 | 설명 |
|------|------|------|
| **Session** (세션) | 건물 | 하나의 작업 환경. 건물 밖으로 나가도(detach) 건물은 그대로 있음 |
| **Window** (윈도우) | 방 | 브라우저의 "탭"과 같음. 한 세션 안에 여러 윈도우 |
| **Pane** (패인) | 책상 위 구역 | 한 윈도우 안을 분할한 영역 |

**가장 중요한 포인트**: 세션은 **내가 보고 있지 않아도 계속 존재**합니다. 게임을 세이브하고 나간 것과 같아요.

---

## 5분 만에 배우는 기본 사용법

### Step 1: 세션 만들기

```bash
# "dev"라는 이름의 세션 만들기
tmux new -s dev
```

이렇게 하면 tmux 세션 안으로 들어갑니다. 화면 아래에 초록색 상태바가 보이면 성공!

### Step 2: 화면 분할하기

tmux의 모든 단축키는 **prefix 키를 먼저 누르고**, 그 다음에 명령 키를 누릅니다.

기본 prefix는 `Ctrl+b`입니다.

```
Ctrl+b 누르고 손 떼고 → % 누르기 = 좌우 분할
Ctrl+b 누르고 손 떼고 → " 누르기 = 상하 분할
```

좌우 분할하면 이렇게 됩니다:

```
┌──────────────────┬──────────────────┐
│                  │                  │
│  왼쪽 패인        │  오른쪽 패인      │
│  (원래 터미널)     │  (새로 생긴 터미널) │
│                  │                  │
└──────────────────┴──────────────────┘
```

### Step 3: 패인 사이 이동

```
Ctrl+b → 방향키(←→↑↓)
```

왼쪽 패인에서 오른쪽 패인으로 가려면: `Ctrl+b` → `→`

### Step 4: 세션에서 나가기 (Detach)

```
Ctrl+b → d
```

이게 핵심입니다! **세션에서 나가도 안에서 돌리던 작업은 계속 실행됩니다.**

노트북을 덮어도, WiFi가 끊겨도, 세션은 살아있어요.

### Step 5: 세션에 다시 붙기 (Attach)

```bash
# 세션 목록 보기
tmux ls

# "dev" 세션에 다시 붙기
tmux a -t dev
```

나갔던 그 화면, 그 상태 그대로 돌아옵니다!

### 전체 흐름 예시

```bash
# 1. 세션 만들고
tmux new -s dev

# 2. 화면 분할하고 코딩 중...
# (Ctrl+b → %)

# 3. 점심 먹으러 감
# (Ctrl+b → d)

# 4. 점심 먹고 돌아와서
tmux a -t dev
# → 점심 전 화면 그대로!
```

---

## 필수 단축키 모음

모든 단축키는 `Ctrl+b`(prefix)를 먼저 누르고, 그 다음 키를 누릅니다.

### 세션 관련

| 동작 | 방법 |
|------|------|
| 세션 만들기 | `tmux new -s 이름` (터미널에서) |
| 세션 목록 보기 | `tmux ls` (터미널에서) |
| 세션에 다시 붙기 | `tmux a -t 이름` (터미널에서) |
| 세션에서 나가기 | `Ctrl+b` → `d` |
| 세션 이름 바꾸기 | `Ctrl+b` → `$` |
| 세션 목록 (트리뷰) | `Ctrl+b` → `s` |

### 윈도우 (탭) 관련

| 동작 | 방법 |
|------|------|
| 새 윈도우 | `Ctrl+b` → `c` |
| 윈도우 이름 바꾸기 | `Ctrl+b` → `,` |
| N번 윈도우로 이동 | `Ctrl+b` → `0~9` |
| 다음 윈도우 | `Ctrl+b` → `n` |
| 이전 윈도우 | `Ctrl+b` → `p` |
| 윈도우 목록 | `Ctrl+b` → `w` |
| 윈도우 닫기 | `Ctrl+b` → `&` |

### 패인 (화면 분할) 관련

| 동작 | 방법 |
|------|------|
| 좌우 분할 | `Ctrl+b` → `%` |
| 상하 분할 | `Ctrl+b` → `"` |
| 패인 이동 | `Ctrl+b` → `방향키` |
| 패인 확대/복원 | `Ctrl+b` → `z` |
| 패인 닫기 | `Ctrl+b` → `x` |
| 패인 번호 표시 | `Ctrl+b` → `q` |
| 패인 크기 조절 (미세) | `Ctrl+b` → `Ctrl+방향키` |
| 패인 크기 조절 (크게) | `Ctrl+b` → `Alt+방향키` |

### 스크롤 (복사 모드)

| 동작 | 방법 |
|------|------|
| 스크롤 모드 진입 | `Ctrl+b` → `[` |
| 스크롤 | `방향키` / `PgUp` / `PgDn` |
| 스크롤 모드 나가기 | `q` 또는 `Esc` |

:::tip
**패인 줌(`Ctrl+b → z`)은 정말 유용합니다!** 작은 패인에서 작업할 때 줌으로 전체 화면으로 키웠다가, 다시 `Ctrl+b → z`로 원래 크기로 돌릴 수 있습니다.
:::

---

## 설정 파일로 더 편하게 쓰기

tmux의 기본 설정은 좀 불편합니다. `~/.tmux.conf` 파일을 만들어서 개선할 수 있어요.

아래는 제가 추천하는 설정입니다:

```bash title="~/.tmux.conf"
# ===========================================
# 기본 설정
# ===========================================

# 마우스 지원 (클릭, 스크롤, 크기 조절 모두 가능!)
set -g mouse on

# 256 컬러 (색상이 제대로 나오게)
set -g default-terminal "screen-256color"
set -sa terminal-overrides ",xterm-256color:RGB"

# 스크롤 버퍼 늘리기 (기본 2000줄 → 50000줄)
set -g history-limit 50000

# ESC 키 딜레이 제거 (vim 사용자 필수)
set -sg escape-time 0

# 윈도우/패인 번호를 1부터 시작 (0은 키보드 왼쪽 끝이라 불편)
set -g base-index 1
setw -g pane-base-index 1

# 윈도우 닫으면 번호 자동 재정렬
set -g renumber-windows on

# ===========================================
# 키 바인딩
# ===========================================

# 설정 파일 다시 불러오기 (prefix + r)
bind r source-file ~/.tmux.conf \; display "Config reloaded!"

# 직관적인 화면 분할 (| 좌우, - 상하)
bind | split-window -h -c "#{pane_current_path}"
bind - split-window -v -c "#{pane_current_path}"

# 새 윈도우도 현재 경로에서 열기
bind c new-window -c "#{pane_current_path}"

# vim 스타일 패인 이동 (hjkl)
bind h select-pane -L
bind j select-pane -D
bind k select-pane -U
bind l select-pane -R

# 패인 크기 조절 (대문자 HJKL)
bind -r H resize-pane -L 5
bind -r J resize-pane -D 5
bind -r K resize-pane -U 5
bind -r L resize-pane -R 5

# ===========================================
# 보기 좋은 상태바
# ===========================================

set -g status-position bottom
set -g status-style "bg=#1a1b26,fg=#a9b1d6"
set -g status-left "#[fg=#7aa2f7,bold] #S "
set -g status-right "#[fg=#565f89] %H:%M #[fg=#7aa2f7] #h "
set -g status-left-length 30
set -g status-right-length 50

# 활성 윈도우 강조
setw -g window-status-current-style "fg=#7aa2f7,bold"
setw -g window-status-current-format " #I:#W "
setw -g window-status-format " #I:#W "

# 패인 테두리 색상
set -g pane-border-style "fg=#3b4261"
set -g pane-active-border-style "fg=#7aa2f7"

# ===========================================
# 복사 모드 (vi 스타일)
# ===========================================

setw -g mode-keys vi

# macOS 클립보드 연동 (tmux 3.2+)
bind -T copy-mode-vi v send -X begin-selection
bind -T copy-mode-vi y send -X copy-pipe-and-cancel "pbcopy"
bind -T copy-mode-vi Enter send -X copy-pipe-and-cancel "pbcopy"

# Linux라면 아래 주석 해제 (xclip 필요)
# bind -T copy-mode-vi y send -X copy-pipe-and-cancel "xclip -selection clipboard"
```

설정 적용 방법:

```bash
# 파일 저장 후, tmux 안에서
tmux source-file ~/.tmux.conf

# 또는 위 설정을 적용했다면 prefix + r
```

:::tip
이 설정을 적용하면 화면 분할이 훨씬 직관적입니다:
- `Ctrl+b` → `|` = 좌우 분할 (파이프가 세로선이니까!)
- `Ctrl+b` → `-` = 상하 분할 (하이픈이 가로선이니까!)
:::

---

## AI 코딩에 tmux 활용하기

AI 코딩 도구(Claude Code 등)를 쓸 때 tmux는 특히 강력합니다.

### 기본 레이아웃: 2패인

```bash
# 한 줄로 세팅 완료
tmux new -s dev \; \
  split-window -h -p 50 \; \
  send-keys -t 1 'claude' Enter \; \
  select-pane -t 0
```

```
┌──────────────────┬──────────────────┐
│ 왼쪽              │ 오른쪽            │
│                  │                  │
│ 일반 터미널       │ Claude Code      │
│ (git, 테스트 등)  │ (AI 대화)        │
│                  │                  │
└──────────────────┴──────────────────┘
```

왼쪽에서 git이나 테스트를 돌리면서, 오른쪽에서 Claude Code와 대화하는 구조입니다.

### 확장 레이아웃: 3패인

```bash
tmux new -s dev \; \
  split-window -h -p 60 \; \
  split-window -v -p 30 \; \
  send-keys -t 1 'claude' Enter \; \
  select-pane -t 0
```

```
┌──────────────────┬──────────────────┐
│                  │ Claude Code      │
│ 메인 터미널       │ (AI 대화)        │
│                  │                  │
│ (코딩, git 등)   ├──────────────────┤
│                  │ 로그/테스트 출력   │
│                  │ (실시간 모니터링)  │
└──────────────────┴──────────────────┘
```

### 셸 함수로 자동화하기

매번 저 긴 명령어를 칠 필요 없이, 함수를 만들어두면 됩니다.

`~/.zshrc` 또는 `~/.bashrc`에 추가하세요:

```bash
# AI 코딩 세션을 한 방에 시작
aidev() {
  local session="${1:-dev}"

  # 이미 세션이 있으면 그냥 붙기
  if tmux has-session -t "$session" 2>/dev/null; then
    tmux attach -t "$session"
    return
  fi

  # 새 세션 생성 (왼쪽 40%, 오른쪽 60% Claude)
  tmux new-session -d -s "$session" -n code
  tmux split-window -h -p 60 -t "$session:code"
  tmux send-keys -t "$session:code.1" 'claude' Enter

  # 로그용 두 번째 윈도우
  tmux new-window -t "$session" -n logs

  # 코드 윈도우의 왼쪽 패인 선택
  tmux select-window -t "$session:code"
  tmux select-pane -t 0

  tmux attach -t "$session"
}
```

이제 터미널에서 이렇게만 치면 됩니다:

```bash
aidev                  # "dev" 세션 시작
aidev stock-screener   # 프로젝트별 세션
```

---

## SSH + tmux: 원격 작업의 핵심

tmux가 가장 빛나는 순간은 **SSH로 원격 서버에 접속할 때**입니다.

### 문제 상황

```
나 (노트북) --SSH--> 서버 (작업 중)

         WiFi 끊김!

나 (노트북) --X--> 서버 (작업 중단됨!)
```

SSH 연결이 끊기면 서버에서 돌리던 프로세스도 같이 죽습니다. 6시간짜리 모델 학습이 WiFi 때문에 날아갈 수 있어요.

### 해결: tmux

```
나 (노트북) --SSH--> 서버의 tmux 세션 (작업 중)

         WiFi 끊김!

나 (노트북) --X      서버의 tmux 세션 (혼자 잘 돌아감!)

         WiFi 복구!

나 (노트북) --SSH--> 서버의 tmux 세션 (아까 이어서!)
```

### 실전 사용법

```bash
# 1. SSH 접속
ssh myserver

# 2. tmux 세션 만들기
tmux new -s work

# 3. 오래 걸리는 작업 시작 (모델 학습, 빌드 등)
python train.py

# 4. 집에 갈 시간! 세션에서 나가기
# Ctrl+b → d

# 5. 다음 날 출근해서 다시 접속
ssh myserver
tmux a -t work
# → 학습이 잘 돌아가고 있음!
```

### SSH 한 줄로 tmux 세션 붙기

```bash
# -A 옵션: 세션이 있으면 붙고, 없으면 새로 만듦
ssh -t myserver "tmux new-session -A -s dev"
```

### SSH 설정 최적화

`~/.ssh/config`에 이 설정을 추가하면 연결이 더 안정적입니다:

```
Host myserver
    HostName 123.456.789.0
    User leo
    # 30초마다 "나 살아있어" 신호 보내기
    ServerAliveInterval 30
    ServerAliveCountMax 3
    # SSH 연결 재사용 (재접속이 빨라짐)
    ControlMaster auto
    ControlPath ~/.ssh/sockets/%r@%h-%p
    ControlPersist 600

# 모든 호스트에 기본 적용
Host *
    ServerAliveInterval 30
    ServerAliveCountMax 3
```

```bash
# 소켓 디렉토리 만들기 (한 번만)
mkdir -p ~/.ssh/sockets
```

---

## 알아두면 좋은 고급 기능

### 프로젝트마다 세션 분리

```bash
# 프로젝트별로 세션을 만들면 깔끔합니다
tmux new -s stock-screener
tmux new -s blog
tmux new -s side-project

# Ctrl+b → s 로 세션 간 전환 (트리 뷰)
```

### 여러 서버에 같은 명령 동시 실행

여러 패인을 열어놓고 동시에 같은 명령을 칠 수 있습니다:

```bash
# tmux 명령 모드에서 (Ctrl+b → :)
:setw synchronize-panes on     # 동시 입력 켜기
:setw synchronize-panes off    # 끄기
```

배포할 때 여러 서버에 같은 명령을 실행하는 데 유용합니다.

### 패인을 새 윈도우로 분리

작업하다 보면 패인을 독립된 윈도우로 빼고 싶을 때가 있습니다:

```
Ctrl+b → !    # 현재 패인을 새 윈도우로 분리
```

### 로그 캡처

패인에 출력된 내용을 파일로 저장할 수 있습니다:

```bash
# Ctrl+b → : 로 명령 모드 진입 후
:capture-pane -S -3000         # 최근 3000줄 캡처
:save-buffer ~/tmux-log.txt    # 파일로 저장
```

---

## 자주 겪는 문제와 해결법

### "sessions should be nested" 에러

tmux 안에서 다시 tmux를 실행하려 할 때 나오는 에러입니다.

```bash
# 해결: 다른 세션으로 전환
tmux switch-client -t other-session
```

### 마우스 스크롤이 안 될 때

`~/.tmux.conf`에 마우스 설정이 있는지 확인하세요:

```bash
set -g mouse on
```

### 색상이 이상할 때

```bash
# ~/.tmux.conf에 추가
set -g default-terminal "screen-256color"
set -sa terminal-overrides ",xterm-256color:RGB"
```

### macOS에서 클립보드 복사가 안 될 때

tmux 3.2 이상이면 기본적으로 동작합니다. 안 되면:

```bash
# ~/.tmux.conf에 추가
set -s set-clipboard on
```

---

## 매일 쓰는 tmux 워크플로우

하루 전체 흐름을 정리하면 이렇습니다:

```bash
# 아침: 세션 시작 (기존 세션이 있으면 그대로 붙음)
aidev                           # 또는 tmux a -t dev

# 작업 중
Ctrl+b → 방향키                  # 패인 간 이동
Ctrl+b → z                      # 패인 확대/축소
Ctrl+b → c                      # 새 윈도우 (새 탭)
Ctrl+b → 0-9                    # 윈도우 전환

# 점심: 세션 나가기 (작업은 계속 돌아감)
Ctrl+b → d

# 오후: 다시 붙기
tmux a -t dev

# SSH 원격 작업
ssh -t server "tmux a -t work"

# 퇴근: detach만 하면 됨 (세션 죽이지 않음!)
Ctrl+b → d
```

---

## 빠른 참조 카드

가장 많이 쓰는 것들만 모았습니다. 이것만 외우면 tmux의 80%를 쓸 수 있습니다:

```
세션:  tmux new -s NAME   세션 만들기
       tmux a -t NAME     세션 붙기
       tmux ls            세션 목록
       Ctrl+b → d         세션 나가기 (detach)

윈도우: Ctrl+b → c         새 윈도우
       Ctrl+b → 0-9       윈도우 전환
       Ctrl+b → ,         이름 변경

패인:  Ctrl+b → %         좌우 분할
       Ctrl+b → "         상하 분할
       Ctrl+b → 방향키     패인 이동
       Ctrl+b → z         패인 확대/복원
       Ctrl+b → x         패인 닫기

스크롤: Ctrl+b → [         스크롤 모드
       q                  스크롤 나가기
```

tmux는 처음에 단축키가 많아 어렵게 느껴지지만, 위의 10개 정도만 외우면 충분합니다. 나머지는 쓰다 보면 자연스럽게 외워져요.

**가장 중요한 세 가지만 기억하세요:**

1. `tmux new -s 이름` — 세션 만들기
2. `Ctrl+b → d` — 나가기 (세션은 살아있음!)
3. `tmux a -t 이름` — 다시 붙기
