#!/usr/bin/env tsx
import { generateOpenApi, SchemaTransformerSync } from '@ts-rest/open-api';
import { JSONSchema, Schema } from 'effect';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { stringify } from 'yaml';

import { nestjsContract } from '../src/nestjs/index';

export const EFFECT_SYNC: SchemaTransformerSync = ({ schema }) => {
  if (Schema.isSchema(schema)) {
    const jsonSchema = JSONSchema.make(schema);

    return jsonSchema as object;
  }

  return null;
};

const openApiDocument = generateOpenApi(
  nestjsContract,
  {
    info: {
      title: 'API',
      version: '1.0.0',
    },
  },
  {
    schemaTransformer: EFFECT_SYNC,
    setOperationId: 'concatenated-path',
  },
);

const dir = join(import.meta.dirname, '..', 'generated');

mkdirSync(dir, { recursive: true });

writeFileSync(
  join(dir, 'openapi.yml'),
  stringify(openApiDocument, { aliasDuplicateObjects: false }),
);

writeFileSync(join(dir, 'openapi.json'), JSON.stringify(openApiDocument));
