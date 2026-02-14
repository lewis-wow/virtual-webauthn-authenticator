import z from 'zod';

import { AuthenticationStateSchema } from './AuthenticationStateSchema';
import { StateActionSchema } from './StateActionSchema';

export const AuthenticationPrevStateSchema = AuthenticationStateSchema.extend(
  {},
);
export type AuthenticationPrevState = z.infer<
  typeof AuthenticationPrevStateSchema
>;

export const AuthenticationPrevStateWithActionSchema =
  AuthenticationPrevStateSchema.extend({
    action: StateActionSchema,
  });
export type AuthenticationPrevStateWithAction = z.infer<
  typeof AuthenticationPrevStateWithActionSchema
>;
