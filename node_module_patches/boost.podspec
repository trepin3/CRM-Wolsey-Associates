# Patched boost.podspec (local-file variant)
# This file will be copied into node_modules/react-native/third-party-podspecs/boost.podspec
# to ensure pod install uses local copy when needed.

# Copyright (c) Meta Platforms, Inc. and affiliates.
#
# This source code is licensed under the MIT license found in the
# LICENSE file in the root directory of this source tree.

Pod::Spec.new do |spec|
  spec.name = 'boost'
  spec.version = '1.76.0'
  spec.license = { :type => 'Boost Software License', :file => "LICENSE_1_0.txt" }
  spec.homepage = 'http://www.boost.org'
  spec.summary = 'Boost provides free peer-reviewed portable C++ source libraries.'
  spec.authors = 'Rene Rivera'
  # Patched locally to avoid network mirror/checksum issues.
  # Use a local file placed in the repo root by the repo script. Escape the path for URI safety.
  require 'uri'
  local_path = File.join(Pod::Config.instance.installation_root, 'boost_1_76_0.tar.bz2')
  escaped = URI::DEFAULT_PARSER.escape(local_path)
  spec.source = { :http => "file://#{escaped}",
                  :sha256 => 'f0397ba6e982c4450f27bf32a2a83292aba035b827a5623a14636ea583318c41' }

  # Pinning to the same version as React.podspec.
  spec.platforms = { :ios => '11.0' }
  spec.requires_arc = false

  spec.module_name = 'boost'
  spec.header_dir = 'boost'
  spec.preserve_path = 'boost'
end
