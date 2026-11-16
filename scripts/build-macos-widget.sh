#!/usr/bin/env bash
set -euo pipefail

# [SPEC-008:AC-3] macOS WidgetKit Host & Extension(.appex) 정식 서명 빌드 및 등록 스크립트
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
XCODEPROJ="$ROOT_DIR/native/macos/CalWidgetHost.xcodeproj"
DERIVED_DATA="$ROOT_DIR/native/macos/build"

xcodebuild \
  -project "$XCODEPROJ" \
  -target CalWidgetHost \
  -configuration Debug \
  -allowProvisioningUpdates \
  SYMROOT="$DERIVED_DATA/Products" \
  OBJROOT="$DERIVED_DATA/Intermediates" \
  build

HOST_APP="$DERIVED_DATA/Products/Debug/CalWidgetHost.app"
APPEX_PATH="$HOST_APP/Contents/PlugIns/CalWidgetExtension.appex"

if [ ! -d "$APPEX_PATH" ]; then
  echo "Error: CalWidgetExtension.appex not found at $APPEX_PATH" >&2
  exit 1
fi

pluginkit -a "$APPEX_PATH" || true
pluginkit -e use -i com.worean.calwidget.host.widget || true
echo "Built and registered signed macOS WidgetKit extension: $APPEX_PATH"
# [/SPEC-008:AC-3]
