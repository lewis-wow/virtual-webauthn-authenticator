import type { StandardSchemaDictionary } from '@t3-oss/env-core';
import z from 'zod';

export const BASE_ENV = {
  ENVIRONMENT: z.enum(['production', 'development', 'test']),
  APP_NAME: z.string(),
} as const satisfies StandardSchemaDictionary;
