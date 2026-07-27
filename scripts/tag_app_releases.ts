#!/usr/bin/env tsx
/// <reference types="node" />
// Runs as the `publish` step of .github/workflows/version.yml, right after
// `changeset publish` (which no-ops - every package here is private). Every
// apps/* dir with a Dockerfile is a component release.yml's tag-triggered
// Docker build cares about, so for each one we tag its current package.json
// version as `<app>/vX.Y.Z` - unless that tag already exists, which means
// this version was already released. This mirrors the exact tag format
// (tag-separator: "/") release-please used to produce, so release.yml needs
// no changes.
//
// Usage:
//   ./scripts/tag_app_releases.ts             tag + push new app releases
//   ./scripts/tag_app_releases.ts --dry-run    print what would be tagged
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const DRY_RUN = process.argv.includes('--dry-run');

function discoverDockerApps(): string[] {
  const appsDir = join(ROOT, 'apps');
  return readdirSync(appsDir).filter((dir) =>
    existsSync(join(appsDir, dir, 'Dockerfile')),
  );
}

function readVersion(app: string): string {
  const pkgJson = JSON.parse(
    readFileSync(join(ROOT, 'apps', app, 'package.json'), 'utf-8'),
  );
  return pkgJson.version;
}

function tagExists(tag: string): boolean {
  try {
    execFileSync('git', ['rev-parse', '-q', '--verify', `refs/tags/${tag}`], {
      stdio: 'ignore',
    });
    return true;
  } catch {
    return false;
  }
}

function main() {
  const created: string[] = [];

  for (const app of discoverDockerApps()) {
    const version = readVersion(app);
    const tag = `${app}/v${version}`;

    if (tagExists(tag)) {
      console.log(`skip ${tag} (already released)`);
      continue;
    }

    if (DRY_RUN) {
      console.log(`[dry-run] would tag ${tag}`);
      continue;
    }

    execFileSync('git', ['tag', '-a', tag, '-m', `Release ${app} ${version}`], {
      stdio: 'inherit',
    });
    created.push(tag);
    console.log(`created ${tag}`);
  }

  if (DRY_RUN || created.length === 0) {
    console.log('No new app release tags to push.');
    return;
  }

  execFileSync('git', ['push', 'origin', ...created], { stdio: 'inherit' });
  console.log(`Pushed: ${created.join(', ')}`);
}

main();
