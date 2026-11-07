#!/usr/bin/env bash
# Usage: scripts/queue-sync.sh pull             -> clone/refresh the render-queue branch into ./queue
#        scripts/queue-sync.sh commit "message" -> add a normal commit on top and push (small pushes; Claude uses this)
#        scripts/queue-sync.sh push "message"   -> publish ./queue as ONE squashed commit (Actions only; keeps the repo small)
set -euo pipefail
REMOTE_URL="${QUEUE_REMOTE:-$(git remote get-url origin)}"
case "${1:-}" in
  pull)
    rm -rf queue
    if git ls-remote --exit-code "$REMOTE_URL" refs/heads/render-queue >/dev/null 2>&1; then
      git clone --quiet --depth 1 --branch render-queue "$REMOTE_URL" queue
    else
      mkdir -p queue && git -C queue init --quiet -b render-queue && git -C queue remote add origin "$REMOTE_URL"
    fi
    git -C queue rev-parse HEAD 2>/dev/null > queue/.base || echo "" > queue/.base
    ;;
  commit)
    cd queue
    git config user.name >/dev/null || git config user.name "render-queue-bot"
    git config user.email >/dev/null || git config user.email "render-queue-bot@users.noreply.github.com"
    git add -A -- . ':!.base'
    git commit --quiet -m "${2:-render queue update}" || { echo "nothing to commit"; exit 0; }
    for i in 1 2 3; do
      git push --quiet origin HEAD:render-queue && { echo "render-queue updated"; exit 0; }
      git fetch --quiet --depth 1 origin render-queue && git rebase --quiet FETCH_HEAD || { git rebase --abort || true; git reset --soft FETCH_HEAD; git commit --quiet -m "${2:-render queue update}"; }
    done
    echo "push failed"; exit 1
    ;;
  push)
    cd queue
    base=$(cat .base); rm -f .base
    git config user.name >/dev/null || git config user.name "render-queue-bot"
    git config user.email >/dev/null || git config user.email "render-queue-bot@users.noreply.github.com"
    printf '# render-queue\nVoice (Actions) and videos (Claude) waiting to be published. Managed by scripts/queue.ts; force-pushed as one commit.\n' > README.md
    git checkout --quiet --orphan next
    git add -A
    git commit --quiet -m "${2:-render queue update}" || { echo "nothing to push"; exit 0; }
    if [ -n "$base" ]; then git push --quiet --force-with-lease=render-queue:"$base" origin next:render-queue
    else git push --quiet origin next:render-queue; fi
    echo "render-queue updated"
    ;;
  *) echo "usage: $0 pull|push [message]"; exit 1 ;;
esac
