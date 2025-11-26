import type { ValueOfEnum } from '@repo/types';

export const Environment = {
  PRODUCTION: 'production',
  DEVELOPMENT: 'development',
  TEST: 'test',
} as const;

export type Environment = ValueOfEnum<typeof Environment>;
