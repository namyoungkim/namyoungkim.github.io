#!/bin/bash
# 세션 종료 시 정리 작업
# Stop hook

# 개발 서버 프로세스 정리
pkill -f "docusaurus start" 2>/dev/null
pkill -f "npm start" 2>/dev/null

# 임시 파일 정리
rm -f "$CLAUDE_PROJECT_DIR"/.docusaurus/client-*.json 2>/dev/null

echo "✓ 세션 정리 완료"
exit 0
