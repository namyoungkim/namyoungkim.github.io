---
slug: agent-skills-part2
title: "[Agent Skills #2] 설치부터 멀티 에이전트 공유까지"
authors: namyoungkim
tags: [ai, agent-skills, vercel, claude-code, gemini-cli, installation-guide]
---

> Claude Code, Gemini CLI에서 동일한 스킬을 사용하는 완벽 가이드

<!-- truncate -->

## 들어가며

[Part 1](/blog/agent-skills-part1)에서 Agent Skills의 개념과 Vercel이 제공하는 3가지 스킬을 알아봤습니다.

이번 편에서는 **실제로 설치하고 설정하는 방법**을 다룹니다.

특히 여러 AI 에이전트(Claude Code, Gemini CLI 등)에서 **동일한 스킬을 공유**하는 방법까지 알아보겠습니다.

---

## 에이전트별 스킬 디렉토리

Agent Skills는 오픈 표준이지만, 각 에이전트마다 스킬을 찾는 위치가 다릅니다.

| 에이전트 | 프로젝트 레벨 | 글로벌 레벨 |
|---------|-------------|------------|
| **Claude Code** | `.claude/skills/` | `~/.claude/skills/` |
| **Gemini CLI** | `.gemini/skills/` | `~/.gemini/skills/` |
| **Cursor** | `.cursor/skills/` | `~/.cursor/skills/` |
| **VS Code Copilot** | `.github/skills/` | `~/.copilot/skills/` |
| **OpenCode** | `.opencode/skills/` | `~/.opencode/skills/` |

> 💡 **프로젝트 vs 글로벌**
> - 프로젝트 레벨: 해당 프로젝트에서만 사용
> - 글로벌 레벨: 모든 프로젝트에서 사용

---

## 설치 방법

### 방법 1: npx add-skill (권장)

가장 간단한 방법입니다.

```bash
# Vercel 스킬 전체 설치
npx add-skill vercel-labs/agent-skills
```

설치 과정에서 몇 가지 질문이 나옵니다:

```
? Select skills to install:
  ◉ react-best-practices
  ◉ web-design-guidelines
  ◉ vercel-deploy-claimable

? Install globally or in current project?
  ◉ Global (~/.claude/skills/)
  ○ Project (.claude/skills/)

? Which agents?
  ◉ claude-code
  ◉ gemini-cli
  ○ cursor
  ○ opencode
```

### 방법 2: 특정 스킬만 설치

```bash
# react-best-practices만 설치
npx add-skill vercel-labs/agent-skills --skill react-best-practices

# 여러 스킬 선택 설치
npx add-skill vercel-labs/agent-skills \
  --skill react-best-practices \
  --skill web-design-guidelines
```

### 방법 3: 특정 에이전트 지정

```bash
# Claude Code에만 설치
npx add-skill vercel-labs/agent-skills -a claude-code -g

# 여러 에이전트에 동시 설치
npx add-skill vercel-labs/agent-skills -a claude-code -a gemini-cli -g
```

### 방법 4: 수동 설치 (Git Clone)

```bash
# 1. 저장소 클론
git clone https://github.com/vercel-labs/agent-skills.git

# 2. 원하는 에이전트 디렉토리로 복사
mkdir -p ~/.claude/skills
cp -r agent-skills/skills/* ~/.claude/skills/

# 3. 정리
rm -rf agent-skills
```

---

## 에이전트별 상세 설정

### Claude Code

Claude Code는 Agent Skills를 **기본 지원**합니다.

```bash
# 1. 스킬 설치
npx add-skill vercel-labs/agent-skills -a claude-code -g

# 2. 설치 확인
ls ~/.claude/skills/
# react-best-practices/  web-design-guidelines/  vercel-deploy-claimable/

# 3. Claude Code 실행
claude

# 4. 스킬 확인 (Claude Code 내에서)
/skills
```

**네트워크 설정 (vercel-deploy-claimable용):**

배포 스킬을 사용하려면 Vercel 도메인을 허용해야 합니다.

1. Claude.ai > Settings > Admin Settings > Capabilities
2. Allowed Domains에 추가:
   - `*.vercel.com`
   - `api.vercel.com`

### Gemini CLI

Gemini CLI는 현재 **Preview 단계**에서 Agent Skills를 지원합니다.

```bash
# 1. Preview 버전 설치 (Agent Skills 지원)
npm install -g @google/gemini-cli@preview

# 2. 스킬 디렉토리 생성
mkdir -p ~/.gemini/skills

# 3. 스킬 설치
npx add-skill vercel-labs/agent-skills -a gemini-cli -g

# 또는 수동 복사
cp -r agent-skills/skills/* ~/.gemini/skills/
```

**Agent Skills 활성화:**

Gemini CLI에서는 설정에서 활성화가 필요합니다.

```bash
# Gemini CLI 실행
gemini

# 설정 열기
/settings

# "Skills" 검색 → Agent Skills를 true로 변경
# ESC로 저장 후 종료
```

**스킬 확인:**

```bash
# Gemini CLI 내에서
/skills list

# 출력 예시:
# Available skills:
#   - react-best-practices
#   - web-design-guidelines
#   - vercel-deploy-claimable
```

### Cursor

Cursor는 프로젝트 knowledge 또는 스킬 디렉토리를 지원합니다.

```bash
# 프로젝트 레벨 설치
npx add-skill vercel-labs/agent-skills -a cursor

# 또는 수동으로 프로젝트에 추가
mkdir -p .cursor/skills
cp -r agent-skills/skills/* .cursor/skills/
```

---

## 여러 에이전트에서 스킬 공유하기

여러 에이전트를 사용한다면, **스킬을 한 곳에서 관리**하는 것이 효율적입니다.

### 심볼릭 링크 방식 (권장)

```bash
# 1. 공유 스킬 디렉토리 생성
mkdir -p ~/.shared-skills

# 2. 스킬 설치 (공유 디렉토리에)
cd ~/.shared-skills
npx add-skill vercel-labs/agent-skills --path .

# 또는 Git clone
git clone https://github.com/vercel-labs/agent-skills.git temp
cp -r temp/skills/* ./
rm -rf temp

# 3. 각 에이전트 디렉토리에 심볼릭 링크 생성
mkdir -p ~/.claude/skills
mkdir -p ~/.gemini/skills

# 스킬별로 링크
ln -s ~/.shared-skills/react-best-practices ~/.claude/skills/
ln -s ~/.shared-skills/react-best-practices ~/.gemini/skills/

ln -s ~/.shared-skills/web-design-guidelines ~/.claude/skills/
ln -s ~/.shared-skills/web-design-guidelines ~/.gemini/skills/

ln -s ~/.shared-skills/vercel-deploy-claimable ~/.claude/skills/
ln -s ~/.shared-skills/vercel-deploy-claimable ~/.gemini/skills/
```

### 한 번에 링크하는 스크립트

매번 명령어 치기 귀찮다면, 스크립트로 자동화하세요.

```bash
#!/bin/bash
# setup-skills.sh

SHARED_DIR="$HOME/.shared-skills"
AGENTS=("claude" "gemini" "cursor")

# 공유 디렉토리 생성
mkdir -p "$SHARED_DIR"

# 스킬 다운로드 (처음 한 번만)
if [ ! -d "$SHARED_DIR/react-best-practices" ]; then
  cd "$SHARED_DIR"
  git clone https://github.com/vercel-labs/agent-skills.git temp
  cp -r temp/skills/* ./
  rm -rf temp
fi

# 각 에이전트에 심볼릭 링크
for agent in "${AGENTS[@]}"; do
  AGENT_DIR="$HOME/.$agent/skills"
  mkdir -p "$AGENT_DIR"

  for skill in "$SHARED_DIR"/*/; do
    skill_name=$(basename "$skill")
    if [ ! -L "$AGENT_DIR/$skill_name" ]; then
      ln -s "$skill" "$AGENT_DIR/$skill_name"
      echo "Linked $skill_name to $agent"
    fi
  done
done

echo "Done! Skills shared across all agents."
```

**사용법:**

```bash
chmod +x setup-skills.sh
./setup-skills.sh
```

### 링크 확인

```bash
ls -la ~/.claude/skills/
# react-best-practices -> /home/user/.shared-skills/react-best-practices
# web-design-guidelines -> /home/user/.shared-skills/web-design-guidelines
# vercel-deploy-claimable -> /home/user/.shared-skills/vercel-deploy-claimable

ls -la ~/.gemini/skills/
# (동일한 심볼릭 링크)
```

### 장점

| 장점 | 설명 |
|------|------|
| **일관성** | 모든 에이전트가 동일한 스킬 버전 사용 |
| **업데이트 용이** | 한 곳만 업데이트하면 전체 반영 |
| **디스크 절약** | 중복 저장 없음 |
| **버전 관리** | Git으로 공유 디렉토리 관리 가능 |

---

## Claude Code vs Gemini CLI 비교

실제로 두 에이전트에서 같은 스킬이 어떻게 동작하는지 비교해봤습니다.

### 스킬 로딩 방식

| 항목 | Claude Code | Gemini CLI |
|------|-------------|------------|
| 지원 상태 | ✅ 정식 지원 | ⚠️ Preview |
| 자동 활성화 | ✅ | ✅ (설정 필요) |
| 스킬 확인 명령 | `/skills` | `/skills list` |
| 스크립트 실행 | ✅ 지원 | ⚠️ 제한적 |

### 트리거 테스트

**테스트 프롬프트:** `"React 컴포넌트 성능 검토해줘"`

**Claude Code:**
```
[react-best-practices 스킬 자동 활성화]
SKILL.md 로드 완료. 40+ 규칙 기반으로 검토합니다...
```

**Gemini CLI:**
```
[스킬 활성화 확인 프롬프트]
activate_skill: react-best-practices를 활성화하시겠습니까? (Y/n)
```

> Gemini CLI는 보안상 스킬 활성화 전 사용자 확인을 요청합니다.

### 배포 스킬 (vercel-deploy-claimable)

| 항목 | Claude Code | Gemini CLI |
|------|-------------|------------|
| 동작 여부 | ✅ 완벽 지원 | ⚠️ 네트워크 제한 |
| 스크립트 실행 | ✅ | ⚠️ 권한 필요 |
| 권장 여부 | ✅ 권장 | 코드 리뷰용으로만 |

**결론:**
- **배포까지 원한다면**: Claude Code
- **코드 리뷰만 원한다면**: 둘 다 OK

---

## 트러블슈팅

### "스킬이 인식되지 않아요"

**1. 디렉토리 위치 확인**

```bash
# Claude Code
ls ~/.claude/skills/

# Gemini CLI
ls ~/.gemini/skills/
```

**2. SKILL.md 파일 존재 확인**

```bash
cat ~/.claude/skills/react-best-practices/SKILL.md | head -10
```

**3. 에이전트 재시작**

```bash
# Claude Code
claude  # 새 세션 시작

# Gemini CLI
gemini  # 새 세션 시작
```

### "Gemini CLI에서 /skills list가 안 돼요"

**1. Preview 버전 확인**

```bash
gemini --version
# @google/gemini-cli@preview 이어야 함
```

**2. Agent Skills 활성화 확인**

```bash
gemini
/settings
# Skills → true 확인
```

### "심볼릭 링크가 안 돼요" (Windows)

Windows에서는 관리자 권한이 필요하거나, 개발자 모드를 활성화해야 합니다.

```powershell
# PowerShell (관리자 권한)
New-Item -ItemType SymbolicLink -Path "$env:USERPROFILE\.claude\skills\react-best-practices" -Target "$env:USERPROFILE\.shared-skills\react-best-practices"
```

또는 **Junction** 사용:

```cmd
mklink /J "%USERPROFILE%\.claude\skills\react-best-practices" "%USERPROFILE%\.shared-skills\react-best-practices"
```

### "vercel-deploy-claimable이 동작 안 해요"

**1. 네트워크 도메인 허용 확인**

Claude.ai에서:
- Settings > Capabilities > Allowed Domains
- `*.vercel.com` 추가

**2. 스크립트 실행 권한 확인**

```bash
ls -la ~/.claude/skills/vercel-deploy-claimable/scripts/
chmod +x ~/.claude/skills/vercel-deploy-claimable/scripts/*.sh
```

---

## 스킬 업데이트하기

Vercel이 스킬을 업데이트하면, 로컬에도 반영해야 합니다.

### 방법 1: add-skill 재실행

```bash
npx add-skill vercel-labs/agent-skills -g -y
# -y: 기존 스킬 덮어쓰기
```

### 방법 2: Git pull (공유 디렉토리 사용 시)

```bash
cd ~/.shared-skills
git pull origin main
```

### 자동 업데이트 스크립트

```bash
#!/bin/bash
# update-skills.sh

cd ~/.shared-skills

# 임시 디렉토리에 최신 버전 다운로드
git clone https://github.com/vercel-labs/agent-skills.git temp 2>/dev/null

# 스킬 업데이트
cp -r temp/skills/* ./

# 정리
rm -rf temp

echo "Skills updated!"
```

---

## 마무리

이번 편에서는 Agent Skills의 설치와 설정 방법을 알아봤습니다.

**핵심 정리:**

1. `npx add-skill`로 간편 설치
2. 에이전트별 스킬 디렉토리 위치 숙지
3. 심볼릭 링크로 멀티 에이전트 공유
4. Gemini CLI는 Preview 버전 + 설정 활성화 필요

다음 편에서는 실제로 **react-best-practices 스킬로 코드 리뷰**를 해보겠습니다.

---

## 다음 편 예고

**[Part 3: 실전! react-best-practices로 코드 최적화하기](/blog/agent-skills-part3)**

- 문제 있는 코드 → 최적화된 코드
- 실제 리뷰 과정 스크린샷
- 7가지 주요 이슈와 해결법

---

## 참고 자료

- [add-skill CLI GitHub](https://github.com/vercel-labs/add-skill)
- [Gemini CLI Skills 문서](https://geminicli.com/docs/cli/skills/)
- [Agent Skills Specification](https://agentskills.io/integrate-skills)

---

## 시리즈 전체 링크

1. [Part 1: Agent Skills란?](/blog/agent-skills-part1)
2. [Part 2: 설치 및 설정 가이드](/blog/agent-skills-part2) ← 현재 글
3. [Part 3: 실전 코드 리뷰](/blog/agent-skills-part3)
4. [Part 4: 나만의 스킬 만들기](/blog/agent-skills-part4)
