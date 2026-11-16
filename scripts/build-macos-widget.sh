#!/usr/bin/env bash
set -euo pipefail

# [SPEC-008:AC-3] macOS WidgetKit Extension(.appex) 빌드 및 Tauri .app 번들 통합 스크립트
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
XCODEPROJ="$ROOT_DIR/native/macos/CalWidgetHost.xcodeproj"
DERIVED_DATA="$ROOT_DIR/native/macos/build"
TAURI_APP="$ROOT_DIR/src-tauri/target/debug/bundle/macos/cal-widget.app"

xcodebuild \
  -project "$XCODEPROJ" \
  -target CalWidgetExtension \
  -configuration Debug \
  SYMROOT="$DERIVED_DATA/Products" \
  OBJROOT="$DERIVED_DATA/Intermediates" \
  CODE_SIGN_IDENTITY="" \
  CODE_SIGNING_REQUIRED=NO \
  CODE_SIGNING_ALLOWED=NO \
  CODE_SIGN_ENTITLEMENTS="" \
  build

APPEX_PATH="$DERIVED_DATA/Products/Debug/CalWidgetExtension.appex"
if [ ! -d "$APPEX_PATH" ]; then
  echo "Error: CalWidgetExtension.appex not found at $APPEX_PATH" >&2
  exit 1
fi

if [ -d "$TAURI_APP" ]; then
  mkdir -p "$TAURI_APP/Contents/PlugIns"
  rm -rf "$TAURI_APP/Contents/PlugIns/CalWidgetExtension.appex"
  cp -R "$APPEX_PATH" "$TAURI_APP/Contents/PlugIns/"
  codesign --force --deep --sign - "$TAURI_APP/Contents/PlugIns/CalWidgetExtension.appex" || true
  codesign --force --sign - "$TAURI_APP" || true
  pluginkit -a "$TAURI_APP/Contents/PlugIns/CalWidgetExtension.appex" || true
  echo "Embedded and registered CalWidgetExtension.appex into $TAURI_APP"
else
  echo "Built $APPEX_PATH (run 'yarn build:mac:dev' first to embed into cal-widget.app)"
fi
# [/SPEC-008:AC-3]
