---
description: 빌드 검증 및 배포 준비
user-invocable: true
allowed-tools:
  - Bash
  - Read
---

# 빌드 검증 및 배포 준비

변경사항을 커밋하기 전에 빌드가 정상적으로 완료되는지 확인합니다.

## 검증 순서

1. **캐시 삭제** (선택)
   ```bash
   npm run clear
   ```

2. **빌드 실행**
   ```bash
   npm run build
   ```
   - prebuild 스크립트가 자동으로 `generate:llms`, `generate:tags` 실행

3. **빌드 결과 확인**
   - `./build/` 디렉토리 생성 확인
   - 에러 메시지 없음 확인

4. **로컬 미리보기** (선택)
   ```bash
   npm run serve
   ```

## 일반적인 빌드 오류

- **Markdown 문법 오류**: frontmatter YAML 형식 확인
- **이미지 경로 오류**: static/ 또는 상대 경로 확인
- **수식 렌더링 오류**: `$` 기호 이스케이프 확인

## 배포

빌드 성공 후:
```bash
git add .
git commit -m "커밋 메시지"
git push origin main
```

GitHub Actions가 자동으로 배포합니다.
