---
layout: post
title:  "선형대수학 ①"
date:   2017-08-23 11:36:23 +0700
categories: [Linear_Algebra]
---

#### 표기법
- vector의 표기
    + $$\mathbf{x}$$ (mathbf 표기)
    + $$\vec{x}$$ (vector 표기)
- 행렬의 표기는 대문자
    + $$R$$ : 실수 집합 real values

---

#### Scalar
- 하나의 열
- feature 하나의 값, 혹은 target 하나의 값
- `y` : Scalar
- $$ y \in R $$

#### Vector
- Column Vector
    + 컬럼열이 벡터가 되도록 배열한다.(아래로 / 열로)
- 행 → 샘플 1개의 정보
- $$ x \in R^N = R^{N\times 1} $$
- $$ \mathbf{x} = [x_n]
 = \begin{bmatrix}
x_{1} \\
x_{2} \\
\vdots \\
x_{N} \\
\end{bmatrix}
$$
