---
slug: bhattacharyya-distance
title: Bhattacharyya Distance (바타차리야 거리) 쉽게 이해하기
authors: namyoungkim
tags: [statistics, machine-learning, mathematics, data-science, anti-abusing]
---

# Bhattacharyya Distance (바타차리야 거리) 쉽게 이해하기

> 두 확률 분포의 차이를 측정하는 Bhattacharyya Distance를 실생활 예시와 수식으로 완벽히 이해하기

## 🎯 핵심 개념

**Bhattacharyya Distance**는 두 개의 확률 분포가 얼마나 다른지를 측정하는 지표입니다. 쉽게 말하면, 두 그룹이 얼마나 "구별 가능한지"를 숫자로 나타낸 것이죠.

## 📊 실제 예시 1: 키 분포

두 그룹의 키를 비교한다고 생각해봅시다:
- **그룹 A**: 한국 성인 남성 (평균 175cm, 표준편차 6cm)
- **그룹 B**: 한국 성인 여성 (평균 162cm, 표준편차 5cm)

```
그룹 A:        ___
              /   \
             /     \___
            /          \
         165  175  185 (cm)

그룹 B:  ___
        /   \
       /     \___
      /          \
    155  162  170 (cm)
```

**Bhattacharyya Coefficient (BC)**는 두 분포의 겹치는 부분(overlap)을 측정합니다:
- BC ≈ 0.3 → 겹치는 부분이 적음 → 두 그룹이 잘 구별됨
- **Bhattacharyya Distance = -ln(0.3) ≈ 1.2**

<!-- truncate -->

---

## 📊 실제 예시 2: 이메일 분류

스팸 메일과 정상 메일을 구별하는 경우:

- **정상 메일**: "회의", "보고서" 같은 단어 빈도가 높음
- **스팸 메일**: "무료", "대박" 같은 단어 빈도가 높음

두 분포의 겹침이:
- **적으면** (BC 작음, $D_B$ 큼) → 구별하기 쉬움 ✅
- **많으면** (BC 큼, $D_B$ 작음) → 구별하기 어려움 ❌

## 🔢 값의 의미

| BC 값 | $D_B$ 값 | 의미 |
|-------|---------|------|
| 1.0 | 0 | 두 분포가 완전히 동일 |
| 0.5 | 0.69 | 중간 정도 겹침 |
| 0.1 | 2.3 | 거의 안 겹침 (잘 구별됨) |
| 0.01 | 4.6 | 완전히 분리됨 |

## 💡 왜 사용하나요?

1. **머신러닝**: 클래스 간 분리도 평가
2. **이미지 인식**: 얼굴 인식, 물체 감지
3. **음성 인식**: 서로 다른 음성 패턴 구별
4. **이상 탐지**: 정상 vs 비정상 패턴 구별

anti-abusing 시스템에서도 이 개념이 유용합니다. 예를 들어:
- **정상 유저**의 플레이 패턴 vs **어뷰징 유저**의 플레이 패턴
- 두 분포의 Bhattacharyya Distance가 크다면 → 탐지 모델의 성능이 좋을 것으로 예상

---

## 1️⃣ Bhattacharyya Coefficient (BC) 정의

### 이산 분포 (Discrete Distribution)

$$
BC(p, q) = \sum_{x \in X} \sqrt{p(x) \cdot q(x)}
$$

**의미 해석:**
- 각 점에서 두 확률의 기하평균(geometric mean)을 더한 값
- $\sqrt{p(x) \cdot q(x)}$ 부분은 두 확률이 모두 높을 때만 큰 값
- 0 ≤ BC ≤ 1 범위를 가짐

**왜 제곱근을 사용하나?**

```
단순 곱: p(x) · q(x)
→ 한쪽이 0이면 무조건 0 (너무 엄격)
→ 대칭성 부족

기하평균: √(p(x) · q(x))
→ 대칭성 보장: √(p·q) = √(q·p) ✓
→ 두 확률의 균형잡힌 overlap 측정 ✓
```

### 연속 분포 (Continuous Distribution)

$$
BC(p, q) = \int \sqrt{p(x) \cdot q(x)} \, dx
$$

**적분의 의미:**
- 전체 확률 공간에서 두 분포의 겹침을 "누적"
- 확률밀도함수(PDF)의 기하평균을 적분

---

## 2️⃣ Bhattacharyya Distance ($D_B$) 정의

$$
D_B(p, q) = -\ln(BC(p, q))
$$

**왜 로그를 취하나?**

1. **거리 척도(Distance Metric) 특성 부여:**
   - BC는 유사도(similarity) → 클수록 비슷함
   - $D_B$는 거리(distance) → 클수록 다름

2. **수치 범위 변환:**
   ```
   BC = 1.0 → D_B = 0      (완전히 동일)
   BC = 0.5 → D_B = 0.69   (중간)
   BC = 0.1 → D_B = 2.30   (매우 다름)
   BC → 0   → D_B → ∞      (완전히 분리)
   ```

3. **수학적 편의성:**
   - 로그는 곱셈을 덧셈으로 변환 (계산 편리)
   - 정보 이론과의 연결 (KL divergence와 관련)

---

## 3️⃣ 정규분포에서의 특수 공식

### 단변량 정규분포 (Univariate Normal)

두 정규분포 $p_1 = N(\mu_p, \sigma_p^2)$, $p_2 = N(\mu_q, \sigma_q^2)$에 대해:

$$
D_B(p, q) = \frac{1}{4} \ln\left(\frac{1}{4}\left(\frac{\sigma_p^2}{\sigma_q^2} + \frac{\sigma_q^2}{\sigma_p^2} + 2\right)\right) + \frac{1}{4}\left(\frac{(\mu_p - \mu_q)^2}{\sigma_p^2 + \sigma_q^2}\right)
$$

**수식 분해:**

$$
D_B = \underbrace{\frac{1}{4} \ln\left(\frac{1}{4}\left(\frac{\sigma_p^2}{\sigma_q^2} + \frac{\sigma_q^2}{\sigma_p^2} + 2\right)\right)}_{\text{분산 차이 항}} + \underbrace{\frac{1}{4}\left(\frac{(\mu_p - \mu_q)^2}{\sigma_p^2 + \sigma_q^2}\right)}_{\text{평균 차이 항}}
$$

**각 항의 의미:**

1. **첫 번째 항 (분산 차이):**
   ```
   두 분포의 "퍼짐" 정도가 얼마나 다른지

   σ_p = σ_q 일 때:
   (σ²/σ² + σ²/σ² + 2)/4 = (1 + 1 + 2)/4 = 1
   ln(1) = 0  → 이 항은 0이 됨
   ```

2. **두 번째 항 (평균 차이):**
   ```
   두 분포의 "중심" 위치가 얼마나 떨어져 있는지

   Mahalanobis 거리의 제곱 형태
   (μ_p - μ_q)²를 합쳐진 분산(σ_p² + σ_q²)으로 정규화
   ```

---

## 4️⃣ 다변량 정규분포 (Multivariate Normal)

$$
D_B = \frac{1}{8}(\mu_1 - \mu_2)^T \Sigma^{-1}(\mu_1 - \mu_2) + \frac{1}{2}\ln\left(\frac{\det \Sigma}{\sqrt{\det \Sigma_1 \cdot \det \Sigma_2}}\right)
$$

여기서 $\Sigma = \frac{\Sigma_1 + \Sigma_2}{2}$ (평균 공분산 행렬)

**구성 요소:**

1. **첫 번째 항:**
   - 두 평균 벡터 간의 Mahalanobis 거리
   - $\Sigma^{-1}$를 통해 공분산 구조를 고려한 거리

2. **두 번째 항:**
   - 두 공분산 행렬의 기하평균 대비 평균 공분산의 크기
   - det는 행렬식(determinant) - 분포의 "부피" 측정

---

## 5️⃣ 수식의 직관적 이해

### BC를 적분으로 유도해보기

두 정규분포 $p(x) = \frac{1}{\sqrt{2\pi\sigma_p^2}}e^{-\frac{(x-\mu_p)^2}{2\sigma_p^2}}$와 $q(x)$에 대해:

$$
BC = \int \sqrt{p(x) \cdot q(x)} \, dx
$$

$$
= \int \sqrt{\frac{1}{2\pi\sigma_p\sigma_q}} \exp\left(-\frac{(x-\mu_p)^2}{4\sigma_p^2} - \frac{(x-\mu_q)^2}{4\sigma_q^2}\right) dx
$$

이 적분을 계산하면 (복잡한 과정 생략) 위의 closed-form 공식이 유도됩니다.

---

## 6️⃣ 실제 계산 예시

**예시:** 두 정규분포
- $p_1 = N(10, 4)$ (평균 10, 분산 4)
- $p_2 = N(15, 9)$ (평균 15, 분산 9)

**Step 1: 분산 차이 항 계산**

$$
\frac{1}{4}\left(\frac{4}{9} + \frac{9}{4} + 2\right) = \frac{1}{4}\left(0.444 + 2.25 + 2\right) = \frac{4.694}{4} = 1.174
$$

$$
\ln(1.174) = 0.160
$$

$$
\text{첫 번째 항} = \frac{0.160}{4} = 0.040
$$

**Step 2: 평균 차이 항 계산**

$$
\frac{(10-15)^2}{4+9} = \frac{25}{13} = 1.923
$$

$$
\text{두 번째 항} = \frac{1.923}{4} = 0.481
$$

**Step 3: 최종 결과**

$$
D_B = 0.040 + 0.481 = 0.521
$$

---

## 7️⃣ 관련 개념과의 비교

### KL Divergence vs Bhattacharyya Distance

**KL Divergence:**

$$
D_{KL}(p||q) = \int p(x) \ln\frac{p(x)}{q(x)} dx
$$

- 비대칭: $D_{KL}(p||q) \neq D_{KL}(q||p)$
- 정보 이론적 해석

**Bhattacharyya Distance:**

$$
D_B(p,q) = -\ln\int\sqrt{p(x)q(x)}dx
$$

- 대칭: $D_B(p,q) = D_B(q,p)$
- 기하학적 해석

**관계:**

$$
D_B \leq \sqrt{D_{KL}(p||q) \cdot D_{KL}(q||p)}
$$

---

## 💡 Anti-Abusing 시스템 적용 예시

**시스템에서 활용 방법:**

```python
# 정상 유저와 어뷰저의 플레이 시간 분포
normal_user = N(μ=120분, σ²=900)  # 평균 2시간, 표준편차 30분
abuser = N(μ=360분, σ²=14400)      # 평균 6시간, 표준편차 120분

# Bhattacharyya Distance 계산
# → 값이 크면: 두 그룹이 잘 분리됨 → 탐지 쉬움
# → 값이 작으면: 두 그룹이 겹침 → 탐지 어려움
```

**실무 활용:**
1. **Feature 선정**: 여러 feature 중 $D_B$가 큰 것을 선택
2. **모델 성능 예측**: $D_B$를 통해 분류 성능 사전 평가
3. **임계값 설정**: 두 분포의 겹치는 영역을 고려한 threshold 결정

---

## 참고 자료

- [Bhattacharyya Distance - Wikipedia](https://en.wikipedia.org/wiki/Bhattacharyya_distance)
- [Pattern Recognition and Machine Learning (Bishop)](https://www.springer.com/gp/book/9780387310732)
- [Information Theory, Inference, and Learning Algorithms (MacKay)](http://www.inference.org.uk/mackay/itila/)
