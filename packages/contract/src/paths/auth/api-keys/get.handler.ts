import { ApikeySchema } from '@repo/validation';
import z from 'zod';
import type { ZodOpenApiOperationObject } from 'zod-openapi';

export const GET = {
  responses: {
    200: {
      description: 'Successful response',
      content: {
        'application/json': {
          schema: z.array(ApikeySchema),
        },
      },
    },
  },
} as const satisfies ZodOpenApiOperationObject;
