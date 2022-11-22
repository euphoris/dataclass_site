# 한국어 형태소 분석

## kiwi 형태소 분석기

설치

```
pip install kiwipiepy
```

불러오기

```python
from kiwipiepy import Kiwi
k = Kiwi()
```

형태소 분석

```python
text = '오늘은 자연어 처리를 배우기 좋은 날이다.'
result = k.tokenize(text)
result
```

명사 추출 함수
```python
def extract_noun(text):
    result = k.tokenize(text)
    for token in result:
        if token.tag in ['NNG', 'NNP']:
            yield token.form
```

사용 예시

```python
list(extract_noun('어제는 홍차를 마셨다.'))
```

## 한국어 문서 단어 행렬 만들기 

데이터

```python
import pandas as pd
df = pd.read_csv('news_ai.csv')
```

사용자 단어 추가

```python
k.add_user_word('인공지능', 'NNP')
```

문서 단어 행렬 만들기 

```python
from sklearn.feature_extraction.text import CountVectorizer

cv = CountVectorizer(
    max_features=100,       # 최대 단어 수(빈도 순)
    tokenizer=extract_noun) # 토큰화 방법

dtm = cv.fit_transform(df['본문'])
```

단어 빈도 

```python
word_count = pd.DataFrame({
	'단어': cv.get_feature_names_out(),
	'빈도': dtm.sum(axis=0).flat
})
```