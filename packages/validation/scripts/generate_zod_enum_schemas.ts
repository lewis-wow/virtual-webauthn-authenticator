#!/usr/bin/env -S npx tsx
import ejs from 'ejs';
import { readdir, readFile, writeFile } from 'fs/promises';
import path, { join } from 'path';

const IMPORT_ALIAS = '@repo/enums';
const OUTPUT_PATH = join(import.meta.dirname, '..', 'src/enums.ts');
const TEMPLATE_PATH = join(import.meta.dirname, '..', 'enums.template.ejs');
const TARGET_PATH = join(import.meta.dirname, '..', '..', 'enums/src/enums');

console.log(`🌀 Generating a Zod schema file for enums in "${TARGET_PATH}"`);

const files = await readdir(TARGET_PATH);

const enumFiles = files.filter(
  (file) => file.endsWith('.ts') && file !== 'index.ts',
);

const enumNames = enumFiles.map((file) => path.parse(file).name).sort();

const template = await readFile(
  path.resolve(import.meta.dirname, TEMPLATE_PATH),
  'utf-8',
);

const finalContent = ejs.render(template, {
  enumNames,
  importAlias: IMPORT_ALIAS,
});

await writeFile(OUTPUT_PATH, finalContent);

console.log(`✅ Generated enums schema`);
