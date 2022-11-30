## 문서 단어 행렬

실습 파일 불러오기

```python
import pandas as pd
df = pd.read_excel('2018년도 NT 과제의 30대 기술 및 97대 나노기술 분류 DATA.xlsx')
```

컬럼 목록 보기
```python
df.columns
```

명사 추출

```python
from kiwipiepy import Kiwi

k = Kiwi()

def extract_noun(text):
    result = k.tokenize(text)
    for token in result:
        if token.tag in ['NNG', 'NNP']:
            yield token.form
```

문서 단어 행렬 설정

```python
from sklearn.feature_extraction.text import CountVectorizer
stop_words = {'기술', '개발'}
cv = CountVectorizer(
    max_features=1000, 
    tokenizer=extract_noun, 
    stop_words=stop_words)
```

여러 컬럼 텍스트 합치기


```python
cols = ['과제명-국문', '요약문_한글키워드']
text = df[cols].agg(' '.join, axis=1)
```

문서 단어 행렬 만들기


```python
dtm = cv.fit_transform(text)
```

## 단어 빈도

단어 빈도 정리


```python
word_count = pd.DataFrame({
    '단어': cv.get_feature_names_out(),
    '빈도':dtm.sum(axis=0).flat})
```

단어 빈도 엑셀로 저장

```python
word_count.to_excel('word_count.xlsx', index=False)
```

단어 빈도 엑셀에서 불러오기

```python
word_count = pd.read_excel('word_count.xlsx')
```

단어 빈도에서 불용어 제외

```python
word_count = word_count.query('단어 not in @stop_words')
```

## 머신러닝으로 문서 분류

데이터 분할

```python
from sklearn.model_selection import train_test_split

x = dtm
y = df['30대 미래기술(명)']


x_train, x_test, y_train, y_test = train_test_split(
    x, 
    y, 
    test_size=0.2, 
    random_state=1201)

```

나이브 베이즈 분류
```python
from sklearn.naive_bayes import BernoulliNB
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

Top-K 정확도: 상위 k개를 예측했을 때, 그 중에 정답이 있는 경우

```python
from sklearn.metrics import top_k_accuracy_score
y_prob = model.predict_proba(x_test)
top_k_accuracy_score(y_test, y_prob, k=3)
```

로지스틱 회귀분석: 단어별로 가중치를 주어 총점을 구하고, 그 총점을 바탕으로 확률을 계산하는 머신러닝 모형

```python
from sklearn.linear_model import LogisticRegressionCV
model = LogisticRegressionCV()
```

단어별 가중치 보기

```python
category = sorted(df['30대 미래기술(명)'].unique())
cdf = pd.DataFrame(model.coef_.T, 
                   columns=category,
                   index=cv.get_feature_names_out())
cdf[category[0]].sort_values().tail(10)
```

K-최근접이웃 분류: K개의 가장 비슷한 사례를 바탕으로 분류

```python
from sklearn.neighbors import KNeighborsClassifier
model = KNeighborsClassifier(n_neighbors=5)
```

혼동행렬: 정답과 예측을 비교

```python
from sklearn.metrics import confusion_matrix
y_pred = model.predict(x_test)
confusion_matrix(y_test, y_pred)
```

예측을 데이터에 추가

```python
df['예측된 범주'] = model.predict(dtm)
```
