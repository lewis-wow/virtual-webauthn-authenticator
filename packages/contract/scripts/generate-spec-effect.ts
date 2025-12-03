#!/usr/bin/env tsx
import { convertSync } from '@openapi-contrib/json-schema-to-openapi-schema';
import { generateOpenApi, SchemaTransformerSync } from '@ts-rest/open-api';
import { JSONSchema, Schema } from 'effect';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { stringify } from 'yaml';

import { nestjsContract } from '../src/nestjs/index';

// 1. Global Registry to hold extracted schemas
// This solves the "Fresh Object" problem by storing them by name.
const extractedComponents: Record<string, any> = {};

// Helper: Rewrites Effect's "#/$defs/MyType" to OpenAPI's "#/components/schemas/MyType"
const resolveRefs = (obj: any): any => {
  if (Array.isArray(obj)) return obj.map(resolveRefs);
  if (typeof obj === 'object' && obj !== null) {
    const newObj: any = {};
    for (const key in obj) {
      if (key === '$ref' && typeof obj[key] === 'string') {
        newObj[key] = obj[key].replace('#/$defs/', '#/components/schemas/');
      } else {
        newObj[key] = resolveRefs(obj[key]);
      }
    }
    return newObj;
  }
  return obj;
};

export const EFFECT_SYNC: SchemaTransformerSync = ({ schema }) => {
  if (Schema.isSchema(schema)) {
    // Generate the raw JSON Schema
    const jsonSchema = JSONSchema.make(schema) as any;

    // 2. Intercept Definitions
    // If Effect generated local $defs, we steal them and put them in our global registry
    if (jsonSchema.$defs) {
      for (const [name, definition] of Object.entries(jsonSchema.$defs)) {
        if (!extractedComponents[name]) {
          extractedComponents[name] = resolveRefs(definition);
        }
      }
      // Delete them from the local object so they don't get inlined
      delete jsonSchema.$defs;
    }

    // 3. Clean up the main schema
    // Fix refs in the main object and convert to OpenAPI 3.0 compatible format
    const cleanSchema = resolveRefs(jsonSchema);
    return convertSync(cleanSchema);
  }

  return null;
};

const openApiDocument = generateOpenApi(
  nestjsContract,
  {
    info: { title: 'API', version: '1.0.0' },
    // Initialize components
    components: { schemas: {} },
  },
  {
    schemaTransformer: EFFECT_SYNC, // Use our smart transformer
    setOperationId: 'concatenated-path',
  },
);

// 4. Inject Extracted Schemas
// We merge our captured definitions into the final document
if (openApiDocument.components) {
  openApiDocument.components.schemas = {
    ...openApiDocument.components.schemas,
    ...extractedComponents,
  };
}

// Write files
const dir = join(import.meta.dirname, '..', 'generated');
mkdirSync(dir, { recursive: true });

writeFileSync(
  join(dir, 'openapi.yml'),
  stringify(openApiDocument, { aliasDuplicateObjects: false }),
);
writeFileSync(
  join(dir, 'openapi.json'),
  JSON.stringify(openApiDocument, null, 2),
);
