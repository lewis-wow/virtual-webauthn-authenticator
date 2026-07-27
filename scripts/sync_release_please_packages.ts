#!/usr/bin/env tsx
/// <reference types="node" />
// Keeps release-please-config.json / .release-please-manifest.json in sync
// with the actual apps/* and packages/* directories, so adding a new
// workspace member doesn't require hand-editing both files.
//
// Usage:
//   ./scripts/sync_release_please_packages.ts          add any missing entries
//   ./scripts/sync_release_please_packages.ts --check   exit 1 if anything is missing (CI)
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const CONFIG_PATH = join(ROOT, 'release-please-config.json');
const MANIFEST_PATH = join(ROOT, '.release-please-manifest.json');

interface PackageConfigEntry {
  component: string;
  'skip-github-release'?: true;
  'skip-changelog'?: true;
}

interface DiscoveredEntry {
  path: string;
  entry: PackageConfigEntry;
}

function discoverEntries(): DiscoveredEntry[] {
  const entries: DiscoveredEntry[] = [];

  // apps/*: only ones actually published via release.yml's tag-triggered
  // Docker build. A Dockerfile is what release.yml keys off, so it's also
  // the signal for "this app is release-please's concern".
  for (const dir of readdirSync(join(ROOT, 'apps'))) {
    const appPath = `apps/${dir}`;
    if (!existsSync(join(ROOT, appPath, 'Dockerfile'))) continue;
    entries.push({ path: appPath, entry: { component: dir } });
  }

  // packages/*: every internal package gets a tracked-but-hidden version so
  // the node-workspace plugin can cascade bumps into apps that depend on it.
  for (const dir of readdirSync(join(ROOT, 'packages'))) {
    const pkgPath = `packages/${dir}`;
    if (!existsSync(join(ROOT, pkgPath, 'package.json'))) continue;
    entries.push({
      path: pkgPath,
      entry: {
        component: dir,
        'skip-github-release': true,
      },
    });
  }

  return entries.sort((a, b) => a.path.localeCompare(b.path));
}

function readCurrentVersion(pkgPath: string): string {
  const pkgJson = JSON.parse(
    readFileSync(join(ROOT, pkgPath, 'package.json'), 'utf-8'),
  );
  return pkgJson.version ?? '0.0.0';
}

function sortedByKey<T>(obj: Record<string, T>): Record<string, T> {
  return Object.fromEntries(
    Object.entries(obj).sort(([a], [b]) => a.localeCompare(b)),
  );
}

function main() {
  const check = process.argv.includes('--check');
  const discovered = discoverEntries();

  const config = JSON.parse(readFileSync(CONFIG_PATH, 'utf-8'));
  const manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf-8'));

  const missing = discovered.filter(({ path }) => !(path in config.packages));

  if (missing.length === 0) {
    console.log(
      'release-please-config.json already tracks every deployable app and package.',
    );
    return;
  }

  if (check) {
    console.error(
      'release-please-config.json is missing these workspace members:',
    );
    for (const { path } of missing) console.error(`  - ${path}`);
    console.error('\nRun `pnpm release:sync-config` and commit the result.');
    process.exit(1);
  }

  for (const { path, entry } of missing) {
    config.packages[path] = entry;
    manifest[path] = readCurrentVersion(path);
    console.log(`Added ${path} (component: ${entry.component})`);
  }

  config.packages = sortedByKey(config.packages);
  writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2) + '\n');
  writeFileSync(
    MANIFEST_PATH,
    JSON.stringify(sortedByKey(manifest), null, 2) + '\n',
  );
}

main();
