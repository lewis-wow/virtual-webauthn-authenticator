#!/usr/bin/env tsx
import { generateOpenApi, SchemaTransformerSync } from '@ts-rest/open-api';
import { JSONSchema, Schema } from 'effect';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { stringify } from 'yaml';

import { contract } from '../src';

export const EFFECT_ASYNC: SchemaTransformerSync = ({ schema }) => {
  if (Schema.isSchema(schema)) {
    try {
      const jsonSchema = JSONSchema.make(schema);

      return jsonSchema as object;
    } catch (error) {
      console.error(error, schema);
    }
  }

  return null;
};

const openApiDocument = generateOpenApi(
  contract,
  {
    info: {
      title: 'API',
      version: '1.0.0',
    },
  },
  {
    schemaTransformer: EFFECT_ASYNC,
  },
);

const dir = join(import.meta.dirname, '..', 'generated');

mkdirSync(dir, { recursive: true });

writeFileSync(
  join(dir, 'openapi.yml'),
  stringify(openApiDocument, { aliasDuplicateObjects: false }),
);

writeFileSync(join(dir, 'openapi.json'), JSON.stringify(openApiDocument));
