#!/usr/bin/env bash
# Switch the payment-service between Cashfree sandbox (test) and production
# without rewriting the .env by hand. Also lets you paste fresh test
# credentials in a way that never echoes them to the screen.
#
# Usage:
#   bash scripts/set-cashfree-mode.sh test       # switch to sandbox + reload
#   bash scripts/set-cashfree-mode.sh prod       # switch to production + reload
#   bash scripts/set-cashfree-mode.sh set-test   # paste fresh sandbox keys (hidden) + switch
#
# After any change the script restarts the naploo-payment pm2 process so
# the new env takes effect immediately. Run from the repo root.

set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="$ROOT/.env"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "ERR: $ENV_FILE not found" >&2
  exit 1
fi

mode="${1:-}"

reload_payment() {
  echo "→ Reloading naploo-payment so new env is picked up..."
  pm2 restart naploo-payment --update-env >/dev/null
  sleep 2
  pm2 logs naploo-payment --lines 5 --nostream | tail -10
}

# Replace (or insert) a KEY=VALUE line in .env
upsert() {
  local key="$1" value="$2"
  if grep -q "^${key}=" "$ENV_FILE"; then
    # use a delimiter unlikely to appear in cashfree values
    sed -i "s|^${key}=.*|${key}=${value}|" "$ENV_FILE"
  else
    echo "${key}=${value}" >> "$ENV_FILE"
  fi
}

case "$mode" in
  test|sandbox)
    test_app=$(grep -E '^CASHFREE_TEST_APP_ID=' "$ENV_FILE" | head -1 | cut -d= -f2-)
    test_secret=$(grep -E '^CASHFREE_TEST_SECRET_KEY=' "$ENV_FILE" | head -1 | cut -d= -f2-)
    if [[ "$test_app" == "PASTE_TEST_APP_ID_HERE" || -z "$test_app" || "$test_secret" == "PASTE_TEST_SECRET_KEY_HERE" || -z "$test_secret" ]]; then
      echo "ERR: CASHFREE_TEST_APP_ID / CASHFREE_TEST_SECRET_KEY are empty. Run:" >&2
      echo "       bash scripts/set-cashfree-mode.sh set-test" >&2
      exit 1
    fi
    upsert CASHFREE_MODE sandbox
    upsert CASHFREE_APP_ID "$test_app"
    upsert CASHFREE_SECRET_KEY "$test_secret"
    echo "✓ Switched to Cashfree SANDBOX (test) mode"
    reload_payment
    ;;
  prod|production|live)
    prod_app=$(grep -E '^CASHFREE_PROD_APP_ID=' "$ENV_FILE" | head -1 | cut -d= -f2-)
    prod_secret=$(grep -E '^CASHFREE_PROD_SECRET_KEY=' "$ENV_FILE" | head -1 | cut -d= -f2-)
    if [[ -z "$prod_app" || -z "$prod_secret" ]]; then
      echo "ERR: CASHFREE_PROD_APP_ID / CASHFREE_PROD_SECRET_KEY are empty in $ENV_FILE" >&2
      exit 1
    fi
    upsert CASHFREE_MODE production
    upsert CASHFREE_APP_ID "$prod_app"
    upsert CASHFREE_SECRET_KEY "$prod_secret"
    echo "✓ Switched to Cashfree PRODUCTION (live) mode"
    reload_payment
    ;;
  set-test)
    # Read secrets without echoing them and without putting them on the
    # shell history. The values are written directly to .env.
    echo "Paste Cashfree TEST AppID then press Enter (input hidden):"
    IFS= read -rs test_app
    echo
    echo "Paste Cashfree TEST Secret Key then press Enter (input hidden):"
    IFS= read -rs test_secret
    echo
    if [[ -z "$test_app" || -z "$test_secret" ]]; then
      echo "ERR: empty value — aborting." >&2
      exit 1
    fi
    upsert CASHFREE_TEST_APP_ID "$test_app"
    upsert CASHFREE_TEST_SECRET_KEY "$test_secret"
    upsert CASHFREE_APP_ID "$test_app"
    upsert CASHFREE_SECRET_KEY "$test_secret"
    upsert CASHFREE_MODE sandbox
    chmod 600 "$ENV_FILE"
    echo "✓ Saved test keys + switched to SANDBOX mode"
    reload_payment
    ;;
  *)
    cat <<EOF
Usage: bash scripts/set-cashfree-mode.sh <command>

Commands:
  test       Switch to Cashfree sandbox (uses stored test keys)
  prod       Switch to Cashfree production
  set-test   Paste new test AppID + Secret (hidden), save + switch

Current state:
  CASHFREE_MODE = $(grep -E '^CASHFREE_MODE=' "$ENV_FILE" | head -1 | cut -d= -f2-)
  CASHFREE_APP_ID = $(grep -E '^CASHFREE_APP_ID=' "$ENV_FILE" | head -1 | cut -d= -f2- | head -c 12)...
EOF
    exit 1
    ;;
esac
