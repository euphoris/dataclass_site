# 머신러닝으로 문서 분류

## 전처리

데이터 준비

```python
import pandas as pd
df = pd.read_excel('yelp.xlsx')
```

문서단어행렬

```python
from sklearn.feature_extraction.text import CountVectorizer
cv = CountVectorizer(max_features=1000, stop_words='english')
dtm = cv.fit_transform(df.review)
```

x와 y

```python
x = dtm
y = df.sentiment
```

분할

```python
from sklearn.model_selection import train_test_split
x_train, x_test, y_train, y_test = train_test_split(
    x,
    y,
    test_size=0.2,   # 20%의 데이터를 테스트용으로 유보
    random_state=42) # 유사난수의 씨앗값 seed을 42로 설정
```

## 나이브 베이즈

```python
from sklearn.naive_bayes import BernoulliNB
import numpy as np

model = BernoulliNB()

model.fit(x_train, y_train)
```

훈련 데이터 정확도

```python
model.score(x_train, y_train)
```

테스트 데이터 정확도

```python
model.score(x_test, y_test)
```

단어별 확률비

```python
prob_df = pd.DataFrame({
'단어': cv.get_feature_names_out(),
'비율': model.feature_log_prob_[1] - model.feature_log_prob_[0]
})
```

긍정단어

```python
prob_df.sort_values('비율').tail(10)
```

부정단어

```python
prob_df.sort_values('비율').head(10)
```

예측

```python
model.predict(x_test)
```

임의로 정한 문턱값을 기준으로 분류

```python
probs = model.predict_proba(x_test)  # 종류별 확률 
prob = probs[:, 1]  # 긍정 확률만
threshold = 0.5 # 문턱값
y_pred = np.where(prob > threshold, 1, 0)
```
