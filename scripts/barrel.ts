#!/usr/bin/env tsx
/// <reference types="node" />
import { execSync } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const HEADER_CONTENT = `/**
 * @file Automatically generated.
 *
 * @noprettier
 */
`;

console.log('🌀 Starting barrel generation...');

const DEFAULT_DIRECTORY = './src';

const directory = process.argv[2] ?? DEFAULT_DIRECTORY;
const output = `${directory}/index.ts`;

console.log('Directory: ', directory);

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
