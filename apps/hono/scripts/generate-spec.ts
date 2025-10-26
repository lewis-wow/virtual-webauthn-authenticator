#!/usr/bin/env tsx
import { document } from '@repo/contract';
import { writeFileSync } from 'fs';
import { join } from 'path';
import { stringify } from 'yaml';

const yaml = stringify(document, { aliasDuplicateObjects: false });
const json = JSON.stringify(document);

writeFileSync(join(import.meta.dirname, '..', 'static/openapi.yml'), yaml);
writeFileSync(join(import.meta.dirname, '..', 'static/openapi.json'), json);
