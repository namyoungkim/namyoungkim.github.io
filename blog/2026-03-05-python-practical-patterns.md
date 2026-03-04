---
slug: python-practical-patterns
title: "코드 리뷰에서 배운 Python 실전 패턴들"
authors: namyoungkim
tags: [python, code-review, pydantic, pytest, guide]
---

> 여러 차례의 코드 리뷰 과정에서 다룬 Python 패턴과 설계 판단을 주제별로 정리했다. 단순 문법 설명이 아니라, "왜 이렇게 바꿨는가"라는 근거 중심으로 기록한다. 각 패턴마다 배경 지식부터 차근차근 설명하므로, Python 기초 문법을 아는 분이라면 누구나 따라올 수 있다.

<!-- truncate -->

---

## 1. 타입 안전성과 Pydantic 활용

:::info Pydantic이란?
**Pydantic**은 Python에서 데이터의 형태(타입)를 자동으로 검사해주는 라이브러리다. 예를 들어 "이름은 문자열, 나이는 숫자"라고 정해두면, 누군가 나이에 문자열을 넣으려 할 때 자동으로 에러를 내준다. 일종의 **데이터 경비원** 역할이다.
:::

### 1.1 `dict` → `dict[str, Any]` + `Field(default_factory=dict)`

```python
# 변경 전
details: dict = {}

# 변경 후
from typing import Any
from pydantic import Field
details: dict[str, Any] = Field(default_factory=dict)
```

**무엇이 달라졌나?**

두 가지가 바뀌었다.

**첫 번째, `dict` → `dict[str, Any]`**

`dict`만 쓰면 "이 안에 뭐가 들어가는지" 아무 정보가 없다. 열쇠(key)가 숫자인지 문자인지, 값(value)이 뭔지 전혀 모른다. `dict[str, Any]`로 바꾸면 "열쇠는 반드시 문자열(`str`)이고, 값은 뭐든 될 수 있다(`Any`)"라는 계약을 명시하는 것이다.

이렇게 하면 IDE(코드 편집기)가 자동완성을 더 잘 해주고, 타입 체커(코드의 타입 실수를 자동으로 찾아주는 도구)가 잘못된 사용을 미리 잡아낸다.

**두 번째, `= {}` → `Field(default_factory=dict)`**

이건 Python의 유명한 함정과 관련된다. 아래 예시를 보자:

```python
# ⚠️ 위험한 패턴 (순수 Python 클래스에서)
class Student:
    def __init__(self, scores = []):
        self.scores = scores

a = Student()
b = Student()
a.scores.append(100)
print(b.scores)  # [100] — b도 같이 바뀐다!
```

`= []`로 기본값을 쓰면, Python은 이 리스트를 **딱 한 번만** 만들고 모든 인스턴스가 **같은 리스트를 공유**한다. A 학생의 점수를 추가했는데 B 학생의 점수도 바뀌는 버그가 생긴다.

`Field(default_factory=dict)`는 "새 인스턴스를 만들 때마다 **새로운 빈 dict를 만들어라**"는 뜻이다. Pydantic은 내부적으로 이 문제를 처리해주지만, `default_factory`를 명시하면 의도가 더 명확해지고, 순수 Python에서의 나쁜 습관을 방지하는 방어적 코딩이 된다.

### 1.2 `@field_serializer` — 무거운 필드 JSON 직렬화 제외

:::tip 직렬화(Serialization)란?
프로그램 안의 데이터를 **텍스트(JSON 같은 형식)로 변환**하는 것이다. 네트워크로 데이터를 보내거나, 파일에 저장할 때 쓴다. 반대로 텍스트를 다시 데이터로 변환하는 건 **역직렬화(Deserialization)**라고 한다.
:::

```python
@field_serializer("raw_data", "cached_binary", "thumbnail_bytes")
def serialize_heavy_fields(self, v: bytes | None) -> None:
    return None
```

**왜 이렇게 했을까?**

`bytes`는 이미지, 파일 내용 등 **바이너리 데이터**(0과 1의 나열)를 담는 타입이다. 이걸 JSON으로 변환하면 base64라는 형식으로 바뀌는데, 원래 크기보다 약 33% 커진다. 10MB 파일이 13MB짜리 텍스트가 되는 셈이다.

`@field_serializer`를 써서 `return None`을 하면, `.model_dump_json()`(모델을 JSON 텍스트로 바꾸는 메서드)을 호출할 때 해당 필드들이 `null`로 처리된다. 즉, **무거운 데이터는 JSON에 포함시키지 않겠다**는 뜻이다.

**"그러면 `Field(exclude=True)`를 쓰면 안 되나?"**

쓸 수 있지만, 차이가 있다:
- `Field(exclude=True)` → **항상** 제외된다. Python 코드에서 `item.raw_data`로 접근하는 것도 안 된다.
- `@field_serializer` → **JSON으로 변환할 때만** 개입한다. Python 코드에서는 정상적으로 `item.raw_data`로 접근할 수 있다.

프로그램 내부에서는 데이터를 쓰되, 외부로 보낼 때만 제외하고 싶으므로 `@field_serializer`가 맞다.

### 1.3 내부 캐시 필드까지 serializer 확장

이후 리뷰에서 내부 캐시용 `bool` 필드들(`is_processed`, `is_validated` 같은)을 추가했다. bool은 `true`/`false`뿐이니 JSON으로 변환하는 데 문제가 없다. 하지만 여기서 중요한 깨달음이 있었다:

> "기술적으로 직렬화가 **되느냐**"와 "JSON 출력에 **포함돼야 하느냐**"는 다른 질문이다.

이 필드들은 프로그램 내부에서만 쓰는 값이다. 외부에 보내는 JSON에 포함될 이유가 없다. 그래서 serializer를 확장했다:

```python
@field_serializer(
    "raw_data", "cached_binary", "thumbnail_bytes",
    "is_processed", "is_validated", "is_cached",
)
def _exclude_internal_from_json(self, _v: object) -> None:
    return None
```

메서드 이름도 `serialize_heavy_fields`(무거운 필드 직렬화) → `_exclude_internal_from_json`(내부 필드를 JSON에서 제외)으로 바꿨다. 이름이 실제 역할을 정확히 설명해야 다른 개발자가 읽을 때 혼란이 없다.

인자 타입도 `bytes | None` → `object`로 바꿨다. 이제 bytes뿐 아니라 bool 필드도 처리하므로, 모든 타입을 받을 수 있는 `object`가 더 정확하다.

### 1.4 `@field_validator` — details 값 타입 제한

```python
@field_validator("details")
@classmethod
def _validate_details(cls, v: dict) -> dict:
    for key, value in v.items():
        if not isinstance(value, (str, int, float, bool, type(None))):
            raise ValueError(
                f"details['{key}'] 값은 str/int/float/bool/None만 허용: "
                f"{type(value).__name__}"
            )
    return v
```

**배경**: `details`는 `dict[str, Any]`로 선언했다. `Any`는 "아무거나 다 됨"이라는 뜻이므로, 리스트, 중첩 dict, 커스텀 객체 등 뭐든 들어갈 수 있다.

**문제**: 아무거나 다 넣을 수 있으면 JSON으로 변환할 때 에러가 날 수 있다. 예를 들어 커스텀 클래스의 인스턴스는 JSON으로 어떻게 바꿔야 하는지 알 수 없다. 또 데이터 구조가 중첩되면 읽는 쪽에서 파싱(해석)이 복잡해진다.

**해결**: `@field_validator`로 값의 타입을 **원시 타입**(문자열, 숫자, 불리언, None)으로 제한한다. 이렇게 하면:
- JSON 직렬화가 **항상** 안전하다 (원시 타입은 모든 JSON 라이브러리가 처리 가능)
- 데이터 구조가 **flat**(1단계 깊이)하게 유지되어, 모듈 간 데이터 교환이 단순해진다

### 1.5 `model_copy` — 불변 객체 업데이트 패턴

```python
updated_config = self.config.model_copy(update={"is_valid": is_valid})
return self.model_copy(update={"config": updated_config})
```

**불변(Immutable) 객체란?** 한번 만들면 내용을 바꿀 수 없는 객체다. 바꾸고 싶으면 **새로운 복사본**을 만들어야 한다. 마치 종이에 적은 글을 수정할 때, 원본에 줄 긋고 고치는 게 아니라 새 종이에 다시 쓰는 것과 같다.

`model_copy(update={...})`는 원본을 그대로 두고, 특정 필드만 바뀐 **새 인스턴스**를 만든다. 여러 모듈이 같은 모델을 공유할 때 한쪽이 수정해도 다른 쪽에 영향이 없으니 안전하다.

**그런데 이 패턴이 폐기됐다!**

이후 리뷰에서 메모리 최적화가 필요해졌다. 큰 바이너리 데이터(`raw_data`)를 빨리 메모리에서 해제해야 하는 상황이었다. 불변 패턴은 "원본은 그대로 두고 새 복사본을 만든다"이므로, 원본의 `raw_data`가 메모리에 계속 남아있게 된다. 즉시 `raw_data = None`으로 설정해서 메모리를 확보해야 하는데, 불변 패턴이 오히려 방해가 된 것이다.

결국 `frozen=True`(수정 불가 설정) 없이 mutable하게 쓰고 있던 모델에서 불변성을 강제하는 것은, 복잡성과 메모리 낭비만 만든 사례가 됐다.

> **교훈**: 설계 원칙(불변성)은 좋지만, 실제 제약 조건(메모리 한계)이 우선한다. "교과서적으로 좋은 방법"이 항상 "현실에서 최선"인 것은 아니다.

---

## 2. Python 데코레이터 심화

:::info 데코레이터란?
데코레이터는 함수나 메서드 위에 `@이름`을 붙여서, 그 함수의 **동작을 꾸며주는(decorate)** 기능이다. 함수 자체를 수정하지 않고도 새로운 기능을 추가할 수 있다. 선물 포장지처럼, 내용물(함수)은 그대로인데 겉모습(동작)을 바꿔주는 역할이다.
:::

### 2.1 `@property` — 메서드를 속성처럼

```python
class AnalysisAgent(BaseAgent):
    @property
    def name(self) -> str:
        return "analysis"

agent = AnalysisAgent()
agent.name      # "analysis" — 괄호 없이 접근 가능!
agent.name()    # ❌ TypeError — 이미 property이므로 함수처럼 호출하면 에러
agent.name = "x"  # ❌ AttributeError — setter가 없으므로 변경 불가
```

**왜 쓸까?**

보통 객체의 값을 읽을 때 `agent.name`처럼 괄호 없이 접근한다. 그런데 이 값이 단순한 변수가 아니라 **계산이 필요**하거나 **보호가 필요**하다면?

`@property`를 쓰면 메서드(함수)인데 마치 일반 변수처럼 접근할 수 있다. 그리고 setter(값 변경 메서드)를 안 만들면 **읽기 전용**이 된다. 외부에서 `agent.name = "해커"`처럼 바꾸려 하면 에러가 나므로, 중요한 값을 보호할 수 있다.

### 2.2 `@staticmethod` — 클래스에 소속되지만 인스턴스 상태 무관

```python
# 변경 전: 모듈 레벨 함수 (파일 어딘가에 떠돌아다님)
def _validate_format(data: bytes) -> bool: ...

# 변경 후: 클래스 안에 넣음
class DataValidator:
    @staticmethod
    def _validate_format(data: bytes) -> bool: ...
```

**`self`가 없다는 게 핵심이다.**

보통 클래스의 메서드는 첫 번째 인자로 `self`(자기 자신)를 받는다. `self`를 통해 인스턴스의 데이터(예: `self.name`, `self.age`)에 접근한다.

`@staticmethod`는 `self`를 받지 않는다. 즉, 인스턴스의 데이터를 전혀 쓰지 않는 함수다. 그렇다면 굳이 클래스 안에 넣는 이유가 뭘까?

**소속을 명확히 하기 위해서다.** 모듈 레벨(파일의 최상단)에 두면 "이 함수가 누구의 것인지, 어디서 쓰이는지" 파일을 뒤져야 한다. 클래스 안에 넣으면 `DataValidator._validate_format(...)`처럼 소속이 코드 자체에서 드러난다.

### 2.3 `@classmethod` — 클래스 자체를 인자로

```python
class DataModel:
    @classmethod
    def from_path(cls, path: Path) -> "DataModel":
        return cls(file_path=str(path), file_name=path.name)

# 사용할 때
model = DataModel.from_path(Path("/data/sample.csv"))
```

**`self` vs `cls`의 차이:**
- `self` → **인스턴스**(이미 만들어진 객체)를 가리킴
- `cls` → **클래스 자체**를 가리킴

`@classmethod`는 인스턴스가 아직 없을 때, **클래스를 통해 직접 호출**하는 메서드다. 위 예시에서 `cls(...)`는 `DataModel(...)`과 같다. 이런 패턴을 **팩토리 메서드(factory method)**라고 부른다 — "경로를 받아서 DataModel을 만들어주는 공장"인 셈이다.

Pydantic v2의 `@field_validator`에서 `@classmethod`가 필수인 이유도 이것이다. validator는 인스턴스가 **생성되기 전**에 실행되므로, `self`가 아직 존재하지 않는다. 그래서 `cls`를 받아야 한다.

### 2.4 `@lru_cache(maxsize=1)` → `@cache`

```python
from functools import cache

@cache
def get_settings() -> Settings:
    return Settings()

# 첫 호출: Settings()를 실제로 실행하고 결과를 저장
settings1 = get_settings()

# 두 번째 호출: 저장해둔 결과를 바로 반환 (Settings()를 다시 실행하지 않음)
settings2 = get_settings()

# settings1 is settings2 → True (완전히 같은 객체)
```

**캐시(Cache)란?** 한 번 계산한 결과를 저장해두고, 같은 요청이 오면 다시 계산하지 않고 저장된 결과를 돌려주는 것이다. 자주 검색하는 웹페이지를 브라우저가 저장해두는 것과 같은 원리다.

`@lru_cache(maxsize=1)`은 "결과 1개만 캐시한다"는 뜻이다. 그런데 `get_settings()`처럼 인자가 없는 함수는 결과가 항상 1개뿐이다. `maxsize` 제한이 무의미하므로, Python 3.9+에서 추가된 `@cache`(제한 없는 캐시)가 더 깔끔하다.

모듈 레벨에 `settings = get_settings()`를 둔 것은, 기존에 `from config import settings`로 사용하던 코드와의 호환성을 유지하면서도, FastAPI의 `Depends(get_settings)` 같은 함수형 패턴도 지원하기 위해서다.

---

## 3. 테스트 패턴: pytest & Mock

:::info 테스트와 Mock이란?
**테스트**는 코드가 의도대로 동작하는지 자동으로 확인하는 코드다. **Mock**은 "가짜 객체"다. 데이터베이스, 외부 API 같은 것을 진짜로 호출하면 느리고 불안정하니까, 가짜를 만들어서 "이 함수가 호출되면 이런 값을 돌려줘라"고 지정한다. 연극에서 실제 폭탄 대신 소품 폭탄을 쓰는 것과 비슷하다.
:::

### 3.1 `@pytest.fixture` — 테스트 준비물 자동 주입

```python
@pytest.fixture
def mock_parser() -> MagicMock:
    """가짜 DataParser를 만들어준다."""
    return MagicMock(spec=DataParser)

@pytest.fixture
def agent(mock_parser, mock_validator) -> AnalysisAgent:
    """가짜 의존성을 주입한 AnalysisAgent를 만들어준다."""
    return AnalysisAgent(parser=mock_parser, validator=mock_validator)

def test_analyze(agent, mock_parser):
    # pytest가 fixture 체인을 자동으로 해결한다:
    # 1. mock_parser 생성
    # 2. mock_validator 생성
    # 3. 둘을 이용해 agent 생성
    # 4. test_analyze에 agent와 mock_parser 주입
    ...
```

**어떻게 동작하나?**

`@pytest.fixture`는 "이 함수의 결과물을 테스트에서 재사용할 준비물로 등록하라"는 뜻이다. 테스트 함수의 **매개변수 이름**과 **fixture 함수 이름**이 같으면 pytest가 자동으로 연결해준다.

위 예시에서 `test_analyze(agent, mock_parser)`:
- `agent` → `agent` fixture를 찾아서 실행
- `agent` fixture는 `mock_parser`와 `mock_validator`가 필요 → 이것들도 자동 실행
- 이 **체인(연쇄)**을 pytest가 알아서 해결해준다

**추가 기능:**
- `scope="module"` → 모듈 전체에서 1번만 생성 (기본은 매 테스트마다 새로 생성)
- `yield`를 쓰면 테스트 후 정리(teardown) 코드를 작성할 수 있다:

```python
@pytest.fixture
def temp_file():
    f = open("test.tmp", "w")
    yield f              # 여기까지가 setup, 여기서 테스트 실행
    f.close()            # 테스트 끝나면 이 코드가 자동 실행 (teardown)
    os.remove("test.tmp")
```

### 3.2 `MagicMock(spec=...)` — 인터페이스 동기화

```python
# spec 없이 — 무법지대
mock = MagicMock()
mock.prse_data()        # ✅ 에러 없음! (parse_data의 오타인데 통과됨)
mock.아무거나()          # ✅ 이것도 통과됨 (존재하지 않는 메서드)
mock.xyz.abc.defg()     # ✅ 이것마저 통과됨

# spec 있으면 — 실제 클래스의 메서드만 허용
mock = MagicMock(spec=DataParser)
mock.parse_data()       # ✅ DataParser에 실제로 있는 메서드
mock.prse_data()        # ❌ AttributeError! (오타 즉시 발견)
```

**왜 `spec`이 중요한가?**

`MagicMock()`은 기본적으로 **어떤 메서드를 호출해도 에러 없이 통과**시킨다. 편리하지만 위험하다. 메서드 이름에 오타가 있어도 테스트가 통과해버린다.

`spec=DataParser`를 지정하면 mock이 `DataParser` 클래스의 인터페이스(어떤 메서드를 갖고 있는지)를 복제한다. 실제로 존재하지 않는 메서드를 호출하면 에러가 난다. 나중에 `DataParser`의 메서드 이름이 바뀌면 mock 테스트도 함께 깨지므로, 테스트와 실제 코드가 항상 동기화된다.

**비슷한 `create_autospec(DataParser)` 대신 `MagicMock(spec=DataParser)`를 쓴 이유:**

`create_autospec`은 **클래스 자체**를 모킹한다 (인스턴스가 아니라). 우리 코드에서는 이미 만들어진 **인스턴스를 주입**받는 구조이므로, 인스턴스를 흉내내는 `MagicMock(spec=...)`이 맞다.

### 3.3 `assert_called_once()` — 호출 검증

```python
# "validate 메서드가 정확히 1번 호출됐는가?"
mock_validator.validate.assert_called_once()

# "parse 메서드가 한 번도 호출되지 않았는가?"
mock_parser.parse.assert_not_called()
```

`MagicMock`은 모든 호출을 내부적으로 기록한다. 마치 CCTV처럼, 누가 언제 어떤 메서드를 호출했는지 다 알고 있다.

**실전 활용 예시:** 캐시에 결과가 이미 있으면 파서를 호출하지 않아야 한다. 이때 `assert_not_called()`로 "파서가 정말 호출되지 않았는지" 검증하면, 캐시 로직이 제대로 동작하는지 확인할 수 있다.

### 3.4 `caplog` — 로그 캡처 및 검증

```python
with caplog.at_level(logging.WARNING, logger="myapp.core.processor"):
    result = agent.analyze(data)

assert "파싱 실패" in caplog.text
```

**`caplog`는 pytest가 기본 제공하는 fixture**로, 프로그램이 남기는 로그를 캡처한다.

`caplog.at_level(logging.WARNING, logger="myapp.core.processor")`는 "myapp.core.processor 로거의 WARNING 레벨 이상 로그를 잡아라"는 뜻이다.

이게 왜 필요할까? 어떤 에러는 프로그램을 멈추지 않고, 로그만 남기고 계속 진행한다. 이때 "로그가 정말 남았는가?"를 테스트할 수 있어야 한다. 예를 들어 "손상된 데이터를 처리할 때 WARNING 로그가 남는가?"를 검증할 수 있다.

### 3.5 Pre-computed 결과 테스트 — 분기 경로 검증

성능 최적화를 위해 "미리 계산된 결과를 bool로 저장하고, 이후 단계에서 이 결과를 재활용하는" 구조를 만들었다. 이때 분기 로직이 네 갈래로 나뉘는데, 각각을 빠짐없이 테스트해야 한다:

| Pre-computed 값 | 동작 | 검증 방법 |
|---|---|---|
| `True` | 재계산 스킵, 정상 판정 | `assert_not_called()` |
| `False` | 재계산 스킵, 불확실 판정 | `assert_not_called()` |
| `None` | fallback으로 원본 데이터 직접 처리 | `assert_called_once()` |
| 모두 pre-computed | 처리기 완전 미사용 | `assert_not_called()` |

`None`은 "아직 계산되지 않았다"는 뜻이므로, 이때만 실제 처리기를 호출해야 한다. `assert_not_called()`와 `assert_called_once()`로 각 경로에서 처리기가 호출됐는지/안 됐는지를 정확히 구분한다.

---

## 4. 에러 처리 전략

### 4.1 Python 예외 계층과 `except Exception`

Python의 모든 예외(에러)는 나무처럼 계층 구조를 이루고 있다:

```
BaseException           ← 모든 예외의 최상위 부모
├── KeyboardInterrupt   ← 사용자가 Ctrl+C를 누름
├── SystemExit          ← 프로그램 종료 요청 (sys.exit())
└── Exception           ← "일반적인" 예외들의 부모
    ├── ValueError      ← 값이 잘못됨
    ├── TypeError       ← 타입이 잘못됨
    ├── FileNotFoundError ← 파일을 찾을 수 없음
    └── ...
```

`except Exception`이라고 쓰면 `Exception`과 그 아래 자식들만 잡는다. `KeyboardInterrupt`(Ctrl+C)와 `SystemExit`(프로그램 종료)는 잡지 않는다.

**왜 이게 중요할까?** 사용자가 Ctrl+C로 프로그램을 멈추려 하는데, `except BaseException`으로 모든 예외를 잡아버리면 프로그램이 멈추지 않는다. `except Exception`은 "프로그래밍 에러는 잡되, 사용자의 의도적 중단은 존중한다"는 뜻이다.

주석으로 "BaseException은 잡지 않음"을 명시하면, 미래 개발자가 "더 안전하게 하려고" `BaseException`으로 바꾸는 실수를 방지할 수 있다.

### 4.2 에러 타입 포맷팅

```python
# 변경 전
error=str(e)                        # "No such file or directory"

# 변경 후
error=f"{type(e).__name__}: {e}"    # "FileNotFoundError: No such file or directory"
```

"No such file or directory"만 보면 **어떤 종류의 에러**인지 바로 알기 어렵다. 네트워크 문제? 파일 시스템 문제? 권한 문제?

`type(e).__name__`은 에러 클래스의 이름(예: `FileNotFoundError`, `PermissionError`)을 반환한다. 이것을 에러 메시지 앞에 붙이면 **에러의 종류와 상세 내용**을 한 번에 볼 수 있다.

### 4.3 예외 타입별 분리 — 로그 기반 운영

이 패턴은 3단계에 걸쳐 진화했다:

**1단계: 뭉뚱그려 처리**
```python
except (FileNotFoundError, json.JSONDecodeError) as e:
    logger.error("DB 로드 실패: %s", e)
```
문제: "파일이 없는 건지, 파일은 있는데 내용이 깨진 건지" 구분이 안 된다.

**2단계: `logger.exception`으로 변경**
```python
except (FileNotFoundError, json.JSONDecodeError) as e:
    logger.exception("DB 로드 실패")  # 스택 트레이스 포함
```
개선: 에러의 전체 경로(스택 트레이스)가 보이지만, 여전히 예외 종류를 구분하기 어렵다.

**3단계: 타입별 분리 (최종)**
```python
except FileNotFoundError:
    logger.error(
        "DB 파일 없음 (경로: %s) — 해당 기능이 비활성화됩니다.",
        self._db_path,
    )
    return {}
except json.JSONDecodeError:
    logger.error(
        "DB JSON 파싱 오류 (경로: %s) — 데이터 파일 손상 가능",
        self._db_path,
        exc_info=True,
    )
    return {}
```

**왜 이게 좋은가?**
- "파일 없음"인지 "파일 손상"인지 **로그 한 줄로 즉시 구분**
- 각 에러별로 **영향 범위**(비활성화됩니다, 손상 가능)를 명시
- `exc_info=True`는 `FileNotFoundError`에는 불필요(원인이 명확)하고, `JSONDecodeError`에는 필요(어디서 파싱이 깨졌는지 보려면 스택 트레이스가 필요)

### 4.4 FAIL_FAST 모드 — 환경별 동작 전환

```python
_FAIL_FAST = os.getenv("APP_FAIL_FAST", "false").lower() == "true"

try:
    result = process(data)
except Exception as e:
    if _FAIL_FAST:
        raise  # 예외 재전파 — 프로그램 즉시 크래시
    logger.error("처리 실패: %s", e)
    result = default_value  # 프로덕션: 에러 기록 후 계속 진행
```

**딜레마가 있다:**

- **프로덕션(실제 운영)**: 하나의 모듈이 실패해도 나머지는 계속 돌아야 한다. 에러를 기록하고 넘어간다.
- **개발 환경**: 버그를 즉시 발견해야 한다. 에러가 나면 바로 크래시시켜서 개발자 눈에 띄게 해야 한다.

환경변수 `APP_FAIL_FAST`를 `true`로 설정하면 개발 모드, `false`(또는 미설정)면 프로덕션 모드다. 코드를 전혀 수정하지 않고 환경변수 하나로 동작을 전환할 수 있다.

### 4.5 에러 reason 구체화

```python
# 변경 전
reason="처리 결과 없음 (워크플로우 오류)"

# 변경 후
reason="처리 결과 없음 (이전 단계 실패 후 잘못된 호출 또는 워크플로우 버그)"
```

변경 전 메시지를 보면 "오류가 났구나"만 알 수 있다. 변경 후 메시지를 보면 "이전 단계가 실패한 뒤 이 함수가 호출됐거나, 워크플로우 자체에 버그가 있다"는 **두 가지 가능한 원인**을 즉시 파악할 수 있다.

운영 환경에서 새벽 3시에 알람이 울렸을 때, "오류입니다"와 "A가 잘못됐거나 B가 잘못됐습니다"의 차이는 디버깅 시간에서 크게 드러난다.

---

## 5. 메모리 최적화와 안전성

### 5.1 방어적 복사 — `list(items)`

```python
# 변경 전
result = Result(items=items)   # items 리스트를 그대로 전달

# 변경 후
result = Result(items=list(items))   # items의 복사본을 전달
```

**핵심 개념: Python에서 리스트를 변수에 넣으면 복사가 아니라 "같은 물건을 가리키는 이름표"가 하나 더 생기는 것이다.**

```python
original = [1, 2, 3]
shared = original      # 복사가 아님! 같은 리스트를 가리킴

original.append(4)
print(shared)          # [1, 2, 3, 4] — shared도 바뀌었다!
```

이건 마치 같은 구글 문서를 두 사람이 공유하는 것과 같다. 한 사람이 수정하면 다른 사람에게도 바뀐 내용이 보인다.

`list(items)`를 하면 **내용이 같은 새 리스트**를 만든다. 원본과 복사본은 독립적이므로, 한쪽을 수정해도 다른 쪽에 영향이 없다. 이를 **방어적 복사(defensive copy)**라고 한다.

### 5.2 Lambda late binding 버그 (Critical)

:::danger 이 버그는 실제로 발견하기 매우 어렵다
코드 리뷰에서 가장 중요한 발견 중 하나였다. lambda의 동작을 정확히 이해하지 않으면 놓치기 쉽다.
:::

```python
# 변경 전
fallback=(lambda: processor.process(data.raw_content))

# 변경 후
raw_content = data.raw_content  # 이 시점의 값을 로컬 변수에 저장
fallback=(lambda: processor.process(raw_content))
```

**무슨 일이 벌어지는가?**

Python의 lambda(그리고 일반 함수도)는 변수의 **값(value)**이 아니라 **이름(참조, reference)**을 캡처한다. 쉽게 말하면:

```python
x = 10
f = lambda: print(x)  # x의 "값 10"을 저장하는 게 아니라, "x라는 이름"을 기억함

x = 20  # x의 값을 바꿈
f()     # 20 출력! (10이 아님)
```

lambda는 `f`가 만들어질 때의 `x` 값(10)을 기억하는 게 아니라, 실행될 때 `x`를 찾아가서 그때의 값(20)을 읽는다.

**실전에서의 문제:**

메모리 최적화를 위해 `data.raw_content = None`으로 큰 데이터를 해제한 뒤, 나중에 lambda가 실행되면 `data.raw_content`가 이미 `None`이 되어 있다. 프로세서에 `None`이 전달되면서 에러가 발생한다.

**해결:** lambda를 만들기 전에 `raw_content = data.raw_content`로 로컬 변수에 값을 미리 담아둔다. 이후 `data.raw_content`가 `None`이 되어도, 로컬 변수 `raw_content`는 원래 값을 그대로 갖고 있다.

### 5.3 원자적 초기화 — 부분 초기화 방지

:::info 원자적(Atomic)이란?
"전부 실행되거나, 전혀 실행되지 않거나" 둘 중 하나인 연산을 원자적이라고 한다. ATM에서 돈을 보낼 때, "내 계좌에서 빠지고 + 상대 계좌에 들어가는" 두 단계가 **반드시 함께** 성공하거나 **함께** 실패해야 하는 것과 같다. 중간에 하나만 성공하면 돈이 증발한다.
:::

```python
# 변경 전: 하나씩 바로 전역 변수에 할당
_parser = DataParser()        # 성공
_matcher = PatternMatcher()   # 💥 여기서 실패!
_validator = DataValidator()  # 실행 안 됨

# → 결과: _parser만 있고 _matcher, _validator는 None인 "반쪽짜리" 상태
```

이 상태에서 프로그램이 계속 돌면, `_matcher`를 쓰려는 코드에서 `None`을 접근하며 또 다른 에러가 발생한다. 원인 추적이 매우 어렵다.

```python
# 변경 후: 로컬 변수에서 모두 생성한 뒤 일괄 할당
parser = DataParser()        # 성공
matcher = PatternMatcher()   # 💥 여기서 실패하면...
validator = DataValidator()  # 실행 안 됨

# → 전역 변수 _parser, _matcher, _validator는 모두 이전 값(None) 그대로
# → "전부 성공 또는 전부 실패" — 원자성 확보

_parser = parser       # 모두 성공했을 때만 여기까지 도달
_matcher = matcher
_validator = validator
```

로컬 변수에서 먼저 생성하므로, 중간에 실패하면 전역 변수는 건드리지 않는다.

### 5.4 Mutable과 In-place의 차이

이 두 용어는 자주 혼동되지만, 다른 개념이다:

**Mutable(변경 가능)** — 객체의 **속성**이다. "이 객체는 생성 후에 내부를 바꿀 수 있는가?"
- Mutable: `list`, `dict`, `set` — 생성 후 추가/삭제 가능
- Immutable: `tuple`, `str`, `int` — 생성 후 변경 불가

**In-place(제자리 연산)** — 연산의 **방식**이다. "새 객체를 만드는가, 기존 객체를 직접 수정하는가?"
- In-place: `my_list.sort()` — 원본 리스트 자체를 정렬
- Not in-place: `sorted(my_list)` — 정렬된 **새 리스트**를 반환, 원본은 그대로

```python
numbers = [3, 1, 2]

# In-place 연산
numbers.sort()         # numbers가 [1, 2, 3]으로 직접 변경됨

# Not in-place 연산
new_numbers = sorted(numbers)  # new_numbers는 [1, 2, 3], numbers는 그대로
```

**관계:** In-place 연산은 mutable 객체에서만 가능하다 (immutable은 수정 자체가 안 되니까). 하지만 mutable이라고 해서 모든 연산이 in-place인 것은 아니다 (`sorted(my_list)`는 mutable 리스트를 받지만, in-place가 아니다).

---

## 6. Python 관용 패턴

:::info 관용 패턴(Idiom)이란?
프로그래밍 언어마다 "이럴 때는 이렇게 쓰는 게 자연스럽다"는 패턴이 있다. 한국어에서 "밥 먹었어?"가 인사인 것처럼, Python에도 "Pythonic하다"고 불리는 자연스러운 코드 스타일이 있다.
:::

### 6.1 `bool(matches)` — Pythonic 진위값 변환

```python
# 변경 전
return len(matches) > 0

# 변경 후
return bool(matches)
```

**Python의 Truthiness(진위값) 규칙:**

Python에서 모든 값은 `True` 또는 `False`로 평가될 수 있다:
- **Falsy (거짓으로 취급)**: `0`, `""`, `[]`, `{}`, `None`, `False`
- **Truthy (참으로 취급)**: 위를 제외한 모든 것

빈 리스트 `[]`는 falsy이고, 요소가 있는 리스트 `[1, 2]`는 truthy다. 따라서 `len(matches) > 0`은 `bool(matches)`와 같은 의미다.

다만, 이것이 항상 좋은 것은 아니다. `bool(matches)`는 Python을 잘 아는 사람에게는 자연스럽지만, 조건이 복잡해지면 `len(matches) > 0`이 더 읽기 쉬울 수 있다. **"읽는 사람이 바로 이해하는가?"**가 기준이다.

### 6.2 `next()` — 첫 번째 매칭 요소 찾기

```python
# 변경 전: for 루프로 하나씩 확인
def _find_item(results, name):
    for item in results.items:
        if item.name == name:
            return item
    return None

# 변경 후: next()로 한 줄로 표현
def _find_item(results, name):
    return next((item for item in results.items if item.name == name), None)
```

**`next()`는 어떻게 동작할까?**

`next(이터레이터, 기본값)` — 이터레이터의 **첫 번째 요소**를 반환한다. 요소가 없으면 **기본값**을 반환한다.

안쪽의 `(item for item in results.items if item.name == name)`는 **제너레이터 표현식**이다. 조건에 맞는 요소를 하나씩 생성하지만, `next()`가 첫 번째만 가져가므로 나머지는 생성되지 않는다 (효율적).

두 번째 인자 `None`은 조건에 맞는 요소가 없을 때 반환할 기본값이다. 이게 없으면 `StopIteration` 에러가 발생한다.

**결론:** "컬렉션에서 조건에 맞는 첫 요소 찾기"를 표현하는 Python 관용 패턴이다. for 루프 4줄을 1줄로 줄인다.

### 6.3 dict 기반 O(1) 조회

:::info O(1)과 O(n)이란?
알고리즘의 속도를 표현하는 방법이다. **O(n)**은 데이터가 n개면 최대 n번 확인해야 한다는 뜻이고(리스트에서 하나씩 찾기), **O(1)**은 데이터가 몇 개든 한 번에 찾을 수 있다는 뜻이다(dict에서 키로 조회). 전화번호부에서 이름을 처음부터 훑어보는 것(O(n))과 색인(ㄱ, ㄴ, ㄷ...)으로 바로 찾아가는 것(O(1))의 차이다.
:::

```python
# 변경 전: 리스트에서 하나씩 찾기 — O(n)
result = _get_result(results, TaskType.VALIDATION)

# 변경 후: dict로 변환 후 키로 바로 찾기 — O(1)
result_map = {r.task_type: r for r in results}
result = result_map.get(TaskType.VALIDATION)
```

`{r.task_type: r for r in results}`는 **딕셔너리 컴프리헨션**이다. 리스트의 각 요소를 `{키: 값}` 쌍으로 변환하여 dict를 만든다.

**성능 외에도 중요한 이유:** 병렬로 실행된 작업의 결과 순서는 보장되지 않는다. 리스트 기반 조회는 순서에 의존할 수 있지만, dict 기반 조회는 키(task_type)로 찾으므로 순서가 바뀌어도 상관없다. 코드 구조 자체에서 "순서에 의존하지 않는다"는 의도가 드러난다.

### 6.4 `getattr` vs `hasattr`

```python
# 변경 전: 속성을 2번 조회 (있는지 확인 1번 + 실제 접근 1번)
if hasattr(obj, "resource_entries"):
    for entry in obj.resource_entries.entries:

# 변경 후: 속성을 1번만 조회
resource = getattr(obj, "resource_entries", None)
if resource is not None:
    for entry in resource.entries:
```

`hasattr(obj, "name")`은 "obj에 name이라는 속성이 있는가?"를 True/False로 반환한다. 이후 `obj.name`으로 다시 접근하면, 같은 속성을 **2번** 조회하는 셈이다.

`getattr(obj, "name", None)`은 "obj에서 name을 가져오되, 없으면 None을 반환하라"이다. 확인과 획득을 **동시에** 처리한다.

추가 이점: `resource`라는 짧은 변수에 담으므로, 이후 코드에서 `obj.resource_entries.entries` 같은 긴 이름을 반복하지 않아도 된다.

### 6.5 Logging에서 `%s` 포맷팅

```python
# ✅ 권장 — 로그 레벨이 꺼져 있으면 포맷팅을 건너뜀
logger.debug("파싱 실패: %s", e)

# ❌ 비효율 — 로그 레벨과 무관하게 항상 f-string을 평가함
logger.debug(f"파싱 실패: {e}")
```

**차이점을 자세히 살펴보자:**

f-string 방식(`f"..."`)은 `logger.debug()`가 **호출되기 전에** 문자열이 먼저 완성된다. 즉, 로그 레벨이 DEBUG가 아니라서 실제로 출력되지 않을 때도 문자열 조합 작업이 수행된다.

`%s` 방식은 `logger.debug()`가 "이 로그를 출력해야 하나?" 판단한 **뒤에** 문자열을 조합한다. 출력하지 않을 거라면 포맷팅 자체를 건너뛴다.

한 번의 차이는 미미하지만, 반복문 안에서 수천~수만 번 호출되는 DEBUG 로그에서는 성능 차이가 누적된다.

---

## 7. 설계 판단과 match/case 동작

### 7.1 룰 컴파일 실패 — 전체 중단 vs 부분 비활성화

```python
# 변경 전: 하나 실패하면 전체 시스템 중단
except CompilationError as e:
    raise RuntimeError(...) from e

# 변경 후: 실패한 룰만 비활성화하고 나머지는 계속 가동
except CompilationError as e:
    logger.error(
        "룰 컴파일 실패 (%s) — 해당 룰 비활성화 후 계속 진행",
        rule_type.value,
    )
    self._rules[rule_type] = None
```

**비유:** 보안 검색대에 X-ray 기계, 금속 탐지기, 폭발물 탐지기가 있다고 하자.

- **변경 전 방식**: 금속 탐지기가 고장나면 → 보안 검색대 전체를 폐쇄한다. 모든 승객이 발이 묶인다.
- **변경 후 방식**: 금속 탐지기가 고장나면 → 금속 탐지만 건너뛰고, X-ray와 폭발물 탐지는 계속한다. 완벽하지는 않지만 최소한의 보안은 유지된다.

여러 검증 룰을 운용하는 시스템에서는, 하나의 룰 문제로 전체가 멈추는 것보다 **부분 가동**이 운영상 더 합리적이다. 물론 이 판단은 도메인에 따라 다를 수 있다 — 금융 거래처럼 하나라도 검증이 빠지면 안 되는 경우에는 전체 중단이 맞다.

### 7.2 match/case 와일드카드 `_`의 함정

:::info match/case란?
Python 3.10에서 추가된 **구조적 패턴 매칭**이다. 값의 구조를 패턴과 비교하여 맞는 케이스를 실행한다. `if/elif` 체인의 더 강력한 버전이라고 생각하면 된다.
:::

```python
match (check_a, check_b, check_c):
    case (PASS, PASS, _):     # 패턴 1: a=PASS, b=PASS, c=무엇이든
        verdict = "정상"
    case (PASS, FAIL, _):     # 패턴 2: a=PASS, b=FAIL, c=무엇이든
        verdict = "비정상"
    case _:                    # 기본 케이스: 위 패턴에 안 맞으면
        verdict = "추가 검토 필요"
```

**와일드카드 `_`는 "무엇이든 매칭"이다. `None`도 포함한다.**

이게 왜 함정일까? 두 가지 시나리오를 비교해보자:

**시나리오 1**: check_c가 누락됨(`None`)
```
(PASS, PASS, None) → 패턴 1의 _가 None을 매칭 → "정상" 판정
```
check_c를 검사하지 않았는데도 "정상"으로 판정됐다. `_`가 `None`을 잡아먹었기 때문이다.

**시나리오 2**: check_b가 누락됨(`None`)
```
(PASS, None, None) → 패턴 1의 b자리는 PASS여야 하는데 None → 매칭 실패
                   → 패턴 2의 b자리는 FAIL이어야 하는데 None → 매칭 실패
                   → 기본 케이스 → "추가 검토 필요"
```

**같은 `None`(누락)인데, 위치에 따라 결과가 완전히 다르다.** `_` 자리에 있으면 조용히 넘어가고, 구체적 값이 필요한 자리에 있으면 매칭 실패가 된다.

이 발견은 실제 테스트 실행 중 기대값과 실제값이 달라서 발견됐고, 두 케이스의 동작 차이를 테스트로 문서화했다.

### 7.3 assert를 활용한 타입 내로잉

```python
if both_failed:
    assert result_a is not None and result_b is not None
    errors = [f"A: {result_a.error}", f"B: {result_b.error}"]
```

**배경:** `result_a`와 `result_b`는 타입이 `Result | None`이다 (결과가 있거나, 없으면 None). `both_failed=True`이면 논리적으로 두 결과가 모두 존재해야 한다 — 결과가 없는데 실패할 수는 없으니까.

**문제:** 하지만 타입 체커(mypy, pyright 같은 도구)는 이 논리를 이해하지 못한다. `both_failed`라는 변수가 `True`라고 해서 `result_a`가 `None`이 아니라는 보장은 타입 체커의 분석 범위 밖이다. 그래서 `result_a.error`에 "result_a가 None일 수 있다"는 경고를 띄운다.

**해결:** `assert result_a is not None`을 쓰면:
1. **타입 체커에게**: "이 시점 이후로 result_a는 None이 아니다"라고 알려준다 (타입 내로잉)
2. **런타임에서**: 만약 누군가 코드를 리팩토링해서 `both_failed`의 의미가 바뀌었는데 이 부분을 수정하지 않았다면, `assert`가 즉시 실패하여 버그를 잡아준다

### 7.4 docstring으로 오용 방지

```python
def compute_overall_verdict(items: list[CheckResult]) -> Verdict:
    """CheckResult 목록에서 종합 판정을 계산한다.

    overall_verdict는 로깅/디버깅/감사 목적으로 사용되며,
    최종 판정 로직은 이 값을 사용하지 않고 개별 CheckResult를 직접 조회한다.
    """
```

**왜 이런 docstring이 필요할까?**

`compute_overall_verdict`라는 함수 이름을 보면, "아, 이게 최종 판정을 내리는 함수구나"라고 오해하기 쉽다. 하지만 실제로 최종 판정은 다른 곳에서 개별 `CheckResult`를 직접 보고 내린다. 이 함수의 결과는 로그에 기록하거나 디버깅할 때만 쓴다.

docstring에 이 사실을 명시하지 않으면, 새 모듈을 만드는 개발자가 이 함수의 결과를 최종 판정 근거로 잘못 사용할 수 있다. 주석 한 줄이 미래의 버그를 예방한다.

---

## 8. ABC(추상 기본 클래스)와 에이전트 계약

:::info 추상 클래스란?
**"설계도의 설계도"**라고 생각하면 된다. 자동차 설계도는 "바퀴 4개, 엔진 1개"라는 공통 규칙을 정해놓고, 세부 디자인은 각 모델(세단, SUV, 트럭)이 알아서 채운다. 추상 클래스가 바로 이 "공통 규칙"이다.
:::

```python
from abc import ABC, abstractmethod

class BaseAgent(ABC):
    @property
    @abstractmethod
    def name(self) -> str:
        """Agent 식별자. 반드시 구현해야 한다."""
        ...

    @abstractmethod
    def analyze(self, data) -> AnalysisResult:
        """데이터를 분석한다. 반드시 구현해야 한다."""
        ...
```

**동작 방식:**

1. `ABC`를 상속하면 이 클래스는 **직접 인스턴스를 만들 수 없다**:
```python
agent = BaseAgent()  # ❌ TypeError: Can't instantiate abstract class
```

2. `@abstractmethod`가 붙은 메서드를 **하위 클래스에서 반드시 구현**해야 한다:
```python
class SearchAgent(BaseAgent):
    # name과 analyze를 구현하지 않으면...
    pass

agent = SearchAgent()  # ❌ TypeError: Can't instantiate abstract class
                        # SearchAgent with abstract methods analyze, name
```

3. 모든 추상 메서드를 구현하면 정상 작동:
```python
class SearchAgent(BaseAgent):
    @property
    def name(self) -> str:
        return "search"

    def analyze(self, data) -> AnalysisResult:
        # 실제 분석 로직
        ...

agent = SearchAgent()  # ✅ 정상 생성
```

**`@property`와 `@abstractmethod`를 함께 쓴 이유:**

`@property`만 쓰면 "이 값은 읽기 전용이다"이고, `@abstractmethod`만 쓰면 "이 메서드를 반드시 구현하라"이다. 둘을 합치면 **"이 읽기 전용 속성을 반드시 제공하라"**는 계약이 된다. 모든 Agent가 고유한 `name`을 반드시 갖도록 강제할 수 있다.

---

## 마무리

여러 차례의 코드 리뷰에서 다룬 패턴들은 크게 세 가지 원칙으로 수렴한다:

1. **명시적으로 표현하라** — 타입 어노테이션, 주석, docstring, 환경변수 네이밍 모두 "왜 이렇게 했는가"를 코드에 남기는 행위다. `dict`보다 `dict[str, Any]`가, `str(e)`보다 `f"{type(e).__name__}: {e}"`가 더 많은 정보를 전달한다.

2. **실제 제약 조건이 설계 원칙보다 우선한다** — 불변성 패턴은 좋지만, 메모리 최적화가 필요하면 in-place 변경으로 전환한다. 교과서적 방법이 현실의 요구와 충돌하면, 현실이 이긴다.

3. **테스트는 문서다** — match/case 와일드카드의 `None` 매칭, pre-computed 결과의 분기 동작 같은 엣지 케이스를 테스트로 기록하면, 미래 개발자에게 코드가 직접 설명한다. "왜 이렇게 동작하는가?"에 대한 답이 테스트 코드에 있다.
