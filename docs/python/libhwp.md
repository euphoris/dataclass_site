# libhwp

홈페이지 https://pypi.org/project/libhwp

설치
```python
pip install libhwp
```

임포트
```python
from libhwp import HWPReader
```

파일 읽기
```python
hwp = HWPReader('테스트.hwp')
```

모든 문단 출력
```python
for paragraph in hwp.find_all('paragraph'):
    print(paragraph)
```