#!/bin/bash
# 위험한 Bash 명령 차단
# PreToolUse hook for Bash tool

read -r input
command=$(echo "$input" | jq -r '.tool_input.command // ""')

# 위험한 패턴 체크
dangerous_patterns=(
  "rm -rf /"
  "rm -rf ~"
  "git push.*--force"
  "git push.* -f( |$)"
  "git reset --hard"
  "npm publish"
)

for pattern in "${dangerous_patterns[@]}"; do
  if echo "$command" | grep -qE "$pattern"; then
    echo "차단됨: 위험한 명령 - $pattern" >&2
    exit 2
  fi
done

exit 0
