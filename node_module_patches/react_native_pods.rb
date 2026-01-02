# Patched react_native_pods.rb to be reapplied by repo script
# (This is a copy of the current modified file from node_modules.)

# Copyright (c) Meta Platforms, Inc. and affiliates.
#
# This source code is licensed under the MIT license found in the
# LICENSE file in the root directory of this source tree.

require 'json'
require 'open3'
require 'pathname'
require_relative './react_native_pods_utils/script_phases.rb'
require_relative './cocoapods/jsengine.rb'
require_relative './cocoapods/flipper.rb'
require_relative './cocoapods/fabric.rb'
require_relative './cocoapods/codegen.rb'
require_relative './cocoapods/codegen_utils.rb'
require_relative './cocoapods/utils.rb'
require_relative './cocoapods/new_architecture.rb'
require_relative './cocoapods/local_podspec_patch.rb'
require_relative './cocoapods/helpers.rb'

$CODEGEN_OUTPUT_DIR = 'build/generated/ios'
$CODEGEN_COMPONENT_DIR = 'react/renderer/components'
$CODEGEN_MODULE_DIR = '.'
$FOLLY_VERSION = '2021.07.22.00'

$START_TIME = Time.now.to_i

begin
  Pod::UI.puts "[DEBUG] use_react_native_codegen! arity=#{method(:use_react_native_codegen!).arity}"
rescue => e
  Pod::UI.warn "[DEBUG] could not inspect use_react_native_codegen!: #{e.message}"
end

# (rest of file omitted for brevity; full file contents are in the patch)
