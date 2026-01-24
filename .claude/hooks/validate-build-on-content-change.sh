#!/bin/bash
# 콘텐츠 변경 후 빌드 검증
# PostToolUse hook for Edit and Write tools

read -r input
file_path=$(echo "$input" | jq -r '.tool_input.file_path // ""')

# blog/ 또는 docs/ 수정 시 빌드 체크
if echo "$file_path" | grep -qE "(blog|docs)/.*\.mdx?$"; then
  cd "$CLAUDE_PROJECT_DIR" || exit 0

  # 빠른 구문 검사 (전체 빌드 대신)
  if ! npm run build -- --no-minify 2>&1 | head -20 | grep -q "error"; then
    echo "✓ 빌드 검증 통과"
  else
    echo "⚠️ 빌드 오류 가능성 - npm run build로 확인 필요" >&2
  fi
fi

exit 0
