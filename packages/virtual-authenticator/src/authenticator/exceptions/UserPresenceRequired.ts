import { Exception } from '@repo/exception';
import { HttpStatusCode } from '@repo/http';
import z from 'zod';

export class UserPresenceRequired extends Exception<UserPresenceRequiredData> {
  static readonly code = 'UserPresenceRequired';
  static readonly status = HttpStatusCode.PRECONDITION_REQUIRED_428;
  static readonly message = 'User Presence (UP) is required to proceed.';

  constructor(data: UserPresenceRequiredData) {
    super({ data });
  }
}

export const UserPresenceRequiredDataSchema = z.object({
  requireUserVerification: z.boolean(),
  requireUserPresence: z.boolean(),
});

export type UserPresenceRequiredData = z.infer<
  typeof UserPresenceRequiredDataSchema
>;
