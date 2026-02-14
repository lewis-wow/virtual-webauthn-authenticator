import z from 'zod';

import { BaseStateSchema } from './BaseStateSchema';

export const UserPresenceStateSchema = BaseStateSchema.extend({
  up: z.boolean(),
});

export type UserPresenceState = z.infer<typeof UserPresenceStateSchema>;
