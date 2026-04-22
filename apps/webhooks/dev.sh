#!/usr/bin/env bash

set -euo pipefail

C_RESET="\033[0m"
C_DEV="\033[1;36m"
C_TUNNEL="\033[1;35m"
C_SCRIPT="\033[90m"

LOG_PREFIX_DEV="${C_DEV}[dev]${C_RESET}"
LOG_PREFIX_TUNNEL="${C_TUNNEL}[tunnel]${C_RESET}"

PORT="${PORT:-3003}"
TUNNEL_URL="${NGROK_TUNNEL_URL:-monarch-adequate-subtly.ngrok-free.app}"
TUNNEL_CMD="ngrok http --url=${TUNNEL_URL} ${PORT}"

cleanup() {
  [ -n "${CLEANUP_DONE:-}" ] && return
  CLEANUP_DONE=1
  echo ""
  echo -e "${C_SCRIPT}[dev.sh]${C_RESET} Shutting down..."
  [ -n "${DEV_PID:-}" ] && { pkill -P "$DEV_PID" 2>/dev/null; kill "$DEV_PID" 2>/dev/null; } || true
  [ -n "${TUNNEL_PID:-}" ] && { pkill -P "$TUNNEL_PID" 2>/dev/null; kill "$TUNNEL_PID" 2>/dev/null; } || true
  exit 0
}

trap cleanup SIGINT SIGTERM EXIT

echo -e "${C_SCRIPT}[dev.sh]${C_RESET} Starting Next dev and ngrok tunnel in parallel..."
echo -e "${C_SCRIPT}[dev.sh]${C_RESET} App port: ${PORT}"
echo -e "${C_SCRIPT}[dev.sh]${C_RESET} Tunnel URL: https://${TUNNEL_URL}"
echo ""

( next dev --port "${PORT}" 2>&1 | while IFS= read -r line; do echo -e "$LOG_PREFIX_DEV $line"; done ) &
DEV_PID=$!

( $TUNNEL_CMD 2>&1 | while IFS= read -r line; do echo -e "$LOG_PREFIX_TUNNEL $line"; done ) &
TUNNEL_PID=$!

echo -e "${C_SCRIPT}[dev.sh]${C_RESET} dev PID: ${DEV_PID} | tunnel PID: ${TUNNEL_PID}"
echo -e "${C_SCRIPT}[dev.sh]${C_RESET} Press Ctrl+C to stop all"
echo ""

wait
