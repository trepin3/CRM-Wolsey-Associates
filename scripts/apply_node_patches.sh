#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR=$(cd "$(dirname "$0")/.." && pwd)
PATCH_DIR="$ROOT_DIR/node_module_patches"

echo "Applying node_module patches from $PATCH_DIR"

# Map of source -> dest (relative to repo root)
declare -A FILES
FILES["$PATCH_DIR/boost.podspec"]="$ROOT_DIR/node_modules/react-native/third-party-podspecs/boost.podspec"
FILES["$PATCH_DIR/react_native_pods.rb"]="$ROOT_DIR/node_modules/react-native/scripts/react_native_pods.rb"
FILES["$PATCH_DIR/FBReactNativeSpec.podspec"]="$ROOT_DIR/node_modules/react-native/React/FBReactNativeSpec/FBReactNativeSpec.podspec"

for src in "${!FILES[@]}"; do
  dest="${FILES[$src]}"
  if [ -f "$src" ]; then
    if [ -f "$dest" ]; then
      echo "Backing up existing: $dest -> ${dest}.bak"
      cp -v "$dest" "${dest}.bak" || true
    else
      echo "Destination not found (will attempt to create): $dest"
      mkdir -p "$(dirname "$dest")"
    fi
    echo "Copying $src -> $dest"
    cp -v "$src" "$dest"
  else
    echo "Patch source not found: $src"
  fi
done

# Make scripts executable
chmod +x "$ROOT_DIR/scripts/patch-rn-codegen.js" 2>/dev/null || true
chmod +x "$ROOT_DIR/scripts/fix_pod_boost_cache.sh" 2>/dev/null || true

echo "Node module patches applied. If you reinstalled node_modules, re-run this script or run 'yarn' to trigger postinstall." 
