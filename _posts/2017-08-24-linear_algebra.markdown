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
