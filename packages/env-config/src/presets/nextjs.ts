import type { StandardSchemaDictionary } from '@t3-oss/env-core';
import z from 'zod';

export const NEXTJS_ENV = {
  NEXT_PUBLIC_APP_NAME: z.string(),
} as const satisfies StandardSchemaDictionary;
