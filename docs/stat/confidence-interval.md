# 신뢰구간

## 신뢰구간 (Confidence Interval, CI)

*   대표적 **구간 추정** 방법.
*   **계산:** `신뢰구간 = 통계량 ± 오차범위`
*   **오차 범위:** 신뢰수준, 표본 크기, 데이터 변산성 등 고려하여 **이론적으로 유도**하여 사용.

## 평균의 신뢰구간

*   모든 통계량(중간값, 비율 등)에 신뢰구간 존재.
*   특히 **평균**의 경우, 이론적으로 신뢰구간 **간단히(정규분포/t-분포 이용) 구할 수 있음**.
*   **예시: 평균의 95% 신뢰구간 계산 (pingouin 패키지 사용)**
    ```python
    import pingouin as pg

    # df.price 데이터의 평균이 0과 다른지 t-검정 수행 (겸사겸사 신뢰구간 계산)
    # 여기서는 모평균이 0이라는 가설 검정 자체보다 신뢰구간 값에 주목
    pg.ttest(df.price, 0, confidence=0.95)
    ```
    *   결과 표에서 `CI95%` 항목 확인 (예: `[814.1, 893.22]`)
    *   해석: df.price의 모평균은 95% 신뢰수준에서 814.1 ~ 893.22 사이에 있을 것으로 추정됨.

## 부트스트래핑 (Bootstrapping)

*   평균과 달리 **중간값, 최빈값 등** 다른 통계량은 오차 범위 이론적 유도 어려움.
*   **대안:** 표본 충분히 크면, **컴퓨터 시뮬레이션(재표집)** 통해 신뢰구간 추정 가능 → 이것이 **부트스트래핑**.
*   **예시: 중간값의 95% 신뢰구간 계산 (scipy 활용)**
    ```python
    import numpy as np
    import scipy.stats as sp # scipy 통계 기능 사용

    # 부트스트래핑 실행
    res = sp.bootstrap(
        [df.price],              # 데이터
        np.median,               # 계산할 통계량 (중간값)
        n_resamples=10000,       # 시뮬레이션(재표집) 횟수
        confidence_level=0.95    # 신뢰수준
    )

    print(res.confidence_interval) # 신뢰구간 결과 출력
    ```
    *   결과 예시: `ConfidenceInterval(low=770.0, high=865.0)`
    *   해석: 중간값의 95% 신뢰구간은 약 770 ~ 865 추정.
    *   **특징:** 시뮬레이션 기반이므로 실행할 때마다 결과 조금씩 달라질 수 있음.


## 퀴즈

<iframe src="https://tally.so/embed/wvzlJ0?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1" loading="lazy" width="100%" height="800" frameborder="0" marginheight="0" marginwidth="0" title="[통계] 추정과 신뢰구간"></iframe>