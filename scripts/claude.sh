#!/bin/sh

# Creates (or reuses) a git worktree for the given branch and launches Claude
# Code inside a Docker Sandbox (sbx) pointed at it, in bypass-permissions mode.
# Requires the sbx CLI and daemon (https://docs.docker.com/ai/sandboxes/agents/claude-code/):
#   sbx daemon start
#
# Usage: pnpm claude <branch-name> [extra claude args...]

set -e

BRANCH="$1"

if [ -z "$BRANCH" ]; then
  echo "Usage: pnpm claude <branch-name> [extra claude args...]" >&2
  exit 1
fi
shift

REPO_ROOT=$(git rev-parse --show-toplevel)
REPO_NAME=$(basename "$REPO_ROOT")
WORKTREES_ROOT="$(dirname "$REPO_ROOT")/${REPO_NAME}-worktrees"
WORKTREE_DIR="${WORKTREES_ROOT}/${BRANCH}"

cd "$REPO_ROOT"

if [ ! -d "$WORKTREE_DIR" ]; then
  mkdir -p "$WORKTREES_ROOT"
  if git show-ref --verify --quiet "refs/heads/${BRANCH}"; then
    echo "Adding worktree for existing branch '${BRANCH}' at ${WORKTREE_DIR}..."
    git worktree add "$WORKTREE_DIR" "$BRANCH"
  else
    echo "Creating branch '${BRANCH}' and worktree at ${WORKTREE_DIR}..."
    git worktree add -b "$BRANCH" "$WORKTREE_DIR"
  fi
else
  echo "Reusing existing worktree at ${WORKTREE_DIR}..."
fi

SANDBOX_NAME=$(echo "claude-${BRANCH}" | tr '/' '-')

exec sbx run claude "$WORKTREE_DIR" --name "$SANDBOX_NAME" -- --dangerously-skip-permissions "$@"
