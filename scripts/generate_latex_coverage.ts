#!/usr/bin/env tsx
import { readFile } from 'fs/promises';
import { resolve } from 'path';

console.log('🌀 Starting coverage to LaTeX conversion...');

const DEFAULT_INPUT = './coverage/coverage-final.json';
const inputPath = resolve(process.argv[2] ?? DEFAULT_INPUT);

type BranchHits = number[];

interface CoverageLocation {
  start: { line: number };
}

interface FileCoverage {
  statementMap: Record<string, CoverageLocation>;
  s: Record<string, number>;
  branchMap: Record<string, unknown>;
  b: Record<string, BranchHits>;
  fnMap: Record<string, unknown>;
  f: Record<string, number>;
}

interface GroupMetrics {
  stmtTotal: number;
  stmtCovered: number;
  branchTotal: number;
  branchCovered: number;
  fnTotal: number;
  fnCovered: number;
  lineTotal: number;
  lineCovered: number;
}

interface KeyPackageDefinition {
  key: string;
  label: string;
}

const KEY_PACKAGES: KeyPackageDefinition[] = [
  { key: 'virtual-authenticator', label: 'virtual-authenticator' },
  { key: 'key-vault', label: 'key-vault' },
  { key: 'cbor', label: 'cbor' },
  { key: 'crypto', label: 'crypto (JWT)' },
  { key: 'auth', label: 'auth (API Key Manager)' },
  { key: 'keys', label: 'keys' },
];

const createEmptyMetrics = (): GroupMetrics => {
  return {
    stmtTotal: 0,
    stmtCovered: 0,
    branchTotal: 0,
    branchCovered: 0,
    fnTotal: 0,
    fnCovered: 0,
    lineTotal: 0,
    lineCovered: 0,
  };
};

const pct = (covered: number, total: number): string => {
  if (total === 0) return '100.00';
  return ((covered / total) * 100).toFixed(2);
};

const formatPercent = (covered: number, total: number): string => {
  return `${pct(covered, total).replace(/\.00$/, '')}\\%`;
};

const formatRatio = (covered: number, total: number): string => {
  return `${covered.toLocaleString('en-US')} / ${total.toLocaleString('en-US')}`;
};

const escapeLatex = (s: string): string => {
  return s.replace(/_/g, '\\_').replace(/&/g, '\\&');
};

/** Extract the group key (e.g. "apps/api-bff" or "packages/auth") from an
 *  absolute file path, relative to the project root. */
const groupKey = (filePath: string): string | null => {
  // Normalise to forward slashes and strip everything up to the workspace root
  const normalised = filePath.replace(/\\/g, '/');
  const marker = normalised.includes('/apps/')
    ? '/apps/'
    : normalised.includes('/packages/')
      ? '/packages/'
      : normalised.includes('/examples/')
        ? '/examples/'
        : null;

  if (!marker) return null;

  const afterMarker = normalised.slice(
    normalised.indexOf(marker) + marker.length,
  );
  const subfolder = afterMarker.split('/')[0];
  return marker.slice(1, -1) + '/' + subfolder; // e.g. "apps/api-bff"
};

const packageKey = (filePath: string): string | null => {
  const normalised = filePath.replace(/\\/g, '/');
  const marker = '/packages/';

  if (!normalised.includes(marker)) return null;

  const afterMarker = normalised.slice(
    normalised.indexOf(marker) + marker.length,
  );
  return afterMarker.split('/')[0] ?? null;
};

const accumulateMetrics = (metrics: GroupMetrics, fc: FileCoverage): void => {
  metrics.stmtTotal += Object.keys(fc.statementMap).length;
  metrics.stmtCovered += Object.values(fc.s).filter((n) => n > 0).length;

  for (const arms of Object.values(fc.b)) {
    metrics.branchTotal += arms.length;
    metrics.branchCovered += arms.filter((n) => n > 0).length;
  }

  metrics.fnTotal += Object.keys(fc.fnMap).length;
  metrics.fnCovered += Object.values(fc.f).filter((n) => n > 0).length;

  const lineHit = new Map<number, boolean>();
  for (const [id, loc] of Object.entries(fc.statementMap)) {
    const line = loc.start.line;
    const hit = (fc.s[id] ?? 0) > 0;
    lineHit.set(line, (lineHit.get(line) ?? false) || hit);
  }

  metrics.lineTotal += lineHit.size;
  metrics.lineCovered += [...lineHit.values()].filter(Boolean).length;
};

const printSection = (title: string, content: string): void => {
  const divider = '='.repeat(24);
  console.log(`\n${divider} ${title} ${divider}\n`);
  console.log(content);
};

try {
  const fileContent = await readFile(inputPath, 'utf-8');
  const data = JSON.parse(fileContent) as Record<string, FileCoverage>;

  const overall = createEmptyMetrics();
  const groups = new Map<string, GroupMetrics>();
  const packageGroups = new Map<string, GroupMetrics>();

  for (const [filePath, fc] of Object.entries(data)) {
    accumulateMetrics(overall, fc);

    const key = groupKey(filePath);
    if (key) {
      if (!groups.has(key)) {
        groups.set(key, createEmptyMetrics());
      }

      accumulateMetrics(groups.get(key)!, fc);
    }

    const pkgKey = packageKey(filePath);
    if (pkgKey) {
      if (!packageGroups.has(pkgKey)) {
        packageGroups.set(pkgKey, createEmptyMetrics());
      }

      accumulateMetrics(packageGroups.get(pkgKey)!, fc);
    }
  }

  const overallTableLines = [
    '\\begin{table}[H]',
    '  \\centering',
    '  \\caption{Overall Code Coverage Summary}',
    '  \\label{tab:coverage_summary}',
    '  \\begin{tabular}{lrr}',
    '    \\toprule',
    '    \\textbf{Metric} & \\textbf{Coverage} & \\textbf{Ratio} \\\\',
    '    \\midrule',
    `    Statements      & ${formatPercent(overall.stmtCovered, overall.stmtTotal)}           & ${formatRatio(overall.stmtCovered, overall.stmtTotal)}  \\\\`,
    `    Branches        & ${formatPercent(overall.branchCovered, overall.branchTotal)}           & ${formatRatio(overall.branchCovered, overall.branchTotal)}      \\\\`,
    `    Functions       & ${formatPercent(overall.fnCovered, overall.fnTotal)}           & ${formatRatio(overall.fnCovered, overall.fnTotal)}      \\\\`,
    `    Lines           & ${formatPercent(overall.lineCovered, overall.lineTotal)}           & ${formatRatio(overall.lineCovered, overall.lineTotal)}  \\\\`,
    '    \\bottomrule',
    '  \\end{tabular}',
    '\\end{table}',
  ];

  const keyPackageTableLines = [
    '\\begin{table}[H]',
    '  \\centering',
    '  \\caption{Coverage by Key Package}',
    '  \\label{tab:package_coverage}',
    '  \\begin{tabular}{lrr}',
    '    \\toprule',
    '    \\textbf{Package} & \\textbf{Statements} & \\textbf{Branches} \\\\',
    '    \\midrule',
  ];

  for (const definition of KEY_PACKAGES) {
    const metrics = packageGroups.get(definition.key) ?? createEmptyMetrics();
    keyPackageTableLines.push(
      `    ${escapeLatex(definition.label)} & ${formatPercent(metrics.stmtCovered, metrics.stmtTotal)}             & ${formatPercent(metrics.branchCovered, metrics.branchTotal)}           \\\\`,
    );
  }

  keyPackageTableLines.push(
    '    \\bottomrule',
    '  \\end{tabular}',
    '  \\footnotesize',
    '  \\vspace{0.5em}',
    '  \\\\',
    '  \\textit{Note: The CBOR package requires less testing as it wraps functions from an external library.}',
    '\\end{table}',
  );

  // Sort: apps first, then packages, then examples — alphabetically within each
  const sorted = [...groups.entries()].sort(([a], [b]) => {
    const order = (k: string) =>
      k.startsWith('apps/') ? 0 : k.startsWith('packages/') ? 1 : 2;
    return order(a) - order(b) || a.localeCompare(b);
  });

  const latexLines = [
    '\\begin{table}[ht]',
    '\\centering',
    '\\begin{tabular}{|l|c|c|c|c|}',
    '\\hline',
    '\\textbf{Module} & \\textbf{Statements} & \\textbf{Branches} & \\textbf{Functions} & \\textbf{Lines} \\\\',
    '\\hline',
  ];

  for (const [key, g] of sorted) {
    const name = escapeLatex(key);
    const stmt = pct(g.stmtCovered, g.stmtTotal);
    const branch = pct(g.branchCovered, g.branchTotal);
    const fn = pct(g.fnCovered, g.fnTotal);
    const line = pct(g.lineCovered, g.lineTotal);

    latexLines.push(
      `${name} & ${stmt}\\% & ${branch}\\% & ${fn}\\% & ${line}\\% \\\\`,
    );
  }

  latexLines.push(
    '\\hline',
    '\\end{tabular}',
    '\\caption{Code Coverage Summary by Module}',
    '\\label{tab:coverage}',
    '\\end{table}',
  );

  printSection('Overall Coverage Summary', overallTableLines.join('\n'));
  printSection('Coverage by Key Package', keyPackageTableLines.join('\n'));
  printSection('Coverage Summary by Module', latexLines.join('\n'));
} catch (error) {
  console.error('❌ An error occurred during conversion:', error);
  process.exit(1);
}
