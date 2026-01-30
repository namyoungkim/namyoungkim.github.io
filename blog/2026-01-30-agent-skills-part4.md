---
slug: agent-skills-part4
title: "[Agent Skills #4] 나만의 Agent Skill 만들기"
authors: namyoungkim
tags: [ai, agent-skills, custom-skill, team-convention, automation]
---

> 팀 컨벤션부터 자동화 워크플로우까지, 커스텀 스킬로 패키징하는 방법

<!-- truncate -->

## 들어가며

지금까지 Vercel이 제공하는 스킬을 사용해봤습니다.

하지만 Agent Skills의 진정한 힘은 **나만의 스킬을 만들 수 있다**는 점입니다.

- 팀 코딩 컨벤션
- 프로젝트별 워크플로우
- 반복되는 작업 자동화
- 도메인 전문 지식

이 모든 것을 스킬로 패키징해서 AI 에이전트에게 전달할 수 있습니다.

---

## 스킬의 기본 구조

Agent Skill은 단순한 **폴더**입니다.

```
my-skill/
├── SKILL.md          # 필수: 스킬 정의 파일
├── scripts/          # 선택: 자동화 스크립트
│   └── check.sh
└── references/       # 선택: 참고 문서
    └── examples.md
```

최소 요구사항은 `SKILL.md` 파일 하나뿐입니다.

---

## SKILL.md 작성법

### 기본 구조

````markdown
---
name: my-skill
description: 스킬이 언제 사용되어야 하는지 설명. 트리거 문구 포함.
---

# 스킬 제목

스킬에 대한 상세 설명과 지침.

## 규칙 또는 가이드라인

1. 첫 번째 규칙
2. 두 번째 규칙

## 예시

좋은 예시와 나쁜 예시 포함.
````

### Frontmatter (YAML 헤더)

```yaml
---
name: my-skill                    # 필수: 스킬 이름 (kebab-case)
description: 스킬 설명             # 필수: 언제 이 스킬을 사용할지
version: 1.0.0                    # 선택: 버전
author: your-name                 # 선택: 작성자
license: MIT                      # 선택: 라이센스
---
```

**중요:** `description`이 스킬 활성화의 핵심입니다.

에이전트는 사용자의 요청과 `description`을 매칭해서 스킬 활성화 여부를 결정합니다.

### 좋은 description 작성법

```yaml
# ❌ 너무 모호함
description: 코드 관련 도움

# ❌ 너무 일반적
description: React 개발 도움

# ✅ 구체적 + 트리거 문구 포함
description: React 컴포넌트의 성능 이슈를 검토합니다. "성능 검토해줘", "최적화해줘", "느린 것 같아" 등의 요청에 사용됩니다.

# ✅ 액션 기반
description: Git 커밋 메시지를 Conventional Commits 형식으로 작성합니다. "커밋 메시지 만들어줘", "커밋해줘" 요청 시 활성화됩니다.
```

---

## 실전 예제 1: 팀 코딩 컨벤션 스킬

우리 팀만의 코딩 규칙을 스킬로 만들어봅시다.

### 디렉토리 구조

```
team-conventions/
└── SKILL.md
```

### SKILL.md

````markdown
---
name: team-conventions
description: 우리 팀의 코딩 컨벤션을 적용합니다. 코드 작성, 리뷰, PR 생성 시 자동으로 활성화됩니다.
version: 1.0.0
author: Team Alpha
---

# Team Alpha 코딩 컨벤션

이 스킬은 우리 팀의 코딩 표준을 정의합니다.
코드 작성 및 리뷰 시 이 규칙을 따라주세요.

## 파일 및 폴더 구조

```
src/
├── components/       # React 컴포넌트
│   ├── ui/          # 재사용 가능한 UI 컴포넌트
│   └── features/    # 기능별 컴포넌트
├── hooks/           # 커스텀 훅
├── lib/             # 유틸리티 함수
├── types/           # TypeScript 타입 정의
└── styles/          # 글로벌 스타일
```

## 네이밍 규칙

### 파일명
- 컴포넌트: `PascalCase.tsx` (예: `UserProfile.tsx`)
- 훅: `useCamelCase.ts` (예: `useAuth.ts`)
- 유틸리티: `camelCase.ts` (예: `formatDate.ts`)
- 타입: `camelCase.types.ts` (예: `user.types.ts`)

### 변수/함수명
- 변수: `camelCase`
- 상수: `SCREAMING_SNAKE_CASE`
- 함수: `camelCase` (동사로 시작)
- 컴포넌트: `PascalCase`
- 타입/인터페이스: `PascalCase`

## 컴포넌트 작성 규칙

### 1. 함수형 컴포넌트만 사용

```tsx
// ✅ Good
export function UserCard({ user }: UserCardProps) {
  return <div>{user.name}</div>
}

// ❌ Bad: 클래스 컴포넌트
class UserCard extends React.Component { ... }
```

### 2. Props 인터페이스는 컴포넌트 위에 정의

```tsx
// ✅ Good
interface UserCardProps {
  user: User
  onSelect?: (id: string) => void
}

export function UserCard({ user, onSelect }: UserCardProps) {
  // ...
}
```

### 3. 한 파일에 하나의 컴포넌트

예외: 작은 서브 컴포넌트는 같은 파일에 둘 수 있음

### 4. 컴포넌트 내부 순서

```tsx
export function MyComponent({ prop }: Props) {
  // 1. 훅 선언 (useState, useEffect 등)
  const [state, setState] = useState()

  // 2. 파생 상태 / 계산
  const derived = useMemo(() => ..., [])

  // 3. 이벤트 핸들러
  const handleClick = useCallback(() => ..., [])

  // 4. 이펙트
  useEffect(() => ..., [])

  // 5. 조건부 렌더링 (early return)
  if (loading) return <Skeleton />

  // 6. 메인 렌더링
  return (...)
}
```

## Import 순서

```tsx
// 1. React 관련
import { useState, useEffect } from 'react'

// 2. 외부 라이브러리
import { format } from 'date-fns'
import { clsx } from 'clsx'

// 3. 내부 컴포넌트
import { Button } from '@/components/ui'
import { UserCard } from '@/components/features'

// 4. 훅
import { useAuth } from '@/hooks/useAuth'

// 5. 유틸리티
import { formatCurrency } from '@/lib/format'

// 6. 타입 (type import 사용)
import type { User } from '@/types/user.types'

// 7. 스타일
import styles from './MyComponent.module.css'
```

## 금지 사항

- ❌ `any` 타입 사용 금지 (불가피한 경우 주석 필수)
- ❌ `console.log` 커밋 금지 (디버깅 후 제거)
- ❌ 매직 넘버 사용 금지 (상수로 정의)
- ❌ 인라인 스타일 사용 금지 (Tailwind 또는 CSS Module 사용)

## 커밋 메시지 형식

Conventional Commits를 따릅니다:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Type:**
- `feat`: 새로운 기능
- `fix`: 버그 수정
- `docs`: 문서 변경
- `style`: 포맷팅, 세미콜론 등
- `refactor`: 리팩토링
- `test`: 테스트 추가/수정
- `chore`: 빌드, 설정 변경

**예시:**
```
feat(auth): 소셜 로그인 추가

- Google OAuth 연동
- Kakao OAuth 연동

Closes #123
```
````

### 설치 및 사용

```bash
# 스킬 디렉토리에 복사
cp -r team-conventions ~/.claude/skills/

# 또는 프로젝트에 추가 (팀 공유용)
cp -r team-conventions .claude/skills/
git add .claude/skills/team-conventions
git commit -m "chore: 팀 컨벤션 스킬 추가"
```

---

## 실전 예제 2: 자동화 스크립트 포함 스킬

스크립트를 포함해서 실제 작업을 자동화할 수 있습니다.

### 디렉토리 구조

```
lint-fix/
├── SKILL.md
└── scripts/
    └── lint-fix.sh
```

### SKILL.md

````markdown
---
name: lint-fix
description: 코드 린팅 및 자동 수정을 실행합니다. "린트 돌려줘", "코드 정리해줘", "포맷팅해줘" 요청 시 사용됩니다.
version: 1.0.0
---

# Lint & Fix 스킬

코드 품질을 자동으로 검사하고 수정합니다.

## 사용 방법

```bash
bash ~/.claude/skills/lint-fix/scripts/lint-fix.sh [path]
```

## 포함된 검사

1. **ESLint**: JavaScript/TypeScript 린팅
2. **Prettier**: 코드 포맷팅
3. **TypeScript**: 타입 체크

## 스크립트 동작

1. ESLint --fix 실행
2. Prettier --write 실행
3. tsc --noEmit 실행
4. 결과 요약 출력
````

### scripts/lint-fix.sh

```bash
#!/bin/bash

# lint-fix.sh - 코드 린팅 및 자동 수정

set -e

TARGET_PATH="${1:-.}"
echo "🔍 린팅 시작: $TARGET_PATH"

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ESLint
echo -e "\n${YELLOW}[1/3] ESLint 실행 중...${NC}"
if npx eslint "$TARGET_PATH" --fix --ext .js,.jsx,.ts,.tsx 2>/dev/null; then
    echo -e "${GREEN}✓ ESLint 완료${NC}"
else
    echo -e "${RED}✗ ESLint 오류 발견${NC}"
fi

# Prettier
echo -e "\n${YELLOW}[2/3] Prettier 실행 중...${NC}"
if npx prettier "$TARGET_PATH" --write --ignore-unknown 2>/dev/null; then
    echo -e "${GREEN}✓ Prettier 완료${NC}"
else
    echo -e "${RED}✗ Prettier 오류${NC}"
fi

# TypeScript
echo -e "\n${YELLOW}[3/3] TypeScript 타입 체크 중...${NC}"
if npx tsc --noEmit 2>/dev/null; then
    echo -e "${GREEN}✓ TypeScript 타입 체크 완료${NC}"
else
    echo -e "${RED}✗ TypeScript 타입 오류 발견${NC}"
fi

echo -e "\n${GREEN}🎉 린팅 완료!${NC}"
```

### 스크립트 권한 설정

```bash
chmod +x ~/.claude/skills/lint-fix/scripts/lint-fix.sh
```

---

## 실전 예제 3: 도메인 지식 스킬

특정 도메인의 전문 지식을 스킬로 패키징할 수 있습니다.

### 예: 주식 투자 분석 스킬

```
stock-analysis/
├── SKILL.md
└── references/
    ├── valuation-methods.md
    └── financial-ratios.md
```

### SKILL.md

````markdown
---
name: stock-analysis
description: 주식 가치 투자 분석을 도와줍니다. "이 종목 분석해줘", "밸류에이션 계산해줘", "재무제표 분석" 요청 시 활성화됩니다.
version: 1.0.0
author: Leo
---

# 주식 가치 투자 분석 스킬

가치 투자 관점에서 기업을 분석하는 프레임워크입니다.

## 분석 프레임워크

### 1단계: 사업 이해
- 회사가 무엇을 하는가?
- 어떻게 돈을 버는가?
- 경쟁 우위(Moat)가 있는가?

### 2단계: 재무 분석

#### 핵심 지표
| 지표 | 좋은 기준 | 설명 |
|------|----------|------|
| ROE | > 15% | 자기자본이익률 |
| ROA | > 7% | 총자산이익률 |
| 영업이익률 | > 10% | 본업 수익성 |
| 부채비율 | < 100% | 재무 안정성 |
| 유동비율 | > 150% | 단기 지급 능력 |

#### 밸류에이션 지표
| 지표 | 저평가 기준 | 주의 |
|------|------------|------|
| PER | < 15 | 업종 평균과 비교 필요 |
| PBR | < 1.5 | 자산 가치 대비 |
| PSR | < 2 | 성장주에 적합 |
| EV/EBITDA | < 10 | 기업가치 대비 |

### 3단계: 적정 가치 산출

#### DCF (현금흐름할인법)
```
적정가치 = Σ(FCF_t / (1+r)^t) + 터미널밸류
```

#### 상대가치법
```
적정주가 = 예상EPS × 목표PER
목표PER = 업종 평균 PER × (1 + 성장 프리미엄)
```

### 4단계: 안전마진 확인

- **매수 기준**: 적정가치 대비 30% 이상 할인
- **관망**: 적정가치 ±10% 범위
- **매도 고려**: 적정가치 대비 20% 이상 고평가

## 체크리스트

투자 전 확인사항:

- [ ] 사업을 이해했는가?
- [ ] 경쟁우위가 지속 가능한가?
- [ ] 경영진이 신뢰할 만한가?
- [ ] 재무상태가 건전한가?
- [ ] 현재 가격이 적정가치 대비 저렴한가?
- [ ] 최소 3년 이상 보유할 수 있는가?

## 참고

- references/valuation-methods.md: 밸류에이션 방법론 상세
- references/financial-ratios.md: 재무비율 계산식
````

---

## 고급 기법

### 1. 다른 스킬 참조하기

스킬 내에서 다른 스킬을 참조할 수 있습니다.

```markdown
## 관련 스킬

이 작업과 함께 다음 스킬도 활용하세요:

- `react-best-practices`: 성능 최적화 필요 시
- `team-conventions`: 코드 컨벤션 확인 시
```

### 2. 조건부 지침

```markdown
## 환경별 지침

### 개발 환경 (NODE_ENV=development)
- 상세한 에러 로깅 활성화
- Hot reload 사용

### 프로덕션 환경 (NODE_ENV=production)
- 에러 로깅 최소화
- 소스맵 비활성화
- 번들 최적화 필수
```

### 3. 버전별 지침

```markdown
## 버전 호환성

### Next.js 14+
- App Router 사용
- Server Components 기본

### Next.js 13 이하
- Pages Router 사용
- getServerSideProps 패턴
```

### 4. 스킬 검증 스크립트

```bash
# validate-skill.sh
#!/bin/bash

SKILL_PATH="$1"

# SKILL.md 존재 확인
if [ ! -f "$SKILL_PATH/SKILL.md" ]; then
    echo "❌ SKILL.md not found"
    exit 1
fi

# Frontmatter 확인
if ! head -1 "$SKILL_PATH/SKILL.md" | grep -q "^---$"; then
    echo "❌ Missing frontmatter"
    exit 1
fi

# name 필드 확인
if ! grep -q "^name:" "$SKILL_PATH/SKILL.md"; then
    echo "❌ Missing 'name' field"
    exit 1
fi

# description 필드 확인
if ! grep -q "^description:" "$SKILL_PATH/SKILL.md"; then
    echo "❌ Missing 'description' field"
    exit 1
fi

echo "✅ Skill validation passed!"
```

---

## 스킬 배포 및 공유

### 방법 1: Git 저장소

```bash
# 1. 저장소 생성
mkdir my-agent-skills
cd my-agent-skills
git init

# 2. 스킬 추가
mkdir -p skills/team-conventions
# SKILL.md 작성...

# 3. 푸시
git remote add origin git@github.com:username/my-agent-skills.git
git push -u origin main

# 4. 팀원이 설치
npx add-skill username/my-agent-skills
```

### 방법 2: 프로젝트 내 포함

```bash
# 프로젝트에 스킬 디렉토리 생성
mkdir -p .claude/skills/team-conventions

# Git에 커밋
git add .claude/skills
git commit -m "chore: add team convention skill"

# 팀원은 clone만 하면 자동으로 스킬 사용 가능
```

### 방법 3: npm 패키지 (고급)

```json
// package.json
{
  "name": "@myteam/agent-skills",
  "version": "1.0.0",
  "files": ["skills/**/*"],
  "scripts": {
    "postinstall": "node scripts/install-skills.js"
  }
}
```

---

## 스킬 작성 베스트 프랙티스

### 1. 명확한 범위 설정

```markdown
# ✅ 좋은 예: 범위가 명확
name: react-testing
description: React 컴포넌트 테스트 작성을 도와줍니다.

# ❌ 나쁜 예: 범위가 모호
name: helper
description: 개발을 도와줍니다.
```

### 2. 구체적인 예시 포함

````markdown
## 예시

### ✅ 좋은 예
```tsx
function UserCard({ user }: { user: User }) {
  return <div data-testid="user-card">{user.name}</div>
}
```

### ❌ 피해야 할 예
```tsx
function UserCard(props: any) {
  return <div>{props.user.name}</div>
}
```
````

### 3. 컨텍스트 효율성 고려

```markdown
<!-- 스킬이 너무 길면 토큰을 많이 소비함 -->
<!-- 핵심만 포함하고, 상세 내용은 references/에 분리 -->

## 핵심 규칙 (5가지)

1. 규칙 1
2. 규칙 2
...

## 상세 가이드

자세한 내용은 `references/detailed-guide.md`를 참조하세요.
```

### 4. 트리거 문구 명시

```markdown
description: |
  API 엔드포인트를 설계합니다.
  트리거: "API 만들어줘", "엔드포인트 설계", "REST API", "GraphQL 스키마"
```

---

## 마무리

이번 시리즈를 통해 Agent Skills의 모든 것을 알아봤습니다.

### 시리즈 요약

| Part | 내용 |
|------|------|
| Part 1 | Agent Skills 개념, Vercel 스킬 소개 |
| Part 2 | 설치, 설정, 멀티 에이전트 공유 |
| Part 3 | 실전 코드 리뷰 예시 |
| Part 4 | 커스텀 스킬 제작 |

### 핵심 포인트

1. **Agent Skills = AI 에이전트용 플러그인**
2. **SKILL.md 하나로 시작** 가능
3. **팀 지식을 코드화**해서 공유
4. **반복 작업을 스킬로 자동화**
5. **오픈 표준**이라 여러 에이전트에서 사용 가능

### 다음 단계

- 팀 컨벤션을 스킬로 만들어보세요
- 반복되는 작업을 자동화해보세요
- 만든 스킬을 팀과 공유해보세요
- 커뮤니티에 기여해보세요!

---

## 참고 자료

- [Agent Skills Specification](https://agentskills.io/specification)
- [Agent Skills Integration Guide](https://agentskills.io/integrate-skills)
- [Anthropic Skills Examples](https://github.com/anthropics/skills)
- [Vercel Agent Skills](https://github.com/vercel-labs/agent-skills)
- [add-skill CLI](https://github.com/vercel-labs/add-skill)

---

## 시리즈 전체 링크

1. [Part 1: Agent Skills란?](/blog/agent-skills-part1)
2. [Part 2: 설치 및 설정 가이드](/blog/agent-skills-part2)
3. [Part 3: 실전 코드 리뷰](/blog/agent-skills-part3)
4. [Part 4: 나만의 스킬 만들기](/blog/agent-skills-part4) ← 현재 글
