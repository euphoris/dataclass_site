
## 모듈 임포트

Python의 함수들이 되게 많은데 이 함수들이 이름이 겹치면 곤란하잖아요. 그래서 모듈이라고 해서 좀 기능이 비슷한 것들끼리 모아놓은 것이 있습니다.

그래서 우리가 모듈을 불러와서 내가 지금부터 이 모듈을 쓰겠다 라고 얘기를 해줘야 되는데 그렇게 하는 거를 임포트 한다고 해요.

임포트 하는 거는 "내가 지금부터 이 모듈 쓸 거야" 라고 Python한테 얘기를 해주는 거죠.

그래서 우리가 이제 엑셀 파일을 열어볼 건데 엑셀 파일을 열려면 `pandas`라는 모듈이 있습니다.


```python
import pandas as pd
```

파일 열기

```python
df = pd.read_excel('car.xlsx')
```

파일 내용 보기

```python
df
```

자 그래서 데이터를 우리가 표로 보면은 이 데이터는 이제 어떤 데이터냐 하면은 중고차 가격을 조사한 데이터예요.

- `mileage`: 주행거리
- `model`: 차종(`Avante`, `K3`)
- `price`: 중고차 가격
- `year`: 연식(2006년식부터 2018년식까지)
- `my_car_damage`: 보험 처리한 내 차 피해
- `other_car_damage` 다른 차 피해
