import { assertSchema } from '@repo/assert';
import { Exception } from '@repo/exception';
import z from 'zod';

import {
  UserPresenceRequiredDataSchema,
  UserPresenceRequired,
} from '../../authenticator/exceptions/UserPresenceRequired';

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
