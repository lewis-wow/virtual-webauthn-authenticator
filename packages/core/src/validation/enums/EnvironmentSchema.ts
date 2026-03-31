import { z } from 'zod';

import { Environment } from '../../enums/Environment';

export const EnvironmentSchema = z.enum(Environment).meta({
  description: 'Environment',
  examples: [Environment.PRODUCTION],
});
