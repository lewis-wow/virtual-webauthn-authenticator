import { assertSchema } from '@repo/assert';
import { Exception } from '@repo/exception';
import { HttpStatusCode } from '@repo/http';
import z from 'zod';

import {
  CredentialSelectExceptionDataSchema,
  CredentialSelectException,
} from '../../authenticator/exceptions/CredentialSelectException';

export class CredentialSelectAgentException extends Exception<CredentialSelectAgentExceptionData> {
  static readonly code = CredentialSelectException.code;
  static readonly message = 'Credential select required.';
  static readonly status = HttpStatusCode.PRECONDITION_REQUIRED_428;

  constructor(data: CredentialSelectAgentExceptionData) {
    assertSchema(data, CredentialSelectAgentExceptionDataSchema);

    super({ data });
  }
}

export const CredentialSelectAgentExceptionDataSchema =
  CredentialSelectExceptionDataSchema.extend({
    stateToken: z.string(),
  });

export type CredentialSelectAgentExceptionData = z.infer<
  typeof CredentialSelectAgentExceptionDataSchema
>;
