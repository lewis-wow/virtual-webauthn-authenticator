#!/usr/bin/env tsx
import { generateOpenApi, SchemaTransformerSync } from '@ts-rest/open-api';
import { JSONSchema, Schema, SchemaAST, Option } from 'effect';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { stringify } from 'yaml';

import { nestjsContract } from '../src/nestjs/index';

export const EFFECT_ASYNC: SchemaTransformerSync = ({ schema }) => {
  if (Schema.isSchema(schema)) {
    try {
      // 1. Generate the standard JSON Schema
      const jsonSchema = JSONSchema.make(schema);

      // 2. Try to extract the 'identifier' annotation from the Effect AST
      const identifierOption = SchemaAST.getIdentifierAnnotation(schema.ast);
      const identifier = Option.getOrUndefined(identifierOption);

      // If we have an identifier, we want to treat this as a Component
      if (identifier) {
        // Case A: Effect wrapped it in $defs (Standard behavior for identifiers)
        if (jsonSchema.$ref && jsonSchema.$defs) {
          const refName = jsonSchema.$ref.replace('#/$defs/', '');
          const innerSchema = jsonSchema.$defs[refName];

          if (innerSchema) {
            return {
              ...innerSchema,
              title: identifier, // <--- Inject identifier as Title here
              // Preserve definitions in case of nested references
              $defs: jsonSchema.$defs,
            };
          }
        }

        // Case B: No wrapping (Rare for identifiers, but possible)
        return {
          ...jsonSchema,
          title: identifier, // <--- Inject identifier as Title here
        };
      }

      // If no identifier, return as is
      return jsonSchema;
    } catch (error) {
      console.error('Schema transform error:', error);
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
