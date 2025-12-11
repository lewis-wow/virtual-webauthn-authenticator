import type { StandardSchemaDictionary } from '@t3-oss/env-core';
import z from 'zod';

export const WXT_ENV = {
  WXT_APP_NAME: z.string(),
} as const satisfies StandardSchemaDictionary;
