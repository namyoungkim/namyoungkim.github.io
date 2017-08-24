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
- x처럼 행 벡터일 경우 `.T`를 해주어도 전치되지 않는다.

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
