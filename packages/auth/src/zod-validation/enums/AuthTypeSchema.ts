import z from 'zod';

import { AuthType } from '../../enums/AuthType';

export const AuthTypeSchema = z.enum(AuthType).meta({
  description: 'Auth type',
  examples: [AuthType.SESSION],
});
