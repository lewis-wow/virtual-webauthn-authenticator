import { assertSchema } from '@repo/assert';
import { Exception } from '@repo/exception';
import { HttpStatusCode } from '@repo/http';
import z from 'zod';

import { ApplicablePublicKeyCredentialSchema } from '../../validation/spec/ApplicablePublicKeyCredentialSchema';

export class CredentialSelectException extends Exception<CredentialSelectExceptionData> {
  static readonly code = 'CredentialSelectException';
  static message = 'Credential select required.';
  static status = HttpStatusCode.PRECONDITION_REQUIRED_428;

  constructor(data: CredentialSelectExceptionData) {
    assertSchema(data, CredentialSelectExceptionDataSchema);

    super({ data });
  }
}

export const CredentialSelectExceptionDataSchema = z.object({
  credentialOptions: z.array(ApplicablePublicKeyCredentialSchema),
});

export type CredentialSelectExceptionData = z.infer<
  typeof CredentialSelectExceptionDataSchema
>;
