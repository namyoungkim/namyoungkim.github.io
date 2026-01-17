---
slug: claude-code-series-part3
title: "[Claude Code 마스터하기 #3] Subagents, Skills, Agent SDK: 확장의 모든 것"
authors: namyoungkim
tags: [claude, claude-code, ai, dev-tools, agent-sdk, tutorial]
---

> 이 글은 Claude Code 시리즈의 세 번째 편입니다. Part 1-2에서 기본과 자동화를 다뤘다면, 이제 진정한 확장으로 넘어갑니다.

---

## TL;DR

- **Subagents**: 독립 컨텍스트에서 작업하는 전문가 에이전트 (토큰 절약)
- **Skills**: Claude가 자동으로 판단해서 사용하는 능력 (vs 슬래시 커맨드)
- **Agent SDK**: Claude Code 엔진을 코드로 제어 (Python/TypeScript)
- 셋을 조합하면 복잡한 멀티 에이전트 시스템 구축 가능

<!-- truncate -->

---

## 들어가며

Part 1-2에서 Claude Code의 기본 기능과 자동화를 다뤘습니다. 하지만 복잡한 작업에서는 한계가 있습니다.

```
문제 1: 컨텍스트가 길어지면 토큰 비용 폭발
문제 2: 모든 작업을 하나의 Claude가 처리하면 비효율
문제 3: 반복되는 작업 패턴을 재사용하고 싶음
문제 4: 내 앱/서비스에 Claude Code를 통합하고 싶음
```

이 문제들을 해결하는 세 가지 확장 기능:

| 기능 | 해결하는 문제 | 비유 |
|------|-------------|------|
| **Subagents** | 토큰 비용, 전문화 | 팀 내 전문가 위임 |
| **Skills** | 작업 패턴 재사용 | 직원의 숙련된 스킬 |
| **Agent SDK** | 앱 통합, 완전 제어 | 엔진만 가져다 쓰기 |

---

## Part A: Subagents (서브에이전트)

### Subagent란?

**"독립된 컨텍스트에서 작업하는 전문가 에이전트"**

회사에서 일하는 방식을 생각해보세요:

```
❌ 나쁜 방식: 팀장이 모든 일을 직접 함
   → 병목, 비효율, 번아웃

✅ 좋은 방식: 전문가에게 위임
   → "보안 검토는 보안팀에, 성능 분석은 인프라팀에"
```

Claude Code도 마찬가지입니다. 메인 Claude가 모든 걸 하면 컨텍스트가 폭발합니다.

### 왜 Subagent인가? (토큰 경제학)

**일반 대화 방식:**

```
메인 Claude 컨텍스트:
- 초기 프롬프트: 1,000 토큰
- 파일 A 분석: +5,000 토큰
- 파일 B 분석: +5,000 토큰
- 파일 C 분석: +5,000 토큰
- 종합 보고서: +2,000 토큰
───────────────────────────
누적: 18,000 토큰 (매 턴마다 이만큼 전송)
```

**Subagent 방식:**

```
메인 Claude: 1,000 토큰
├── Subagent A: 5,000 토큰 → 결과 500 토큰만 반환
├── Subagent B: 5,000 토큰 → 결과 500 토큰만 반환
├── Subagent C: 5,000 토큰 → 결과 500 토큰만 반환
└── 메인이 받는 것: 1,000 + 1,500 = 2,500 토큰
```

**토큰 비용이 1/7로 줄어듭니다.**

### 내장 Subagent 3가지

| 이름 | 용도 | 특징 |
|------|------|------|
| `Explore` | 코드베이스 탐색 | 읽기 전용, 수정 불가 |
| `Plan` | 계획 수립 | /plan 모드의 리서치 담당 |
| `General Purpose` | 범용 작업 | 복잡한 다단계 작업 |

### 커스텀 Subagent 만들기

**.claude/agents/code-reviewer.md**:

```markdown
---
name: code-reviewer
description: "코드 리뷰 전문가. 버그, 보안 취약점, 성능 이슈를 찾을 때 사용"
model: claude-sonnet-4-5-20250929
tools:
  - Read
  - Grep
  - Glob
---

당신은 시니어 코드 리뷰어입니다.

## 역할
- 버그 가능성 탐지
- 보안 취약점 식별
- 성능 개선점 제안
- 코드 스타일 검토

## 출력 형식
각 발견 사항을 다음 형식으로 보고:

### [심각도] 제목
- **위치**: 파일:라인
- **문제**: 설명
- **해결책**: 제안

심각도: 🔴 Critical, 🟠 Warning, 🟡 Info

## 주의사항
- 파일을 수정하지 않음 (읽기만)
- 발견 사항이 없으면 "이슈 없음" 보고
- 최대 10개 항목만 보고 (우선순위순)
```

**.claude/agents/security-expert.md**:

```markdown
---
name: security-expert
description: "보안 전문가. SQL injection, XSS, 인증 취약점 등 보안 이슈 전문"
model: claude-sonnet-4-5-20250929
tools:
  - Read
  - Grep
  - Glob
  - Bash
---

당신은 애플리케이션 보안 전문가입니다.

## 전문 분야
- SQL Injection
- XSS (Cross-Site Scripting)
- CSRF (Cross-Site Request Forgery)
- 인증/인가 취약점
- 민감 정보 노출
- 의존성 취약점

## 검사 절차
1. 사용자 입력 처리 코드 검토
2. 데이터베이스 쿼리 패턴 분석
3. 인증 로직 검토
4. 민감 정보 하드코딩 탐지
5. 의존성 버전 확인

## 출력 형식
OWASP Top 10 기준으로 분류하여 보고
```

**.claude/agents/performance-analyzer.md**:

```markdown
---
name: performance-analyzer
description: "성능 분석 전문가. 병목, 메모리 누수, 비효율적 알고리즘 탐지"
model: claude-sonnet-4-5-20250929
tools:
  - Read
  - Grep
  - Glob
  - Bash
---

당신은 성능 최적화 전문가입니다.

## 분석 항목
- 시간 복잡도 분석 (O(n²) 이상 경고)
- 메모리 사용 패턴
- N+1 쿼리 문제
- 불필요한 I/O
- 캐싱 기회

## Bash 사용
- `time` 명령으로 실행 시간 측정
- `py-spy` 또는 `cProfile`로 프로파일링
- 메모리 사용량 측정

## 출력 형식
예상 영향도(높음/중간/낮음)와 함께 보고
```

### Subagent 호출 방법

**방법 1: 자동 위임 (description 기반)**

```bash
> 이 파일의 보안 취약점을 찾아줘
# Claude가 description을 보고 security-expert 자동 호출
```

**방법 2: 명시적 호출**

```bash
> @code-reviewer src/api/users.py 리뷰해줘

> security-expert로 인증 로직 검토해줘
```

**방법 3: CLAUDE.md에서 유도**

```markdown
# CLAUDE.md

## 작업 위임 규칙
- 코드 리뷰 요청 → code-reviewer 에이전트 사용
- 보안 검토 요청 → security-expert 에이전트 사용
- 성능 분석 요청 → performance-analyzer 에이전트 사용
```

### 실전 시나리오: 멀티 에이전트 코드 리뷰

**상황**: PR 전 종합 코드 리뷰

```bash
> 이 PR을 종합적으로 리뷰해줘. 보안, 성능, 코드 품질 모두 검토해줘.

Claude: 네, 각 전문 에이전트에게 위임하겠습니다.

[security-expert 호출 중...]
[performance-analyzer 호출 중...]
[code-reviewer 호출 중...]

## 종합 리뷰 결과

### 🔴 보안 (security-expert)
1. SQL Injection 위험 - src/api/users.py:45
2. 하드코딩된 API 키 - src/config.py:12

### 🟠 성능 (performance-analyzer)
1. N+1 쿼리 - src/services/order.py:78
2. O(n²) 루프 - src/utils/search.py:23

### 🟡 코드 품질 (code-reviewer)
1. 중복 코드 - src/api/users.py, src/api/admin.py
2. 누락된 에러 핸들링 - src/services/payment.py:56

### 우선순위 권장
1. 🔴 SQL Injection 수정 (즉시)
2. 🔴 API 키 환경변수로 이동 (즉시)
3. 🟠 N+1 쿼리 최적화 (이번 스프린트)
```

---

## Part B: Agent Skills (에이전트 스킬)

### Skill이란?

**"Claude가 상황에 맞게 자동으로 사용하는 능력"**

슬래시 커맨드와 비교하면:

| | 슬래시 커맨드 | Skills |
|---|-------------|--------|
| 호출 | 사용자가 직접 `/명령` | Claude가 자동 판단 |
| 트리거 | 명시적 | 암묵적 (상황 기반) |
| 예시 | `/review` | "이 코드 분석해줘" |

### 내장 Skills

| 스킬 | 용도 | 트리거 예시 |
|------|------|-----------|
| Excel (.xlsx) | 스프레드시트 생성 | "매출 데이터 표로 만들어줘" |
| PowerPoint (.pptx) | 프레젠테이션 생성 | "발표 자료 만들어줘" |
| Word (.docx) | 문서 생성 | "보고서 작성해줘" |
| PDF | PDF 생성/분석 | "PDF로 저장해줘" |

### 커스텀 Skill 만들기

**구조:**

```
.claude/skills/
└── data-analyzer/
    ├── SKILL.md          # 스킬 정의
    ├── templates/        # 템플릿 파일
    │   └── report.md
    └── scripts/          # 보조 스크립트
        └── analyze.py
```

**예시: 데이터 분석 스킬**

**.claude/skills/data-analyzer/SKILL.md**:

```markdown
---
name: data-analyzer
description: "CSV/JSON 데이터를 분석하고 인사이트를 도출하는 스킬"
triggers:
  - "데이터 분석"
  - "CSV 분석"
  - "통계 내줘"
  - "인사이트 찾아줘"
---

# Data Analyzer Skill

## 역할
CSV, JSON, Excel 데이터를 분석하여 인사이트를 도출합니다.

## 분석 절차

### 1단계: 데이터 로드
```python
import pandas as pd
df = pd.read_csv("파일경로")
```

### 2단계: 기본 통계
- shape, dtypes, describe()
- 결측치 확인
- 중복 확인

### 3단계: 심층 분석
- 상관관계 분석
- 이상치 탐지
- 트렌드 파악

### 4단계: 시각화
- matplotlib/seaborn 사용
- 주요 인사이트별 차트 생성

## 출력 형식
templates/report.md 템플릿 사용

## 주의사항
- 대용량 데이터(100MB+)는 샘플링 제안
- 민감 정보(PII) 감지 시 경고
```

**.claude/skills/data-analyzer/templates/report.md**:

```markdown
# 데이터 분석 리포트

## 1. 데이터 개요
- 파일: {filename}
- 크기: {rows}행 × {cols}열
- 기간: {date_range}

## 2. 주요 통계
{statistics_table}

## 3. 핵심 인사이트
{insights}

## 4. 시각화
{charts}

## 5. 권장 액션
{recommendations}
```

**사용 예시:**

```bash
> sales_2024.csv 분석해서 인사이트 찾아줘

Claude: (data-analyzer 스킬 자동 활성화)

# 데이터 분석 리포트

## 1. 데이터 개요
- 파일: sales_2024.csv
- 크기: 12,450행 × 15열
- 기간: 2024-01-01 ~ 2024-12-31

## 2. 주요 통계
| 지표 | 값 |
|------|-----|
| 총 매출 | ₩45.2억 |
| 평균 주문액 | ₩363,000 |
| ...

## 3. 핵심 인사이트
1. 🔥 Q4 매출이 전년 대비 34% 증가
2. 📉 신규 고객 비율 하락 (42% → 28%)
3. 💰 VIP 고객(상위 10%)이 매출의 67% 차지

...
```

### Skill vs Subagent 언제 뭘 쓸까?

| 상황 | 추천 |
|------|------|
| 독립적 전문 분석 필요 | Subagent |
| 정해진 패턴/템플릿 | Skill |
| 컨텍스트 분리 중요 | Subagent |
| 빠른 응답 필요 | Skill |

**조합도 가능:**

```bash
> 이 데이터를 분석하고 보안 검토도 해줘

Claude:
1. data-analyzer 스킬로 분석
2. security-expert 서브에이전트로 보안 검토
```

---

## Part C: Agent SDK

### Agent SDK란?

**"Claude Code의 엔진을 프로그래밍 가능하게 노출"**

```
Claude Code (완제품)
    ↓ 내부 엔진 추출
Agent SDK (프레임워크)
    ↓ 호출
Claude API (기반)
```

| | Claude Code CLI | Agent SDK |
|---|----------------|-----------|
| 형태 | 터미널 도구 | Python/TS 라이브러리 |
| 대화형 | ✅ | ❌ |
| 앱 통합 | ❌ | ✅ |
| 에러 핸들링 | exit code | try/except |
| UI 연동 | ❌ | ✅ |
| 멀티 에이전트 | 제한적 | 완전 지원 |

### 언제 SDK를 써야 할까?

**CLI가 적합한 경우:**
- 터미널에서 직접 작업
- 쉘 스크립트/CI 파이프라인
- 일회성 작업

**SDK가 적합한 경우:**
- 웹/모바일 앱에 통합
- 복잡한 멀티 에이전트 워크플로우
- 실시간 UI 업데이트
- 데이터베이스 연동
- 에러 핸들링이 중요한 프로덕션

### SDK 설치 및 기본 사용

```bash
pip install anthropic-claude-code
```

**기본 예제:**

```python
from claude_code import Agent, query

async def main():
    # 단순 질문
    async for message in query(prompt="Hello!"):
        print(message)

    # 에이전트 생성
    agent = Agent(
        model="claude-sonnet-4-5-20250929",
        system_prompt="당신은 Python 전문가입니다."
    )

    async for message in agent.run("FastAPI 서버 만들어줘"):
        print(message)
```

### 멀티 에이전트 오케스트레이션

**패턴 1: 순차 파이프라인**

```python
async def sequential_pipeline(topic: str):
    """연구 → 분석 → 보고서 파이프라인"""

    # 1단계: 연구
    researcher = Agent(
        system_prompt="당신은 리서처입니다. 주제를 조사하세요."
    )
    research_result = ""
    async for msg in researcher.run(f"조사해줘: {topic}"):
        research_result += msg.content

    # 2단계: 분석
    analyst = Agent(
        system_prompt="당신은 분석가입니다. 데이터를 분석하세요."
    )
    analysis_result = ""
    async for msg in analyst.run(f"분석해줘:\n{research_result}"):
        analysis_result += msg.content

    # 3단계: 보고서
    writer = Agent(
        system_prompt="당신은 테크니컬 라이터입니다."
    )
    async for msg in writer.run(f"보고서 작성해줘:\n{analysis_result}"):
        yield msg
```

**패턴 2: 병렬 처리**

```python
import asyncio

async def parallel_review(files: list[str]):
    """여러 파일을 동시에 리뷰"""

    async def review_file(file_path: str):
        agent = Agent(system_prompt="코드 리뷰어입니다.")
        result = ""
        async for msg in agent.run(f"리뷰해줘: {file_path}"):
            result += msg.content
        return {"file": file_path, "review": result}

    # 동시 실행
    tasks = [review_file(f) for f in files]
    results = await asyncio.gather(*tasks)

    return results
```

**패턴 3: 조건 분기**

```python
async def smart_router(user_request: str):
    """요청 유형에 따라 적절한 에이전트로 라우팅"""

    # 라우터 에이전트
    router = Agent(
        system_prompt="""
        요청을 분류하세요:
        - security: 보안 관련
        - performance: 성능 관련
        - general: 일반 코딩
        분류 결과만 출력하세요.
        """
    )

    category = ""
    async for msg in router.run(user_request):
        category = msg.content.strip().lower()

    # 전문가 에이전트 선택
    experts = {
        "security": Agent(system_prompt="보안 전문가입니다."),
        "performance": Agent(system_prompt="성능 전문가입니다."),
        "general": Agent(system_prompt="풀스택 개발자입니다.")
    }

    expert = experts.get(category, experts["general"])

    async for msg in expert.run(user_request):
        yield msg
```

### 실전 예제: 멀티 에이전트 코드 리뷰 시스템

```python
import asyncio
from dataclasses import dataclass
from claude_code import Agent

@dataclass
class ReviewResult:
    category: str
    findings: list[dict]
    severity: str

class MultiAgentReviewer:
    def __init__(self):
        self.agents = {
            "security": Agent(
                system_prompt="""
                보안 전문가입니다. 다음을 검사합니다:
                - SQL Injection
                - XSS
                - 인증 취약점
                - 민감 정보 노출
                JSON 형식으로 출력하세요.
                """
            ),
            "performance": Agent(
                system_prompt="""
                성능 전문가입니다. 다음을 검사합니다:
                - 시간 복잡도
                - 메모리 사용
                - N+1 쿼리
                - 캐싱 기회
                JSON 형식으로 출력하세요.
                """
            ),
            "style": Agent(
                system_prompt="""
                코드 스타일 전문가입니다. 다음을 검사합니다:
                - PEP 8 준수
                - 네이밍 컨벤션
                - 코드 중복
                - 문서화
                JSON 형식으로 출력하세요.
                """
            ),
            "architecture": Agent(
                system_prompt="""
                아키텍처 전문가입니다. 다음을 검사합니다:
                - SOLID 원칙
                - 의존성 관리
                - 모듈 구조
                - 테스트 가능성
                JSON 형식으로 출력하세요.
                """
            )
        }

        self.synthesizer = Agent(
            system_prompt="""
            리뷰 결과를 종합하는 역할입니다.
            각 전문가의 리뷰를 통합하여 우선순위 정렬된
            액션 아이템 목록을 만드세요.
            """
        )

    async def review_single(self, category: str, code: str) -> ReviewResult:
        """단일 카테고리 리뷰"""
        agent = self.agents[category]
        result = ""

        async for msg in agent.run(f"다음 코드를 리뷰하세요:\n```\n{code}\n```"):
            result += msg.content

        # JSON 파싱 (실제로는 더 robust하게)
        import json
        try:
            findings = json.loads(result)
        except:
            findings = [{"raw": result}]

        return ReviewResult(
            category=category,
            findings=findings,
            severity=self._calculate_severity(findings)
        )

    def _calculate_severity(self, findings: list) -> str:
        # 심각도 계산 로직
        if any("critical" in str(f).lower() for f in findings):
            return "critical"
        elif any("warning" in str(f).lower() for f in findings):
            return "warning"
        return "info"

    async def review_all(self, code: str) -> dict:
        """모든 카테고리 병렬 리뷰"""

        # 1단계: 병렬 리뷰
        tasks = [
            self.review_single(category, code)
            for category in self.agents.keys()
        ]
        results = await asyncio.gather(*tasks)

        # 2단계: 종합
        all_findings = "\n".join([
            f"## {r.category}\n{r.findings}"
            for r in results
        ])

        synthesis = ""
        async for msg in self.synthesizer.run(
            f"다음 리뷰 결과를 종합하세요:\n{all_findings}"
        ):
            synthesis += msg.content

        return {
            "individual_reviews": results,
            "synthesis": synthesis,
            "overall_severity": max(r.severity for r in results)
        }

# 사용 예시
async def main():
    reviewer = MultiAgentReviewer()

    code = """
    def get_user(user_id):
        query = f"SELECT * FROM users WHERE id = {user_id}"
        return db.execute(query)
    """

    result = await reviewer.review_all(code)
    print(result["synthesis"])

asyncio.run(main())
```

---

## Agent SDK의 한계와 대안

### SDK의 단점

| 단점 | 설명 |
|------|------|
| 🔒 Claude 종속 | GPT, Gemini 사용 불가 |
| 💰 비용 폭발 | 멀티 에이전트 = 토큰 × N |
| 🎲 비결정적 | 같은 프롬프트 다른 결과 |
| 📚 초기 단계 | 문서/커뮤니티 부족 |

### 대안: 모델 독립적 아키텍처

SDK가 Claude에 종속되는 게 걱정된다면, 추상화 레이어를 두는 방법이 있습니다.

**방법 1: LiteLLM (가장 간단)**

```python
from litellm import completion

# 100+ 모델을 동일 인터페이스로
response = completion(
    model="claude-3-5-sonnet-20241022",  # 또는 gpt-4o, gemini/...
    messages=[{"role": "user", "content": "Hello"}]
)
```

**방법 2: LangChain + LangGraph (가장 강력)**

```python
from langchain_anthropic import ChatAnthropic
from langchain_openai import ChatOpenAI
from langgraph.graph import StateGraph

# 모델 추상화
class ModelFactory:
    @staticmethod
    def create(model_type: str):
        factories = {
            "claude": lambda: ChatAnthropic(model="claude-sonnet-4-5-20250929"),
            "gpt": lambda: ChatOpenAI(model="gpt-4o"),
        }
        return factories[model_type]()

# 에이전트 정의
class BaseAgent:
    def __init__(self, model_type: str = "claude"):
        self.llm = ModelFactory.create(model_type)

    def switch_model(self, model_type: str):
        """런타임에 모델 교체"""
        self.llm = ModelFactory.create(model_type)
```

### 추천 하이브리드 스택

```
오케스트레이션: LangGraph (워크플로우 제어)
    ↓
모델 추상화: LangChain (쉬운 모델 교체)
    ↓
빠른 교체: LiteLLM (100+ 모델 지원)
    ↓
특수 작업: Agent SDK (코딩 전용 노드)
```

**이유:**
- LangGraph: 검증된 안정성, 그래프 기반 워크플로우
- LangChain: 풍부한 생태계, 쉬운 모델 교체
- LiteLLM: 동일 인터페이스로 100+ 모델
- Agent SDK: 코딩 작업에는 여전히 최강

---

## 종합 비교

| | Subagents | Skills | Agent SDK |
|---|-----------|--------|-----------|
| 목적 | 작업 위임 | 패턴 재사용 | 앱 통합 |
| 호출 | 자동/명시적 | 자동 | 코드에서 |
| 컨텍스트 | 독립 | 공유 | 제어 가능 |
| 토큰 | 절약 | 보통 | 제어 가능 |
| 학습 곡선 | 낮음 | 낮음 | 높음 |

### 의사결정 트리

```
Q: 앱/서비스에 통합해야 하나?
├── Yes → Agent SDK
└── No
    Q: 토큰 비용이 중요한가?
    ├── Yes → Subagents
    └── No
        Q: 정해진 패턴이 있나?
        ├── Yes → Skills
        └── No → 일반 Claude Code
```

---

## 실전 조합 예시

### 예시 1: PR 리뷰 봇

```
[GitHub Webhook] → [Agent SDK 서버]
                        ↓
                   [Router Agent]
                        ↓
    ┌───────────┬───────────┬───────────┐
    ↓           ↓           ↓           ↓
[Security]  [Perf]     [Style]    [Arch]
(Subagent) (Subagent) (Subagent) (Subagent)
    └───────────┴───────────┴───────────┘
                        ↓
                [Synthesizer Agent]
                        ↓
                [GitHub Comment]
```

### 예시 2: 문서 생성 시스템

```
[사용자 요청] → [Claude Code CLI]
                     ↓
              [data-analyzer Skill]
                     ↓
              [문서 템플릿 적용]
                     ↓
              [docx/pptx 생성]
```

### 예시 3: 코드 마이그레이션

```
[소스 코드] → [Explore Subagent] → 구조 분석
                     ↓
            [마이그레이션 계획]
                     ↓
    ┌────────────────┼────────────────┐
    ↓                ↓                ↓
[파일 A 변환]   [파일 B 변환]   [파일 C 변환]
(병렬 Subagent)
    └────────────────┼────────────────┘
                     ↓
            [통합 테스트 실행]
```

---

## 마무리

이번 글에서 다룬 내용:

- ✅ Subagents: 토큰 절약과 전문화
- ✅ 커스텀 Subagent 만들기
- ✅ Skills: 자동 트리거 패턴
- ✅ 커스텀 Skill 만들기
- ✅ Agent SDK: 앱 통합
- ✅ 멀티 에이전트 오케스트레이션 패턴
- ✅ 모델 독립적 아키텍처

### 시리즈 정리

| Part | 주제 | 핵심 |
|------|------|------|
| 1 | 기본 기능 | CLI, 슬래시 커맨드, CLAUDE.md |
| 2 | 자동화 | Hooks, Headless Mode |
| 3 | 확장 | Subagents, Skills, SDK |

### 다음 단계

이 시리즈를 마스터했다면:

1. **실습**: 자신의 프로젝트에 CLAUDE.md 작성
2. **자동화**: Hook으로 자주 하는 작업 자동화
3. **확장**: 커스텀 Subagent/Skill 만들기
4. **통합**: SDK로 자신만의 도구 만들기

---

## 참고 자료

- [Claude Code Sub-agents 공식 문서](https://code.claude.com/docs/en/sub-agents)
- [Claude Code Skills 공식 문서](https://code.claude.com/docs/en/skills)
- [LangGraph 문서](https://docs.langchain.com/oss/python/langgraph/overview)
- [LiteLLM 문서](https://docs.litellm.ai/)

---

*이 시리즈가 도움이 되었다면 공유해주세요. 질문이나 피드백은 댓글로 남겨주세요!*
