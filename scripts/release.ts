#!/usr/bin/env tsx
/// <reference types="node" />
// Detects which Dockerfile apps are affected (directly or via transitive workspace
// deps) since their last release tag, derives the bump type from conventional
// commits, bumps package.json versions, prepends to CHANGELOG.md, commits,
// tags, and pushes — all in one shot.
//
// Usage:
//   pnpm tsx scripts/release.ts             run and release
//   pnpm tsx scripts/release.ts --dry-run   print what would happen, change nothing
import { appendFileSync, existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';

const ROOT = process.cwd();
const DRY_RUN = process.argv.includes('--dry-run');

type BumpType = 'major' | 'minor' | 'patch';

interface AppInfo {
  name: string;
  packageName: string;
  dir: string;
  version: string;
}

interface WorkspacePkg {
  name: string;
  dir: string;
}

function git(...args: string[]): string {
  return execFileSync('git', args, { encoding: 'utf-8' }).trim();
}

function discoverDockerApps(): AppInfo[] {
  const appsDir = join(ROOT, 'apps');
  return readdirSync(appsDir)
    .filter((d) => existsSync(join(appsDir, d, 'Dockerfile')))
    .map((d) => {
      const pkg = JSON.parse(readFileSync(join(appsDir, d, 'package.json'), 'utf-8'));
      return { name: d, packageName: pkg.name, dir: join(appsDir, d), version: pkg.version };
    });
}

function discoverWorkspacePkgs(): Map<string, WorkspacePkg> {
  const result = new Map<string, WorkspacePkg>();
  for (const scope of ['apps', 'packages', 'examples']) {
    const base = join(ROOT, scope);
    if (!existsSync(base)) continue;
    for (const entry of readdirSync(base)) {
      const pkgPath = join(base, entry, 'package.json');
      if (!existsSync(pkgPath)) continue;
      const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
      if (pkg.name) result.set(pkg.name, { name: pkg.name, dir: join(base, entry) });
    }
  }
  return result;
}

// Walks only `dependencies` and `peerDependencies` — devDependencies are build
// tooling (eslint-config, vitest-config, etc.) and should not trigger releases.
function getTransitiveDeps(pkgName: string, registry: Map<string, WorkspacePkg>): WorkspacePkg[] {
  const visited = new Set<string>();
  const result: WorkspacePkg[] = [];

  function visit(name: string) {
    if (visited.has(name)) return;
    visited.add(name);
    const pkg = registry.get(name);
    if (!pkg) return;
    result.push(pkg);
    const pkgJson = JSON.parse(readFileSync(join(pkg.dir, 'package.json'), 'utf-8'));
    const deps = { ...pkgJson.dependencies, ...pkgJson.peerDependencies };
    for (const [dep, version] of Object.entries(deps)) {
      if (typeof version === 'string' && version.startsWith('workspace:')) visit(dep);
    }
  }

  visit(pkgName);
  return result;
}

function getLastTag(app: string): string | null {
  const out = git('tag', '--list', `${app}/v*`, '--sort=-version:refname');
  return out.split('\n')[0] || null;
}

function getInitialCommit(): string {
  return git('rev-list', '--max-parents=0', 'HEAD');
}

function relDirs(dirs: string[]): string[] {
  return dirs.map((d) => d.replace(ROOT + '/', ''));
}

function hasChanges(dirs: string[], since: string): boolean {
  const out = git('diff', '--name-only', `${since}..HEAD`, '--', ...relDirs(dirs));
  return out.length > 0;
}

function determineBumpType(dirs: string[], since: string): BumpType {
  const log = git('log', `${since}..HEAD`, '--pretty=format:%s%n%b', '--', ...relDirs(dirs));
  if (/BREAKING[ -]CHANGE:|^[a-z]+(\(.+\))?!:/m.test(log)) return 'major';
  if (/^feat(\(.+\))?:/m.test(log)) return 'minor';
  return 'patch';
}

function bumpVersion(version: string, bump: BumpType): string {
  const [major, minor, patch] = version.split('.').map(Number);
  if (bump === 'major') return `${major + 1}.0.0`;
  if (bump === 'minor') return `${major}.${minor + 1}.0`;
  return `${major}.${minor}.${patch + 1}`;
}

function updatePackageVersion(dir: string, version: string) {
  const path = join(dir, 'package.json');
  const pkg = JSON.parse(readFileSync(path, 'utf-8'));
  pkg.version = version;
  writeFileSync(path, JSON.stringify(pkg, null, 2) + '\n');
}

function updateChangelog(dir: string, version: string, since: string, dirs: string[]) {
  const log = git('log', `${since}..HEAD`, '--pretty=format:- %s', '--', ...relDirs(dirs));
  const date = new Date().toISOString().split('T')[0];
  const path = join(dir, 'CHANGELOG.md');
  const existing = existsSync(path) ? readFileSync(path, 'utf-8') : '';
  writeFileSync(path, `# ${version} (${date})\n\n${log}\n\n${existing}`);
}

function setOutput(key: string, value: string) {
  if (process.env.GITHUB_OUTPUT) {
    appendFileSync(process.env.GITHUB_OUTPUT, `${key}=${value}\n`);
  }
}

function main() {
  const registry = discoverWorkspacePkgs();
  const apps = discoverDockerApps();
  const initialCommit = getInitialCommit();

  const toRelease: { name: string; tag: string; dir: string }[] = [];
  const stagedPaths: string[] = [];

  for (const app of apps) {
    const lastTag = getLastTag(app.name);
    const since = lastTag ?? initialCommit;
    const deps = getTransitiveDeps(app.packageName, registry);
    const dirs = deps.map((d) => d.dir);

    if (lastTag && !hasChanges(dirs, lastTag)) {
      console.log(`skip  ${app.name} — no changes since ${lastTag}`);
      continue;
    }

    const bump = determineBumpType(dirs, since);
    const newVersion = bumpVersion(app.version, bump);
    const tag = `${app.name}/v${newVersion}`;

    console.log(`${DRY_RUN ? '[dry-run] ' : ''}${app.name}: ${app.version} → ${newVersion} (${bump})`);

    if (DRY_RUN) continue;

    updatePackageVersion(app.dir, newVersion);
    updateChangelog(app.dir, newVersion, since, dirs);
    stagedPaths.push(join(app.dir, 'package.json'), join(app.dir, 'CHANGELOG.md'));
    toRelease.push({ name: app.name, tag, dir: app.dir });
  }

  const appNames = toRelease.map((r) => r.name);

  if (toRelease.length === 0) {
    console.log('Nothing to release.');
    setOutput('apps', '[]');
    setOutput('sha', git('rev-parse', 'HEAD'));
    return;
  }

  execFileSync('git', ['add', ...stagedPaths], { stdio: 'inherit' });
  execFileSync(
    'git',
    ['commit', '-m', `chore: version packages\n\n${toRelease.map((r) => r.tag).join('\n')}`],
    { stdio: 'inherit' },
  );

  for (const { tag } of toRelease) {
    execFileSync('git', ['tag', '-a', tag, '-m', `Release ${tag}`], { stdio: 'inherit' });
  }

  execFileSync('git', ['push', 'origin', 'HEAD', ...toRelease.map((r) => r.tag)], {
    stdio: 'inherit',
  });

  setOutput('apps', JSON.stringify(appNames));
  setOutput('sha', git('rev-parse', 'HEAD'));

  console.log(`Released: ${toRelease.map((r) => r.tag).join(', ')}`);
}

main();
