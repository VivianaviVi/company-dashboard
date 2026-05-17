#!/usr/bin/env bash
set -u

BASE="${BASE:-http://127.0.0.1:3002}"

ADMIN_EMAIL="${ADMIN_EMAIL:-admin@example.com}"
MANAGER_EMAIL="${MANAGER_EMAIL:-manager@example.com}"
USER_EMAIL="${USER_EMAIL:-test@example.com}"
UNKNOWN_EMAIL="${UNKNOWN_EMAIL:-nobody@example.com}"
DEFAULT_PASSWORD="${DEFAULT_PASSWORD:-123456}"

echo "BASE=$BASE"
echo

req() {
  local method="$1"; shift
  local path="$1"; shift
  local token="${1:-}"; shift || true
  local data="${1:-}"; shift || true

  local args=(-sS -o /tmp/resp.json -w "HTTP %{http_code}  time=%{time_total}s\n" -X "$method" "$BASE$path")
  if [ -n "$token" ]; then
    args+=(-H "Authorization: Bearer $token")
  fi
  if [ -n "$data" ]; then
    args+=(-H "Content-Type: application/json" -d "$data")
  fi

  echo "$method $path  token=${token:+<set>}${token:-<none>}"
  curl "${args[@]}" || true
}

login() {
  local email="$1"
  curl -sS -X POST "$BASE/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$email\",\"password\":\"$DEFAULT_PASSWORD\"}" \
  | python3 -c 'import sys,json; print(json.load(sys.stdin).get("access_token",""))'
}

echo "### JWT login"
ADMIN_TOKEN="$(login "$ADMIN_EMAIL")"
MANAGER_TOKEN="$(login "$MANAGER_EMAIL")"
USER_TOKEN="$(login "$USER_EMAIL")"
INVALID_TOKEN="invalid.token.value"

if [ -z "$ADMIN_TOKEN" ] || [ -z "$MANAGER_TOKEN" ] || [ -z "$USER_TOKEN" ]; then
  echo "Login failed: missing token(s). Check backend is running and seeded users have password_hash."
  exit 1
fi

echo "### Connectivity + Swagger"
req GET /health ""
req GET /api-docs ""
req GET /api-docs-json ""

echo
echo "### Auth behavior (missing/invalid token -> 401)"
req GET /users/me ""
req GET /users/me "$INVALID_TOKEN"

echo
echo "### RBAC differences (users list + companies create)"
req GET /users "$USER_TOKEN"        # expect 403
req GET /users "$MANAGER_TOKEN"     # expect 200
req GET /users "$ADMIN_TOKEN"       # expect 200

CODE="SMOKE_$(date +%s)"
COMPANY_BODY="{\"company_code\":\"$CODE\",\"company_name\":\"SmokeCo\",\"level\":2,\"country\":\"USA\",\"city\":\"NY\",\"founded_year\":2020,\"annual_revenue\":1000,\"employees\":10}"
req POST /companies "$USER_TOKEN" "$COMPANY_BODY"      # expect 403
req POST /companies "$MANAGER_TOKEN" "$COMPANY_BODY"   # expect 201
req DELETE "/companies/$CODE" "$ADMIN_TOKEN"           # expect 200 (cleanup)

echo
echo "### Invalid input (format/empty)"
req PATCH "/companies/$CODE" "$MANAGER_TOKEN" "{\"level\":\"oops\"}"  # expect 400 (dto validation)
req POST /companies/filter "$USER_TOKEN" "{\"dimension\":\"bad\",\"filter\":{\"level\":[],\"country\":[],\"city\":[],\"founded_year\":{\"start\":\"\",\"end\":\"\"},\"annual_revenue\":{\"min\":\"\",\"max\":\"\"},\"employees\":{\"min\":\"\",\"max\":\"\"}}}"  # expect 400
req POST /dashboard/bubble "$USER_TOKEN" "{\"dimension\":\"level\"}"  # expect 400

echo
echo "### Response shape checks (sample)"
req GET /dashboard/summary "$USER_TOKEN"  # expect 200
python3 - <<'PY'
import json,sys
p="/tmp/resp.json"
try:
  with open(p,"r",encoding="utf-8") as f: j=json.load(f)
  ok = all(k in j for k in ["companyCount","totalRevenue","countriesCovered","totalEmployees"])
  print("summary_has_keys:", ok)
except Exception as e:
  print("summary_parse_failed:", e)
PY

FILTER_OK="{\"dimension\":\"country\",\"filter\":{\"level\":[],\"country\":[\"China\"],\"city\":[],\"founded_year\":{\"start\":\"\",\"end\":\"\"},\"annual_revenue\":{\"min\":\"\",\"max\":\"\"},\"employees\":{\"min\":\"\",\"max\":\"\"}}}"
req POST /companies/filter "$USER_TOKEN" "$FILTER_OK"  # expect 201
python3 - <<'PY'
import json
p="/tmp/resp.json"
with open(p,"r",encoding="utf-8") as f: j=json.load(f)
print("filter_keys_ok:", all(k in j for k in ["dimension","data","filter","total"]))
print("dimension:", j.get("dimension"))
print("total:", j.get("total"))
print("data_keys_sample:", list(j.get("data",{}).keys())[:5])
PY

echo
echo "DONE"

