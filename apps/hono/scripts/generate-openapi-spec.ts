#!/usr/bin/env tsx
import { root } from '@/routes';
import { generateSpecs } from 'hono-openapi';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const specs = await generateSpecs(root);
const dirname = join(import.meta.dirname, '..', 'static');

mkdirSync(dirname, { recursive: true });

writeFileSync(join(dirname, 'openapi.json'), JSON.stringify(specs, null, 2));
