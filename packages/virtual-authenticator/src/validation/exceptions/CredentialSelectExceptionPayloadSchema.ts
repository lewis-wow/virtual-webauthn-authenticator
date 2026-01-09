import z from 'zod';

import { ApplicablePublicKeyCredentialSchema } from '../spec/ApplicablePublicKeyCredentialSchema';

export const CredentialSelectExceptionPayloadSchema = z.object({
  credentialOptions: z.array(ApplicablePublicKeyCredentialSchema),
});

export type CredentialSelectExceptionPayload = z.infer<
  typeof CredentialSelectExceptionPayloadSchema
>;
