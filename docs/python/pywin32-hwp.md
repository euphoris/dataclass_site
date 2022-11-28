# 한/글 직접 제어

pywin32 설치(아나콘다에 기본 설치,  MS윈도만 가능)
```python
pip install pywin32
```

임포트
```python
import win32com.client as win32
```

## 열기 
한/글 프로그램 열기
```python
hwp = win32.gencache.EnsureDispatch("HWPFrame.HwpObject")
```

창 보이기(`False`로 하면 숨김)
```python
hwp.XHwpWindows.Item(0).Visible = True
```

현재 폴더
```python
import os
d = os.getcwd()
```

파일 열기
```python
hwp.Open(f"{d}/테스트1.hwp")
```


## Action

Action 만들기: 텍스트 입력을 할 경우 `InsertText`
```python
act = hwp.CreateAction("InsertText")
```

설정 만들기
```python
pset = act.CreateSet()
```

파라미터 설정: 입력할 `Text`는 `"안녕하세요"` (Action에 따라 설정할 항목이 없으면 생략)
```python
pset.SetItem("Text", "안녕하세요")
```

Action을 실행
```python
act.Execute(pset)
```

## Action: 모두 찾아바꾸기

"테스트"를 모두 "test"로 찾아 바꾸기
```python
act = hwp.CreateAction("AllReplace")
pset = act.CreateSet()
pset.SetItem("FindString", "테스트")
pset.SetItem("ReplaceString", "test")
pset.SetItem("IgnoreMessage", 1)
act.Execute(pset)
```

## Run

설정할 항목이 없을 경우에는 `CreateAction`, `Execute` 필요 없이 `Run`으로 바로 실행할 수 있음

줄바꿈(`CreateAction`)
```python
act = hwp.CreateAction("BreakPara")
pset = act.CreateSet();
act.Execute(pset)
```

줄바꿈(`Run`)
```python
hwp.Run("BreakPara")
```

## 닫기

다른 이름으로 저장 (`\`대신 `/` 또는 `\\` 사용)
```python
hwp.SaveAs("C:/Users/user/…")
```

저장
```python
hwp.Save()
```

프로그램 종료
```python
hwp.Quit()
```
