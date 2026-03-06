import z from 'zod';

import { BaseStateSchema } from './BaseStateSchema';

export const UserVerificationStateSchema = BaseStateSchema.extend({
  uv: z.object({
    pin: z.string().optional(),
  }),
});

export type UserVerificationState = z.infer<typeof UserVerificationStateSchema>;
