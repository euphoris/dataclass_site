# 회귀분석

## 회귀분석


가져오기

```python
from statsmodels.formula.api import ols
```

분석 

- 종속변수($y$): `price`
- 독립변수($x$): `mileage`

```python
m = ols("price ~ mileage", data = df).fit()
```

결과

```python
m.summary()
```

## 예측


불러오기

```python
new_df = pd.read_excel('new_car.xlsx))
```

모형에 입력하여 예측

```python
m.predict(new_df)
```


## 더미코딩

범주형 변수로 회귀분석

```python
ols('price ~ model', df).fit().summary()
```

범주 목록 보기

```python
df.model.unique()
```


## 다중회귀분석

```python
ols('price ~ mileage + model', df).fit().summary()
```

### 표준화

```python
ols('price ~ scale(mileage) + scale(year)', df).fit().summary()
```

