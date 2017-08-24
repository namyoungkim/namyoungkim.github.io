---
layout: post
title:  "선형대수학 ②"
date:   2017-08-24 13:36:23 +0700
categories: [Linear_Algebra, python, LaTeX]
---

#### Matrix 행렬
- $$ A \in R^{N\times M} $$
- $$ A = [a_{n,m}],(n=1,\cdots,N;\;\;m=1,\cdots,M) \\ \\ \\ = \begin{bmatrix} a_{1,1} \;\;\;\; a_{1,2} \;\;\;\; \cdots \;\;\;\; a_{1,M} \\ a_{2,1} \;\;\;\; a_{2,2} \;\;\;\; \cdots \;\;\;\; a_{2,M} \\ \vdots \;\;\;\; \vdots \;\;\;\; \ddots \;\;\;\; \vdots \\ a_{N,1} \;\;\;\; a_{N,2} \;\;\;\; \cdots \;\;\;\; a_{N,M} \end{bmatrix} $$

{% highlight python %}
# -*- coding: utf-8 -*-

import numpy as np

A = np.array([[1, 2, 3], [4, 5, 6]])
A

np.mat(A)

np.matrix([[1,2,3], [4,5,6]])

np.matrix('1,2,3,;4,5,6')
{% endhighlight %}
- matrix를 만드는 방법은 위처럼 다양하다.
- 가장 흔하게 사용되는 방법은 `np.array(data)`이다.
    + `shape`을 가지고 있기 때문

---

#### Diagonal Matrix 대각 행렬
- 대각행렬은 무조건 `정방행렬`이다!!
- $$ D \in R^{N \times N} $$
- $$ D = \begin{bmatrix} D_1 \;\;\;\; 0  \;\;\;\; \cdots \;\;\;\; 0 \\ 0 \;\;\;\; D_2  \;\;\;\; \cdots \;\;\;\; 0 \\ \vdots \;\;\;\; \vdots  \;\;\;\; \ddots \;\;\;\; \vdots \\ 0 \;\;\;\; 0  \;\;\;\; 0 \;\;\;\; D_N \end{bmatrix} $$
{% highlight python %}
np.diag([1,2,3])
{% endhighlight %}
```
array([[1, 0, 0],
       [0, 2, 0],
       [0, 0, 3]])
```

---

#### Identity Matrix(단위행렬 : I)
- $$ I \in R^{N \times N} $$
- $$ I = \begin{bmatrix} 1 \;\;\;\; 0 \;\;\;\; \cdots \;\;\;\; 0 \\ 0 \;\;\;\; 1 \;\;\;\; \cdots \;\;\;\; 0 \\ \vdots \;\;\;\; \vdots \;\;\;\; \ddots \;\;\;\; \cdots \\ 0 \;\;\;\; 0 \;\;\;\; \cdots \;\;\;\; 1 \end{bmatrix} $$
{% highlight python %}
np.identity(3)
np.eye(3)
{% endhighlight %}
```
array([[ 1.,  0.,  0.],
       [ 0.,  1.,  0.],
       [ 0.,  0.,  1.]])
```
- `np.identity`, `np.eye` 무엇을 쓰든 결과는 동일하다.

---

#### Transpose 전치
- 행과 열을 바꾸는 것
* 벡터
    - 열벡터 → 행벡터로 변환
    - $$ \mathbf{x} = \begin{bmatrix} x_1 \\ x_2 \\ \vdots \\ x_N \end{bmatrix} \rightarrow \mathbf{x}^T = \begin{bmatrix} x_1 \;\;\;\; x_2 \;\;\;\; \cdots \;\;\;\; x_N \end{bmatrix} $$
    - $$ \mathbf{x} \in R^{N \times 1} \rightarrow \mathbf{x}^T \in R^{1 \times N} $$

- 행렬
    - 행과 열을 바꿈
    - $$ A = \begin{bmatrix} a_{11} \;\;\;\; a_{12} \;\;\;\; \cdots \;\;\;\; a_{1M} \\ a_{21} \;\;\;\; a_{22} \;\;\;\; \cdots \;\;\;\; a_{2M} \\ \vdots \;\;\;\; \vdots \;\;\;\; \ddots \;\;\;\; \vdots \\ a_{N1} \;\;\;\; a_{N2} \;\;\;\; \cdots \;\;\;\; a_{NM} \end{bmatrix}\; \rightarrow \; A^T = \begin{bmatrix} a_{11} \;\;\;\; a_{21} \;\;\;\; \cdots \;\;\;\; a_{N1} \\ a_{12} \;\;\;\; a_{22} \;\;\;\; \cdots \;\;\;\; a_{N2} \\ \vdots \;\;\;\; \vdots \;\;\;\; \ddots \;\;\;\; \vdots \\ a_{1M} \;\;\;\; a_{2M} \;\;\;\; \cdots \;\;\;\; a_{NM} \end{bmatrix} $$
    - $$ A \in R^{N \times M} \; \rightarrow \; A^T \in R^{M \times N} $$
{% highlight python %}
# -*- coding: utf-8 -*-

import numpy as np

x = np.array([1,2,3,4,5])
{% endhighlight %}

```
x

array([1, 2, 3, 4, 5])
```

```
x.T

array([1, 2, 3, 4, 5])
```
- $$\mathbf{x}$$처럼 행 벡터일 경우 `.T`를 해주어도 전치되지 않는다.

```
x[:, np.newaxis]

array([[1],
       [2],
       [3],
       [4],
       [5]])
```
- `x[:, np.newaxis]`를 사용하여 전치시킬수 있다.
- 가로(행) → 세로(열)로 바꿀 때는 위처럼 하나씩 인덱싱한 후 axis를 새로 만들어주어야 한다.

```
x[:, np.newaxis].T

array([[1, 2, 3, 4, 5]])
```
- 세로(열) → 가로(행) 일 때는 `.T`가 잘 작동하는 것을 확인할 수 있다.

{% highlight python %}
A = np.array([[1,2,3], [4,5,6]])
A

array([[1, 2, 3],
       [4, 5, 6]])

A.T

array([[1, 4],
       [2, 5],
       [3, 6]])

A.T.T

array([[1, 2, 3],
       [4, 5, 6]])  
{% endhighlight %}
- 행렬은 `.T`를 사용하면 전치가 된다.

---

#### Symmetric Matrix 대칭 행렬
- 아래 조건을 만족하면 A는 대칭행렬이다.(필요충분조건)
- $$ A = A^T $$

---

#### Matrix를 Column vector 와 Row vector로 표현해보자.
- for column vector $$ c_i \; \in R^{M \times 1},\;\;r_i \; \in R^{N \times 1},\;\;X \in R^{M \times N} $$
- $$c_i = r_i^T$$
- $$ X = \begin{bmatrix} c_1 \;\;\;\; c_2 \;\;\;\; \cdots \;\;\;\; c_N \end{bmatrix} = \begin{bmatrix} r_1^T \\ r_2^T \\ \vdots \\ r_M^T \end{bmatrix} $$

#### Example: Feature Matrix
- $$ \mathbf{x_i} = \begin{bmatrix} x_{i1} \\ x_{i2} \\ \vdots \\ x_{iM} \end{bmatrix},\;\; (i=1,\cdots,N) $$
- $$\mathbf{x_i}$$는 샘플 하나의 정보이다.
    + $$(i=1,\cdots,N) $$이므로 sample의 갯수는 N개이다.
- $$\mathbf{x_i}$$ 벡터 안의 원소는 sample 하나의 Feature 값이다.
- $$ X = \begin{bmatrix} \mathbf{x_{1}^T} \\ \mathbf{x_{2}^T} \\ \vdots \\ \mathbf{x_{N}^T} \end{bmatrix} = \begin{bmatrix} x_{11} \;\;\;\; x_{12} \;\;\;\; \cdots \;\;\;\; x_{1M} \\ x_{21} \;\;\;\; x_{22} \;\;\;\; \cdots \;\;\;\; x_{2M} \\ \vdots \;\;\;\; \vdots \;\;\;\; \cdots \;\;\;\; \vdots \\ x_{i1} \;\;\;\; x_{i2} \;\;\;\; \ddots \;\;\;\; x_{iM} \\ \vdots \;\;\;\; \vdots \;\;\;\; \cdots \;\;\;\; \vdots \\ x_{N1} \;\;\;\; x_{N2} \;\;\;\; \cdots \;\;\;\; x_{NM} \end{bmatrix} $$

---

#### Matrix Add/Subtract(덧셈과 뺄셈)
- 같은 위치의 원소끼리 연산을 하면 된다.
{% highlight python %}
x = np.arange(5)
y = np.arange(10, 15)
x, y

(array([0, 1, 2, 3, 4]), array([10, 11, 12, 13, 14]))


x + y

array([10, 12, 14, 16, 18])


x - y
array([-10, -10, -10, -10, -10])


np.arange(20)

array([ 0,  1,  2,  3,  4,  5,  6,  7,  8,  9, 10, 11, 12, 13, 14, 15, 16,
       17, 18, 19])


np.arange(20).reshape(4,5)  # 4행 5열의 매트릭스로 바꿔라.

array([[ 0,  1,  2,  3,  4],
       [ 5,  6,  7,  8,  9],
       [10, 11, 12, 13, 14],
       [15, 16, 17, 18, 19]])


A = np.arange(20).reshape(4,5)
B = (A + 50)
B

array([[50, 51, 52, 53, 54],
       [55, 56, 57, 58, 59],
       [60, 61, 62, 63, 64],
       [65, 66, 67, 68, 69]])


A + B
array([[50, 52, 54, 56, 58],
       [60, 62, 64, 66, 68],
       [70, 72, 74, 76, 78],
       [80, 82, 84, 86, 88]])
{% endhighlight %}

---

#### Vector Multiplication(벡터의 곱셈)
- $$ \mathbf{x}^T\mathbf{y} = \begin{bmatrix} x_1 \;\;\;\; x_2 \;\;\;\; \cdots \;\;\;\; x_N \end{bmatrix} \begin{bmatrix} y_1 \\ y_2 \\ \vdots \\ y_N \end{bmatrix} = x_{1}y_{1} + \cdots + x_{N}y_{N} = \sum_{i=1}^N x_{i}y{i} $$
- vector의 곱 → scalar
- 기본적으로 열 벡터이므로 Transpose를 한 벡터를 앞에 두고 곱한다.
    + 즉, 곱할수 있도록 변형한 상태에서 벡터의 곱을 하도록 한다.
- $$ \mathbf{x} \in R^{N \times 1}, \;\; \mathbf{y} \in R^{N \times 1} \rightarrow \mathbf{x}^T\mathbf{y} \in R^{1 \times 1} $$
    + $$ R^{1 \times 1} = R $$ 실수값(스칼라)
- $$\bbox[15px, border:2px solid darkred]{\mathbf{x}^T\mathbf{y} = \mathbf{y}^T\mathbf{x} = \mathbf{x}\cdot\mathbf{y}}$$
    + **pf)** $$\mathbf{y}^T\mathbf{x} = \begin{bmatrix} y_1 \;\;\;\; y_2 \;\;\;\; \cdots \;\;\;\; y_N \end{bmatrix} \begin{bmatrix} x_1 \\ x_2 \\ \vdots \\ x_N \end{bmatrix} = \sum_{i=1}^N y_{i}x_{i} $$
    + `내적(inner product)`의 값과 같다.

{% highlight python %}
x = np.array([1, 2, 3])
y = np.array([4, 5, 6])
x * y

array([ 4, 10, 18])


(x * y).sum()

32


np.dot(x, y)

32

x_1 = x[:, np.newaxis]
x

array([1, 2, 3])

x_1

array([[1],
       [2],
       [3]])

np.matmul(x_1,y) # error, 차원이 맞지 않기 때문에

np.matmul(y,x_1)
array([32])
{% endhighlight %}
- `np.dot()`, `np.matmul()` → 행령 또는 벡터의 곱
- 벡터가 둘 다 모두 행벡터인 경우 `np.dot()`, `np.matmul()` 값을 잘 뱉는다.
- 열벡터가 하나라도 있으면 차원을 맞춰서 행렬곱을 해주어야 에러가 나지 않는다.
- 또한 행과 열의 곱이면, 어레이가 하나씌여진 값을 출력한다. 

---

#### Example: Weighted Sum(가중치의 합)
- $$ \mathbf{y} = f(\mathbf{w}^T\phi(\mathbf{x})) $$
- $$ w_1 x_1 + \cdots + w_D x_D = \sum_{i=1}^D w_i x_i = \begin{bmatrix} w_1 \;\;\;\; w_2 \;\;\;\; \cdots \;\;\;\; w_D \end{bmatrix} \begin{bmatrix} x_1 \\ x_2 \\ \vdots \\ x_D \end{bmatrix} \\ = \mathbf{w}^T\mathbf{x} = \begin{bmatrix} x_1 \;\;\;\; x_2 \;\;\;\; \cdots \;\;\;\; x_D \end{bmatrix} \begin{bmatrix} w_1 \\ w_2 \\ \vdots \\ w_D \end{bmatrix} =\mathbf{x}^T\mathbf{w} $$

- Average를 구해보자.
- $$ Mean = \sum xf(x) $$
    + 확률변수 x에 확률을 곱한 값의 sum = 평균이라는 것을 활용해서 다음의 예를 풀어보자.
{% highlight python %}
x = np.array([1, 2, 3, 4, 5])
w = 1 / len(x) * np.ones(x.shape)

# 1 / len(x) -> 0.2
# np.ones(x.shape) -> array([ 1.,  1.,  1.,  1.,  1.])

x, w

(array([1, 2, 3, 4, 5]), array([ 0.2,  0.2,  0.2,  0.2,  0.2]))


mean = np.dot(w.T, x)
mean

3.0


mean_2 = np.mean(x)
mean_2

3.0
{% endhighlight %}
- `np.dot(w.T, x)` 대신에 `np.dot(w, x)` 해도 동일한 값을 얻는다.
- 앞에서 포스팅했듯이 행벡터는 자동으로 벡터의 곱을 해준다.
- 또한, `w.T`를 해도 `w`는 전치되지 않는다.
- `mean`, `mean_2`를 비교하면 값이 같음을 알 수 있다.

---

#### Example: Sum of Squares(제곱의 합)
- $$
x^Tx =
\begin{bmatrix} x_{1} \;\;\;\; x_{2} \;\;\;\; \cdots \;\;\;\; x_{M} \end{bmatrix}
\begin{bmatrix}
x_{1} \\
x_{2} \\
\vdots \\
x_{M} \\
\end{bmatrix} = \sum_{i=1}^{M} x_i^2
$$

- 편차 제곱의 합의 평균 = Variance(분산)
- $$ E((x-\mu)^2) = Var(x) $$
{% highlight python %}
# mean은 아래와 같이 두가지 방법으로 계산 가능하다.
x = np.array([1, 2, 3, 4, 5])
w = 1 / len(x) * np.ones(x.shape)
mean_1 = np.dot(x,w)
mean_2 = np.mean(x)
mean = mean_1

# 편향된(biased) sample variance
var1 = np.dot((x - mean).T, x - mean) / len(x)
print(var1)
var2 = np.var(x)
print(var2)

2.0
2.0

# 비편향된(unbiased) sample variance
var3 = np.dot((x - mean).T, x - mean) / (len(x) - 1)
print(var3)
var4 = np.var(x, ddof=1)
print(var4)

2.5
2.5
{% endhighlight %}
- `np.dot((x - mean).T, x - mean) / len(x)` = $$ \dfrac{(\mathbf{x}-\mu)^T(\mathbf{x}-\mu)}{5}  = E((x-\mu)^2) $$
- 표본이므로, 비편향된 표본 분산을 구해야한다.
    + 평균에서 자유도를 하나 썼으므로, `n-1`개로 나누어 계산한다.

---
