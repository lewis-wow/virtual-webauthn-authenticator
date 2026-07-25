#!/bin/sh

# Creates (or reuses) a git worktree for the given branch and launches Claude
# Code inside a Docker Sandbox (sbx) pointed at it, in bypass-permissions mode.

set -e

REPO_ROOT=$(git rev-parse --show-toplevel)
REPO_NAME=$(basename "$REPO_ROOT")

cd "$REPO_ROOT"

if [ -z "$1" ]
then
  BRANCH=$(git branch --show-current)
  SANDBOX_NAME=$(echo "claude-${BRANCH}" | tr '/' '-')

  echo "No branch given, running against current checkout on '${BRANCH}'..."
  exec sbx run claude "$REPO_ROOT" --name "$SANDBOX_NAME" -- --dangerously-skip-permissions "$@"
fi

BRANCH="$1"
shift

WORKTREES_ROOT="$(dirname "$REPO_ROOT")/${REPO_NAME}-worktrees"
WORKTREE_DIR="${WORKTREES_ROOT}/${BRANCH}"

if [ ! -d "$WORKTREE_DIR" ]
then
  mkdir -p "$WORKTREES_ROOT"
  if git show-ref --verify --quiet "refs/heads/${BRANCH}"
  then
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
