const fs = require('fs');
const path = require('path');

function patchReactNativePods() {
  const filePath = path.join(__dirname, '..', 'node_modules', 'react-native', 'scripts', 'react_native_pods.rb');
  if (!fs.existsSync(filePath)) return;
  let src = fs.readFileSync(filePath, 'utf8');
  if (src.includes("def use_react_native_codegen!(*args)")) {
    console.log('react_native_pods.rb already patched');
    return;
  }
  const match = /def use_react_native_codegen!\(spec, options=\{\}\)/;
  if (match.test(src)) {
    src = src.replace(match, `def use_react_native_codegen!(*args)\n  # Backwards-compatible wrapper for differing arities.\n  spec = args[0]\n  options = args[1].is_a?(Hash) ? args[1] : {}\n`);
    fs.writeFileSync(filePath, src, 'utf8');
    console.log('Patched react_native_pods.rb');
  } else {
    console.log('react_native_pods.rb: expected pattern not found; skipping');
  }
}

function patchFBReactNativeSpec() {
  const podspecPath = path.join(__dirname, '..', 'node_modules', 'react-native', 'React', 'FBReactNativeSpec', 'FBReactNativeSpec.podspec');
  if (!fs.existsSync(podspecPath)) return;
  let src = fs.readFileSync(podspecPath, 'utf8');
  if (src.includes('use_react_native_codegen!(s)')) {
    console.log('FBReactNativeSpec.podspec already patched');
    return;
  }
  // Replace use_react_native_codegen!(s, { ... }) with use_react_native_codegen!(s)
  const newSrc = src.replace(/use_react_native_codegen!\(s,\s*\{[\s\S]*?\}\)\s*/m, 'use_react_native_codegen!(s)\n');
  if (newSrc !== src) {
    fs.writeFileSync(podspecPath, newSrc, 'utf8');
    console.log('Patched FBReactNativeSpec.podspec');
  } else {
    console.log('FBReactNativeSpec.podspec: pattern not found; skipping');
  }
}

try {
  patchReactNativePods();
  patchFBReactNativeSpec();
} catch (err) {
  console.error('patch-rn-codegen failed', err);
  // don't exit non-zero to avoid breaking installs
}
