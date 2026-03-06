import { assertSchema } from '@repo/assert';
import { Exception } from '@repo/exception';
import {
  UserVerificationRequired,
  UserVerificationRequiredDataSchema,
} from '@repo/virtual-authenticator/authenticator';
import z from 'zod';

export class UserVerificationRequiredAgentException extends Exception<UserVerificationRequiredAgentExceptionData> {
  static readonly code = UserVerificationRequired.code;
  static readonly status = UserVerificationRequired.status;
  static readonly message = 'User Verification (UV) is required to proceed.';

  constructor(data: UserVerificationRequiredAgentExceptionData) {
    assertSchema(data, UserVerificationRequiredAgentExceptionDataSchema);

    super({ data });
  }
}

export const UserVerificationRequiredAgentExceptionDataSchema =
  UserVerificationRequiredDataSchema.extend({
    stateToken: z.string(),
  });

export type UserVerificationRequiredAgentExceptionData = z.infer<
  typeof UserVerificationRequiredAgentExceptionDataSchema
>;
