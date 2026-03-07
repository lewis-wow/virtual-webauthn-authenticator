import { assertSchema } from '@repo/assert';
import { Exception } from '@repo/exception';
import {
  UserPresenceRequiredDataSchema,
  UserPresenceRequired,
} from '@repo/virtual-authenticator/exceptions';
import z from 'zod';

export class UserPresenceRequiredAgentException extends Exception<UserPresenceRequiredAgentExceptionData> {
  static readonly code = UserPresenceRequired.code;
  static readonly status = UserPresenceRequired.status;
  static readonly message = 'User Presence (UP) is required to proceed.';

  constructor(data: UserPresenceRequiredAgentExceptionData) {
    assertSchema(data, UserPresenceRequiredAgentExceptionDataSchema);

    super({ data });
  }
}

export const UserPresenceRequiredAgentExceptionDataSchema =
  UserPresenceRequiredDataSchema.extend({
    stateToken: z.string(),
  });

export type UserPresenceRequiredAgentExceptionData = z.infer<
  typeof UserPresenceRequiredAgentExceptionDataSchema
>;
