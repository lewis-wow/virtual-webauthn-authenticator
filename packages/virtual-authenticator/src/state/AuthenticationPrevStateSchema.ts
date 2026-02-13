import z from 'zod';

import { AuthenticationStateSchema } from './AuthenticationStateSchema';

export const AuthenticationPrevStateSchema = AuthenticationStateSchema.extend({
  optionsHash: z.string(),
});

export type AuthenticationPrevState = z.infer<
  typeof AuthenticationPrevStateSchema
>;
