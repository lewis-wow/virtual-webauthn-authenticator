import z from 'zod';

import { StateType } from './StateType';

export const AuthenticationStateSchema = z.object({
  type: z.literal(StateType.AUTHENTICATION),
  optionsHash: z.string(),
  up: z.boolean().optional(),
  uv: z.boolean().optional(),
  credentialId: z.string().optional(),
});

export type AuthenticationState = z.infer<typeof AuthenticationStateSchema>;
