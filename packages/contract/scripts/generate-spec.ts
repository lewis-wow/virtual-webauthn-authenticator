#!/usr/bin/env tsx
import { generateOpenApi, SchemaTransformerSync } from '@ts-rest/open-api';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { stringify } from 'yaml';
import { z } from 'zod';
import { zodToTs, printNode, createAuxiliaryTypeStore } from 'zod-to-ts';

import { nestjsContract } from '../src/nestjs';

export const ZOD_4_SYNC: SchemaTransformerSync = ({ schema }) => {
  if (schema instanceof z.core.$ZodType) {
    try {
      const jsonSchema = z.toJSONSchema(schema, {
        io: 'input',
      });

      return jsonSchema as object;
    } catch {
      const auxiliaryTypeStore = createAuxiliaryTypeStore();

      const { node } = zodToTs(schema, {
        auxiliaryTypeStore,
        io: 'input',
        unrepresentable: 'any',
      });

      console.error('Error in node:', printNode(node));
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
    schemaTransformer: ZOD_4_SYNC,
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
