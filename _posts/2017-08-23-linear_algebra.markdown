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
- $$ A = \begin{bmatrix} 1 & 2 \\ 3 & 4 \\ \end{bmatrix} $$

---

#### `numpy`로 벡터 및 행렬을 구현해보자.

{% highlight python %}
import numpy as np

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

- $$ A $$
- $$  \begin{bmatrix} 1 \;\; 2 \\ 3 \;\; 4 \\ \end{bmatrix}  $$

---

#### NumPy Matrix
