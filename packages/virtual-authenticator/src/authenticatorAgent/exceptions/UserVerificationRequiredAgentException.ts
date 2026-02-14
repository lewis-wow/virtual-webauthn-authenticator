import { assertSchema } from '@repo/assert';
import { Exception } from '@repo/exception';
import z from 'zod';

export class UserVerificationRequiredAgentException extends Exception<UserVerificationRequiredAgentExceptionData> {
  static readonly code = 'USER_VERIFICATION_REQUIRED';
  static readonly status = 400;
  static readonly message = 'User Verification (UV) is required to proceed.';

  constructor(data: UserVerificationRequiredAgentExceptionData) {
    assertSchema(data, UserVerificationRequiredAgentExceptionDataSchema);

    super({ data });
  }
}

export const UserVerificationRequiredAgentExceptionDataSchema = z.object({
  stateToken: z.string(),
});

export type UserVerificationRequiredAgentExceptionData = z.infer<
  typeof UserVerificationRequiredAgentExceptionDataSchema
>;
