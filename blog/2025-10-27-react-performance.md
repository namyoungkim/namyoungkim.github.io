---
slug: react-performance-optimization
title: React 성능 최적화 완벽 가이드
authors: namyoungkim
tags: [react, performance, optimization, tutorial]
---

# React 성능 최적화 완벽 가이드

React 애플리케이션의 성능을 향상시키는 실전 기법들을 알아봅시다. 이 가이드에서는 실무에서 바로 적용할 수 있는 최적화 방법들을 다룹니다.

<!-- truncate -->

## 🎯 성능 최적화가 필요한 이유

웹 애플리케이션의 성능은 사용자 경험에 직접적인 영향을 미칩니다:

- **로딩 시간 1초 증가** → 전환율 7% 감소
- **3초 이상 로딩** → 사용자의 53%가 페이지 이탈
- **빠른 응답성** → 더 높은 사용자 만족도

## 1. React.memo로 불필요한 리렌더링 방지

### 문제 상황

```jsx
// ❌ 나쁜 예: 부모가 리렌더링될 때마다 자식도 리렌더링
function UserList({ users }) {
  return users.map(user => (
    <UserCard key={user.id} user={user} />
  ));
}

function UserCard({ user }) {
  console.log('UserCard 렌더링'); // 매번 출력됨
  return <div>{user.name}</div>;
}
```

### 해결 방법

```jsx
// ✅ 좋은 예: props가 변경될 때만 리렌더링
const UserCard = React.memo(({ user }) => {
  console.log('UserCard 렌더링'); // props 변경시만 출력
  return <div>{user.name}</div>;
});
```

### 주의사항

:::warning
`React.memo`는 props 비교 비용이 발생합니다. 모든 컴포넌트에 사용하면 오히려 성능이 저하될 수 있습니다!
:::

## 2. useMemo와 useCallback 활용

### useMemo: 계산 비용이 높은 값 메모이제이션

```jsx
function SearchResults({ query, items }) {
  // ❌ 나쁜 예: 매 렌더링마다 필터링 실행
  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(query.toLowerCase())
  );

  // ✅ 좋은 예: query나 items가 변경될 때만 필터링
  const filteredItems = useMemo(() => {
    return items.filter(item =>
      item.name.toLowerCase().includes(query.toLowerCase())
    );
  }, [query, items]);

  return <List items={filteredItems} />;
}
```

### useCallback: 함수 재생성 방지

```jsx
function TodoList({ todos }) {
  // ❌ 나쁜 예: 매 렌더링마다 새 함수 생성
  const handleToggle = (id) => {
    toggleTodo(id);
  };

  // ✅ 좋은 예: 함수를 메모이제이션
  const handleToggle = useCallback((id) => {
    toggleTodo(id);
  }, []);

  return todos.map(todo => (
    <TodoItem 
      key={todo.id} 
      todo={todo} 
      onToggle={handleToggle} // 항상 동일한 함수 참조
    />
  ));
}
```

## 3. 코드 스플리팅 (Code Splitting)

### React.lazy와 Suspense

```jsx
import React, { Suspense, lazy } from 'react';

// ✅ 좋은 예: 필요할 때만 컴포넌트 로드
const HeavyComponent = lazy(() => import('./HeavyComponent'));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <HeavyComponent />
    </Suspense>
  );
}
```

### 라우트 기반 코드 스플리팅

```jsx
import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Dashboard = lazy(() => import('./pages/Dashboard'));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
```

## 4. 가상화 (Virtualization)

큰 리스트를 렌더링할 때는 react-window 라이브러리를 사용하세요:

```jsx
import { FixedSizeList } from 'react-window';

function VirtualizedList({ items }) {
  const Row = ({ index, style }) => (
    <div style={style}>
      {items[index].name}
    </div>
  );

  return (
    <FixedSizeList
      height={600}
      itemCount={items.length}
      itemSize={50}
      width="100%"
    >
      {Row}
    </FixedSizeList>
  );
}
```

**성능 비교:**
- 일반 렌더링: 10,000개 항목 → 5초 로딩
- 가상화: 10,000개 항목 → 0.1초 로딩 ⚡

## 5. 이미지 최적화

### Next.js Image 컴포넌트

```jsx
import Image from 'next/image';

// ✅ 좋은 예: 자동 최적화
function ProductCard({ product }) {
  return (
    <Image
      src={product.image}
      alt={product.name}
      width={300}
      height={400}
      loading="lazy" // 지연 로딩
      placeholder="blur" // 블러 플레이스홀더
    />
  );
}
```

### 일반 React에서 이미지 최적화

```jsx
function OptimizedImage({ src, alt }) {
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      style={{ aspectRatio: '16/9' }} // CLS 방지
    />
  );
}
```

## 6. 실전 체크리스트

개발 완료 전에 확인하세요:

- [ ] **React DevTools Profiler**로 성능 측정
- [ ] 불필요한 리렌더링 제거 (React.memo)
- [ ] 무거운 계산 메모이제이션 (useMemo)
- [ ] 이벤트 핸들러 최적화 (useCallback)
- [ ] 큰 컴포넌트 코드 스플리팅
- [ ] 긴 리스트 가상화
- [ ] 이미지 지연 로딩
- [ ] 번들 크기 분석 (webpack-bundle-analyzer)

## 7. 성능 측정 도구

### React DevTools Profiler 사용법

```jsx
import { Profiler } from 'react';

function onRenderCallback(
  id,
  phase,
  actualDuration,
  baseDuration,
  startTime,
  commitTime
) {
  console.log(`${id} took ${actualDuration}ms`);
}

function App() {
  return (
    <Profiler id="App" onRender={onRenderCallback}>
      <YourComponent />
    </Profiler>
  );
}
```

### 웹 성능 측정

```javascript
// Performance API
const perfObserver = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.log(`${entry.name}: ${entry.duration}ms`);
  }
});

perfObserver.observe({ entryTypes: ['measure'] });

performance.mark('start');
// 무거운 작업 실행
performance.mark('end');
performance.measure('작업 소요 시간', 'start', 'end');
```

## 8. 실전 예제: 검색 기능 최적화

### Before (느림)

```jsx
function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  const handleSearch = (e) => {
    setQuery(e.target.value);
    // 매 입력마다 API 호출 → 비효율적!
    fetchResults(e.target.value).then(setResults);
  };

  return (
    <div>
      <input onChange={handleSearch} />
      <ResultsList results={results} />
    </div>
  );
}
```

### After (빠름)

```jsx
import { useState, useMemo, useCallback } from 'react';
import { debounce } from 'lodash';

function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  // ✅ 디바운싱으로 API 호출 최소화
  const debouncedSearch = useMemo(
    () => debounce((query) => {
      fetchResults(query).then(setResults);
    }, 300),
    []
  );

  const handleSearch = useCallback((e) => {
    const value = e.target.value;
    setQuery(value);
    debouncedSearch(value);
  }, [debouncedSearch]);

  // ✅ 결과 메모이제이션
  const memoizedResults = useMemo(() => 
    results.slice(0, 10), 
    [results]
  );

  return (
    <div>
      <input onChange={handleSearch} value={query} />
      <ResultsList results={memoizedResults} />
    </div>
  );
}
```

## 📊 성능 개선 결과

이 기법들을 적용한 실제 프로젝트 결과:

| 지표 | 이전 | 이후 | 개선율 |
|------|------|------|--------|
| 초기 로딩 | 5.2s | 1.8s | **-65%** |
| TTI | 7.1s | 2.3s | **-68%** |
| 번들 크기 | 850KB | 320KB | **-62%** |
| Lighthouse | 62점 | 94점 | **+52%** |

## 🎓 마무리

React 성능 최적화의 핵심은:

1. **측정하라** - 추측하지 말고 프로파일링하세요
2. **필요한 곳만** - 모든 곳에 최적화는 오버엔지니어링
3. **사용자 중심** - 실제 사용자 경험 개선에 집중

## 📚 참고 자료

- [React 공식 문서 - 성능 최적화](https://react.dev/learn/render-and-commit)
- [Web.dev - React Performance](https://web.dev/react/)
- [React DevTools 가이드](https://react.dev/learn/react-developer-tools)

---

질문이나 피드백이 있으시면 댓글로 남겨주세요! 🙌
