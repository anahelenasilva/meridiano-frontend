#!/usr/bin/env bash
#
# Deploys the newest commit on origin/main of meridiano-frontend to the Pi.
#
# The Pi reaches out to GitHub; nothing on the internet reaches the Pi. Run by
# meridiano-frontend-deploy.timer, or by hand over Tailscale for an immediate
# deploy. Exits 0 and does nothing when origin/main has not moved.
#
# Runs as root so it can restart the unit, but every git and pnpm call drops to
# APP_USER. Running those as root leaves root-owned files in the checkout that
# break the next deploy.
#
# There is no database here, so unlike the API deploy there is no backup and no
# migration. Rollback is pure code: rebuild the previous commit.
set -euo pipefail

REPO="${REPO:-/home/anahelena/dev/meridiano-frontend}"
APP_USER="${APP_USER:-anahelena}"
SERVICE="${SERVICE:-meridiano-frontend}"
BRANCH="${BRANCH:-main}"
PNPM="${PNPM:-/usr/bin/pnpm}"
PORT="${PORT:-8080}"
HEALTH_TIMEOUT="${HEALTH_TIMEOUT:-120}"
# A commit that failed to deploy is recorded here so the timer does not rebuild
# and restart it every two minutes until someone notices. Its own dir, separate
# from the API deploy's /var/lib/meridiano, so the two never collide.
STATE_DIR="${STATE_DIR:-/var/lib/meridiano-frontend}"
FAILED_FILE="$STATE_DIR/failed-sha"

log() { echo "[$(date -Is)] $*"; }

as_app() { sudo -u "$APP_USER" -H "$@"; }

git_app() { as_app git -C "$REPO" "$@"; }

# Only tracked changes block a deploy. Untracked files in the checkout (the
# stray .next/ and next-env.d.ts) are left alone, and nothing here runs
# git clean.
tracked_changes() {
  git_app status --porcelain --untracked-files=no
}

# Explicit `|| return 1` on every step: bash suppresses errexit inside a
# function called as a condition, so set -e alone would not stop the build here.
checkout_and_build() {
  git_app reset --hard --quiet "$1" || return 1
  as_app "$PNPM" install --frozen-lockfile || return 1
  as_app "$PNPM" run build || return 1
}

wait_for_health() {
  local url deadline
  url="http://127.0.0.1:${PORT}/"
  deadline=$(($(date +%s) + HEALTH_TIMEOUT))

  while [ "$(date +%s)" -lt "$deadline" ]; do
    if curl -fsS --max-time 5 "$url" >/dev/null 2>&1; then
      return 0
    fi
    sleep 5
  done

  log "no healthy response from $url within ${HEALTH_TIMEOUT}s"
  return 1
}

rollback_to() {
  local old="$1"
  log "ROLLBACK: rebuilding ${old:0:12}"
  if checkout_and_build "$old"; then
    systemctl restart "$SERVICE"
    if wait_for_health; then
      log "ROLLBACK succeeded, running ${old:0:12}"
      return 0
    fi
  fi
  log "ROLLBACK FAILED, $SERVICE needs hands"
  return 1
}

main() {
  cd "$REPO"
  mkdir -p "$STATE_DIR"

  if [ -n "$(tracked_changes)" ]; then
    log "tracked files are modified in $REPO, refusing to reset over them:"
    tracked_changes
    return 1
  fi

  git_app fetch --quiet origin "$BRANCH"

  local old new
  old="$(git_app rev-parse HEAD)"
  new="$(git_app rev-parse "origin/$BRANCH")"

  if [ "$old" = "$new" ]; then
    log "already on ${new:0:12}, nothing to do"
    return 0
  fi

  if [ -f "$FAILED_FILE" ] && [ "$(cat "$FAILED_FILE")" = "$new" ]; then
    log "${new:0:12} already failed to deploy, waiting for a newer commit"
    log "to retry it anyway: rm $FAILED_FILE"
    return 0
  fi

  log "deploying ${old:0:12} -> ${new:0:12}"

  # vite preview keeps serving the old dist/ from disk through the build. Only
  # the restart below is downtime. See the dist-rewrite note in deploy/README.md.
  if checkout_and_build "$new"; then
    systemctl restart "$SERVICE"
    if wait_for_health; then
      rm -f "$FAILED_FILE"
      log "deploy healthy on ${new:0:12}"
      return 0
    fi
    journalctl -u "$SERVICE" -n 50 --no-pager || true
  fi

  echo "$new" >"$FAILED_FILE"
  rollback_to "$old"
  return 1
}

main "$@"
