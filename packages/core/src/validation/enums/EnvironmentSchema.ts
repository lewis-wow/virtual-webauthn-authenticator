import { z } from 'zod';

import { Environment } from '@repo/enums';

export const EnvironmentSchema = z.enum(Environment).meta({
  description: 'Environment',
  examples: [Environment.PRODUCTION],
});
