import { assertSchema } from '@repo/assert';
import { Exception } from '@repo/exception';
import { HttpStatusCode } from '@repo/http';
import z from 'zod';

import { ApplicablePublicKeyCredentialSchema } from '../../validation/spec/ApplicablePublicKeyCredentialSchema';

export class CredentialSelectAgentException extends Exception<CredentialSelectAgentExceptionData> {
  static readonly code = 'CredentialSelectAgentException';
  static message = 'Credential select required.';
  static status = HttpStatusCode.PRECONDITION_REQUIRED_428;

  constructor(data: CredentialSelectAgentExceptionData) {
    assertSchema(data, CredentialSelectAgentExceptionDataSchema);

    super({ data });
  }
}

export const CredentialSelectAgentExceptionDataSchema = z.object({
  stateToken: z.string(),
  credentialOptions: z.array(ApplicablePublicKeyCredentialSchema),
});

export type CredentialSelectAgentExceptionData = z.infer<
  typeof CredentialSelectAgentExceptionDataSchema
>;
