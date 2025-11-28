#!/usr/bin/env tsx
import { generateOpenApi, SchemaTransformerSync } from '@ts-rest/open-api';
import { mkdirSync, writeFileSync } from 'fs';
import { JSONSchema4 } from 'json-schema';
import { join } from 'path';
import { stringify } from 'yaml';
import { z } from 'zod';
import { zodToTs, printNode, createAuxiliaryTypeStore } from 'zod-to-ts';

import { OpenApiRefsResolver } from '../src/lib/OpenApiRefsResolver';
import { nestjsContract } from '../src/nestjs';

const openApiRefsResolver = new OpenApiRefsResolver();

export const ZOD_4_ASYNC: SchemaTransformerSync = ({ schema }) => {
  if (schema instanceof z.core.$ZodType) {
    try {
      const jsonSchema = z.toJSONSchema(schema, {
        io: 'input',
        target: 'draft-4',
      });

      const openApiSchema = openApiRefsResolver.extract(
        jsonSchema as JSONSchema4,
      );

      return openApiSchema as object;
    } catch {
      const auxiliaryTypeStore = createAuxiliaryTypeStore();

      const { node } = zodToTs(schema, {
        auxiliaryTypeStore,
        io: 'input',
        unrepresentable: 'any',
      });

      console.error('error in node:', printNode(node));
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
    schemaTransformer: ZOD_4_ASYNC,
    setOperationId: 'concatenated-path',
  },
);

if (openApiDocument.components) {
  Object.assign(
    openApiDocument.components.schemas!,
    openApiRefsResolver.getComponents(),
  );
}

const dir = join(import.meta.dirname, '..', 'generated');

mkdirSync(dir, { recursive: true });

writeFileSync(
  join(dir, 'openapi.yml'),
  stringify(openApiDocument, { aliasDuplicateObjects: false }),
);

writeFileSync(join(dir, 'openapi.json'), JSON.stringify(openApiDocument));
