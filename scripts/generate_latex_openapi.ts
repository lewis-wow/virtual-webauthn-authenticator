#!/usr/bin/env tsx
import { readFile } from 'fs/promises';
import { resolve } from 'path';

console.log('🌀 Starting OpenAPI to LaTeX conversion...');

const DEFAULT_INPUT = './packages/contract/generated/openapi.json';
const HTTP_METHODS = [
  'get',
  'post',
  'put',
  'patch',
  'delete',
  'options',
  'head',
];
const inputPath = resolve(process.argv[2] ?? DEFAULT_INPUT);

type OpenApiDocument = {
  openapi?: string;
  info?: {
    title?: string;
    version?: string;
  };
  paths?: Record<string, PathItem>;
  components?: {
    schemas?: Record<string, SchemaObject>;
  };
};

type PathItem = {
  [method: string]: OperationObject | unknown;
};

type OperationObject = {
  summary?: string;
  operationId?: string;
};

type SchemaObject = {
  $ref?: string;
  title?: string;
  id?: string;
  type?: string;
  format?: string;
  properties?: Record<string, SchemaObject>;
  required?: string[];
  items?: SchemaObject;
  anyOf?: SchemaObject[];
  oneOf?: SchemaObject[];
  allOf?: SchemaObject[];
  enum?: unknown[];
  const?: unknown;
};

type ApiRow = {
  method: string;
  path: string;
  description: string;
};

type SchemaRow = {
  name: string;
  kind: string;
  propertyCount: number;
  requiredCount: number;
};

const escapeLatex = (value: string): string => {
  return value
    .replace(/\\/g, '\\textbackslash{}')
    .replace(/&/g, '\\&')
    .replace(/%/g, '\\%')
    .replace(/\$/g, '\\$')
    .replace(/#/g, '\\#')
    .replace(/_/g, '\\_')
    .replace(/{/g, '\\{')
    .replace(/}/g, '\\}')
    .replace(/~/g, '\\textasciitilde{}')
    .replace(/\^/g, '\\textasciicircum{}');
};

const truncate = (value: string, maxLength: number): string => {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 3)}...`;
};

const schemaLabel = (schema?: SchemaObject): string => {
  if (!schema) {
    return '-';
  }

  if (schema.$ref) {
    const parts = schema.$ref.split('/');
    return parts[parts.length - 1] ?? schema.$ref;
  }

  if (schema.enum?.length) {
    return `enum[${schema.enum.length}]`;
  }

  if (schema.const !== undefined) {
    return 'const';
  }

  if (schema.anyOf?.length) {
    const labels = [...new Set(schema.anyOf.map((item) => schemaLabel(item)))];
    return truncate(labels.join(' | '), 40);
  }

  if (schema.oneOf?.length) {
    const labels = [...new Set(schema.oneOf.map((item) => schemaLabel(item)))];
    return truncate(labels.join(' | '), 40);
  }

  if (schema.allOf?.length) {
    const labels = [...new Set(schema.allOf.map((item) => schemaLabel(item)))];
    return truncate(`allOf(${labels.join(', ')})`, 40);
  }

  if (schema.type === 'array') {
    return `array<${schemaLabel(schema.items)}>`;
  }

  if (schema.type) {
    return schema.format ? `${schema.type} (${schema.format})` : schema.type;
  }

  return schema.title ?? schema.id ?? 'object';
};

const summarizeDescription = (operation: OperationObject): string => {
  return truncate(operation.summary ?? '-', 72);
};

const buildApiRows = (document: OpenApiDocument): ApiRow[] => {
  const rows: ApiRow[] = [];

  for (const [path, pathItem] of Object.entries(document.paths ?? {})) {
    for (const method of HTTP_METHODS) {
      const operation = pathItem[method];
      if (!operation || typeof operation !== 'object') {
        continue;
      }

      const typedOperation = operation as OperationObject;
      rows.push({
        method: method.toUpperCase(),
        path,
        description: summarizeDescription(typedOperation),
      });
    }
  }

  return rows.sort(
    (left, right) =>
      left.path.localeCompare(right.path) ||
      left.method.localeCompare(right.method),
  );
};

const buildSchemaRows = (document: OpenApiDocument): SchemaRow[] => {
  return Object.entries(document.components?.schemas ?? {})
    .map(([name, schema]) => ({
      name,
      kind: schemaLabel(schema),
      propertyCount: Object.keys(schema.properties ?? {}).length,
      requiredCount: schema.required?.length ?? 0,
    }))
    .sort((left, right) => left.name.localeCompare(right.name));
};

const printSection = (title: string, content: string): void => {
  const divider = '='.repeat(24);
  console.log(`\n${divider} ${title} ${divider}\n`);
  console.log(content);
};

try {
  const fileContent = await readFile(inputPath, 'utf-8');
  const document = JSON.parse(fileContent) as OpenApiDocument;
  const apiRows = buildApiRows(document);
  const schemaRows = buildSchemaRows(document);

  const overviewTableLines = [
    '\\begin{table}[H]',
    '  \\centering',
    '  \\caption{OpenAPI Document Summary}',
    '  \\label{tab:openapi_summary}',
    '  \\begin{tabular}{lr}',
    '    \\toprule',
    '    \\textbf{Metric} & \\textbf{Value} \\\\',
    '    \\midrule',
    `    Title & ${escapeLatex(document.info?.title ?? '-')} \\\\`,
    `    OpenAPI version & ${escapeLatex(document.openapi ?? '-')} \\\\`,
    `    API version & ${escapeLatex(document.info?.version ?? '-')} \\\\`,
    `    Paths & ${Object.keys(document.paths ?? {}).length} \\\\`,
    `    Operations & ${apiRows.length} \\\\`,
    `    Component schemas & ${schemaRows.length} \\\\`,
    '    \\bottomrule',
    '  \\end{tabular}',
    '\\end{table}',
  ];

  const endpointTableLines = [
    '\\begin{table}[H]',
    '  \\centering',
    '  \\caption{OpenAPI Endpoint Summary}',
    '  \\label{tab:openapi_endpoints}',
    '  \\begin{tabularx}{\\textwidth}{@{}l l X@{}}',
    '    \\toprule',
    '    \\textbf{Method} & \\textbf{Path} & \\textbf{Description} \\\\',
    '    \\midrule',
  ];

  for (const row of apiRows) {
    endpointTableLines.push(
      `    ${escapeLatex(row.method)} & ${escapeLatex(row.path)} & ${escapeLatex(row.description)} \\\\`,
    );
  }

  endpointTableLines.push(
    '    \\bottomrule',
    '  \\end{tabularx}',
    '\\end{table}',
  );

  const schemaTableLines = [
    '\\begin{table}[H]',
    '  \\centering',
    '  \\caption{OpenAPI Component Schema Summary}',
    '  \\label{tab:openapi_schemas}',
    '  \\begin{tabular}{p{6.5cm}p{4.5cm}rr}',
    '    \\toprule',
    '    \\textbf{Schema} & \\textbf{Kind} & \\textbf{Properties} & \\textbf{Required} \\\\',
    '    \\midrule',
  ];

  for (const row of schemaRows) {
    schemaTableLines.push(
      `    ${escapeLatex(row.name)} & ${escapeLatex(row.kind)} & ${row.propertyCount} & ${row.requiredCount} \\\\`,
    );
  }

  schemaTableLines.push('    \\bottomrule', '  \\end{tabular}', '\\end{table}');

  printSection('OpenAPI Document Summary', overviewTableLines.join('\n'));
  printSection('OpenAPI Endpoint Summary', endpointTableLines.join('\n'));
  printSection('OpenAPI Component Schema Summary', schemaTableLines.join('\n'));
} catch (error) {
  console.error('❌ An error occurred during conversion:', error);
  process.exit(1);
}
