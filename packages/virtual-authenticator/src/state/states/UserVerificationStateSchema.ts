import z from 'zod';

import { BaseStateSchema } from './BaseStateSchema';

export const UserVerificationStateSchema = BaseStateSchema.extend({
  uv: z.boolean(),
});

export type UserVerificationState = z.infer<typeof UserVerificationStateSchema>;
