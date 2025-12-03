---
slug: probability-distance-part2
title: 분포 거리 측정 (Part 2) - Forward vs Reverse KL, 그리고 VAE
authors: namyoungkim
tags: [data, deep-learning, machine-learning]
---

> Forward KL과 Reverse KL의 차이, Mode-covering과 Mode-seeking 행동의 이해. VAE의 Reparameterization Trick까지 상세 설명.

## 들어가며

Part 1에서 KL Divergence의 정의와 정보이론적 의미를 살펴봤습니다. 그런데 한 가지 의문이 남습니다. KL Divergence가 비대칭적이라면, $D_{KL}(P \| Q)$와 $D_{KL}(Q \| P)$ 중 어떤 것을 사용해야 할까요?

이 선택은 단순한 수학적 문제가 아닙니다. **ML 모델의 학습 행동을 근본적으로 바꿉니다.** 이번 글에서는 Forward KL과 Reverse KL의 차이를 깊이 이해하고, VAE에서 Reparameterization Trick이 왜 필요한지 알아보겠습니다.

<!-- truncate -->

---

## 1. Mode란 무엇인가

Forward와 Reverse KL을 이해하려면 먼저 **mode** 개념을 알아야 합니다.

### 정의

확률 분포에서 **mode**는 확률 밀도가 가장 높은 지점(peak, 봉우리)입니다.

```
Unimodal (단봉):           Bimodal (쌍봉):
      ∩                        ∩     ∩
    _/ \_                    _/ \_ _/ \_
      ↑                        ↑     ↑
    mode                    mode1  mode2


Multimodal (다봉):
    ∩  ∩    ∩
  _/ \/ \__/ \_
    ↑  ↑    ↑
   mode들
```

### 실제 예시

**게임 플레이 시간 분포:**
```
플레이어 수
    ↑
    │  ∩                    ∩
    │ /│\                  /│\
    │/ │ \                / │ \
    └──┴──┴────────────────┴──┴───→ 플레이 시간
      30분                   4시간
      (캐주얼)              (하드코어)
```

캐주얼 유저와 하드코어 유저가 만드는 bimodal 분포입니다.

**거래 금액 분포:**
```
거래 수
    ↑
    │∩                         ∩
    ││\                       /│
    ││ \                     / │
    └┴──────────────────────┴──→ 금액
    정상 거래               사기 거래
    (소액 다수)            (고액 소수)
```

정상 거래와 이상 거래가 서로 다른 mode를 형성합니다.

---

## 2. Forward KL: $D_{KL}(P \| Q)$

### 수식 전개

$$D_{KL}(P \| Q) = \sum_x P(x) \log \frac{P(x)}{Q(x)} = \mathbb{E}_{x \sim P}\left[\log \frac{P(x)}{Q(x)}\right]$$

핵심: **P에서 샘플링**하고, P와 Q의 비율을 평가합니다.

### 페널티 구조

- P(x) > 0인데 Q(x) ≈ 0이면 → $\log \frac{P(x)}{Q(x)} \to \infty$ → **큰 페널티**
- P(x) ≈ 0이면 → 해당 항이 0에 가까움 → **페널티 없음**

```
P(x) > 0, Q(x) = 0:  무한대 페널티! ← Forward KL이 싫어하는 상황
P(x) = 0, Q(x) > 0:  페널티 없음    ← Forward KL은 신경 안 씀
```

### 결과: Mode-Covering 행동

Forward KL을 최소화하면, Q는 **P가 존재하는 모든 곳을 커버**하려고 합니다.

```
실제 분포 P (bimodal):
        ∩           ∩
      _| |_________|_|_
       A             B

Forward KL 최소화로 학습된 Q:
      _____∩∩∩∩∩_____
     |_______________|

     → 두 mode를 모두 커버
     → 결과적으로 넓게 퍼진 분포
```

**왜 이렇게 되는가?**

A 지점이든 B 지점이든, P가 있는 곳에서 Q가 0이면 안 됩니다. 그래서 Q는 A와 B 사이를 모두 포함하는 넓은 분포가 됩니다. 심지어 P가 0인 중간 영역까지 커버합니다.

---

## 3. Reverse KL: $D_{KL}(Q \| P)$

### 수식 전개

$$D_{KL}(Q \| P) = \sum_x Q(x) \log \frac{Q(x)}{P(x)} = \mathbb{E}_{x \sim Q}\left[\log \frac{Q(x)}{P(x)}\right]$$

핵심: **Q에서 샘플링**하고, Q와 P의 비율을 평가합니다.

### 페널티 구조

- Q(x) > 0인데 P(x) ≈ 0이면 → **큰 페널티**
- Q(x) ≈ 0이면 → **페널티 없음**

```
Q(x) > 0, P(x) = 0:  무한대 페널티! ← Reverse KL이 싫어하는 상황
Q(x) = 0, P(x) > 0:  페널티 없음    ← Reverse KL은 신경 안 씀
```

### 결과: Mode-Seeking 행동

Reverse KL을 최소화하면, Q는 **P의 한 mode에 집중**합니다.

```
실제 분포 P (bimodal):
        ∩           ∩
      _| |_________|_|_
       A             B

Reverse KL 최소화로 학습된 Q:
              ∩
           __|_|__

     → 하나의 mode에만 집중
     → 좁고 정확한 분포
```

**왜 이렇게 되는가?**

Q가 P의 support 밖으로 나가면 큰 페널티를 받습니다. 가장 안전한 전략은 P의 한 mode 안에만 머무르는 것입니다. 다른 mode를 무시하더라도(P(x) > 0, Q(x) = 0) 페널티가 없으니까요.

---

## 4. Mode-Covering vs Mode-Seeking 비교

### 시각적 요약

```
┌─────────────────────────────────────────────────────────┐
│                    True Distribution P                  │
│                                                         │
│            ∩                       ∩                    │
│          _| |_                   _| |_                  │
│         Mode A                   Mode B                 │
└─────────────────────────────────────────────────────────┘
                        ↓
        ┌───────────────┴───────────────┐
        ↓                               ↓
┌───────────────────┐         ┌───────────────────┐
│   Forward KL      │         │   Reverse KL      │
│   D_KL(P || Q)    │         │   D_KL(Q || P)    │
│                   │         │                   │
│  ____∩∩∩∩∩∩____   │         │        ∩          │
│ |______________|  │         │      _|_|_        │
│                   │         │                   │
│  Mode-Covering    │         │  Mode-Seeking     │
│  (spread wide)    │         │  (focus on one)   │
└───────────────────┘         └───────────────────┘
```

- **Forward KL (Mode-Covering)**: 넓게 퍼짐 - 모든 mode를 커버하려 함
- **Reverse KL (Mode-Seeking)**: 한 곳에 집중 - 하나의 mode에만 집중

### 특성 비교

```
┌────────────────┬─────────────────────┬─────────────────────┐
│                │    Forward KL       │    Reverse KL       │
│                │    D_KL(P || Q)     │    D_KL(Q || P)     │
├────────────────┼─────────────────────┼─────────────────────┤
│ Sampling from  │    P                │    Q                │
│ Big penalty    │    P>0, Q≈0         │    Q>0, P≈0         │
│ Behavior       │    Mode-covering    │    Mode-seeking     │
│ Result dist    │    Wide, spread     │    Narrow, focused  │
│ Diversity      │    High             │    Low              │
│ Precision      │    Low (blur)       │    High (sharp)     │
└────────────────┴─────────────────────┴─────────────────────┘
```

| 항목 | Forward KL | Reverse KL |
|------|------------|------------|
| 샘플링 위치 | P에서 | Q에서 |
| 큰 페널티 조건 | P>0, Q≈0 | Q>0, P≈0 |
| 학습 행동 | Mode-covering | Mode-seeking |
| 결과 분포 | 넓고 퍼짐 | 좁고 집중 |
| 다양성 | 높음 | 낮음 |
| 정확도 | 낮음 (blur) | 높음 (sharp) |

### 언제 무엇을 사용하는가

**Forward KL이 적합한 경우:**
- 모든 가능성을 커버해야 할 때
- 놓치는 mode가 있으면 안 될 때
- 예: 위험 예측 (모든 위험 요소 포착)

**Reverse KL이 적합한 경우:**
- 정확한 샘플이 필요할 때
- 한 mode라도 정확히 맞추는 게 중요할 때
- 예: 이미지 생성 (blur보다 sharp한 이미지)

---

## 5. Stochastic 연산의 문제

VAE를 이해하기 전에, 먼저 **stochastic 연산**이 왜 문제인지 알아야 합니다.

### Deterministic vs Stochastic

```
Deterministic (결정적):
    입력이 같으면 출력도 항상 같음

    f(x) = 2x + 1
    f(3) = 7  (항상)
    f(3) = 7  (항상)
    f(3) = 7  (항상)

Stochastic (확률적):
    입력이 같아도 출력이 매번 다를 수 있음

    f(x) = x + ε,  where ε ~ N(0, 1)
    f(3) = 3.7
    f(3) = 2.1
    f(3) = 4.2
```

### Backpropagation은 Deterministic 연산만 처리 가능

Gradient 계산은 chain rule에 기반합니다:

$$\frac{\partial L}{\partial x} = \frac{\partial L}{\partial y} \cdot \frac{\partial y}{\partial x}$$

이 계산이 가능하려면 $\frac{\partial y}{\partial x}$가 **정의 가능**해야 합니다.

```
Deterministic 연산:
    y = 2x
    ∂y/∂x = 2  ← 명확히 정의됨

Stochastic 연산 (sampling):
    y ~ N(x, 1)  (x를 평균으로 하는 정규분포에서 샘플)
    ∂y/∂x = ???  ← 정의 불가!
```

샘플링은 **함수가 아니라 과정**입니다. 같은 입력에서 다른 출력이 나오므로 미분 개념 자체가 모호합니다.

### 시각화

```
[Deterministic - Gradient 흐름 OK]

x ───→ f(x)=2x ───→ g(·)=·+1 ───→ y ───→ Loss
          ↑             ↑
       ∂f/∂x=2      ∂g/∂f=1

       Chain rule: ∂Loss/∂x 계산 가능 ✓


[Stochastic - Gradient 끊김]

x ───→ [SAMPLE from N(x,1)] ───→ z ───→ h(z) ───→ Loss
                ↑
           ∂z/∂x = ???

           Gradient가 x까지 전파 불가 ✗
```

---

## 6. VAE의 구조와 문제

### VAE 기본 구조

```
Input x                                      Output x̂
   │                                            ↑
   ↓                                            │
┌─────────┐      ┌─────────┐      ┌─────────────┤
│ Encoder │ ───→ │ μ, σ    │ ───→ │   Decoder   │
└─────────┘      └────┬────┘      └─────────────┘
                      │
                      ↓
                z ~ N(μ, σ²)  ← 여기가 문제!
```

Encoder는 입력 x를 받아 latent space의 분포 파라미터 (μ, σ)를 출력합니다. 그리고 이 분포에서 z를 **샘플링**합니다.

### 문제: Sampling은 미분 불가

```pseudo
# 문제가 되는 코드
function forward(x):
    mu, sigma = encoder(x)
    z = sample_from_normal(mu, sigma)  # Stochastic! Gradient 끊김
    x_reconstructed = decoder(z)
    return x_reconstructed
```

Loss를 계산해서 backprop을 하면, gradient가 `sample_from_normal`에서 멈춥니다. Encoder의 파라미터까지 gradient가 전파되지 않습니다.

```
Loss
  ↑
  │ ∂L/∂decoder (OK)
  │
decoder
  ↑
  │ ∂decoder/∂z (OK)
  │
  z
  ↑
  │ ∂z/∂μ = ??? ← 여기서 끊김!
  │
 μ, σ
  ↑
  │
encoder  ← gradient 도달 못함
```

---

## 7. Reparameterization Trick

### 핵심 아이디어

랜덤성을 **연산 밖으로 분리**합니다.

```
[변환 전]
z ~ N(μ, σ²)     ← stochastic, gradient 못 흘림

[변환 후]
ε ~ N(0, 1)      ← stochastic, 하지만 학습 파라미터 아님
z = μ + σ · ε   ← deterministic! gradient 흐름 OK
```

수학적으로 동일한 분포이지만, 계산 그래프에서의 의미가 다릅니다.

### 시각화

```
[변환 전: Gradient 끊김]

x → Encoder → μ, σ → [SAMPLE z ~ N(μ,σ²)] → Decoder → Loss
                              ↑
                         gradient 막힘


[변환 후: Gradient 흐름]

                         ε ~ N(0,1)  (외부 noise, 학습 대상 아님)
                              ↓
x → Encoder → μ, σ → [z = μ + σ·ε] → Decoder → Loss
        ↑              ↑
        │              │
        └──────────────┴── gradient 흐름 OK!
```

### 왜 동작하는가?

z = μ + σ·ε 연산은 **deterministic**입니다:

$$\frac{\partial z}{\partial \mu} = 1$$

$$\frac{\partial z}{\partial \sigma} = \epsilon$$

ε는 고정된 값(그 순간에 샘플된 상수)이므로, gradient 계산이 가능합니다.

### 구현

```pseudo
function reparameterize(mu, log_var):
    # log_var = log(σ²) 사용 (수치 안정성)
    sigma = exp(0.5 * log_var)

    # 외부 noise 샘플링
    epsilon = sample_standard_normal(shape=mu.shape)

    # Deterministic 연산으로 z 계산
    z = mu + sigma * epsilon

    return z

function forward(x):
    mu, log_var = encoder(x)
    z = reparameterize(mu, log_var)  # Gradient 흐름 OK
    x_reconstructed = decoder(z)
    return x_reconstructed, mu, log_var
```

---

## 8. VAE Loss 구조

### ELBO (Evidence Lower Bound)

VAE의 손실 함수는 두 부분으로 구성됩니다:

$$\mathcal{L} = \underbrace{\mathbb{E}_{q(z|x)}[\log p(x|z)]}_{\text{Reconstruction}} - \underbrace{D_{KL}(q(z|x) \| p(z))}_{\text{KL Regularization}}$$

### 각 항의 의미

**1. Reconstruction Loss:**

- Decoder가 z로부터 x를 잘 복원하는가?
- 보통 MSE 또는 Binary Cross-Entropy 사용

**2. KL Divergence:**

- Encoder가 만드는 posterior q(z|x)가 prior p(z)에 가까운가?
- Prior는 보통 N(0, I) (표준 정규분포)

```
┌─────────────────────────────────────────────────────┐
│                    VAE Loss                         │
│                                                     │
│   ┌─────────────────┐   ┌─────────────────────┐     │
│   │  Reconstruction │ + │   KL Divergence     │     │
│   │     Loss        │   │   (Regularization)  │     │
│   │                 │   │                     │     │
│   │  "reconstruct   │   │  "z distribution    │     │
│   │   x well"       │   │   close to N(0,1)"  │     │
│   └─────────────────┘   └─────────────────────┘     │
└─────────────────────────────────────────────────────┘
```

- **Reconstruction Loss**: x를 잘 복원하라
- **KL Divergence**: z의 분포가 N(0,1)에 가깝게

### Gaussian KL의 Closed-Form

Prior가 N(0, 1)이고 posterior가 N(μ, σ²)일 때:

$$D_{KL}(N(\mu, \sigma^2) \| N(0, 1)) = -\frac{1}{2}\sum_{j=1}^{J}(1 + \log\sigma_j^2 - \mu_j^2 - \sigma_j^2)$$

### 구현

```pseudo
function vae_loss(x, x_reconstructed, mu, log_var):
    # Reconstruction loss (예: MSE)
    recon_loss = mean_squared_error(x, x_reconstructed)

    # KL divergence (closed-form)
    # D_KL = -0.5 * Σ(1 + log(σ²) - μ² - σ²)
    kl_loss = -0.5 * sum(1 + log_var - mu^2 - exp(log_var))

    # Total loss
    total_loss = recon_loss + kl_loss

    return total_loss
```

---

## 9. 가우시안 간 Closed-Form KL

VAE 외에도 가우시안 분포 간 KL은 자주 사용됩니다.

### 1차원 가우시안

$$D_{KL}(N(\mu_1, \sigma_1^2) \| N(\mu_2, \sigma_2^2)) = \log\frac{\sigma_2}{\sigma_1} + \frac{\sigma_1^2 + (\mu_1 - \mu_2)^2}{2\sigma_2^2} - \frac{1}{2}$$

### 다변량 가우시안

$$D_{KL}(N(\boldsymbol{\mu}_1, \boldsymbol{\Sigma}_1) \| N(\boldsymbol{\mu}_2, \boldsymbol{\Sigma}_2))$$

$$= \frac{1}{2}\left[\log\frac{|\boldsymbol{\Sigma}_2|}{|\boldsymbol{\Sigma}_1|} - d + \text{tr}(\boldsymbol{\Sigma}_2^{-1}\boldsymbol{\Sigma}_1) + (\boldsymbol{\mu}_2-\boldsymbol{\mu}_1)^T\boldsymbol{\Sigma}_2^{-1}(\boldsymbol{\mu}_2-\boldsymbol{\mu}_1)\right]$$

여기서 d는 차원 수입니다.

### 구현

```pseudo
function kl_gaussian_1d(mu1, sigma1, mu2, sigma2):
    term1 = log(sigma2 / sigma1)
    term2 = (sigma1^2 + (mu1 - mu2)^2) / (2 * sigma2^2)
    term3 = -0.5

    return term1 + term2 + term3

function kl_gaussian_multivariate(mu1, cov1, mu2, cov2):
    d = length(mu1)
    cov2_inv = inverse(cov2)

    term1 = log(determinant(cov2) / determinant(cov1))
    term2 = trace(cov2_inv @ cov1)
    diff = mu2 - mu1
    term3 = diff.T @ cov2_inv @ diff

    return 0.5 * (term1 - d + term2 + term3)
```

---

## 10. 정리

### Forward vs Reverse KL 요약

```
Forward KL: D_KL(P || Q)
├── Sample from P
├── Penalty when P>0, Q=0
├── Mode-covering → wide distribution
└── Use: Maximum Likelihood, cover all modes

Reverse KL: D_KL(Q || P)
├── Sample from Q
├── Penalty when Q>0, P=0
├── Mode-seeking → focused distribution
└── Use: VAE, precise samples needed
```

- **Forward KL**: P에서 샘플링, 모든 mode 커버 필요시 사용
- **Reverse KL**: Q에서 샘플링, 정확한 샘플 필요시 사용

### Reparameterization Trick 요약

```
Problem: z ~ N(μ, σ²) is stochastic → gradient blocked

Solution: z = μ + σ·ε, ε ~ N(0,1)
      ├── Separate randomness (ε) outside
      ├── z computation is deterministic
      └── Gradient can flow to μ, σ
```

- **문제**: z ~ N(μ, σ²)는 stochastic이라 gradient가 끊김
- **해결**: 랜덤성(ε)을 외부로 분리하면 z 계산이 deterministic이 되어 gradient 흐름 가능

### 다음 편 예고

KL Divergence는 강력하지만 한계가 있습니다. 특히 두 분포의 support가 겹치지 않으면 문제가 발생합니다. Part 3에서는 이를 해결하는 **Jensen-Shannon Divergence**와, GAN 학습에서 더 나은 **Wasserstein Distance**를 알아보겠습니다.

---

## 참고 자료

- Kingma, D. P., & Welling, M. "Auto-Encoding Variational Bayes" (2014)
- Doersch, C. "Tutorial on Variational Autoencoders" (2016)
- Murphy, K. P. "Machine Learning: A Probabilistic Perspective" Chapter 21
