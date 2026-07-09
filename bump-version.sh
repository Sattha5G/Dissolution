#!/usr/bin/env bash
# =============================================================================
# bump-version.sh — สคริปต์อัปเดตเวอร์ชันของโปรแกรม Dissolution
# =============================================================================
#
# วิธีใช้:
#   bash bump-version.sh <version>
#   ตัวอย่าง: bash bump-version.sh 1.1.0
#
# เวอร์ชันของ Dissolution เก็บไว้ที่ไฟล์เดียวคือ VERSION ที่ root ของโปรเจกต์
# ทั้ง release.yml (DMG/installer filename, GitHub Release tag) และ
# scripts/windows-installer.iss (ผ่าน /DMyAppVersion ที่ CI ส่งเข้าไป) อ่านจาก
# ไฟล์นี้ไฟล์เดียว
#
# *** ห้ามแก้เวอร์ชันด้วยมือที่อื่น ให้รันสคริปต์นี้เสมอ ***
# =============================================================================
set -e

VERSION=$1

if [[ -z "$VERSION" ]]; then
  echo "Usage: bash bump-version.sh <version>"
  echo "Example: bash bump-version.sh 1.1.0"
  exit 1
fi

if ! [[ "$VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "Error: version must be in format X.Y.Z (e.g. 1.1.0)"
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "$VERSION" > "$SCRIPT_DIR/VERSION"

echo "Bumped to v$VERSION in:"
echo "  VERSION"
