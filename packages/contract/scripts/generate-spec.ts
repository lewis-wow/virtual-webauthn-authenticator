#!/usr/bin/env tsx
import { generateOpenApi, SchemaTransformerAsync } from '@ts-rest/open-api';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { stringify } from 'yaml';
import { z } from 'zod';

import { nestjsContract } from '../src/zod-nestjs/index';

export const ZOD_4_ASYNC: SchemaTransformerAsync = async ({ schema }) => {
  if (schema instanceof z.core.$ZodObject) {
    const jsonSchema = z.toJSONSchema(schema, {
      io: 'input',
    });

    console.log(jsonSchema);

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
    openapi: '3.1.0',
  },
  {
    schemaTransformer: ZOD_4_ASYNC,
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
