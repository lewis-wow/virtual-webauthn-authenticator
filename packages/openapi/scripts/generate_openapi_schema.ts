#!/usr/bin/env tsx
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { stringify } from 'yaml';

import { openApiDocument } from '../src/index.js';

const yaml = stringify(openApiDocument, { aliasDuplicateObjects: false });
const json = JSON.stringify(openApiDocument);

mkdirSync(join(import.meta.dirname, '..', 'src/generated'), {
  recursive: true,
});

writeFileSync(
  join(import.meta.dirname, '..', 'src/generated/openapi.yml'),
  yaml,
);

writeFileSync(
  join(import.meta.dirname, '..', 'src/generated/openapi.json'),
  json,
);
