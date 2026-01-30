---
slug: agent-skills-part3
title: "[Agent Skills #3] 실전! react-best-practices로 코드 최적화하기"
authors: namyoungkim
tags: [ai, agent-skills, react, next-js, performance-optimization, code-review]
---

> 문제 있는 코드를 AI 에이전트가 어떻게 개선하는지 직접 확인해봅니다

<!-- truncate -->

## 들어가며

[Part 1](/blog/agent-skills-part1)에서 Agent Skills의 개념을, [Part 2](/blog/agent-skills-part2)에서 설치 방법을 알아봤습니다.

이번 편에서는 **실제로 react-best-practices 스킬이 어떻게 동작하는지** 확인해봅니다.

의도적으로 문제가 있는 코드를 작성하고, AI 에이전트에게 리뷰를 요청해보겠습니다.

---

## 실습 환경

- **에이전트**: Claude Code (또는 Gemini CLI)
- **스킬**: react-best-practices
- **샘플 코드**: Dashboard.tsx (7가지 성능 이슈 포함)

---

## Step 1: 문제 있는 코드 준비

다음은 **의도적으로 7가지 성능 이슈를 포함**한 React 컴포넌트입니다.

실제 프로덕션에서 흔히 볼 수 있는 패턴들이에요.

```tsx
// Dashboard.tsx - 문제가 있는 버전
'use client'

import { useState, useEffect } from 'react'
import { Check, X, Menu, Settings, User, Home } from 'lucide-react'  // ❶ Barrel import

// ❷ localStorage를 매번 읽음
function getTheme() {
  return localStorage.getItem('theme') ?? 'light'
}

// ❸ Request Waterfall - 순차적 데이터 페칭
async function fetchDashboardData(userId: string) {
  const user = await fetch(`/api/users/${userId}`).then(r => r.json())
  const posts = await fetch(`/api/posts?userId=${user.id}`).then(r => r.json())
  const comments = await fetch(`/api/comments?userId=${user.id}`).then(r => r.json())
  const notifications = await fetch(`/api/notifications?userId=${user.id}`).then(r => r.json())

  return { user, posts, comments, notifications }
}

export default function Dashboard({ userId }: { userId: string }) {
  // ❹ useState 초기값에서 무거운 연산
  const [settings, setSettings] = useState(
    JSON.parse(localStorage.getItem('userSettings') || '{}')
  )

  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [theme, setTheme] = useState(getTheme())

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      const result = await fetchDashboardData(userId)
      setData(result)
      setLoading(false)
    }
    loadData()
  }, [userId])

  // ❺ 여러 번 배열 순회 (filter → map → reduce)
  const activeItems = data?.posts?.filter((p: any) => p.active) || []
  const mappedItems = activeItems.map((p: any) => ({
    ...p,
    formattedDate: new Date(p.createdAt).toLocaleDateString()
  }))
  const totalLikes = mappedItems.reduce((sum: number, p: any) => sum + p.likes, 0)

  // ❻ 인라인 함수로 인한 불필요한 리렌더링
  const handleClick = () => {
    console.log('clicked')
  }

  if (loading) return <div>Loading...</div>

  return (
    <div style={{ padding: '20px' }}>
      <header style={{ display: 'flex', gap: '10px' }}>
        <Home /><User /><Settings /><Menu />
      </header>

      <div style={{ marginTop: '20px' }}>
        <h1>Welcome, {data?.user?.name}</h1>
        <p>Total Likes: {totalLikes}</p>
      </div>

      {mappedItems.map((post: any) => (
        <div key={post.id} onClick={handleClick}>
          <h3>{post.title}</h3>
          <button onClick={() => console.log('like', post.id)}>
            <Check /> Like
          </button>
        </div>
      ))}

      {/* ❼ Heavy component가 항상 로드됨 */}
      <HeavyAnalyticsChart data={data?.posts || []} />
    </div>
  )
}

function HeavyAnalyticsChart({ data }: { data: any[] }) {
  return <div>Analytics Chart ({data.length} items)</div>
}
```

**포함된 7가지 이슈:**

| # | 이슈 | 영향 |
|---|------|------|
| ❶ | Barrel Import | 번들 사이즈 증가 |
| ❷ | localStorage 반복 읽기 | 동기 I/O 반복 |
| ❸ | Request Waterfall | 800ms+ 지연 |
| ❹ | useState 무거운 초기값 | 매 렌더마다 파싱 |
| ❺ | 다중 배열 순회 | O(3n) 복잡도 |
| ❻ | 인라인 함수 | 불필요한 리렌더링 |
| ❼ | Heavy Component 즉시 로드 | 초기 번들 증가 |

---

## Step 2: AI 에이전트에게 리뷰 요청

### Claude Code에서

```bash
# 프로젝트 디렉토리에서 Claude Code 실행
claude

# 리뷰 요청
> Dashboard.tsx 파일의 성능 이슈를 검토해줘
```

### Gemini CLI에서

```bash
gemini

> Dashboard.tsx 성능 검토해줘
```

---

## Step 3: AI 에이전트의 분석 결과

스킬이 활성화되면, 에이전트는 다음과 같이 응답합니다.

```
[react-best-practices 스킬 활성화]

Dashboard.tsx를 분석한 결과, 7가지 성능 이슈를 발견했습니다.

🔴 Critical (즉시 수정 권장)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Request Waterfall (Line 13-18)
   - 현재: 순차 fetch로 ~800ms 소요
   - 권장: Promise.all()로 병렬 처리 (~200ms)
   - 예상 개선: 75% 지연 감소

2. Barrel Import (Line 3)
   - 현재: lucide-react 전체 번들 로드
   - 권장: next.config.js에 optimizePackageImports 설정
   - 예상 개선: 번들 30% 감소

🟠 High Priority
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
3. useState 무거운 초기값 (Line 23-25)
   - 현재: 매 렌더마다 JSON.parse 실행
   - 권장: Lazy initialization 사용

4. Heavy Component 즉시 로드 (Line 58)
   - 현재: HeavyAnalyticsChart가 항상 번들에 포함
   - 권장: dynamic import로 지연 로딩

🟡 Medium Priority
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
5. 다중 배열 순회 (Line 37-43)
   - 현재: filter → map → reduce (3회 순회)
   - 권장: 단일 reduce로 통합

6. localStorage 반복 읽기 (Line 6-8)
   - 현재: 호출마다 동기 I/O
   - 권장: 메모리 캐싱

7. 인라인 함수 (Line 45-47)
   - 현재: 매 렌더마다 새 함수 생성
   - 권장: useCallback 사용

수정된 코드를 생성할까요?
```

---

## Step 4: 개선된 코드 확인

에이전트에게 "수정해줘"라고 요청하면, 다음과 같이 개선된 코드를 생성합니다.

```tsx
// DashboardOptimized.tsx - 최적화된 버전
'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import dynamic from 'next/dynamic'

// ✅ Rule 2: next.config.js에 optimizePackageImports 설정 권장
import { Check, X, Menu, Settings, User, Home } from 'lucide-react'

// ✅ Rule 5: Heavy component는 dynamic import로 지연 로딩
const HeavyAnalyticsChart = dynamic(
  () => import('./HeavyAnalyticsChart'),
  {
    loading: () => <div className="animate-pulse h-64 bg-gray-200 rounded" />,
    ssr: false
  }
)

// ✅ Rule 6: localStorage 읽기 캐싱
let cachedTheme: string | null = null
function getTheme() {
  if (cachedTheme === null && typeof window !== 'undefined') {
    cachedTheme = localStorage.getItem('theme') ?? 'light'
  }
  return cachedTheme ?? 'light'
}

// ✅ Rule 1: Request Waterfall 제거 - 병렬 데이터 페칭
async function fetchDashboardData(userId: string) {
  const [user, posts, comments, notifications] = await Promise.all([
    fetch(`/api/users/${userId}`).then(r => r.json()),
    fetch(`/api/posts?userId=${userId}`).then(r => r.json()),
    fetch(`/api/comments?userId=${userId}`).then(r => r.json()),
    fetch(`/api/notifications?userId=${userId}`).then(r => r.json())
  ])
  // 순차: 800ms → 병렬: ~200ms (75% 감소)

  return { user, posts, comments, notifications }
}

interface Post {
  id: string
  title: string
  active: boolean
  createdAt: string
  likes: number
}

interface DashboardData {
  user: { id: string; name: string }
  posts: Post[]
}

export default function DashboardOptimized({ userId }: { userId: string }) {
  // ✅ Rule 4: useState 초기값 lazy initialization
  const [settings, setSettings] = useState(() => {
    if (typeof window === 'undefined') return {}
    return JSON.parse(localStorage.getItem('userSettings') || '{}')
  })

  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [theme, setTheme] = useState(getTheme)

  // ✅ 개선: cleanup 함수 추가
  useEffect(() => {
    let isMounted = true

    const loadData = async () => {
      try {
        setLoading(true)
        const result = await fetchDashboardData(userId)
        if (isMounted) setData(result)
      } catch (err) {
        if (isMounted) setError(err as Error)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadData()
    return () => { isMounted = false }
  }, [userId])

  // ✅ Rule 7: 여러 배열 순회를 단일 reduce + useMemo로 통합
  const { mappedItems, totalLikes } = useMemo(() => {
    if (!data?.posts) return { mappedItems: [], totalLikes: 0 }

    return data.posts.reduce(
      (acc, post) => {
        if (post.active) {
          acc.mappedItems.push({
            ...post,
            formattedDate: new Date(post.createdAt).toLocaleDateString()
          })
          acc.totalLikes += post.likes
        }
        return acc
      },
      { mappedItems: [] as (Post & { formattedDate: string })[], totalLikes: 0 }
    )
  }, [data?.posts])

  // ✅ useCallback으로 함수 참조 안정화
  const handleCardClick = useCallback((postId: string) => {
    console.log('clicked', postId)
  }, [])

  const handleLike = useCallback((postId: string) => {
    console.log('like', postId)
  }, [])

  if (loading) {
    return (
      <div className="p-5 space-y-4 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4" />
        <div className="h-32 bg-gray-200 rounded" />
      </div>
    )
  }

  if (error) {
    return <div className="p-5 text-red-500">Error: {error.message}</div>
  }

  return (
    <div className="p-5">
      <header className="flex gap-2.5">
        <Home className="w-5 h-5" />
        <User className="w-5 h-5" />
        <Settings className="w-5 h-5" />
        <Menu className="w-5 h-5" />
      </header>

      <div className="mt-5 p-4 border rounded-lg">
        <h1 className="text-xl font-bold">Welcome, {data?.user?.name}</h1>
        <p className="text-gray-600">Total Likes: {totalLikes}</p>
      </div>

      <div className="mt-5 space-y-2.5">
        {mappedItems.map((post) => (
          <article
            key={post.id}
            className="p-4 border rounded-lg cursor-pointer hover:shadow-md"
            onClick={() => handleCardClick(post.id)}
          >
            <h3 className="font-semibold">{post.title}</h3>
            <time className="text-sm text-gray-500">{post.formattedDate}</time>
            <button
              className="mt-2 flex items-center gap-1 px-3 py-1 bg-green-100 rounded"
              onClick={(e) => {
                e.stopPropagation()
                handleLike(post.id)
              }}
            >
              <Check className="w-4 h-4" /> Like
            </button>
          </article>
        ))}
      </div>

      {/* ✅ Dynamic import로 필요할 때만 로드 */}
      <HeavyAnalyticsChart data={data?.posts || []} />
    </div>
  )
}
```

---

## Step 5: 개선 효과 정리

### 성능 지표 비교

| 지표 | Before | After | 개선율 |
|------|--------|-------|--------|
| 데이터 로딩 | ~800ms | ~200ms | **75%↓** |
| 초기 번들 | 100% | ~70% | **30%↓** |
| 배열 순회 | O(3n) | O(n) | **66%↓** |
| 리렌더링 | 많음 | 최소화 | **감소** |

### 코드 품질 개선

| 항목 | Before | After |
|------|--------|-------|
| 타입 안정성 | `any` 사용 | 인터페이스 정의 |
| 에러 처리 | 없음 | try-catch + 상태 |
| 로딩 UI | 텍스트만 | 스켈레톤 UI |
| 메모리 관리 | cleanup 없음 | isMounted 패턴 |

---

## 주요 규칙 상세 설명

### 🔴 Rule 1: Request Waterfall 제거

**가장 임팩트가 큰 최적화**입니다.

```typescript
// ❌ Waterfall: 순차 실행
const user = await getUser()        // 200ms
const posts = await getPosts()      // 200ms
const comments = await getComments() // 200ms
// Total: 600ms

// ✅ Parallel: 병렬 실행
const [user, posts, comments] = await Promise.all([
  getUser(),    // 200ms ─┐
  getPosts(),   // 200ms ─┼─ 동시 실행
  getComments() // 200ms ─┘
])
// Total: ~200ms
```

**시각화:**

```
Waterfall:
|--user--|--posts--|--comments--|  = 600ms

Parallel:
|--user--|
|--posts--|                        = 200ms
|--comments--|
```

### 🔴 Rule 2: Bundle Size 최적화

```javascript
// next.config.js
module.exports = {
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@mui/material',
      'lodash',
      'date-fns'
    ]
  }
}
```

이 설정 하나로:
- 개발 서버 부팅: **15-70% 빨라짐**
- 빌드 시간: **28% 빨라짐**
- 콜드 스타트: **40% 빨라짐**

### 🟠 Rule 4: Lazy Initialization

```typescript
// ❌ 매 렌더마다 JSON.parse 실행
const [data, setData] = useState(
  JSON.parse(localStorage.getItem('data') || '{}')
)

// ✅ 초기 렌더에서만 실행
const [data, setData] = useState(() => {
  if (typeof window === 'undefined') return {}
  return JSON.parse(localStorage.getItem('data') || '{}')
})
```

### 🟠 Rule 5: Dynamic Import

```typescript
// ❌ 항상 번들에 포함
import HeavyChart from './HeavyChart'

// ✅ 필요할 때만 로드
const HeavyChart = dynamic(() => import('./HeavyChart'), {
  loading: () => <Skeleton />,
  ssr: false
})
```

### 🟡 Rule 7: 배열 순회 최적화

```typescript
// ❌ 3번 순회
const active = items.filter(i => i.active)      // 1회
const mapped = active.map(i => transform(i))    // 2회
const total = mapped.reduce((a, b) => a + b, 0) // 3회

// ✅ 1번 순회
const { mapped, total } = items.reduce((acc, item) => {
  if (item.active) {
    acc.mapped.push(transform(item))
    acc.total += item.value
  }
  return acc
}, { mapped: [], total: 0 })
```

---

## 실전 팁

### 1. 점진적으로 적용하기

모든 규칙을 한 번에 적용할 필요 없습니다.

**우선순위 순서:**
1. 🔴 Request Waterfall 제거 (가장 큰 효과)
2. 🔴 Bundle Size 최적화 (next.config.js 한 줄)
3. 🟠 Dynamic Import (무거운 컴포넌트만)
4. 나머지는 점진적으로

### 2. 측정하기

개선 전후로 성능을 측정하세요.

```bash
# Lighthouse 실행
npx lighthouse http://localhost:3000 --view

# Bundle 분석
ANALYZE=true npm run build
```

### 3. 팀에 공유하기

스킬을 프로젝트 레벨로 설치하면 팀 전체가 같은 기준으로 리뷰받을 수 있습니다.

```bash
# 프로젝트에 스킬 추가
npx add-skill vercel-labs/agent-skills --skill react-best-practices

# .claude/skills/ 또는 .gemini/skills/가 생성됨
# 이를 Git에 커밋하면 팀 전체가 사용 가능
```

---

## 마무리

이번 편에서는 react-best-practices 스킬을 사용해 **실제 코드 리뷰**를 진행해봤습니다.

**핵심 포인트:**

1. 의도적으로 문제 있는 코드 작성
2. AI 에이전트에게 리뷰 요청
3. 40+ 규칙 기반의 자동 분석
4. 개선된 코드 생성
5. 75% 성능 향상 달성

다음 편에서는 **나만의 커스텀 스킬을 만드는 방법**을 알아보겠습니다.

---

## 다음 편 예고

**[Part 4: 나만의 Agent Skill 만들기](/blog/agent-skills-part4)**

- SKILL.md 작성법
- 스크립트 추가하기
- 팀 컨벤션을 스킬로 패키징
- 배포 및 공유 방법

---

## 참고 자료

- [Vercel Blog: How We Made the Dashboard 2x Faster](https://vercel.com/blog/how-we-made-the-vercel-dashboard-twice-as-fast)
- [Vercel Blog: Package Import Optimization](https://vercel.com/blog/how-we-optimized-package-imports-in-next-js)
- [React Best Practices AGENTS.md](https://github.com/vercel-labs/agent-skills/blob/main/skills/react-best-practices/AGENTS.md)

---

## 시리즈 전체 링크

1. [Part 1: Agent Skills란?](/blog/agent-skills-part1)
2. [Part 2: 설치 및 설정 가이드](/blog/agent-skills-part2)
3. [Part 3: 실전 코드 리뷰](/blog/agent-skills-part3) ← 현재 글
4. [Part 4: 나만의 스킬 만들기](/blog/agent-skills-part4)
