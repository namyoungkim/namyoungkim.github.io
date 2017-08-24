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
