#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

MY_IP="$(hostname -I | awk '{print $1}')"

echo "Using IP: $MY_IP"

mkcert -key-file nginx/certs/progtalk.key \
       -cert-file nginx/certs/progtalk.crt \
       localhost 127.0.0.1 ::1 "$MY_IP"

docker compose up -d --build nginx

echo "Done. Test: https://localhost and https://$MY_IP"