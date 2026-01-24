#!/bin/bash
# 민감한 파일 수정 차단
# PreToolUse hook for Edit and Write tools

read -r input
file_path=$(echo "$input" | jq -r '.tool_input.file_path // ""')

# 보호할 패턴
protected_patterns=(
  "\.env"
  "\.git/"
  "package-lock\.json"
  "node_modules/"
  "docusaurus\.config\.js"
  "sidebars\.js"
  "\.github/workflows/"
)

for pattern in "${protected_patterns[@]}"; do
  if echo "$file_path" | grep -qE "$pattern"; then
    echo "차단됨: 보호된 파일 - $file_path" >&2
    exit 2
  fi
done

exit 0
