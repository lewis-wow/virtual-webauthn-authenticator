#!/usr/bin/env tsx
import convert from '@openapi-contrib/json-schema-to-openapi-schema';
import { generateOpenApi, SchemaTransformerAsync } from '@ts-rest/open-api';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { stringify } from 'yaml';
import z from 'zod';

import { contract } from '../src';

export const ZOD_4_ASYNC: SchemaTransformerAsync = async ({ schema }) => {
  if (schema instanceof z.ZodType) {
    const jsonSchema = z.toJSONSchema(schema, {
      io: 'input',
    });

    const converted = await convert(jsonSchema);

    return converted;
  }
  return null;
};

const openApiDocument = generateOpenApi(
  contract,
  {
    info: {
      title: 'Posts API',
      version: '1.0.0',
    },
  },
  {
    schemaTransformer: ZOD_4_ASYNC,
  },
);

const dir = join(import.meta.dirname, '..', 'generated');

mkdirSync(dir, { recursive: true });

writeFileSync(
  join(dir, 'openapi.yml'),
  stringify(openApiDocument, { aliasDuplicateObjects: false }),
);

writeFileSync(join(dir, 'openapi.json'), JSON.stringify(openApiDocument));
