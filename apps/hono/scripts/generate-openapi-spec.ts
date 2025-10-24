#!/usr/bin/env tsx
import { root } from '@/routes';
import { generateSpecs } from 'hono-openapi';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

console.log('generate openapi spec');

const specs = await generateSpecs(root, {
  documentation: {
    openapi: '3.1.0',
    info: {
      title: 'API',
      version: '1.0.0',
      description: 'API',
    },
  },
});
const dirname = join(import.meta.dirname, '..', 'static');

mkdirSync(dirname, { recursive: true });

writeFileSync(join(dirname, 'openapi.json'), JSON.stringify(specs, null, 2));
