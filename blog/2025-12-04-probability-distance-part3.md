---
slug: probability-distance-part3
title: 분포 거리 측정 (Part 3) - JSD와 Wasserstein Distance
authors: namyoungkim
tags: [data, deep-learning, machine-learning]
---

> GAN 학습이 어려운 이유와 해결책. JSD의 gradient vanishing 문제부터 Wasserstein Distance, WGAN까지의 발전 과정.

## 들어가며

Part 1에서 KL Divergence의 정보이론적 의미를 살펴봤습니다. 하지만 KL Divergence에는 실용적인 한계가 있습니다. 비대칭적이고, 특정 상황에서 무한대로 발산합니다. 이번 글에서는 이러한 한계를 극복하기 위해 등장한 **Jensen-Shannon Divergence(JSD)**와, GAN 학습에서 JSD의 치명적인 문제를 해결한 **Wasserstein Distance**를 다룹니다.

이 여정을 따라가다 보면 GAN이 왜 학습하기 어려운지, 그리고 WGAN이 어떻게 이를 해결했는지 깊이 이해할 수 있습니다.

<!-- truncate -->

---

## 1. KL Divergence의 한계 복습

### 세 가지 문제점

**1. 비대칭성**

$$D_{KL}(P \| Q) \neq D_{KL}(Q \| P)$$

"거리"라고 부르기엔 직관에 어긋납니다. 서울에서 부산까지 거리와 부산에서 서울까지 거리가 다르다면 이상하겠죠.

**2. 무한대 발산**

Q(x) = 0인 지점에서 P(x) > 0이면 KL Divergence는 무한대로 발산합니다.

```
P = [0.5, 0.5, 0,   0  ]
Q = [0,   0,   0.5, 0.5]

D_KL(P || Q) = 0.5 × log(0.5/0) + ... = ∞
```

**3. 삼각부등식 불만족**

거리 함수(metric)의 기본 조건인 삼각부등식을 만족하지 않습니다.

이러한 문제들을 해결하기 위해 JSD가 등장합니다.

---

## 2. Jensen-Shannon Divergence (JSD)

### 정의

JSD는 KL Divergence를 **대칭화**한 버전입니다.

$$JSD(P \| Q) = \frac{1}{2} D_{KL}(P \| M) + \frac{1}{2} D_{KL}(Q \| M)$$

여기서 M은 두 분포의 평균입니다:

$$M = \frac{1}{2}(P + Q)$$

### 직관적 이해

```
         P ─────┐
                 ├──→ M = (P+Q)/2
         Q ─────┘
                       │
         ┌─────────────┼─────────────┐
         ↓             ↓             ↓
    D_KL(P||M)         M        D_KL(Q||M)
         │                           │
         └───────────┬───────────────┘
                     ↓
              JSD = 평균
```

P와 Q를 직접 비교하는 대신, 둘의 중간 지점 M을 기준으로 각각의 거리를 측정합니다.

### 왜 안정적인가?

M은 항상 P와 Q의 support를 모두 포함합니다. 따라서 한쪽이 0이어도 M은 0이 아닙니다.

```
P = [0.5, 0.5, 0,   0  ]
Q = [0,   0,   0.5, 0.5]
M = [0.25, 0.25, 0.25, 0.25]  ← 모든 위치에서 > 0

D_KL(P || Q) = log(0.5 / 0) = ∞       ← 발산!
D_KL(P || M) = log(0.5 / 0.25) = 1    ← 유한!
```

### JSD vs KL 비교

```
┌────────────────┬─────────────────┬─────────────────┐
│   Property     │  KL Divergence  │  JS Divergence  │
├────────────────┼─────────────────┼─────────────────┤
│   Symmetric    │       ✗         │       ✓         │
│   Range        │    [0, ∞)       │   [0, log2]     │
│   Zero prob    │   diverge (∞)   │    stable       │
│   Metric       │       ✗         │   √JSD is ✓     │
│   Compute cost │      Low        │     Low         │
└────────────────┴─────────────────┴─────────────────┘
```

| 속성 | KL Divergence | JS Divergence |
|------|---------------|---------------|
| 대칭성 | ✗ | ✓ |
| 범위 | [0, ∞) | [0, log2] |
| Zero 처리 | 발산 (∞) | 안정적 |
| Metric | ✗ | √JSD는 ✓ |
| 계산 비용 | 낮음 | 낮음 |

### 구현

```pseudo
function jsd(P, Q):
    M = 0.5 * (P + Q)

    kl_pm = 0
    kl_qm = 0

    for each x:
        if P(x) > 0:
            kl_pm += P(x) * log(P(x) / M(x))
        if Q(x) > 0:
            kl_qm += Q(x) * log(Q(x) / M(x))

    return 0.5 * (kl_pm + kl_qm)
```

---

## 3. Original GAN과 JSD의 관계

### GAN의 목적함수

2014년 Goodfellow가 제안한 GAN의 minimax 목적함수는 다음과 같습니다:

$$\min_G \max_D \mathbb{E}_{x \sim p_{data}}[\log D(x)] + \mathbb{E}_{z \sim p_z}[\log(1 - D(G(z)))]$$

- **Discriminator D**: 진짜 데이터에는 높은 점수, 가짜 데이터에는 낮은 점수
- **Generator G**: D를 속여서 가짜 데이터에 높은 점수를 받도록

### JSD와의 연결

수학적으로 분석하면, **최적의 Discriminator** 하에서 Generator의 손실은:

$$L_G = 2 \cdot JSD(p_{data} \| p_g) - \log 4$$

여기서 $p_g$는 Generator가 만드는 분포입니다.

**의미**: Generator는 사실상 **JSD를 최소화**하도록 학습됩니다. $p_g = p_{data}$가 되면 JSD = 0이 되어 손실이 최소화됩니다.

---

## 4. 문제: Gradient Vanishing

### JSD의 치명적 약점

JSD는 bounded metric입니다. 값이 0과 log(2) 사이로 제한됩니다. 이것이 문제가 됩니다.

**두 분포의 support가 겹치지 않을 때:**

```
p_data (실제 데이터 분포):
        ∩
      _| |_
    ──────────────────────────
      A   B

                        (gap)

p_g (생성 데이터 분포):
                              ∩
                            _| |_
    ──────────────────────────────
                              C   D
```

이 경우 JSD 값은:

$$JSD(p_{data} \| p_g) = \log(2) \approx 0.693$$

문제는 **p_g를 어디로 움직여도 JSD 값이 동일**하다는 점입니다. support가 겹치지 않는 한, 가까이 가든 멀리 가든 JSD = log(2)입니다.

### Gradient가 사라지는 이유

```
p_g를 p_data 쪽으로 이동시켜도:

이동 전: JSD = 0.693
         p_data: ∩         p_g: ∩
                 |←─ 10 ─→|

이동 후: JSD = 0.693  (여전히 안 겹침)
         p_data: ∩    p_g: ∩
                 |←─ 5 ─→|

∂JSD/∂θ_G ≈ 0  (변화가 없으니 gradient도 없음)
```

Generator는 어느 방향으로 가야 할지 정보를 받지 못합니다.

### 고차원에서 더 심각

실제 이미지는 수만 차원의 공간에 존재합니다. 이 공간에서 두 분포가 겹칠 확률은 극히 낮습니다.

```
2D 공간: 두 영역이 겹치기 비교적 쉬움
    ┌───┐
    │ P │
    └─┬─┘
      │ (겹침 가능)
    ┌─┴─┐
    │ Q │
    └───┘

1000D 공간: 각 차원에서 모두 겹쳐야 함
    P(전체 겹침) ≈ P(한 차원 겹침)^1000 ≈ 0
```

학습 초기에 Generator가 만드는 분포는 실제 데이터 분포와 거의 확실히 겹치지 않습니다. 따라서 **학습 시작부터 gradient vanishing**이 발생합니다.

### Mode Collapse

Gradient vanishing의 또 다른 결과는 **mode collapse**입니다.

```
p_data (다양한 mode):
    ∩     ∩     ∩
  _| |_ _| |_ _| |_
   강아지 고양이 새

p_g (mode collapse):
          ∩
        _| |_
        고양이만 생성

Generator가 "고양이만 그리면 D를 50%는 속일 수 있네"
→ 다양성 포기, 한 mode에만 집중
```

---

## 5. Wasserstein Distance의 등장

### 새로운 관점: 흙 옮기기

Wasserstein Distance는 **Earth Mover's Distance(EMD)**라고도 불립니다. 직관적으로 "한 분포를 다른 분포로 바꾸는 데 필요한 최소 작업량"입니다.

```
분포 P (흙더미):          분포 Q (목표 형태):
    ■■■                       ■■■
    ■■■■■                   ■■■■■
  ─────────               ─────────
   위치 A                   위치 B

Wasserstein = (옮길 흙의 양) × (최소 이동 거리)
```

### 수학적 정의

$$W(P, Q) = \inf_{\gamma \in \Pi(P,Q)} \mathbb{E}_{(x,y) \sim \gamma}[\|x - y\|]$$

- $\Pi(P, Q)$: P와 Q를 marginal로 갖는 모든 joint distribution (transport plan)
- $\gamma$: 어떤 점에서 어떤 점으로 얼마나 옮길지를 나타내는 계획
- $\inf$: 가능한 모든 계획 중 최소 비용

### 왜 Wasserstein인가?

**핵심: support가 겹치지 않아도 의미 있는 거리를 제공합니다.**

```
p_data (위치 0):  ∩
                  |
                  |
p_g (위치 10):    |                 ∩
                  |←────── 10 ─────→|

JSD:          log(2) = 0.693 (상수)
              → gradient ≈ 0

Wasserstein:  10 (실제 거리)
              → p_g를 왼쪽으로 옮기면 W 감소
              → gradient 존재!
```

### JSD vs Wasserstein 비교

```
시나리오: p_g를 p_data 방향으로 1만큼 이동

[JSD]
이동 전: JSD = 0.693
이동 후: JSD = 0.693 (안 겹치면 동일)
변화량: 0 → gradient ≈ 0

[Wasserstein]
이동 전: W = 10
이동 후: W = 9
변화량: -1 → gradient 존재!
```

Wasserstein은 **두 분포가 겹치지 않아도 "얼마나 떨어져 있는지"를 알려줍니다**. Generator는 이 정보를 바탕으로 올바른 방향으로 학습할 수 있습니다.

---

## 6. WGAN: Wasserstein GAN

### Kantorovich-Rubinstein Duality

Wasserstein distance를 직접 계산하는 것은 어렵습니다. 다행히 dual form이 존재합니다:

$$W(p_{data}, p_g) = \sup_{\|f\|_L \leq 1} \mathbb{E}_{x \sim p_{data}}[f(x)] - \mathbb{E}_{x \sim p_g}[f(x)]$$

- $f$: 1-Lipschitz 함수 (기울기가 1 이하인 함수)
- $\sup$: 조건을 만족하는 모든 f 중 최대값

### Lipschitz 조건이란?

함수 f가 K-Lipschitz라는 것은:

$$|f(x_1) - f(x_2)| \leq K \cdot |x_1 - x_2|$$

즉, 출력의 변화가 입력의 변화보다 K배 이상 클 수 없습니다. 1-Lipschitz는 기울기가 최대 1인 함수입니다.

```
1-Lipschitz 함수:          Non-Lipschitz 함수:
      /                           │
     /                            │
    /   기울기 ≤ 1               │  급격한 변화
   /                             /
  /                             /
```

### WGAN 학습 알고리즘

```pseudo
# WGAN Training
for each iteration:
    # Step 1: Critic 업데이트 (여러 번)
    for _ in range(n_critic):
        real_samples = sample_from_data()
        fake_samples = generator(random_noise())

        # Critic은 Wasserstein distance를 추정
        critic_loss = mean(critic(fake_samples)) - mean(critic(real_samples))

        update critic to minimize critic_loss

        # Lipschitz 제약 적용
        clip_weights(critic, min=-c, max=c)

    # Step 2: Generator 업데이트
    fake_samples = generator(random_noise())

    # Generator는 critic(fake)를 최대화 = W를 최소화
    generator_loss = -mean(critic(fake_samples))

    update generator to minimize generator_loss
```

### 핵심 차이점: Discriminator vs Critic

| Original GAN | WGAN |
|--------------|------|
| Discriminator | Critic |
| 확률 출력 (0~1) | 점수 출력 (unbounded) |
| Sigmoid 활성화 | 활성화 없음 |
| Binary cross-entropy | Wasserstein distance |

---

## 7. Lipschitz 제약 방법들

### 방법 1: Weight Clipping (Original WGAN)

가장 단순한 방법으로, 가중치를 일정 범위로 잘라냅니다.

```pseudo
function clip_weights(model, c):
    for each weight w in model:
        w = clamp(w, -c, c)
```

**문제점:**
- 모델의 capacity를 심하게 제한
- c 값에 민감
- 학습 불안정

### 방법 2: Gradient Penalty (WGAN-GP)

Lipschitz 조건을 직접 강제하는 대신, gradient norm이 1에 가깝도록 페널티를 줍니다.

$$L_{GP} = \lambda \mathbb{E}_{\hat{x}}[(|\nabla_{\hat{x}} D(\hat{x})| - 1)^2]$$

여기서 $\hat{x}$는 real과 fake 사이의 interpolation입니다.

```pseudo
function gradient_penalty(critic, real, fake):
    # real과 fake 사이의 랜덤 interpolation
    alpha = random(0, 1)
    interpolated = alpha * real + (1 - alpha) * fake

    # critic의 gradient 계산
    critic_output = critic(interpolated)
    gradients = compute_gradient(critic_output, interpolated)

    # gradient norm이 1에서 벗어나면 페널티
    gradient_norm = norm(gradients)
    penalty = (gradient_norm - 1)^2

    return mean(penalty)

# WGAN-GP Loss
critic_loss = mean(critic(fake)) - mean(critic(real)) + lambda * gradient_penalty
```

### 방법 3: Spectral Normalization

가중치 행렬의 spectral norm(최대 singular value)으로 나눠서 정규화합니다.

$$W_{SN} = \frac{W}{\sigma(W)}$$

여기서 $\sigma(W)$는 W의 최대 singular value입니다.

```
┌──────────────────┬──────────────────┬──────────────────┐
│   Weight Clip    │   Gradient Pen   │  Spectral Norm   │
├──────────────────┼──────────────────┼──────────────────┤
│  Simple impl     │  Stable train    │  Efficient       │
│  Limit capacity  │  High cost       │  Low overhead    │
│  Unstable        │  Hyperparam λ    │  Widely used     │
└──────────────────┴──────────────────┴──────────────────┘
```

- **Weight Clip**: 구현 간단, Capacity 제한, 학습 불안정
- **Gradient Penalty**: 안정적 학습, 계산 비용 높음, 하이퍼파라미터 λ
- **Spectral Norm**: 효율적, 추가 비용 낮음, 널리 사용됨

---

## 8. GAN 발전의 역사

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  GAN (2014)                                             │
│    │                                                    │
│    │ Issue: JSD → gradient=0 if no support overlap      │
│    ↓                                                    │
│  WGAN (2017)                                            │
│    │                                                    │
│    │ Fix: Wasserstein → meaningful gradient always      │
│    │ Issue: Weight clipping → unstable training         │
│    ↓                                                    │
│  WGAN-GP (2017)                                         │
│    │                                                    │
│    │ Fix: Gradient penalty → stable Lipschitz           │
│    ↓                                                    │
│  Spectral Normalization (2018)                          │
│    │                                                    │
│    │ Improve: Efficient Lipschitz constraint            │
│    ↓                                                    │
│  Progressive GAN, StyleGAN, StyleGAN2, ...              │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

- **GAN**: JSD 기반 → support가 안 겹치면 gradient = 0
- **WGAN**: Wasserstein 도입으로 항상 의미있는 gradient 제공, 하지만 weight clipping으로 학습 불안정
- **WGAN-GP**: Gradient penalty로 안정적 Lipschitz 제약 달성
- **Spectral Norm**: 더 효율적인 Lipschitz 제약

---

## 9. 정리

### 핵심 비교

```
┌─────────────────┬───────────────┬───────────────┬───────────────┐
│                 │      KL       │     JSD       │  Wasserstein  │
├─────────────────┼───────────────┼───────────────┼───────────────┤
│ Symmetric       │      ✗        │      ✓        │      ✓        │
│ Bounded         │      ✗        │      ✓        │      ✗        │
│ No overlap      │      ∞        │   constant    │  meaningful   │
│ Gradient        │    medium     │    poor*      │    good       │
│ Compute cost    │     low       │     low       │    high       │
└─────────────────┴───────────────┴───────────────┴───────────────┘
* when supports don't overlap
```

| 속성 | KL | JSD | Wasserstein |
|------|-----|-----|-------------|
| 대칭성 | ✗ | ✓ | ✓ |
| 범위 제한 | ✗ | ✓ | ✗ |
| Support 안겹침 | ∞ | 상수 | 유의미한 값 |
| Gradient 품질 | 보통 | 나쁨* | 좋음 |
| 계산 비용 | 낮음 | 낮음 | 높음 |

\* support가 안 겹칠 때

### 언제 무엇을 사용하는가

- **KL Divergence**: VAE loss, Knowledge Distillation 등 gradient 특성 활용 시
- **JSD**: 두 분포의 대칭적 비교, drift detection 등
- **Wasserstein**: GAN 학습, 분포가 많이 다를 수 있는 상황

### 다음 편 예고

Part 4에서는 이러한 거리 측정 방법들을 **실제 시스템에 적용하는 방법**을 다룹니다. Drift Detection, Anomaly Detection, Model Monitoring 등 실무에서 바로 활용할 수 있는 패턴들을 살펴보겠습니다.

---

## 참고 자료

- Goodfellow, I. et al. "Generative Adversarial Networks" (2014)
- Arjovsky, M. et al. "Wasserstein GAN" (2017)
- Gulrajani, I. et al. "Improved Training of Wasserstein GANs" (2017)
- Miyato, T. et al. "Spectral Normalization for GANs" (2018)
