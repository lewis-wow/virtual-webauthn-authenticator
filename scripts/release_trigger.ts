#!/usr/bin/env tsx
/// <reference types="node" />
// Kicks off the release-please workflow by force-pushing master's current
// tip to a fixed `release` branch on origin - that push is the only thing
// .github/workflows/release-please.yml listens for. The branch's content is
// irrelevant; release-please always scans master itself (target-branch), and
// the workflow deletes `release` again once it has run.
//
// Goes via `git fetch` + FETCH_HEAD rather than a local `master` checkout so
// it works regardless of which branch is currently checked out locally.
//
// Usage:
//   ./scripts/release_trigger.ts
import { execFileSync } from 'node:child_process';

function main() {
  execFileSync('git', ['fetch', 'origin', 'master'], { stdio: 'inherit' });
  execFileSync(
    'git',
    ['push', '--force', 'origin', 'FETCH_HEAD:refs/heads/release'],
    {
      stdio: 'inherit',
    },
  );
  console.log(
    'Pushed master to origin/release - release-please workflow triggered.',
  );
}

main();
