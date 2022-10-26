## Python 기초

### 사칙연산

덧셈
```python
1 + 2
```

뺄셈

```python
4 - 5
```

곱셈

```python
5 * 6
```

나눗셈

```python
3 / 4
```


### 주석

```python
1 + 1 # 더하기
```

### 변수

데이터(값)에 이름을 붙이는 것

```python
x = 3
```

변수는 값과 동일하게 사용할 수 있다	

```python
x + 1
```

한 번 정의한 변수는 다시 정의할 수 있다

```python
x = 4
```

`=`의 오른쪽을 계산 후 왼쪽에 대입

```python
x = x + 1
```



### 함수

예: 17을 3으로 나눈 몫과 나머지 구하기


```python
divmod(17,3)
```

### 엑셀 파일 열기

모듈 임포트

```python
import pandas as pd
```

파일 열기

```python
df = pd.read_excel('car.xlsx')
```
