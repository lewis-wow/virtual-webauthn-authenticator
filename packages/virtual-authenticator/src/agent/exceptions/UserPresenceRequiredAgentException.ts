import { assertSchema } from '@repo/assert';
import { Exception } from '@repo/exception';
import z from 'zod';

export class UserPresenceRequiredAgentException extends Exception<UserPresenceRequiredAgentExceptionData> {
  static readonly code = 'USER_PRESENCE_REQUIRED';
  static readonly status = 400;
  static readonly message = 'User Presence (UP) is required to proceed.';

  constructor(data: UserPresenceRequiredAgentExceptionData) {
    assertSchema(data, UserPresenceRequiredAgentExceptionDataSchema);

    super({ data });
  }
}

export const UserPresenceRequiredAgentExceptionDataSchema = z.object({
  stateToken: z.string(),
});

export type UserPresenceRequiredAgentExceptionData = z.infer<
  typeof UserPresenceRequiredAgentExceptionDataSchema
>;
