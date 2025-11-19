import { Schema } from 'effect';

import { Environment } from '../../enums/Environment';

export const EnvironmentSchema = Schema.Enums(Environment).annotations({
  description: 'Environment',
  examples: [Environment.PRODUCTION],
});
