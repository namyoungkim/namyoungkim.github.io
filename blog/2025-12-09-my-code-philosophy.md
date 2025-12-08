---
slug: my-code-philosophy
title: My Code Philosophy
authors: namyoungkim
tags: [career, python, rust, dev-tools]
---

> **"명확하게 이해되고, 성능이 좋고, 설계가 잘 되어 있어서 운영 및 추가 개발시 좋았던 코드"**
>
> — 내가 "잘 짰다"고 느꼈던 코드에 대한 정의

<!-- truncate -->

---

## 핵심 원칙 5가지

### 1. Explicit over Clever
**영리한 코드보다 명확한 코드**

6개월 후의 내가, 혹은 동료가 이 코드를 이해할 수 있어야 한다.
짧고 영리한 트릭보다 읽기 쉬운 코드가 우선이다.

### 2. Fail-Fast
**에러는 숨기지 않고 즉시 드러나게**

문제가 생기면 최대한 빨리 알아야 한다.
에러를 삼키거나 무시하는 코드는 나중에 더 큰 문제를 만든다.

### 3. Self-Documenting
**코드 자체가 의도를 말하게**

주석은 "왜(Why)"를 설명할 때만 쓴다.
"무엇(What)"과 "어떻게(How)"는 코드 자체가 말해야 한다.

### 4. Design First
**설계 먼저, 키보드는 나중에**

키보드부터 치고 싶은 충동이 와도 참고, 먼저 구조를 그린다.
장기 유지보수를 고려한 설계가 결국 시간을 아낀다.

### 5. Proven over Trendy
**검증된 것이 트렌디한 것보다 낫다**

새 라이브러리가 핫하다고 해도, 검증된 게 있으면 그걸 쓴다.
기술 선택은 신중하게, 유행보다는 안정성을 택한다.

---

## 1. 네이밍 컨벤션

### Python (PEP 8)

| 대상 | 스타일 | 예시 |
|------|--------|------|
| 변수, 함수, 메서드 | `snake_case` | `user_id`, `calculate_total()` |
| 클래스 | `PascalCase` | `UserProfile`, `DataProcessor` |
| 상수 | `SCREAMING_SNAKE_CASE` | `MAX_RETRY_COUNT`, `API_BASE_URL` |
| 모듈, 패키지 | `snake_case` (짧게) | `data_utils`, `config` |
| private | `_leading_underscore` | `_internal_method()` |

### Rust (RFC 430)

| 대상 | 스타일 | 예시 |
|------|--------|------|
| 변수, 함수, 메서드, 모듈 | `snake_case` | `user_id`, `calculate_total()` |
| 타입, 트레이트, Enum | `PascalCase` | `UserProfile`, `DataProcessor` |
| 상수, static | `SCREAMING_SNAKE_CASE` | `MAX_RETRY_COUNT` |
| 라이프타임 | 짧은 소문자 | `'a`, `'ctx` |
| 제네릭 타입 | 대문자 한 글자 또는 서술적 | `T`, `Key`, `Value` |

### My Choice: 의미 있는 이름 우선

```python
# ❌ 짧지만 모호함
def calc(d):
    return d * 1.1

# ✅ 길어도 의도가 명확함
def calculate_price_with_tax(base_price: float) -> float:
    TAX_RATE = 0.1
    return base_price * (1 + TAX_RATE)
```

```rust
// ❌ 모호함
fn proc(d: &Data) -> Result<(), Error> { ... }

// ✅ 의도가 명확함
fn process_user_transaction(transaction: &Transaction) -> Result<(), TransactionError> { ... }
```

**원칙:**
- 이름만 보고 역할을 알 수 있어야 한다
- 약어는 도메인에서 널리 쓰이는 것만 허용 (예: `id`, `url`, `api`)
- Boolean은 `is_`, `has_`, `can_` 접두사 사용

---

## 2. 함수/모듈 크기

### 업계 권장 사항

| 출처 | 권장 크기 | 비고 |
|------|----------|------|
| Clean Code (Robert Martin) | 20줄 이하 | "작을수록 좋다" |
| Code Complete (Steve McConnell) | 100-200줄까지 허용 | 연구 기반 |
| Google | 40줄 권장 | 내부 스타일 가이드 |
| PMD (정적 분석 도구) | 100줄 기본 한계 | 경고 발생 기준 |

### My Choice: 한 화면 원칙 + 단일 책임

**함수:**
- **목표: 20-50줄** (스크롤 없이 한 화면에 보이는 크기)
- 한 함수는 한 가지 일만 한다 (Single Responsibility)
- 50줄 넘어가면 분리를 고려
- 100줄 넘어가면 반드시 리팩토링

**모듈/클래스:**
- **목표: 200-400줄**
- 10-20개 이하의 public 메서드
- 500줄 넘어가면 분리 고려

**Python 예시:**
```python
# ❌ 너무 많은 책임
def process_order(order):
    # 검증 (20줄)
    # 재고 확인 (15줄)
    # 결제 처리 (30줄)
    # 알림 발송 (20줄)
    # 로깅 (10줄)
    pass  # 총 95줄

# ✅ 책임 분리
def process_order(order: Order) -> OrderResult:
    validate_order(order)
    check_inventory(order.items)
    payment_result = process_payment(order.payment_info)
    send_notification(order.customer, payment_result)
    log_order_completion(order)
    return OrderResult.success(order.id)
```

**Rust 예시:**
```rust
// ✅ 작은 함수들의 조합
fn process_order(order: &Order) -> Result<OrderResult, OrderError> {
    validate_order(order)?;
    check_inventory(&order.items)?;
    let payment = process_payment(&order.payment_info)?;
    send_notification(&order.customer, &payment)?;
    Ok(OrderResult::success(order.id))
}
```

---

## 3. 테스트 전략

### My Choice: 실용적 TDD

**테스트 피라미드 (권장 비율)**
```
        /\
       /  \      E2E (10-20%)
      /----\     - 핵심 사용자 시나리오만
     /      \
    /--------\   Integration (20-30%)
   /          \  - API, DB 연동
  /------------\
 /              \ Unit (50-60%)
/________________\ - 비즈니스 로직
```

**핵심 원칙:**

1. **테스트 커버리지 목표: 70-80%**
   - 100%는 비현실적이고 유지보수 비용만 높임
   - 핵심 비즈니스 로직은 90% 이상
   - UI, 설정 코드는 낮아도 괜찮음

2. **TDD는 상황에 따라 유연하게**
   ```
   새 기능 개발     → TDD 권장 (Red-Green-Refactor)
   버그 수정        → 먼저 실패하는 테스트 작성
   탐색적 프로토타입 → 구현 후 테스트 작성 가능
   레거시 코드      → 변경하는 부분만 테스트 추가
   ```

3. **좋은 테스트의 조건 (FIRST)**
   - **F**ast: 빠르게 실행
   - **I**solated: 다른 테스트와 독립적
   - **R**epeatable: 언제 실행해도 같은 결과
   - **S**elf-validating: 성공/실패가 명확
   - **T**imely: 적시에 작성

**Python (pytest) 예시:**
```python
# Arrange-Act-Assert 패턴
def test_calculate_discount_for_premium_user():
    # Arrange
    user = User(membership="premium")
    order = Order(total=10000)

    # Act
    discount = calculate_discount(user, order)

    # Assert
    assert discount == 1000  # 10% 할인
```

**Rust 예시:**
```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_calculate_discount_for_premium_user() {
        // Arrange
        let user = User::new(Membership::Premium);
        let order = Order::new(10000);

        // Act
        let discount = calculate_discount(&user, &order);

        // Assert
        assert_eq!(discount, 1000);
    }
}
```

---

## 4. 성능 vs 가독성 트레이드오프

### My Choice: 측정 후 최적화 (Measured Optimization)

> "Premature optimization is the root of all evil."
> — Donald Knuth

**그러나 나는 10% 성능 향상을 위해 복잡한 코드를 쓸 의향이 있다.**
단, 다음 조건을 충족할 때만:

### 최적화 의사결정 플로우

```
1. 먼저 명확한 코드 작성
         ↓
2. 프로파일링으로 병목 지점 측정
         ↓
3. 병목인가? → 아니오 → 그대로 유지
    ↓ 예
4. 최적화 가치가 있나?
   - 자주 호출되는가?
   - 사용자 경험에 영향?
   - 비용 대비 효과?
    ↓ 예
5. 최적화 적용 + 반드시 문서화
```

### 최적화 시 필수 조건

1. **측정 데이터 필수**
   ```python
   # Python: cProfile, line_profiler
   python -m cProfile -s cumtime my_script.py
   ```
   ```bash
   # Rust: cargo flamegraph, criterion
   cargo bench
   ```

2. **최적화된 코드는 격리**
   ```python
   # ✅ 복잡한 최적화는 별도 모듈로 격리
   # optimized_parser.py
   """
   최적화된 로그 파서

   성능 요구사항: 1GB 로그를 30초 내 처리
   벤치마크 결과: 기존 120초 → 최적화 후 25초
   최적화 기법: 메모리 매핑 + 병렬 처리
   """
   ```

3. **원본 코드 보존 (가능하면)**
   ```python
   def parse_log_simple(file_path: str) -> List[LogEntry]:
       """읽기 쉬운 버전 (작은 파일용)"""
       ...

   def parse_log_optimized(file_path: str) -> List[LogEntry]:
       """최적화 버전 (대용량 파일용)

       Note: parse_log_simple과 동일한 결과 반환
       벤치마크: 1GB 파일 기준 5배 빠름
       """
       ...
   ```

### Python & Rust에서의 최적화 우선순위

| 순위 | 최적화 대상 | 예시 |
|------|------------|------|
| 1 | 알고리즘 개선 | O(n²) → O(n log n) |
| 2 | 데이터 구조 선택 | List → Set (검색 시) |
| 3 | I/O 최적화 | 배치 처리, 비동기 |
| 4 | 메모리 효율 | Generator, Iterator 활용 |
| 5 | 병렬/비동기 | multiprocessing, async |
| 6 | Rust로 핫스팟 재작성 | PyO3 활용 |

---

## Python ↔ Rust 철학 비교

| 나의 원칙 | Python에서 | Rust에서 |
|------------|------------|----------|
| **Explicit over Clever** | Type hints 적극 사용 | 강력한 타입 시스템이 강제 |
| **Fail-Fast** | 예외 명시적 발생, `assert` 활용 | `Result<T, E>`, `Option<T>` |
| **Self-Documenting** | 좋은 네이밍 + docstring | 타입이 문서, 필요시 `///` doc |
| **Design First** | 모듈 구조 먼저 설계 | Ownership이 설계 없이 컴파일 거부 |
| **Proven over Trendy** | 표준 라이브러리 우선 | std 우선, 검증된 crate만 |

### Rust가 나의 스타일에 맞는 이유

```rust
// Fail-Fast: 에러를 무시할 수 없음
fn read_config(path: &str) -> Result<Config, ConfigError> {
    let content = fs::read_to_string(path)?;  // 에러 전파 필수
    let config: Config = serde_json::from_str(&content)?;
    Ok(config)
}

// Explicit: 의도가 타입에 드러남
fn find_user(id: UserId) -> Option<User> {
    // 반환 타입만 봐도 "없을 수 있음"을 알 수 있음
}

// Self-Documenting: 타입이 곧 문서
struct Transaction {
    id: TransactionId,
    amount: Money,  // Money 타입으로 통화 처리 보장
    timestamp: DateTime<Utc>,
}
```

---

## 체크리스트

### 코드 리뷰 시 확인 사항

- [ ] 함수/클래스 이름만 보고 역할을 알 수 있는가?
- [ ] 한 함수가 한 가지 일만 하는가?
- [ ] 에러 케이스가 명시적으로 처리되는가?
- [ ] 매직 넘버 없이 상수로 정의되어 있는가?
- [ ] 테스트가 핵심 로직을 커버하는가?
- [ ] 최적화된 코드는 문서화되어 있는가?

### 새 프로젝트 시작 시

- [ ] 프로젝트 구조 먼저 설계
- [ ] 린터/포매터 설정 (Python: ruff, black / Rust: clippy, rustfmt)
- [ ] 테스트 프레임워크 설정 (Python: pytest / Rust: 내장)
- [ ] CI/CD에 테스트 자동화 추가

---

## 마무리

> **"좋은 코드는 작동하는 코드가 아니라, 함께 일하고 싶은 코드다."**

나의 코드 철학은 단순히 "이렇게 해라"가 아니다.
**명확함, 안정성, 유지보수성**을 최우선으로 두되,
**성능이 필요한 곳에서는 측정을 바탕으로 과감하게 최적화**하는 균형 잡힌 접근이다.

Python과 Rust는 이 철학을 실현하는 두 가지 도구다:
- **Python**: 생산성과 가독성이 필요한 곳
- **Rust**: 성능과 안정성이 필요한 곳

두 언어를 함께 쓰면서 나만의 코드 스타일을 발전시켜 나가자.
