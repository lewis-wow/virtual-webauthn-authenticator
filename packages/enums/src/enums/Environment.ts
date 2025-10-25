import z from 'zod';

import type { ValueOfEnum } from '../types';

export const Environment = {
  PRODUCTION: 'production',
  DEVELOPMENT: 'development',
  TEST: 'test',
} as const;

export type Environment = ValueOfEnum<typeof Environment>;

export const EnvironmentSchema = z.enum(Environment).meta({
  description: 'Environment',
  examples: [Environment.PRODUCTION],
});
