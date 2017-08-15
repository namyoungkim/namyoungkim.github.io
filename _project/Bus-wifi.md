---
layout: project_single
title:  "Bus-wifi"
slug: "Bus-wifi"
---

### 버스 정류장 Data를 활용하여 Wifi 환경 보완
* March 2016 ~ April 2016

---
### Abstract
- 버스를 타고 이동할 때, wifi 신호가 약해지는 문제점을 보완하기 위해 프로젝트를 시작함
- 버스 data를 활용하여 버스가 많이 정거하는 정류장을 추출한 후 위치를 바탕으로 군집화(clustering)
- K-means clustering 사용

---
### 프로젝트 진행 및 결론
- 버스정류장 위치와 Google Map을 활용하여 버스가 많이 정거하는 버스 정류장을 군집화(Clustering)하여 그 중심점(centroid) 탐색
- 위치(좌표)를 기반으로 한 K-means clustering 모델을 사용
- 인천공항과 김포공항처럼 버스가 많이 다니지만 군집화되지 못하고 따로 떨어진 정거장이 존재
- DBSCAN(밀도 기반 공간 군집 알고리즘)을 활용하여 outlier(이상치 제거)
- 이상치 제거 후 K-means clustering 성능 향상
- 중심점(centroid)을 탐색한 결과, CGV강남점, 대학로, 연남동, 신촌 지역 등 유동인구가 많은 곳임을 알 수 있음
- 이 centroid에 wifi 중계소나 광대역 wifi를 설치한다면 버스 이동 간 wifi가 끊기는 문제점을 보완할 수 있을 것으로 보임

---
### 프로젝트 페이지
- [Bus-Wifi](https://github.com/namyoungkim/Bus-wifi/blob/master/Bus_Final/Bus.ipynb)
