#!/usr/bin/env tsx
import ejs from 'ejs';
import { readdir, readFile, writeFile } from 'fs/promises';
import path from 'path';

const targetDir = process.argv[2];
if (!targetDir) {
  console.error('❌ Please provide a target directory.');
  process.exit(1);
}

const fullPath = path.resolve(process.cwd(), targetDir);
const dirName = path.basename(fullPath);
const outputFile = path.join(fullPath, 'index.ts');

console.log(`🌀 Generating barrel file for "${dirName}"...`);

const templatePath = path.join(import.meta.dirname, 'barrel.ejs');
const ejsTemplate = await readFile(templatePath, 'utf-8');

const files = await readdir(fullPath);
const moduleImports = files
  .filter(
    (file) =>
      file !== 'index.ts' && (file.endsWith('.ts') || file.endsWith('.tsx')),
  )
  .map((file) => `./${path.parse(file).name}`);

const content = ejs.render(ejsTemplate, { moduleImports });

await writeFile(outputFile, content + '\n');

console.log(`✅ Barrel file generated at "${targetDir}/index.ts"`);
