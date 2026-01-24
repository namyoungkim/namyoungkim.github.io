#!/bin/bash
# 블로그 포스트 frontmatter 검증
# PostToolUse hook for Edit and Write tools

read -r input
file_path=$(echo "$input" | jq -r '.tool_input.file_path // ""')

# blog/ 디렉토리의 .md 파일만 검사
if echo "$file_path" | grep -qE "blog/.*\.mdx?$"; then
  if [ -f "$file_path" ]; then
    content=$(head -50 "$file_path")

    missing_fields=()

    # 필수 필드 확인
    echo "$content" | grep -q "^slug:" || missing_fields+=("slug")
    echo "$content" | grep -q "^title:" || missing_fields+=("title")
    echo "$content" | grep -q "^authors:" || missing_fields+=("authors")
    echo "$content" | grep -q "^tags:" || missing_fields+=("tags")

    if [ ${#missing_fields[@]} -gt 0 ]; then
      echo "⚠️ 블로그 포스트에 누락된 frontmatter: ${missing_fields[*]}" >&2
    fi
  fi
fi

exit 0
