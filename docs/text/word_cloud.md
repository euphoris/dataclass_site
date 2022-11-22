# 단어 구름

설치

```
pip install wordcloud
```

임포트

```python
from wordcloud import WordCloud
```

설정

```python
wc = WordCloud(
  font_path='NanumGothic.ttf', # 글꼴 파일이 있을 경우
  background_color='white',    # 배경색
  max_words=100,               # 시각화할 단어 개수
  width=400,                   # 가로 크기
  height=300)                  # 세로 크기
```

그리기

```python
count_dic = dict(zip(word_count.단어, word_count.빈도))
cloud = wc.fit_words(count_dic)
cloud.to_image()
```

저장

```python
cloud.to_file('cloud.png')
```

## 특정한 모양으로 그리기

마스크

```python
from PIL import Image
import numpy as np
mask = Image.open('mask.png').convert('L')
mask = np.asarray(mask)
```

그리기

```python
wc = WordCloud(background_color='white', mask=mask)
cloud = wc.fit_words(count_dic)
cloud.to_image()
```

## 특정한 색깔과 모양으로 그리기

```python
mask = np.asarray(Image.open('color_mask.jpg'))
wc = WordCloud(background_color='white', mask=mask)
wc.fit_words(count_dic)

from wordcloud import ImageColorGenerator
color_func = ImageColorGenerator(mask)
cloud = wc.recolor(color_func=color_func)
cloud.to_image()
```