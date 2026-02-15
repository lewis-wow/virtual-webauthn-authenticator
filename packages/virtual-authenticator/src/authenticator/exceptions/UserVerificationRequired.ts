import { Exception } from '@repo/exception';
import { HttpStatusCode } from '@repo/http';
import z from 'zod';

export class UserVerificationRequired extends Exception<UserVerificationRequiredData> {
  static readonly code = 'UserVerificationRequired';
  static readonly status = HttpStatusCode.PRECONDITION_REQUIRED_428;
  static readonly message = 'User Verification (UV) is required to proceed.';

  constructor(data: UserVerificationRequiredData) {
    super({ data });
  }
}

export const UserVerificationRequiredDataSchema = z.object({
  requireUserPresence: z.boolean(),
  requireUserVerification: z.boolean(),
});

export type UserVerificationRequiredData = z.infer<
  typeof UserVerificationRequiredDataSchema
>;
