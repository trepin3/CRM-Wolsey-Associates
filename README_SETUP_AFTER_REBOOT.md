Quick steps to resume development after restarting the machine

1) Open the repo in VS Code

2) Install system deps (if not already):
   - Docker Desktop (start it)
   - Xcode (if you plan to run native iOS builds)

3) From a terminal in the repo root (zsh):

```bash
# ensure node modules + workspace deps are installed
yarn install

# reapply node module patches (postinstall will run automatically during yarn install, but you can run explicitly)
bash ./scripts/apply_node_patches.sh

# ensure the boost tarball is in the repo root (we included it as boost_1_76_0.tar.bz2)
# then fix caches and run pod install (if doing native iOS builds)
bash ./scripts/fix_pod_boost_cache.sh

# start backend and Metro (or use VS Code Tasks)
# in separate terminals you can run:
yarn --cwd packages/server dev
EXPO_NO_WEB=1 yarn --cwd apps/mobile start -c

# or use the VS Code Tasks: Run 'Start Server (dev)' and 'Start Metro (Expo)'
```

Notes
- The repo includes `scripts/apply_node_patches.sh` which will restore critical node_module modifications we used to get CocoaPods past the codegen errors.
- If you plan to build for iOS you must install full Xcode and run `sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer` and `sudo xcodebuild -runFirstLaunch`.
- To persist patching across reinstalls in a cleaner way, consider adding `patch-package` and committing generated patches to `patches/`.
