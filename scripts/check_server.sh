#!/usr/bin/env bash
set -u

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PID_FILE="$REPO_ROOT/packages/server/dev.pid"
LOG_FILE="$REPO_ROOT/packages/server/dev.log"

echo "=== PID file ==="
if [ -f "$PID_FILE" ]; then
  cat "$PID_FILE"
else
  echo "no pid file"
fi

echo
echo "=== process (ps) ==="
if [ -f "$PID_FILE" ]; then
  PID=$(cat "$PID_FILE")
  if ps -p "$PID" > /dev/null 2>&1; then
    ps -fp "$PID"
  else
    echo "process $PID not found"
  fi
else
  echo "no pid to check"
fi

echo
echo "=== listener (lsof) ==="
if command -v lsof >/dev/null 2>&1; then
  lsof -iTCP:4000 -sTCP:LISTEN -n -P || echo 'no listener on 4000'
else
  echo "lsof not installed; skipping listener check"
fi

echo
echo "=== last 200 lines of log ==="
if [ -f "$LOG_FILE" ]; then
  tail -n 200 "$LOG_FILE"
else
  echo "no log file"
fi

echo
echo "=== health check (curl) ==="
if command -v curl >/dev/null 2>&1; then
  curl -v http://localhost:4000/health || echo 'curl failed'
else
  echo "curl not installed; skipping health check"
fi

echo
echo "=== login smoke test ==="
# default seed credentials
EMAIL="founder@wolsey.test"
PASSWORD="password123"
# allow override via env
: "${SEED_PASSWORD:=}"
if [ -n "${SEED_PASSWORD:-}" ]; then
  PASSWORD="$SEED_PASSWORD"
fi

if command -v curl >/dev/null 2>&1; then
  if command -v jq >/dev/null 2>&1; then
    curl -s -X POST http://localhost:4000/auth/login \
      -H "Content-Type: application/json" \
      -d "{\"email\":\"${EMAIL}\",\"password\":\"${PASSWORD}\"}" | jq || echo 'login curl failed'
  else
    echo "(jq not available; raw output below)"
    curl -s -X POST http://localhost:4000/auth/login \
      -H "Content-Type: application/json" \
      -d "{\"email\":\"${EMAIL}\",\"password\":\"${PASSWORD}\"}" || echo 'login curl failed'
  fi
else
  echo "curl not installed; skipping login test"
fi

echo
echo "Done. If you want this script executable: run: chmod +x scripts/check_server.sh"
