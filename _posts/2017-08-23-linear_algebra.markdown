---
layout: post
title:  "선형대수학 ①"
date:   2017-08-23 11:36:23 +0700
categories: [Linear_Algebra, python, LaTeX]
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
- $$ \mathbf{x} = [x_n], (n = 1, \dotsi, N)
 = \begin{bmatrix}
x_{1} \\
x_{2} \\
\vdots \\
x_{N} \\
\end{bmatrix}
$$

---

#### `numpy`로 벡터 및 행렬을 구현해보자.

{% highlight python %}

import numpy as np

x = np.array([1], [2], [3], [4], [5])
x
{% endhighlight %}

```
array([[1],
       [2],
       [3],
       [4],
       [5]])
```
- 위처럼 열 벡터가 되도록 데이터를 input

{% highlight python %}
x_1 = np.array([1, 2, 3, 4, 5])
x_1
{% endhighlight %}

```
array([1, 2, 3, 4, 5])
```
- 위와 같은 행 벡터는 열벡터로 변경해주어야 한다.

---

{% highlight python %}
x_1.reshape(5, 1)
x_1.T
x_1[:, np.newaxis]
{% endhighlight %}
- $$\mathbf{x_1}$$ → $$\mathbf{x}$$
    - 위 방법을 사용하면 행 벡터를 열 벡터로 변경할 수 있다.
    - x.reshape(행, 렬)

---

#### Difference between numpy dot() and inner()

{% highlight python %}
a = np.array([[1,2],[3,4]])
b = np.array([[11,12],[13,14]])
{% endhighlight %}

{% highlight python %}
np.dot(a,b)
{% endhighlight %}

```
array([[37, 40],
       [85, 92]])
```

{% highlight python %}
np.inner(a,b)
{% endhighlight %}

```
array([[35, 41],
       [81, 95]])
```

- $$ A = \begin{bmatrix} 1 \;\;\;\; 2 \\ 3 \;\;\;\; 4 \\ \end{bmatrix},\; B = \begin{bmatrix} 11 \;\;\;\; 12 \\ 13 \;\;\;\; 14 \\ \end{bmatrix} $$
- with dot(A, B)
    + $$ \begin{bmatrix} 1*11 + 2*13 \;\;\;\; 1*12 + 2*14 \\ 3*11 + 4*13 \;\;\;\; 3*12 + 4*14 \\ \end{bmatrix} = \begin{bmatrix} 37 \;\;\;\; 40 \\ 85 \;\;\;\; 92 \\ \end{bmatrix} $$
- with inner(A, B)
    + $$ \begin{bmatrix} 1*11 + 2*12 \;\;\;\; 1*13 + 2*14 \\ 3*11 + 4*12 \;\;\;\; 3*13 + 4*14 \\ \end{bmatrix} = \begin{bmatrix} 35 \;\;\;\; 41 \\ 81 \;\;\;\; 95 \\ \end{bmatrix} $$

---

#### NumPy Matrix
{% highlight python %}
A = np.matrix([[1.,2], [3,4], [5,6]])
A
{% endhighlight %}

```
matrix([[ 1.,  2.],
        [ 3.,  4.],
        [ 5.,  6.]])
```

{% highlight python %}
B = np.matrix("1.,2; 3,4; 5,6")
{% endhighlight %}

```
matrix([[ 1.,  2.],
        [ 3.,  4.],
        [ 5.,  6.]])
```
- np.matrix()로 데이터를 input하는 방법은 위와 같다.
  + 주로 `np.matrix([[1.,2], [3,4], [5,6]])`를 많이 사용

---

#### A vector as a matrix
- Vectors are handled as matrices with one row or one column:
{% highlight python %}
x = np.matrix("10., 20.")

x = np.matrix([10., 20.])
{% endhighlight %}

```
matrix([[ 10.,  20.]])
```

---

#### Here is an example for matrix and vector multiplication:
{% highlight python %}
x = np.matrix("4.;5.")
x_1 = np.matrix([[4.], [5.]])
{% endhighlight %}

```
matrix([[ 4.],
        [ 5.]])
```

{% highlight python %}
A = np.matrix([[1.,2], [3,4], [5,6]])

A_1 = np.matrix("1., 2; 3, 4; 5, 6")
{% endhighlight %}

```
matrix([[ 1.,  2.],
        [ 3.,  4.],
        [ 5.,  6.]])
```
- `""`를 활용하여 input할 경우 소수점을 첫 원소에만 찍으면, 나머지 원소는 자동으로 찍힌다.

{% highlight python %}
A
x
A*x
{% endhighlight %}

```
matrix([[ 1.,  2.],
        [ 3.,  4.],
        [ 5.,  6.]])
matrix([[ 4.],
        [ 5.]])
matrix([[ 14.],
        [ 32.],
        [ 50.]])
```
- matrix로 넣었을 경우 행렬의 연산(`*`)을 실행시키면 행렬의 곱이 출력된다.

---

#### For vectors, indexing requires two indices:
- $$ A = \begin{bmatrix} 1 \;\;\;\; 2 \\ 3 \;\;\;\; 4 \\ 5 \;\;\;\; 6 \\ \end{bmatrix} $$

{% highlight python %}
A[0,0]
A[0,1]
A[1,1]
A[2,1]
{% endhighlight %}

```
1.0
2.0
4.0
6.0
```
- `A[행-1, 열-1]`로 인덱싱하면 된다.

---

#### Rank
- `np.rank()`는 선형대수학의 `Rank`와는 다르다.
- `np.rank()`는 np.array의 차원(dimension)을 출력한다.

{% highlight python %}
A = np.ones((4,3))
A
{% endhighlight %}
```
array([[ 1.,  1.,  1.],
       [ 1.,  1.,  1.],
       [ 1.,  1.,  1.],
       [ 1.,  1.,  1.]])
```
{% highlight python %}
np.rank(A)
{% endhighlight %}
```
2
```

{% highlight python %}
x = np.array(10)
x
{% endhighlight %}
```
array(10)
```

{% highlight python %}
np.rank(x)
{% endhighlight %}
```
0
```
- `Scalar` → np.rank() = 0
- 차원이 없다고 본다.

{% highlight python %}
B = np.ones((2,2,2))
B
np.rank(B)
{% endhighlight %}

```
array([[[ 1.,  1.],
        [ 1.,  1.]],

       [[ 1.,  1.],
        [ 1.,  1.]]])
3
```

##### 3차 행렬의 인덱싱
{% highlight python %}
C = np.array([[['a','b'], ['c','d']], [['e','f'], ['g','h']]])
C[1,0,1]
{% endhighlight %}

```
array([[['a', 'b'],
        ['c', 'd']],

       [['e', 'f'],
        ['g', 'h']]])
'f'
```

#### 그렇다면 선형대수학에서의 Rank는 무엇일까?
- 어떤 행렬 A의 열계수(column rank)는 선형독립인 열 벡터의 최대 개수이다.
- 마찬가지로, 행계수(row rank)는 선형독립인 행 벡터의 최대 개수이다.
- 행렬에서 열계수와 행계수는 항상 같으며, 이를 계수 정리(rank theorem)
- 그렇다면, 우리가 구해야하는 Rank는 어떻게 구할지는 다음 포스팅에서 알아보도록 하자.

---

#### Dot product, (자료 형태가 `array`인 경우)
$$ A = \begin{bmatrix} 1 \;\;\;\; 2 \\ 3 \;\;\;\; 4 \end{bmatrix},\;\;\;
b = \begin{bmatrix} 10 \;\;\;\; 20 \end{bmatrix} \;\;\; A b = \begin{bmatrix} 50 \;\;\;\; 110 \end{bmatrix} $$
- 아래 코드는 위 계산이 된다.
{% highlight pytho %}
A = np.array([[1,2],[3,4]])
b = np.array([10, 20])
np.dot(A,b)
{% endhighlight %}
```
array([ 50, 110])
```

- 행렬은 dimension이 맞아야 곱셈이 가능하다.
- np.dot()은 행렬의 곱과 다르게 차원을 맞추지 않아도 위처럼 계산을 한다.
- 올바른 행렬의 곱을 표현하기 위해서는 다음과 같이 행렬을 바꿔야 한다.
$$ A = \begin{bmatrix} 1 \;\;\;\; 2 \\ 3 \;\;\;\; 4 \end{bmatrix}, \;\;\; b_{1} = \begin{bmatrix} 10 \\ 20 \end{bmatrix},\;\;\; Ab_{1} = \begin{bmatrix} 50 \\ 110 \end{bmatrix} $$

{% highlight python %}
b_1 = b.reshape(2,1)
np.dot(A, b_1)
{% endhighlight %}
```
array([[ 50],
       [110]])
```

#### Another example:
$$ A = \begin{bmatrix} 1 \;\;\;\; 2 \;\;\;\; 3 \\ 4 \;\;\;\; 5 \;\;\;\; 6 \end{bmatrix}, \;\;\;\; B = \begin{bmatrix} 7 \;\;\;\; 8 \;\;\;\; 9 \end{bmatrix}, \;\;\;\; B_{1} = \begin{bmatrix} 7 \\ 8 \\ 9 \end{bmatrix} $$

{% highlight python %}
A = np.array([[ 1, 2 ,3], [ 4, 5 ,6]])
B = np.array([7,8,9])
B_1 = B.reshape(3, 1)
A.dot(B_1)
np.dot(A, B_1)
{% endhighlight %}
```
(2, 3)
(3,)
```

---

#### Ax = b : numpy.linalg
- Now we want to solve `Ax = b:`
-$$ A = \begin{bmatrix} 1 \;\;\;\; 2 \\ 3 \;\;\;\; 4 \end{bmatrix},\;\;\; b = \begin{bmatrix} 10 \\ 20 \end{bmatrix} $$

-$$ Ax = \begin{bmatrix} 1 \;\;\;\; 2 \\ 3 \;\;\;\; 4 \end{bmatrix}, \;\;\; x = \begin{bmatrix} 10 \\ 20 \end{bmatrix} $$

-$$ x = \begin{bmatrix} 0 \\ 5 \end{bmatrix} $$
- 위 수식을 계산하면 다음과 같다.
{% highlight python %}

import numpy as np
from numpy.linalg import solve

A = np.array([[1,2],[3,4]])
b = np.array([[10], [20]])
x = solve(A,b)
{% endhighlight %}

---
