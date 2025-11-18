#!/usr/bin/env tsx
import { execSync } from 'child_process';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';

const HEADER_CONTENT = `/**
 * @file Automatically generated.
 *
 * @noprettier
 */
`;

console.log('🌀 Starting barrel generation...');

const DEFAULT_DIRECTORY = './src';
const DEFAULT_OUTPUT = './src/index.ts';

const directory = process.argv[1] ?? DEFAULT_DIRECTORY;
const output = process.argv[2] ?? DEFAULT_OUTPUT;

const configPath = path.join(import.meta.dirname, '..', '.barrelsby.json');
try {
  execSync(
    `npx barrelsby --config ${configPath} --directory ${directory} --output ${output}`,
    {
      stdio: 'inherit',
    },
  );

  const originalContent = await readFile(output, 'utf-8');
  const newContent = `${HEADER_CONTENT}\n${originalContent}`;
  await writeFile(output, newContent);
} catch (error) {
  console.error('❌ An error occurred during barrel generation:');
  process.exit(1);
}
