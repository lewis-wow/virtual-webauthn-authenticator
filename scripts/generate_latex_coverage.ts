#!/usr/bin/env tsx
import { readFile } from 'fs/promises';
import { resolve } from 'path';

console.log('🌀 Starting coverage to LaTeX conversion...');

const DEFAULT_INPUT = './coverage/coverage-final.json';
const inputPath = resolve(process.argv[2] ?? DEFAULT_INPUT);

type BranchHits = number[];

interface FileCoverage {
  statementMap: Record<string, { start: { line: number } }>;
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

function pct(covered: number, total: number): string {
  if (total === 0) return '100.00';
  return ((covered / total) * 100).toFixed(2);
}

function escapeLatex(s: string): string {
  return s.replace(/_/g, '\\_');
}

/** Extract the group key (e.g. "apps/api-bff" or "packages/auth") from an
 *  absolute file path, relative to the project root. */
function groupKey(filePath: string): string | null {
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
}

try {
  const fileContent = await readFile(inputPath, 'utf-8');
  const data = JSON.parse(fileContent) as Record<string, FileCoverage>;

  // Aggregate per group
  const groups = new Map<string, GroupMetrics>();

  for (const [filePath, fc] of Object.entries(data)) {
    const key = groupKey(filePath);
    if (!key) continue;

    if (!groups.has(key)) {
      groups.set(key, {
        stmtTotal: 0,
        stmtCovered: 0,
        branchTotal: 0,
        branchCovered: 0,
        fnTotal: 0,
        fnCovered: 0,
        lineTotal: 0,
        lineCovered: 0,
      });
    }

    const g = groups.get(key)!;

    // Statements
    g.stmtTotal += Object.keys(fc.statementMap).length;
    g.stmtCovered += Object.values(fc.s).filter((n) => n > 0).length;

    // Branches (each branch entry is an array of arm hit counts)
    for (const arms of Object.values(fc.b)) {
      g.branchTotal += arms.length;
      g.branchCovered += arms.filter((n) => n > 0).length;
    }

    // Functions
    g.fnTotal += Object.keys(fc.fnMap).length;
    g.fnCovered += Object.values(fc.f).filter((n) => n > 0).length;

    // Lines: collect unique line numbers and whether they were hit
    const lineHit = new Map<number, boolean>();
    for (const [id, loc] of Object.entries(fc.statementMap)) {
      const line = loc.start.line;
      const hit = (fc.s[id] ?? 0) > 0;
      lineHit.set(line, (lineHit.get(line) ?? false) || hit);
    }
    g.lineTotal += lineHit.size;
    g.lineCovered += [...lineHit.values()].filter(Boolean).length;
  }

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

  console.log('\n✅ Generated LaTeX Code:\n');
  console.log(latexLines.join('\n'));
} catch (error) {
  console.error('❌ An error occurred during conversion:', error);
  process.exit(1);
}
