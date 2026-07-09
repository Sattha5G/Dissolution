#!/bin/bash
set -e

if ! command -v gh &>/dev/null; then
  echo "ติดตั้ง GitHub CLI ก่อน: https://cli.github.com"
  exit 1
fi

VERSION=$(cat VERSION)

echo "Version : v$VERSION"
echo "Platform: macOS + Windows (รัน Build แบบ Parallel)"
echo ""
read -p "ชัวร์ป่าวว่าจะ release ? (y/n): " CONFIRM

if [[ "$CONFIRM" != "y" ]]; then
  echo "ยกเลิก"
  exit 0
fi

gh workflow run release.yml

echo ""
echo "Trigger การ Build แล้วเรียบร้อย ดูสถานะได้ที่:"
sleep 2
gh run list --workflow=release.yml --limit=1 --json url --jq '.[0].url' 2>/dev/null || \
  echo "https://github.com/$(gh repo view --json nameWithOwner -q .nameWithOwner)/actions"
