---
slug: probability-distance-part4
title: 분포 거리 측정 (Part 4) - 실무 적용과 Detection 시스템
authors: namyoungkim
tags: [data, mlops, machine-learning, statistics]
---

> KL, JSD, Wasserstein을 실제 시스템에 적용하는 방법. Drift Detection, Anomaly Detection, Model Monitoring 구현 패턴과 실무 체크리스트.

## 들어가며

지난 세 편에서 KL Divergence, JSD, Wasserstein Distance의 이론적 배경을 살펴봤습니다. 이제 가장 중요한 질문이 남았습니다. **"실제로 어떻게 쓰는가?"**

이번 글에서는 분포 비교 기법을 실제 시스템에 적용하는 구체적인 패턴들을 다룹니다. Feature drift detection, anomaly detection, model monitoring 등 바로 활용할 수 있는 내용에 집중합니다.

<!-- truncate -->

---

## 1. 분포 비교가 필요한 실무 상황

### 주요 사용 사례

```
┌─────────────────────────────────────────────────────────┐
│             Distribution Comparison Use Cases           │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │
│  │   Data      │  │   Model     │  │   Anomaly   │      │
│  │   Drift     │  │   Monitoring│  │   Detection │      │
│  │             │  │             │  │             │      │
│  │  Input      │  │  Prediction │  │  Behavior   │      │
│  │  Change     │  │  Tracking   │  │  Pattern    │      │
│  └─────────────┘  └─────────────┘  └─────────────┘      │
│                                                         │
│  ┌─────────────┐  ┌─────────────┐                       │
│  │   A/B Test  │  │   Quality   │                       │
│  │   Analysis  │  │   Control   │                       │
│  │             │  │             │                       │
│  │  Group      │  │  Batch      │                       │
│  │  Compare    │  │  Compare    │                       │
│  └─────────────┘  └─────────────┘                       │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

- **Data Drift**: 입력 분포 변화 감지
- **Model Monitoring**: 예측 분포 변화 추적
- **Anomaly Detection**: 행동 패턴 이상 탐지
- **A/B Test Analysis**: 그룹 간 분포 비교
- **Quality Control**: 배치 간 품질 비교

### 공통 패턴

대부분의 경우 다음 구조를 따릅니다:

```
1. Baseline 분포 구축 (정상 상태)
           ↓
2. 현재 분포 추정 (실시간 또는 배치)
           ↓
3. 거리/발산 계산
           ↓
4. Threshold 기반 판단
           ↓
5. 알림 또는 액션
```

---

## 2. Feature Distribution Drift Detection

### 문제 상황

ML 모델은 학습 데이터와 유사한 분포의 입력을 기대합니다. 시간이 지나면서 입력 데이터의 분포가 변하면(**drift**), 모델 성능이 저하될 수 있습니다.

```
Training time:                Production time:
    ∩                             ∩
  _| |_                        _|   |_
──────────────              ──────────────
  Feature X                   Feature X
  (mean: 100)                 (mean: 120)

                    ↓

         Drift detected! Retrain model?
```

- 학습 시점 평균: 100 → 운영 시점 평균: 120으로 분포 이동 (Drift 발생)

### 구현 패턴

```pseudo
class FeatureDriftDetector:
    function initialize(n_bins, threshold):
        self.n_bins = n_bins
        self.threshold = threshold
        self.baseline_histogram = null
        self.bin_edges = null

    function fit_baseline(baseline_data):
        # Baseline 데이터로 히스토그램 생성
        self.baseline_histogram, self.bin_edges = histogram(
            baseline_data,
            bins=self.n_bins,
            density=true
        )

        # Smoothing (zero 방지)
        self.baseline_histogram = self.baseline_histogram + 1e-10
        self.baseline_histogram = normalize(self.baseline_histogram)

    function check_drift(current_data):
        # 현재 데이터의 히스토그램
        current_histogram, _ = histogram(
            current_data,
            bins=self.bin_edges,  # 동일한 bin 사용
            density=true
        )

        current_histogram = current_histogram + 1e-10
        current_histogram = normalize(current_histogram)

        # JSD 계산 (대칭, bounded)
        jsd_value = compute_jsd(self.baseline_histogram, current_histogram)

        # 판단
        return {
            "jsd": jsd_value,
            "is_drift": jsd_value > self.threshold,
            "severity": classify_severity(jsd_value)
        }

    function classify_severity(jsd_value):
        if jsd_value > 2 * self.threshold:
            return "high"
        else if jsd_value > self.threshold:
            return "medium"
        else:
            return "low"
```

### 사용 예시

```pseudo
# 초기화 및 baseline 학습
detector = FeatureDriftDetector(n_bins=50, threshold=0.05)
detector.fit_baseline(training_data["feature_x"])

# 실시간 모니터링 루프
while true:
    current_window = get_recent_data(window_size=1000)
    result = detector.check_drift(current_window["feature_x"])

    if result["is_drift"]:
        alert(
            message="Feature drift detected",
            severity=result["severity"],
            jsd_value=result["jsd"]
        )

    wait(interval=1_hour)
```

---

## 3. Behavioral Anomaly Detection

### 문제 상황

게임, 금융, 보안 등의 도메인에서 정상 사용자와 비정상 사용자(봇, 사기꾼, 해커)를 구분해야 합니다. 개별 행동보다 **행동 패턴의 분포**를 비교하는 것이 효과적입니다.

```
Normal player:              Suspicious player:

  Action interval dist:       Action interval dist:
      ∩                          │
    _/ \_                        │
  _/     \_                      │
 ───────────                ─────┴─────
  50ms~500ms                exactly 100ms
  (natural variance)        (mechanical precision)
```

- 정상 플레이어: 50ms~500ms 범위의 자연스러운 변동
- 의심 플레이어: 정확히 100ms의 기계적 정확성 (봇 의심)

### 구현 패턴

```pseudo
class BehaviorAnomalyDetector:
    function initialize(feature_configs):
        # feature_configs 예시:
        # {
        #     "action_interval_ms": {"bins": 50},
        #     "click_position_variance": {"bins": 30},
        #     "session_duration": {"bins": 40}
        # }
        self.feature_configs = feature_configs
        self.baseline_distributions = {}

    function fit_baseline(normal_user_data):
        # 정상 사용자 데이터로 각 feature의 baseline 분포 학습
        for feature_name, config in self.feature_configs:
            values = normal_user_data[feature_name]
            histogram, edges = histogram(values, bins=config["bins"])
            histogram = smooth_and_normalize(histogram)

            self.baseline_distributions[feature_name] = {
                "histogram": histogram,
                "edges": edges
            }

    function score_user(user_data, window_size=100):
        feature_scores = {}

        for feature_name, config in self.feature_configs:
            if length(user_data[feature_name]) < window_size:
                continue

            baseline = self.baseline_distributions[feature_name]

            # 사용자의 최근 행동 분포
            user_values = user_data[feature_name][-window_size:]
            user_histogram, _ = histogram(
                user_values,
                bins=baseline["edges"]
            )
            user_histogram = smooth_and_normalize(user_histogram)

            # JSD로 이상치 스코어 계산
            jsd = compute_jsd(baseline["histogram"], user_histogram)
            feature_scores[feature_name] = jsd

        # 종합 스코어
        if length(feature_scores) > 0:
            final_score = mean(values(feature_scores))
            return {
                "anomaly_score": final_score,
                "feature_scores": feature_scores,
                "is_suspicious": final_score > 0.15,
                "top_anomalous_features": get_top_features(feature_scores, n=3)
            }

        return null
```

### 실제 적용 시 고려사항

```
┌─────────────────────────────────────────────────────────┐
│           Behavioral Anomaly Detection Checklist        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  □ Feature Selection                                    │
│    - Hard-to-manipulate features                        │
│    - Time-based (response time, intervals)              │
│    - Pattern-based (sequence, combinations)             │
│                                                         │
│  □ Window Size                                          │
│    - Too small: noise-sensitive                         │
│    - Too large: detection delay                         │
│    - Recommend: minimum for statistical significance    │
│                                                         │
│  □ Threshold Tuning                                     │
│    - False Positive vs False Negative trade-off         │
│    - Consult domain experts                             │
│    - Validate with A/B testing                          │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**체크리스트 설명:**
- **Feature 선택**: 조작하기 어려운 feature, 시간/패턴 기반 feature 선택
- **Window 크기**: 너무 작으면 노이즈 민감, 너무 크면 감지 지연
- **Threshold 튜닝**: FP/FN 트레이드오프, 도메인 전문가 협의, A/B 테스트 검증

---

## 4. Model Prediction Monitoring

### 문제 상황

모델의 **예측 결과 분포**가 시간에 따라 변하면, 이는 데이터 drift나 모델 성능 저하의 신호일 수 있습니다.

```
Normal period:              Anomaly period:

  Class prediction ratio:     Class prediction ratio:

  Class A: ████████ 40%      Class A: ██ 10%
  Class B: ██████ 30%        Class B: ██████████████ 70%
  Class C: ██████ 30%        Class C: ████ 20%

                    ↓

         Prediction drift detected!
         - Actual data changed?
         - Model issue?
```

- 정상 시기: 균형 잡힌 예측 분포 (40/30/30)
- 이상 시기: Class B에 편중된 예측 (10/70/20) → 데이터 변화 또는 모델 문제 의심

### 구현 패턴

```pseudo
class PredictionMonitor:
    function initialize(n_classes, alert_threshold):
        self.n_classes = n_classes
        self.alert_threshold = alert_threshold
        self.baseline_distribution = null
        self.history = []  # 시간별 기록

    function set_baseline(predictions, period="1_day"):
        # 정상 기간의 예측 분포를 baseline으로
        class_counts = count_by_class(predictions, self.n_classes)
        self.baseline_distribution = normalize(class_counts)
        self.baseline_distribution = smooth(self.baseline_distribution)

    function monitor(current_predictions):
        # 현재 예측 분포
        current_counts = count_by_class(current_predictions, self.n_classes)
        current_distribution = normalize(current_counts)
        current_distribution = smooth(current_distribution)

        # 여러 metric 계산
        jsd = compute_jsd(self.baseline_distribution, current_distribution)

        # 어떤 클래스가 가장 변했는지 분석
        class_drift = current_distribution - self.baseline_distribution
        most_increased = argmax(class_drift)
        most_decreased = argmin(class_drift)

        result = {
            "jsd": jsd,
            "alert": jsd > self.alert_threshold,
            "most_increased_class": most_increased,
            "most_decreased_class": most_decreased,
            "class_changes": class_drift,
            "timestamp": now()
        }

        # 히스토리 기록
        self.history.append(result)

        return result

    function get_trend(window="7_days"):
        # 시간에 따른 JSD 변화 추이
        recent = filter(self.history, last=window)
        return {
            "jsd_values": [r["jsd"] for r in recent],
            "timestamps": [r["timestamp"] for r in recent],
            "alert_count": count(r for r in recent if r["alert"])
        }
```

---

## 5. Streaming 환경에서의 구현

### 문제

대용량 실시간 스트림에서는 전체 데이터를 메모리에 유지할 수 없습니다.

### 해결: Sliding Window + Approximate Histogram

```pseudo
class StreamingDriftEstimator:
    function initialize(window_size, n_bins):
        self.window_size = window_size
        self.n_bins = n_bins
        self.buffer = circular_buffer(max_size=window_size)
        self.baseline_quantiles = null
        self.baseline_histogram = null

    function fit_baseline(baseline_data):
        # Quantile 기반 bin edges (데이터 적응형)
        self.baseline_quantiles = percentile(
            baseline_data,
            linspace(0, 100, self.n_bins + 1)
        )

        self.baseline_histogram, _ = histogram(
            baseline_data,
            bins=self.baseline_quantiles
        )
        self.baseline_histogram = smooth_and_normalize(self.baseline_histogram)

    function update(new_value):
        # 스트림에서 새 값 추가 (O(1) 연산)
        self.buffer.append(new_value)

    function compute_divergence():
        if length(self.buffer) < self.window_size / 2:
            return null  # 충분한 데이터 없음

        # 현재 window의 히스토그램
        current_histogram, _ = histogram(
            self.buffer.to_array(),
            bins=self.baseline_quantiles
        )
        current_histogram = smooth_and_normalize(current_histogram)

        # JSD 계산
        return compute_jsd(self.baseline_histogram, current_histogram)

    function should_alert():
        jsd = self.compute_divergence()
        if jsd is null:
            return false
        return jsd > self.threshold
```

### 메모리 효율적인 대안

데이터를 저장하지 않고 히스토그램만 유지하는 방식:

```pseudo
class MemoryEfficientMonitor:
    function initialize(n_bins, decay_factor):
        self.n_bins = n_bins
        self.decay_factor = decay_factor  # 예: 0.99
        self.current_histogram = zeros(n_bins)
        self.count = 0

    function update(value):
        # 어느 bin에 속하는지 결정
        bin_index = find_bin(value, self.bin_edges)

        # Exponential moving average 방식
        self.current_histogram = self.current_histogram * self.decay_factor
        self.current_histogram[bin_index] += 1

        self.count += 1

    function get_distribution():
        return normalize(self.current_histogram)
```

---

## 6. 다차원 Feature 처리 전략

### 문제

실제 시스템에서는 수십~수백 개의 feature가 존재합니다. 각각을 개별 모니터링하면 관리가 어렵습니다.

### 전략 1: Feature별 계산 + 집계

```pseudo
class MultiFeatureDriftDetector:
    function initialize(feature_names, weights=null):
        self.feature_names = feature_names
        self.detectors = {}

        # 가중치 (기본: 균등)
        if weights is null:
            self.weights = {f: 1.0/length(feature_names) for f in feature_names}
        else:
            self.weights = weights

    function fit(baseline_dataframe):
        for feature in self.feature_names:
            detector = FeatureDriftDetector()
            detector.fit_baseline(baseline_dataframe[feature])
            self.detectors[feature] = detector

    function detect(current_dataframe):
        results = {}
        weighted_score = 0

        for feature in self.feature_names:
            result = self.detectors[feature].check_drift(
                current_dataframe[feature]
            )
            results[feature] = result
            weighted_score += self.weights[feature] * result["jsd"]

        # 가장 많이 변한 feature 찾기
        sorted_features = sort_by(
            results.items(),
            key=lambda x: x["jsd"],
            descending=true
        )

        return {
            "overall_score": weighted_score,
            "feature_results": results,
            "top_drifted_features": sorted_features[:3],
            "alert": weighted_score > self.threshold
        }
```

### 전략 2: 차원 축소 후 비교

고차원 데이터를 저차원으로 투영한 뒤 비교:

```
원본 데이터 (100차원)
         │
         ↓
    PCA / UMAP
         │
         ↓
저차원 표현 (2~10차원)
         │
         ↓
   분포 비교 (JSD)
```

### 전략 3: 중요 Feature 선별

모델의 feature importance나 도메인 지식으로 핵심 feature만 모니터링:

```pseudo
function select_important_features(model, threshold=0.01):
    importances = model.get_feature_importances()

    important_features = []
    for feature, importance in importances:
        if importance > threshold:
            important_features.append(feature)

    return important_features

# 중요 feature만 모니터링
important_features = select_important_features(trained_model)
detector = MultiFeatureDriftDetector(important_features)
```

---

## 7. 거리 측정 방법 선택 가이드

### 상황별 권장

```
┌──────────────────────────┬─────────────────────────────────┐
│        Situation         │         Recommendation          │
├──────────────────────────┼─────────────────────────────────┤
│ Direction-agnostic       │ JSD (symmetric, bounded)        │
│ Model training loss      │ KL (gradient properties)        │
│ Zero probability exists  │ JSD or smoothed KL              │
│ Distributions may differ │ Wasserstein (gradient ok)       │
│ Real-time systems        │ JSD (compute efficient)         │
│ Intuitive interpretation │ Wasserstein ("distance")        │
│ High-dimensional data    │ Per-feature JSD + aggregate     │
└──────────────────────────┴─────────────────────────────────┘
```

| 상황 | 권장 방식 |
|------|----------|
| 방향 상관없는 비교 | JSD (대칭, bounded, 안정적) |
| 모델 학습 loss | KL (gradient 특성 활용) |
| Zero 확률 존재 가능 | JSD 또는 smoothed KL |
| 분포가 많이 다를 수 있음 | Wasserstein (gradient 유지) |
| 실시간 시스템 | JSD (계산 효율적) |
| 직관적 해석 필요 | Wasserstein ("거리" 개념) |
| 고차원 데이터 | Feature별 JSD + 집계 |

### 계산 비용 비교

```
KL Divergence:    O(n)        가장 빠름
JSD:              O(n)        KL과 유사 (2배)
Wasserstein:      O(n log n)  정렬 필요 (1D 경우)
                  O(n³)       일반적 경우 (LP 문제)
```

### 구현 팁

```pseudo
# 안정적인 KL 계산
function stable_kl(p, q, epsilon=1e-10):
    q_smooth = q + epsilon
    q_smooth = q_smooth / sum(q_smooth)

    result = 0
    for i in range(length(p)):
        if p[i] > 0:
            result += p[i] * log(p[i] / q_smooth[i])

    return result

# 안정적인 JSD 계산
function stable_jsd(p, q, epsilon=1e-10):
    p_smooth = smooth_and_normalize(p, epsilon)
    q_smooth = smooth_and_normalize(q, epsilon)
    m = 0.5 * (p_smooth + q_smooth)

    return 0.5 * stable_kl(p_smooth, m) + 0.5 * stable_kl(q_smooth, m)
```

---

## 8. Threshold 설정 전략

### 통계적 접근

Baseline 기간의 JSD 분포를 사용:

```pseudo
function compute_adaptive_threshold(baseline_windows, percentile=95):
    jsd_values = []

    # Baseline 내에서 window 간 JSD 계산
    for i in range(length(baseline_windows) - 1):
        jsd = compute_jsd(baseline_windows[i], baseline_windows[i+1])
        jsd_values.append(jsd)

    # 95 percentile을 threshold로
    threshold = percentile(jsd_values, percentile)

    return threshold
```

### 경험적 접근

운영 경험을 기반으로 조정:

```
Initial (conservative):   threshold = 0.1
          │
          ↓
    2-week operation, analyze alerts
          │
    ├── Too many alerts → increase threshold (0.15)
    └── Too few alerts  → decrease threshold (0.05)
          │
          ↓
    Iterate tuning
```

- 초기 설정 (보수적): threshold = 0.1
- 2주 운영 후 알림 분석하여 조정
  - 알림 과다 → threshold 상향
  - 알림 부족 → threshold 하향
- 반복 튜닝으로 최적값 탐색

### Adaptive Threshold

시간에 따라 threshold 자동 조정:

```pseudo
class AdaptiveThreshold:
    function initialize(initial_threshold, learning_rate):
        self.threshold = initial_threshold
        self.learning_rate = learning_rate
        self.history = []

    function update(jsd_value, was_true_positive):
        self.history.append({
            "jsd": jsd_value,
            "was_tp": was_true_positive
        })

        # 최근 기록 기반으로 threshold 조정
        recent = self.history[-100:]

        # False positive가 많으면 threshold 상향
        fp_rate = count(r for r in recent if r["jsd"] > self.threshold and not r["was_tp"]) / length(recent)

        if fp_rate > 0.1:  # FP rate 10% 초과
            self.threshold += self.learning_rate
        elif fp_rate < 0.01:  # FP rate 1% 미만
            self.threshold -= self.learning_rate

    function get_threshold():
        return self.threshold
```

---

## 9. 모니터링 대시보드 구성

### 핵심 지표

```
┌─────────────────────────────────────────────────────────┐
│                   Drift Monitor Dashboard               │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  [Overall Health]          [Alert Summary]              │
│  ┌─────────────┐          ┌─────────────────┐           │
│  │   OK        │          │ Last 24h: 3     │           │
│  │  JSD: 0.02  │          │ Last 7d: 12     │           │
│  └─────────────┘          │ Severity: Low   │           │
│                           └─────────────────┘           │
│                                                         │
│  [JSD Trend - 7 Days]                                   │
│  0.15│                                                  │
│      │              *                                   │
│  0.10│    *    *   * *                                  │
│      │   * *  * * *   *  *                              │
│  0.05│  *   **     *   ** *  *                          │
│      │ *                    * **                        │
│  0.00└──────────────────────────→                       │
│       Mon Tue Wed Thu Fri Sat Sun                       │
│                                                         │
│  [Top Drifted Features]                                 │
│  1. user_age         JSD: 0.08  ████████                │
│  2. session_count    JSD: 0.05  █████                   │
│  3. purchase_amount  JSD: 0.03  ███                     │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 10. 실무 체크리스트

### 구축 전 체크리스트

```
□ 데이터 품질 검증
  - Baseline 데이터에 이상치가 없는가?
  - 충분한 양의 데이터인가?
  - 계절성/주기성이 반영되었는가?

□ Feature 선정
  - 모니터링할 feature 목록 확정
  - Feature별 특성 파악 (연속/이산, 범위, 분포 형태)
  - 중요도 기반 우선순위 설정

□ 기술적 설계
  - Binning 전략 결정 (고정 bin vs 적응형)
  - Window 크기 결정
  - 계산 주기 결정 (실시간 vs 배치)
```

### 운영 체크리스트

```
□ Threshold 관리
  - 초기 threshold 설정
  - 정기적 threshold 검토 주기
  - False positive/negative 분석 프로세스

□ 알림 관리
  - 알림 채널 설정 (Slack, Email, PagerDuty 등)
  - 심각도별 대응 프로세스
  - 에스컬레이션 규칙

□ 유지보수
  - Baseline 갱신 주기
  - 모델 재학습 트리거 조건
  - 로그 및 이력 보관 정책
```

---

## 11. 시리즈 정리

### 전체 흐름 요약

```
Part 1: 정보이론 기초
├── Self-Information, Entropy
├── Cross-Entropy
└── KL Divergence 유도

Part 2: KL 심화
├── Forward vs Reverse KL
├── Mode-covering vs Mode-seeking
├── Reparameterization Trick
└── VAE 적용

Part 3: JSD와 Wasserstein
├── JSD 정의와 특성
├── GAN의 학습 불안정성
├── Wasserstein Distance
└── WGAN 발전

Part 4: 실무 적용 (현재)
├── Drift Detection
├── Anomaly Detection
├── Model Monitoring
└── 구현 패턴
```

### 핵심 메시지

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  1. KL Divergence measures "information loss"           │
│                                                         │
│  2. Forward/Reverse KL induce different behaviors       │
│                                                         │
│  3. JSD is symmetric KL, stable in practice             │
│                                                         │
│  4. Wasserstein provides meaningful gradient            │
│     even without support overlap                        │
│                                                         │
│  5. Choose the right metric for the situation           │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

1. **KL Divergence**는 "정보 손실"을 측정한다
2. **Forward/Reverse KL**은 완전히 다른 행동을 유발한다
3. **JSD**는 KL의 대칭화 버전으로 실무에서 안정적이다
4. **Wasserstein**은 support가 안 겹쳐도 의미있는 gradient를 제공한다
5. 실무에서는 **상황에 맞는 metric 선택**이 중요하다

---

## 참고 자료

- Rabanser, S. et al. "Failing Loudly: An Empirical Study of Methods for Detecting Dataset Shift" (2019)
- Lipton, Z. et al. "Detecting and Correcting for Label Shift with Black Box Predictors" (2018)
- Sculley, D. et al. "Hidden Technical Debt in Machine Learning Systems" (2015)
- Google ML Best Practices: "Monitoring ML Models in Production"

---

## 마치며

이 시리즈를 통해 확률 분포 간 거리 측정의 이론적 배경부터 실무 적용까지 살펴봤습니다. 핵심은 **"어떤 metric을 언제 사용하는가"**를 이해하는 것입니다.

모델이 잘 동작하는지, 데이터가 변하고 있는지, 이상한 패턴이 있는지—이 모든 질문에 분포 비교가 답을 줄 수 있습니다. 이론을 이해하고, 상황에 맞게 적용하시기 바랍니다.
