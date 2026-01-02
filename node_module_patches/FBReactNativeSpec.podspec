# Patched FBReactNativeSpec.podspec copy to reapply
# (This matches the modified version used earlier to avoid hard-failing use_react_native_codegen calls)

Pod::Spec.new do |s|
  s.name     = 'FBReactNativeSpec'
  s.version  = '0.71.14'
  s.summary  = 'FBReactNativeSpec'
  s.homepage = 'https://reactnative.dev'
  begin
    use_react_native_codegen!(s)
  rescue => e
    Pod::UI.warn "Skipping use_react_native_codegen!: #{e.message}"
  end
end
