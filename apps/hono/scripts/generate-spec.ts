#!/usr/bin/env tsx
import { openapiMetadata } from '@/openapi-metadata';
import { root } from '@/routes';
import { writeFileSync } from 'fs';
import { generateSpecs } from 'hono-openapi';
import { join } from 'path';
import { stringify } from 'yaml';

const specs = await generateSpecs(root, openapiMetadata as object);

const yaml = stringify(specs, { aliasDuplicateObjects: false });
const json = JSON.stringify(specs);

writeFileSync(join(import.meta.dirname, '..', 'static/openapi.yml'), yaml);
writeFileSync(join(import.meta.dirname, '..', 'static/openapi.json'), json);
