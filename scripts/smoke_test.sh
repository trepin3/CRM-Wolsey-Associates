#!/usr/bin/env bash
set -euo pipefail

HOST=${HOST:-http://localhost:4000}
EMAIL=${EMAIL:-founder@wolsey.test}
PASSWORD=${SEED_PASSWORD:-password123}

check_cmd() {
  command -v "$1" >/dev/null 2>&1 || { echo "Required command '$1' not found. Please install it."; exit 1; }
}

# jq optional but nicer
if command -v jq >/dev/null 2>&1; then
  JQ=1
else
  JQ=0
fi

echo "Smoke test against $HOST"

echo "\n1) Login"
LOGIN_JSON=$(curl -s -X POST "$HOST/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${EMAIL}\",\"password\":\"${PASSWORD}\"}")

if [ "$JQ" -eq 1 ]; then
  echo "$LOGIN_JSON" | jq .
else
  echo "$LOGIN_JSON"
fi

ACCESS=$(echo "$LOGIN_JSON" | (jq -r '.tokens.access' 2>/dev/null || cat))
REFRESH=$(echo "$LOGIN_JSON" | (jq -r '.tokens.refresh' 2>/dev/null || cat))

if [ -z "$ACCESS" ] || [ "$ACCESS" = "null" ]; then
  echo "Login failed or token missing. Aborting smoke test."
  exit 1
fi

echo "\n2) Call /auth/me"
ME=$(curl -s -H "Authorization: Bearer $ACCESS" "$HOST/auth/me")
if [ "$JQ" -eq 1 ]; then echo "$ME" | jq .; else echo "$ME"; fi

echo "\n3) Create a lead"
CREATE_PAYLOAD='{"firstName":"Smoke","lastName":"Test","email":"smoke+test@example.com","address":"1 Test Ave","age":30,"source":"smoke","notes":"created-by-smoke-test"}'
CREATE_RES=$(curl -s -X POST "$HOST/leads" -H "Authorization: Bearer $ACCESS" -H "Content-Type: application/json" -d "$CREATE_PAYLOAD")
if [ "$JQ" -eq 1 ]; then echo "$CREATE_RES" | jq .; else echo "$CREATE_RES"; fi
LEAD_ID=$(echo "$CREATE_RES" | (jq -r '.lead.id' 2>/dev/null || cat))
if [ -z "$LEAD_ID" ] || [ "$LEAD_ID" = "null" ]; then
  echo "Create lead failed. Output above. Aborting."; exit 1
fi

echo "\n4) List leads (first page)"
LIST_RES=$(curl -s -H "Authorization: Bearer $ACCESS" "$HOST/leads?limit=1")
if [ "$JQ" -eq 1 ]; then echo "$LIST_RES" | jq .; else echo "$LIST_RES"; fi

# if pagination present, exercise next page
NEXT_CURSOR=$(echo "$LIST_RES" | (jq -r '.nextCursor' 2>/dev/null || echo ''))
if [ -n "$NEXT_CURSOR" ] && [ "$NEXT_CURSOR" != "null" ]; then
  echo "\n4b) Fetch next page using cursor"
  LIST2=$(curl -s -H "Authorization: Bearer $ACCESS" "$HOST/leads?limit=1&cursor=$NEXT_CURSOR")
  if [ "$JQ" -eq 1 ]; then echo "$LIST2" | jq .; else echo "$LIST2"; fi
fi

echo "\n5) Update lead notes"
UPDATE_PAYLOAD='{"notes":"updated-by-smoke-test","status":"CIRCLE_BACK"}'
UPDATE_RES=$(curl -s -X PATCH "$HOST/leads/$LEAD_ID" -H "Authorization: Bearer $ACCESS" -H "Content-Type: application/json" -d "$UPDATE_PAYLOAD")
if [ "$JQ" -eq 1 ]; then echo "$UPDATE_RES" | jq .; else echo "$UPDATE_RES"; fi

echo "\n6) Refresh tokens"
REFRESH_RES=$(curl -s -X POST "$HOST/auth/refresh" -H "Content-Type: application/json" -d "{\"refreshToken\":\"${REFRESH}\"}")
if [ "$JQ" -eq 1 ]; then echo "$REFRESH_RES" | jq .; else echo "$REFRESH_RES"; fi

echo "\n7) Delete lead (requires admin/founder)"
DEL_RES=$(curl -s -X DELETE "$HOST/leads/$LEAD_ID" -H "Authorization: Bearer $ACCESS")
if [ "$JQ" -eq 1 ]; then echo "$DEL_RES" | jq .; else echo "$DEL_RES"; fi

echo "\nSmoke test finished." 
