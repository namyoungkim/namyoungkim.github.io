---
slug: custom-domain-setup
title: GitHub Pages에 커스텀 도메인 설정하기
authors: namyoungkim
tags: [devops, tutorial, github-pages, docusaurus]
draft: true
---

# GitHub Pages에 커스텀 도메인 설정하기

`https://username.github.io/project-name/` 같은 긴 URL 대신, `https://yourdomain.com` 같은 깔끔한 커스텀 도메인을 사용하고 싶으신가요?

이 가이드에서는 **GitHub Pages**에서 **커스텀 도메인**을 설정하는 전체 과정을 단계별로 안내합니다.

<!-- truncate -->

## 왜 커스텀 도메인이 필요한가요?

### 현재 상태
```
https://namyoungkim.github.io/a1rtisan/
```

URL이 너무 길고, 브랜딩하기 어렵습니다.

### 목표 상태
```
https://a1rtisan.io
```

짧고 기억하기 쉬우며, 전문적으로 보입니다!

### 커스텀 도메인의 장점

✅ **짧고 깔끔한 URL** - 공유하기 쉽고 기억하기 쉬움
✅ **브랜딩 강화** - 개인 브랜드 구축
✅ **SEO 개선** - 검색 엔진 최적화에 유리
✅ **전문성** - 더 전문적인 인상

---

## 전체 프로세스 개요

```mermaid
graph LR
    A[도메인 구매] --> B[프로젝트 설정]
    B --> C[DNS 설정]
    C --> D[GitHub 설정]
    D --> E[HTTPS 활성화]
```

**예상 소요 시간**: 15분 ~ 1일 (DNS 전파 시간 포함)

---

## 1단계: 프로젝트 설정 변경

### 1-1. Docusaurus 설정 수정

`docusaurus.config.js` 파일을 열어 다음 부분을 수정합니다:

```javascript title="docusaurus.config.js"
// ❌ 변경 전
url: 'https://namyoungkim.github.io',
baseUrl: '/a1rtisan/',

// ✅ 변경 후
url: 'https://a1rtisan.io',
baseUrl: '/',
```

:::warning 주의
`baseUrl`을 `/`로 변경하면 모든 URL이 루트 경로로 바뀝니다. Docusaurus가 자동으로 처리하므로 걱정하지 마세요!
:::

### 1-2. CNAME 파일 생성

`static/CNAME` 파일을 새로 만들고, **한 줄만** 입력합니다:

```text title="static/CNAME"
a1rtisan.io
```

:::tip
- 파일명은 **대문자** CNAME이어야 합니다
- `www.` 없이 도메인만 입력하세요
- `static/` 디렉토리에 배치하면 빌드 시 자동으로 루트로 복사됩니다
:::

### 1-3. 빌드 테스트

로컬에서 빌드가 잘 되는지 확인합니다:

```bash
npm run build
```

빌드가 성공하면 `build/CNAME` 파일이 생성된 것을 확인할 수 있습니다:

```bash
ls build/CNAME
# build/CNAME
```

### 1-4. 변경사항 커밋

```bash
git add docusaurus.config.js static/CNAME
git commit -m "Add custom domain configuration"
git push origin main
```

GitHub Actions가 자동으로 빌드하고 배포합니다. (2-3분 소요)

---

## 2단계: DNS 설정

도메인을 구매한 업체(가비아, 네이버, GoDaddy, Cloudflare 등)의 DNS 관리 페이지로 이동합니다.

### 2-1. A 레코드 추가

다음 **4개의 A 레코드**를 모두 추가합니다:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | @ | 185.199.108.153 | 3600 |
| A | @ | 185.199.109.153 | 3600 |
| A | @ | 185.199.110.153 | 3600 |
| A | @ | 185.199.111.153 | 3600 |

:::info
- `@`는 루트 도메인을 의미합니다 (일부 업체에서는 비워두거나 도메인을 직접 입력)
- TTL은 기본값(3600)을 사용하세요
:::

### 2-2. (선택) www 서브도메인 CNAME 레코드

`www.a1rtisan.io`도 사용하고 싶다면:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| CNAME | www | namyoungkim.github.io | 3600 |

### DNS 설정 예시 (가비아)

```
[DNS 레코드 관리]
타입: A
호스트: @
값: 185.199.108.153
TTL: 3600

[추가] 버튼 클릭하여 나머지 3개도 추가
```

---

## 3단계: GitHub Pages 설정

### 3-1. 저장소 설정 페이지 이동

1. GitHub 저장소 접속 (예: `namyoungkim/a1rtisan`)
2. **Settings** 탭 클릭
3. 왼쪽 메뉴에서 **Pages** 선택

### 3-2. 커스텀 도메인 입력

1. **Custom domain** 입력란에 `a1rtisan.io` 입력
2. **Save** 버튼 클릭
3. DNS 체크가 진행됩니다 (몇 분 소요)

:::warning
DNS 설정이 완료되지 않았다면 "DNS check unsuccessful" 메시지가 나타납니다. DNS 전파를 기다린 후 다시 시도하세요.
:::

### 3-3. HTTPS 강제 활성화

DNS 체크가 성공하면:

1. **Enforce HTTPS** 체크박스 활성화
2. Let's Encrypt 인증서가 자동으로 발급됩니다 (수 분 소요)

---

## 4단계: 확인 및 테스트

### DNS 전파 확인

터미널에서 다음 명령어로 DNS가 정상적으로 설정되었는지 확인합니다:

```bash
nslookup a1rtisan.io
```

정상 응답 예시:
```
Server:		8.8.8.8
Address:	8.8.8.8#53

Non-authoritative answer:
Name:	a1rtisan.io
Address: 185.199.108.153
Address: 185.199.109.153
...
```

### 사이트 접속 확인

브라우저에서 다음을 확인합니다:

✅ `https://a1rtisan.io` 접속 성공
✅ HTTPS 자물쇠 아이콘 표시
✅ 모든 페이지 정상 작동
✅ 블로그, 문서 링크 정상 작동

---

## 타임라인 및 소요 시간

```
1️⃣ 프로젝트 설정 변경       : 5분
   └─> docusaurus.config.js, CNAME 파일 생성 및 푸시

2️⃣ GitHub Actions 빌드      : 2-3분
   └─> 자동 배포 완료

3️⃣ DNS 설정                 : 5분
   └─> 도메인 제공자에서 A 레코드 추가

4️⃣ DNS 전파 대기            : 5분 ~ 24시간
   └─> 대부분 30분 이내 완료

5️⃣ GitHub Pages 커스텀 도메인: 2분
   └─> Custom domain 입력 및 저장

6️⃣ HTTPS 인증서 발급        : 자동 (수 분)
   └─> DNS 전파 후 자동 발급

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
총 소요 시간: 최소 15분 ~ 최대 1일
```

---

## 주의사항 및 문제 해결

### ⚠️ baseUrl 변경의 영향

`baseUrl`을 `/a1rtisan/`에서 `/`로 변경하면:

- **이전**: `https://namyoungkim.github.io/a1rtisan/docs/intro`
- **이후**: `https://a1rtisan.io/docs/intro`

Docusaurus가 모든 내부 링크를 자동으로 조정하므로 걱정하지 마세요!

### ⚠️ 기존 GitHub Pages URL

기존 `https://namyoungkim.github.io/a1rtisan/` URL은:

- **계속 작동합니다**
- 원하면 리다이렉션 설정 가능
- 북마크나 공유된 링크는 여전히 유효

### ⚠️ DNS 전파 시간

DNS 변경은 즉시 적용되지 않습니다:

- **보통**: 5-30분
- **최대**: 24시간
- 지역과 ISP에 따라 다름

### ⚠️ HTTPS 인증서 발급 실패

다음 경우 인증서 발급이 실패할 수 있습니다:

- DNS 설정이 완료되지 않음
- 도메인명이 64자 초과
- 도메인이 다른 GitHub 저장소에서 이미 사용 중

### ⚠️ CNAME 파일 위치

반드시 `static/CNAME`에 생성하세요:

- ✅ `static/CNAME` - 올바른 위치
- ❌ `build/CNAME` - 빌드 시 삭제됨
- ❌ `CNAME` (루트) - 인식되지 않음

---

## 도메인 구매 가이드

### 추천 도메인 등록 업체

| 업체 | 특징 | 가격대 (.io) |
|------|------|--------------|
| **가비아** | 🇰🇷 한국 최대, 한글 지원 | 연 45,000원 |
| **네이버 도메인** | 🇰🇷 네이버 계정 연동 | 연 40,000원 |
| **Cloudflare** | 🌍 저렴, 무료 DNS/CDN | 연 $10 (~13,000원) |
| **GoDaddy** | 🌍 글로벌 1위 | 연 $40 (~50,000원) |

### 도메인 확장자 선택

| 확장자 | 가격 | 추천 용도 |
|--------|------|-----------|
| `.io` | $30-50 | 기술 블로그, 개발자 (가장 인기) |
| `.dev` | $12-15 | 개발자 (저렴한 대안) |
| `.com` | $10-15 | 일반 웹사이트 |
| `.me` | $20-30 | 개인 블로그 |

:::tip 추천
개발 블로그라면 `.io` 또는 `.dev`를 추천합니다. `.io`가 더 인기있지만, `.dev`가 더 저렴합니다.
:::

---

## 체크리스트

커스텀 도메인 설정 시 이 체크리스트를 따라하세요:

### 프로젝트 설정
- [ ] `docusaurus.config.js`에서 `url` 변경
- [ ] `docusaurus.config.js`에서 `baseUrl`을 `/`로 변경
- [ ] `static/CNAME` 파일 생성 (내용: 도메인)
- [ ] `npm run build`로 로컬 빌드 테스트
- [ ] `build/CNAME` 파일 생성 확인

### Git & 배포
- [ ] 변경사항 git commit
- [ ] main 브랜치에 push
- [ ] GitHub Actions 배포 완료 대기

### DNS 설정
- [ ] 도메인 제공자 DNS 관리 페이지 접속
- [ ] A 레코드 4개 추가 (185.199.108.153 등)
- [ ] (선택) www CNAME 레코드 추가
- [ ] `nslookup` 명령어로 DNS 확인

### GitHub Pages
- [ ] GitHub 저장소 Settings → Pages 이동
- [ ] Custom domain에 도메인 입력
- [ ] DNS check 성공 확인
- [ ] Enforce HTTPS 체크박스 활성화

### 최종 확인
- [ ] `https://yourdomain.com` 접속 확인
- [ ] HTTPS 자물쇠 아이콘 확인
- [ ] 모든 페이지 정상 작동 확인
- [ ] 블로그, 문서 링크 테스트

---

## 결론

커스텀 도메인 설정은 처음에는 복잡해 보이지만, 단계별로 따라하면 어렵지 않습니다.

**핵심 요약:**

1. **프로젝트 설정**: `docusaurus.config.js`와 `CNAME` 파일 수정
2. **DNS 설정**: A 레코드 4개 추가
3. **GitHub 설정**: Custom domain 입력 및 HTTPS 활성화
4. **인내심**: DNS 전파 대기

이제 `https://yourdomain.com` 같은 멋진 URL로 블로그를 운영할 수 있습니다!

---

## 추가 리소스

- [GitHub Pages 커스텀 도메인 공식 문서](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site)
- [Docusaurus 배포 가이드](https://docusaurus.io/docs/deployment)
- [DNS 전파 확인 도구](https://dnschecker.org/)

질문이나 문제가 있다면 댓글로 남겨주세요! 😊
