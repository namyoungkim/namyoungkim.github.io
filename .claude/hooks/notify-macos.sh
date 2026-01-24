#!/bin/bash
# macOS 데스크톱 알림
# Notification hook - Claude가 권한 요청 시 알림

osascript -e 'display notification "권한 승인이 필요합니다" with title "Claude Code"'
exit 0
