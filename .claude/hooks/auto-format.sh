#!/bin/bash
# 파일 수정 후 자동 포맷팅
# PostToolUse hook for Edit and Write tools

read -r input
file_path=$(echo "$input" | jq -r '.tool_input.file_path // ""')

# 포맷팅 대상 확장자
if echo "$file_path" | grep -qE "\.(js|jsx|ts|tsx|json|md|mdx|css|scss)$"; then
  if [ -f "$file_path" ]; then
    cd "$CLAUDE_PROJECT_DIR" || exit 0

    # prettier가 설치되어 있으면 실행
    if command -v npx &> /dev/null && [ -f "node_modules/.bin/prettier" ]; then
      npx prettier --write "$file_path" 2>/dev/null && echo "✓ 포맷팅 완료: $(basename "$file_path")"
    fi
  fi
fi

exit 0
