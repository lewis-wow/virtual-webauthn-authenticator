import { Environment } from '@repo/enums';
import { z } from 'zod';

export const EnvironmentSchema = z.enum(Environment).meta({
  description: 'Environment',
  examples: [Environment.PRODUCTION],
});
