---
layout: post
title:  "선형대수학 ③"
date:   2017-08-25 11:27:23 +0700
categories: [Linear_Algebra, python, LaTeX]
---

#### Linear Combination of Column Vector(열 벡터의 선형 결합)

- for $$ a_i \in R, \;\; \mathbf{c}_i \in R^{M}, \;\; \mathbf{a} \in R^N, \;\; C \in R^{M \times N} $$
- $$ a_1 \begin{bmatrix} c_{11} \\ c_{21} \\ \vdots \\ c_{M1} \end{bmatrix} + a_2 \begin{bmatrix} c_{12} \\ c_{22} \\ \vdots \\ c_{M2} \end{bmatrix} + \cdots + a_N \begin{bmatrix} c_{1N} \\ c_{2N} \\ \vdots \\ c_{MN} \end{bmatrix} = a_1 \mathbf{c}_1 + a_2 \mathbf{c}_2 + \cdots + a_N \mathbf{c}_M \\ = \begin{bmatrix} \mathbf{c}_1 \;\;\;\; \mathbf{c}_2 \;\;\;\; \cdots \;\;\;\; \mathbf{c}_M \end{bmatrix} \begin{bmatrix} a_{1} \\ a_{2} \\ \vdots \\
 a_{N} \end{bmatrix}= C\mathbf{a} $$

{% highlight python %}
# -*- coding: utf-8 -*-

import numpy as np

c1 = np.array([[1, 1, 1]]).T
c2 = np.array([[0, 2, 2]]).T
c3 = np.array([[0, 0, 3]]).T
a = np.array([1, 2, 3])

c1
[[1]
 [1]
 [1]]

c2
[[0]
 [2]
 [2]]

c3
[[0]
 [0]
 [3]]

a
[1 2 3]

a[0] * c1 + a[1] * c2 + a[2] * c3
array([[ 1],
       [ 5],
       [14]])

C = np.hstack([c1, c2, c3])
C

array([[1, 0, 0],
       [1, 2, 0],
       [1, 2, 3]])

np.dot(C, a)
array([ 1,  5, 14])

np.dot(a, C) 
array([ 6, 10,  9])
{% endhighlight %}
- `np.array()` → `[ ]`, `[[ ]]` 벡터와 매트릭스를 확인하고 데이터를 Input해야 한다.
- 
