import { Schema } from 'effect';

import { AuthType } from '../../enums/AuthType';

export const AuthTypeSchema = Schema.Enums(AuthType).annotations({
  description: 'Auth type',
  examples: [AuthType.SESSION],
});
