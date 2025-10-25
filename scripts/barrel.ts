#!/usr/bin/env tsx
import { execSync } from 'child_process';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';

import config from '../.barrelsby.json';

const HEADER_CONTENT = `/**
 * @file Automatically generated.
 *
 * @noprettier
 */
`;

console.log('🌀 Starting barrel generation...');

const configPath = path.join(import.meta.dirname, '..', '.barrelsby.json');
try {
  execSync(`npx barrelsby --config ${configPath}`, {
    stdio: 'inherit',
  });

  const originalContent = await readFile(config.output, 'utf-8');
  const newContent = `${HEADER_CONTENT}\n${originalContent}`;
  await writeFile(config.output, newContent);
} catch (error) {
  console.error('❌ An error occurred during barrel generation:');
  process.exit(1);
}
