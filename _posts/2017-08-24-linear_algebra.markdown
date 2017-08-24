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
- $$ X = \begin{bmatrix} c_1 \;\;\;\; c_2 \;\;\;\; \cdots \;\;\;\; c_N \end{bmatrix} = \begin{bmatrix} r_1^T \\ r_2^T \\ \cdots \\ r_M^T \end{bmatrix} $$

#### Example: Feature Matrix
- $$ \mathbf{x_i} = \begin{bmatrix} x_{i1} \\ x_{i2} \\ \vdots \\ x_{iM} \end{bmatrix},\;\; (i=1,\cdots,N) $$
- $$\mathbf{x_i}$$는 샘플 하나의 정보이다.
    + $$(i=1,\cdots,N) $$이므로 sample의 갯수는 N개이다.
- $$\mathbf{x_i}$$ 벡터 안의 원소는 sample 하나의 Feature 값이다.
- $$ X = \begin{bmatrix} \mathbf{x_{1}^T} \\ \mathbf{x_{2}^T} \\ \vdots \\ \mathbf{x_{N}^T} \end{bmatrix} = \begin{bmatrix} x_{11} \;\;\;\; x_{12} \;\;\;\; \cdots \;\;\;\; x_{1M} \\ x_{21} \;\;\;\; x_{22} \;\;\;\; \cdots \;\;\;\; x_{2M} \\ \vdots \;\;\;\; \vdots \;\;\;\; \cdots \;\;\;\; \vdots \\ x_{i1} \;\;\;\; x_{i2} \;\;\;\; \cdots \;\;\;\; x_{iM} \\ \vdots \;\;\;\; \vdots \;\;\;\; \cdots \;\;\;\; \vdots \\ x_{N1} \;\;\;\; x_{N2} \;\;\;\; \cdots \;\;\;\; x_{NM} \end{bmatrix} $$

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
