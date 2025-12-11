import type { StandardSchemaDictionary } from '@t3-oss/env-core';
import z from 'zod';

export const APP_ENV = {
  PORT: z.coerce.number(),
  BASE_URL: z.url(),
} as const satisfies StandardSchemaDictionary;
