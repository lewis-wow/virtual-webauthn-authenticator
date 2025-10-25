import { sValidator } from '@hono/standard-validator';
import type { ZodType } from 'zod';
import type { ZodOpenApiOperationObject } from 'zod-openapi';

export const validator = <T extends ZodOpenApiOperationObject>(operation: T) =>
  [
    operation.requestBody?.content['application/json']?.schema &&
      sValidator(
        'json',
        operation.requestBody?.content['application/json']?.schema,
      ),
  ].filter(Boolean);
