---
slug: go-code-philosophy
title: "Go 코드 철학: 좋은 Go 코드란 무엇인가?"
authors: namyoungkim
tags: [go, golang, best-practices, clean-code, philosophy]
---

# Go 코드 철학: 좋은 Go 코드란 무엇인가?

Go 문법은 배웠는데, "좋은" Go 코드는 어떻게 작성할까요? 이 글에서는 Go 언어의 설계 철학과 Go Proverbs(격언)를 통해 Go다운 코드를 작성하는 방법을 알아봅니다.

<!-- truncate -->

이 글은 [Go 프로젝트 세팅 완벽 가이드](/blog/go-project-setup-guide)의 후속편입니다. 환경 설정이 안 되어 있다면 먼저 Part 1을 읽어주세요!

---

## Go의 설계 철학

Go는 세 가지 핵심 철학을 가지고 만들어졌어요:

### 1. 단순함 (Simplicity)

Go는 의도적으로 기능을 적게 만들었어요.

> "적은 것이 더 많은 것이다" (Less is more)

다른 언어들은 같은 일을 10가지 방법으로 할 수 있지만, Go는 보통 1-2가지 방법만 제공해요. 처음엔 불편해 보이지만, 코드를 읽기가 훨씬 쉬워져요!

**비유**: 스마트폰의 버튼이 100개보다 3개일 때 더 쓰기 쉬운 것처럼요.

### 2. 실용성 (Pragmatism)

Go는 이론적 완벽함보다 **실제로 쓰기 좋은지**를 중요시해요.

- 컴파일이 빨라야 해요 (피자 주문처럼 기다리기 싫으니까!)
- 에러 메시지가 친절해야 해요
- 도구들이 기본으로 제공돼야 해요 (`go fmt`, `go test` 등)

### 3. 병행성 (Concurrency)

Go는 여러 일을 동시에 처리하는 게 쉬워요.

**비유**: 요리사 한 명이 여러 요리를 동시에 하는 것처럼, Go 프로그램은 여러 작업을 동시에 처리할 수 있어요. 이를 위한 특별한 도구가 `goroutine`과 `channel`이에요.

---

## Go Proverbs (격언) 10선

Go의 창시자 중 한 명인 Rob Pike가 발표한 유명한 격언들이에요. 표로 정리하고, 중요한 것들은 자세히 설명할게요.

| 격언 | 의미 |
|------|------|
| **Clear is better than clever** | 영리한 코드보다 명확한 코드가 좋다 |
| **Errors are values** | 에러도 값이다 (특별히 다루지 말고 값처럼 처리하라) |
| **Don't just check errors, handle them gracefully** | 에러를 확인만 하지 말고, 우아하게 처리하라 |
| **Don't panic** | panic을 남용하지 마라 |
| **Make the zero value useful** | 제로값을 유용하게 만들어라 |
| **The bigger the interface, the weaker the abstraction** | 인터페이스가 클수록 추상화가 약하다 |
| **A little copying is better than a little dependency** | 작은 복사가 작은 의존성보다 낫다 |
| **Gofmt's style is no one's favorite, yet gofmt is everyone's favorite** | gofmt 스타일은 아무도 좋아하지 않지만, gofmt는 모두가 좋아한다 |
| **Documentation is for users** | 문서는 사용자를 위한 것이다 |
| **Don't communicate by sharing memory, share memory by communicating** | 메모리 공유로 통신하지 말고, 통신으로 메모리를 공유하라 |

---

## 핵심 원칙 3가지 상세 설명

### 원칙 1: 명확함이 영리함보다 낫다

**Clear is better than clever**

```go
// ❌ 영리한(?) 코드 - 이해하기 어려움
func sum(n int) int {
    return n * (n + 1) / 2
}

// ✅ 명확한 코드 - 누구나 이해 가능
func sum(n int) int {
    total := 0
    for i := 1; i <= n; i++ {
        total += i
    }
    return total
}
```

**왜 이게 중요할까요?**

코드는 작성하는 시간보다 **읽는 시간이 10배** 많아요. 6개월 후의 나 자신도 코드를 읽는 "다른 사람"이에요!

더 복잡한 예제를 볼까요?

```go
// ❌ 한 줄에 모든 것을 - 읽기 힘듦
users := filter(users, func(u *User) bool { return u != nil && u.Active && time.Since(u.LastLogin) < 24*time.Hour })

// ✅ 단계별로 명확하게
func isRecentlyActiveUser(u *User) bool {
    if u == nil {
        return false
    }
    if !u.Active {
        return false
    }
    return time.Since(u.LastLogin) < 24*time.Hour
}

activeUsers := filter(users, isRecentlyActiveUser)
```

### 원칙 2: 에러를 숨기지 마라

**Don't just check errors, handle them gracefully**

Go에서 에러 처리는 정말 중요해요. `if err != nil`을 자주 보게 될 거예요.

```go
// ❌ 에러 무시 - 나중에 큰 문제가 될 수 있음
file, _ := os.Open("config.json")
// file이 nil일 수 있는데 그냥 사용하면 프로그램이 죽어요!

// ❌ 에러 확인만 하고 아무것도 안 함
file, err := os.Open("config.json")
if err != nil {
    // 아무것도 안 함... 위험!
}

// ✅ 에러를 제대로 처리
file, err := os.Open("config.json")
if err != nil {
    return fmt.Errorf("설정 파일을 열 수 없습니다: %w", err)
}
defer file.Close()
```

**에러 처리 3단계**:

1. **에러 확인**: `if err != nil`
2. **컨텍스트 추가**: `fmt.Errorf("무슨 작업 중: %w", err)`
3. **적절히 반환 또는 로깅**

<details>
<summary>%w가 뭔가요? 클릭해서 확인!</summary>

`%w`는 에러를 "감싸는" 특별한 형식이에요. 원래 에러 정보를 유지하면서 추가 설명을 붙일 수 있어요.

```go
// 원본 에러: "file not found"
// 감싼 에러: "설정 파일을 열 수 없습니다: file not found"

// 나중에 원본 에러를 꺼낼 수도 있어요
if errors.Is(err, os.ErrNotExist) {
    // 파일이 없는 경우 처리
}
```

</details>

### 원칙 3: 작은 인터페이스가 좋다

**The bigger the interface, the weaker the abstraction**

Go의 유명한 인터페이스들은 매우 작아요:

```go
// io.Reader - 메서드 1개
type Reader interface {
    Read(p []byte) (n int, err error)
}

// io.Writer - 메서드 1개
type Writer interface {
    Write(p []byte) (n int, err error)
}

// fmt.Stringer - 메서드 1개
type Stringer interface {
    String() string
}
```

**왜 작은 인터페이스가 좋을까요?**

```go
// ❌ 큰 인터페이스 - 구현하기 어렵고, 사용하기도 제한적
type DataStore interface {
    Create(data []byte) error
    Read(id string) ([]byte, error)
    Update(id string, data []byte) error
    Delete(id string) error
    List() ([]string, error)
    Search(query string) ([]string, error)
    Backup() error
    Restore() error
}

// ✅ 작은 인터페이스 - 필요한 것만
type Reader interface {
    Read(id string) ([]byte, error)
}

type Writer interface {
    Write(id string, data []byte) error
}

// 함수는 필요한 인터페이스만 받음
func processData(r Reader) error {
    data, err := r.Read("config")
    // ...
}
```

**비유**: 자격증을 10개 가진 사람을 찾는 것보다, 1개만 있어도 되는 사람을 찾는 게 쉬운 것처럼요!

---

## 실전 예제: 간단한 웹 서버 만들기

배운 원칙들을 적용해서 간단한 웹 서버를 만들어볼게요:

```go
package main

import (
    "encoding/json"
    "fmt"
    "log"
    "net/http"
)

// User 구조체 - 제로값이 유용하게 설계됨
type User struct {
    Name  string `json:"name"`
    Email string `json:"email"`
}

// Response 구조체
type Response struct {
    Success bool   `json:"success"`
    Message string `json:"message"`
    Data    any    `json:"data,omitempty"`
}

func main() {
    // 라우터 설정
    http.HandleFunc("/", handleHome)
    http.HandleFunc("/user", handleUser)

    // 서버 시작
    addr := ":8080"
    log.Printf("서버 시작: http://localhost%s", addr)

    // 에러를 제대로 처리!
    if err := http.ListenAndServe(addr, nil); err != nil {
        log.Fatalf("서버 시작 실패: %v", err)
    }
}

// handleHome - 홈 페이지 핸들러
func handleHome(w http.ResponseWriter, r *http.Request) {
    // 명확하게: 메서드 체크
    if r.Method != http.MethodGet {
        writeJSON(w, http.StatusMethodNotAllowed, Response{
            Success: false,
            Message: "GET 요청만 허용됩니다",
        })
        return
    }

    writeJSON(w, http.StatusOK, Response{
        Success: true,
        Message: "안녕하세요! Go 웹 서버입니다.",
    })
}

// handleUser - 사용자 정보 핸들러
func handleUser(w http.ResponseWriter, r *http.Request) {
    if r.Method != http.MethodGet {
        writeJSON(w, http.StatusMethodNotAllowed, Response{
            Success: false,
            Message: "GET 요청만 허용됩니다",
        })
        return
    }

    user := User{
        Name:  "김고퍼",
        Email: "gopher@example.com",
    }

    writeJSON(w, http.StatusOK, Response{
        Success: true,
        Message: "사용자 정보 조회 성공",
        Data:    user,
    })
}

// writeJSON - JSON 응답 헬퍼 (작은 함수로 분리)
func writeJSON(w http.ResponseWriter, status int, data any) {
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(status)

    // 에러 처리
    if err := json.NewEncoder(w).Encode(data); err != nil {
        log.Printf("JSON 인코딩 실패: %v", err)
    }
}
```

이 코드에서 적용된 원칙들:

| 원칙 | 적용된 부분 |
|------|------------|
| 명확함 > 영리함 | 각 함수가 한 가지 일만 함 |
| 에러 처리 | `log.Fatalf`, `log.Printf`로 에러 로깅 |
| 작은 함수 | `writeJSON` 헬퍼 함수 분리 |
| 제로값 활용 | `User` 구조체의 제로값도 유효한 JSON |

---

## Go vs 다른 언어의 스타일 차이

Go를 처음 접하면 다른 언어와 다른 점이 있어요:

### 예외(Exception) 대신 에러 반환

```python
# Python - 예외 사용
try:
    result = do_something()
except ValueError as e:
    print(f"에러: {e}")
```

```go
// Go - 에러 값 반환
result, err := doSomething()
if err != nil {
    fmt.Printf("에러: %v\n", err)
}
```

### 상속 대신 조합(Composition)

```java
// Java - 상속
class Dog extends Animal {
    // ...
}
```

```go
// Go - 조합 (임베딩)
type Dog struct {
    Animal  // Animal의 기능을 "포함"
    Breed string
}
```

### 제네릭 대신 인터페이스 (Go 1.18 이전)

Go 1.18부터 제네릭이 추가됐지만, 여전히 인터페이스를 선호하는 경우가 많아요:

```go
// 제네릭도 좋지만...
func Min[T constraints.Ordered](a, b T) T {
    if a < b {
        return a
    }
    return b
}

// 인터페이스로도 충분한 경우가 많음
type Comparable interface {
    CompareTo(other any) int
}
```

---

## 코드 작성 팁 요약

| 카테고리 | 좋은 습관 |
|----------|----------|
| **네이밍** | 짧고 명확하게. `userCount` (O), `numberOfUsersInTheSystem` (X) |
| **함수 크기** | 20-50줄 목표, 100줄 넘으면 분리 |
| **에러 처리** | 절대 무시하지 말기! `_`로 에러 무시 금지 |
| **주석** | "왜(Why)"만 작성. "무엇(What)"은 코드가 말함 |
| **패키지** | 작은 단위로, 순환 의존성 피하기 |

---

## 더 배우고 싶다면

### 필수 자료

- [Effective Go](https://go.dev/doc/effective_go) - Go 공식 스타일 가이드
- [Go Proverbs](https://go-proverbs.github.io/) - Rob Pike의 격언 전체
- [Go Code Review Comments](https://github.com/golang/go/wiki/CodeReviewComments) - 코드 리뷰 가이드

### 추천 책

- "The Go Programming Language" - Go의 바이블
- "100 Go Mistakes and How to Avoid Them" - 실수 모음집

### 실습 사이트

- [Go by Example](https://gobyexample.com/) - 예제로 배우기
- [Exercism Go Track](https://exercism.org/tracks/go) - 문제 풀이

---

## 마무리

Go의 철학은 한 문장으로 요약할 수 있어요:

> **"단순하게, 명확하게, 실용적으로"**

처음엔 다른 언어보다 불편해 보일 수 있지만, 코드가 쌓일수록 Go의 단순함에 감사하게 될 거예요.

이전 글 [Go 프로젝트 세팅 완벽 가이드](/blog/go-project-setup-guide)에서 환경 설정을 했다면, 이제 Go다운 코드를 작성할 준비가 됐어요!

---

## 참고 자료

- [Go 공식 문서](https://go.dev/doc/)
- [Go Proverbs](https://go-proverbs.github.io/)
- [Effective Go](https://go.dev/doc/effective_go)
- [Go Code Review Comments](https://github.com/golang/go/wiki/CodeReviewComments)
