#!/usr/bin/env -S npx tsx
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { stringify } from 'yaml';

import { openApiDocument } from '../src/openApiDocument.js';

const yaml = stringify(openApiDocument, { aliasDuplicateObjects: false });

mkdirSync(join(import.meta.dirname, '..', 'generated'), { recursive: true });

writeFileSync(join(import.meta.dirname, '..', 'generated/openapi.yml'), yaml);
