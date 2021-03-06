---
layout: post
title:  "선형대수학 ③"
date:   2017-08-25 11:27:23 +0700
categories: [Linear_Algebra]
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
    + `a` → 벡터
    + `c1, c2, c3` → 행렬
- `np.hstack()` → 열을 쌓는 메소드(`↓``↓``↓`)
- `np.vstack()` → 행을 쌓는 메소드(`⇶`)
- `np.dot(C, a)`: `a`가 행벡터이나 이 메소드는 행렬의 곱이 되도록 배열을 스스로 변형하여 계산해준다.
    - `a`: `1 * 3`  
- `np.dot(a, C)`
- **행렬과 벡터의 곱은 배열을 항상 생각하고 연산을 해주어야 한다!**

---

#### Quadratic Form (Weighted Sum of Squares)
- $$ x^T A x = \begin{bmatrix} x_{1} \;\;\;\; x_{2} \;\;\;\; \cdots \;\;\;\; x_{N} \end{bmatrix} \begin{bmatrix} a_{11} \;\;\;\; a_{12} \;\;\;\; \cdots \;\;\;\; a_{1N} \\ a_{21} \;\;\;\; a_{22} \;\;\;\; \cdots \;\;\;\; a_{2N} \\
\vdots \;\;\;\; \vdots \;\;\;\; \ddots \;\;\;\; \vdots \\ a_{N1} \;\;\;\; a_{N2} \;\;\;\; \cdots \;\;\;\; a_{NN} \\ \end{bmatrix} \begin{bmatrix} x_{1} \\ x_{2} \\ \vdots \\ x_{N} \end{bmatrix} \\ = a_{11} x_{1}^2 + \cdots + a_{NN} x_{N}^2 = \sum_{i=1}^{N} \sum_{j=1}^{N} a_{ij} x_i x_j $$

- ex) $$ \mathbf{x} = \begin{bmatrix} 1 \;\;\;\; 2 \;\;\;\; 3 \end{bmatrix}^T, \;\;\; \mathbf{A} = \begin{bmatrix} 1 \;\;\;\; 2 \;\;\;\; 3 \\ 4 \;\;\;\; 5 \;\;\;\; 6 \\ 7 \;\;\;\; 8 \;\;\;\; 9 \end{bmatrix} $$
- 이때, $$\mathbf{x}^T \mathbf{A} \mathbf{x}$$ = ?
- 코드로 구현해보면 다음과 같다.
{% highlight python %}
# -*- coding: utf-8 -*-

import numpy as np

x = np.array([[1,2,3]]).T
# 대괄호 두 개를 넣어야 Transpose가 되므로 행렬형태로 넣었다.
x

    array([[1],
       [2],
       [3]])

x.T
    array([[1, 2, 3]])

# 1~9까지 수를 배열하고, (3,3)의 shape으로 재배열해라.
A = np.arange(1, 10).reshape(3,3)
A
    array([[1, 2, 3],
       [4, 5, 6],
       [7, 8, 9]])

# x의 shape이 (3,1)이므로 (3,3)인 A와 행렬의 곱이 불가능하여 아래와 같이 Error가 발생함.
np.dot(x, A)
    ValueError: shapes (3,1) and (3,3) not aligned: 1 (dim 1) != 3 (dim 0)

np.dot(A, x)
    array([[14],
       [32],
       [50]])

x.T.dot(A).dot(x)
    array([[228]])

np.dot(np.dot(x.T, A), x)
    array([[228]])
{% endhighlight %}
- $$\mathbf{x}^T \mathbf{A} \mathbf{x}$$ = `228`이다.

---
