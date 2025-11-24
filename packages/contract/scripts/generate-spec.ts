#!/usr/bin/env tsx
import { generateOpenApi, SchemaTransformerSync } from '@ts-rest/open-api';
import { JSONSchema, Schema } from 'effect';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { stringify } from 'yaml';

import { nestjsContract } from '../src/nestjs/index';

export const EFFECT_ASYNC: SchemaTransformerSync = ({ schema }) => {
  if (Schema.isSchema(schema)) {
    try {
      const jsonSchema = JSONSchema.make(schema);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
      const { $schema: _, ...rest } = jsonSchema as any;

      return rest as object;
    } catch (error) {
      console.error(error, schema);
    }
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
