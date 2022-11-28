## glob 모듈

임포트
```python
import glob
```

현재 폴더에서 확장자가 hwp인 파일들 찾기
```python
glob.glob('*.hwp')
```

## os 모듈

임포트
```python
import os
```

파일 이름 바꾸기
```python
os.rename('old', 'new')
```

파일 삭제
```python
os.remove('filename')
```

폴더 만들기
```python
os.mkdir('folder')
```

폴더 삭제
```python
os.rmdir('folder')
```