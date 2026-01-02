#!/usr/bin/env bash
set -euo pipefail

SF_TARBALL="/tmp/boost_1_76_0_sf.tar.bz2"

if [ ! -f "$SF_TARBALL" ]; then
  echo "ERROR: Verified SourceForge tarball not found at $SF_TARBALL"
  echo "Please download it first with:\n  curl -L -o /tmp/boost_1_76_0_sf.tar.bz2 https://sourceforge.net/projects/boost/files/boost/1.76.0/boost_1_76_0.tar.bz2/download"
  exit 1
fi

echo "SourceForge tarball sha256:" 
shasum -a 256 "$SF_TARBALL"

echo "Searching common cache locations for existing boost tarballs..."
# Find candidate cached boost tarballs in a portable way
echo "Searching common cache locations for existing boost tarballs..."
TMPF=$(mktemp)
find "$HOME/Library/Caches" -type f -iname '*boost*1_76_0*.tar.bz2' -print0 2>/dev/null > "$TMPF" || true

if [ ! -s "$TMPF" ]; then
  echo "No existing cached boost tarballs found under ~/Library/Caches."
else
  echo "Found cached candidate(s):"
  while IFS= read -r -d '' f; do
    echo " - $f"
    echo "Backing up: $f -> ${f}.bak"
    cp -v "$f" "${f}.bak" || true
    echo "Replacing cached file with the verified tarball..."
    cp -v "$SF_TARBALL" "$f"
    echo "New sha256 for $f:"; shasum -a 256 "$f"
  done < "$TMPF"
fi

rm -f "$TMPF"

# Ensure CocoaPods cache location and copy the file there
CP_DEST_DIR="$HOME/Library/Caches/CocoaPods/Pods/External/boost"
mkdir -p "$CP_DEST_DIR"
DEST="$CP_DEST_DIR/boost_1_76_0.tar.bz2"

echo "Copying verified tarball to CocoaPods cache: $DEST"
cp -v "$SF_TARBALL" "$DEST"
shasum -a 256 "$DEST"

# Also try CocoaPods cache locations used by CDN or archives
ALT_DEST_DIRS=(
  "$HOME/Library/Caches/CocoaPods/Pods/boost"
  "$HOME/Library/Caches/CocoaPods/Repo"
)
for d in "${ALT_DEST_DIRS[@]}"; do
  mkdir -p "$d" || true
  echo "Also copying to: $d/boost_1_76_0.tar.bz2"
  cp -v "$SF_TARBALL" "$d/boost_1_76_0.tar.bz2" || true
done

# Run pod install with verbose output
if [ ! -d "ios" ]; then
  echo "ERROR: ios/ directory not found in repo root. Run this script from the repo root.";
  exit 1
fi

echo "Running: cd ios && pod install --repo-update --verbose"
cd ios
pod install --repo-update --verbose

echo "pod install finished. If it completed without error, the boost checksum issue is resolved."
