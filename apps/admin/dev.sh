#!/usr/bin/env bash

set -euo pipefail

C_RESET="\033[0m"
C_NEXT="\033[1;36m"
C_TRIGGER="\033[1;35m"
C_SCRIPT="\033[90m"

LOG_PREFIX_NEXT="${C_NEXT}[next]${C_RESET}"
LOG_PREFIX_TRIGGER="${C_TRIGGER}[trigger]${C_RESET}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

PORT="${PORT:-3000}"

cleanup() {
	[ -n "${CLEANUP_DONE:-}" ] && return
	CLEANUP_DONE=1
	echo ""
	echo -e "${C_SCRIPT}[dev.sh]${C_RESET} Shutting down..."
	[ -n "${NEXT_PID:-}" ] && { pkill -P "$NEXT_PID" 2>/dev/null; kill "$NEXT_PID" 2>/dev/null; } || true
	[ -n "${TRIGGER_PID:-}" ] && { pkill -P "$TRIGGER_PID" 2>/dev/null; kill "$TRIGGER_PID" 2>/dev/null; } || true
	exit 0
}

trap cleanup SIGINT SIGTERM EXIT

echo -e "${C_SCRIPT}[dev.sh]${C_RESET} Starting Next.js and Trigger.dev dev in parallel..."
echo -e "${C_SCRIPT}[dev.sh]${C_RESET} App port: ${PORT}"
echo -e "${C_SCRIPT}[dev.sh]${C_RESET} Working directory: ${SCRIPT_DIR}"
echo ""

( next dev --port "${PORT}" 2>&1 | while IFS= read -r line; do echo -e "$LOG_PREFIX_NEXT $line"; done ) &
NEXT_PID=$!

( bun run dev:trigger 2>&1 | while IFS= read -r line; do echo -e "$LOG_PREFIX_TRIGGER $line"; done ) &
TRIGGER_PID=$!

echo -e "${C_SCRIPT}[dev.sh]${C_RESET} next PID: ${NEXT_PID} | trigger PID: ${TRIGGER_PID}"
echo -e "${C_SCRIPT}[dev.sh]${C_RESET} Press Ctrl+C to stop all"
echo ""

wait
