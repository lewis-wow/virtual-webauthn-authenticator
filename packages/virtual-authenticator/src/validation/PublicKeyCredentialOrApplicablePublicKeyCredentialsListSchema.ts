import z from 'zod';

import { ApplicablePublicKeyCredentialSchema } from './ApplicablePublicKeyCredentialSchema';
import { PublicKeyCredentialSchema } from './PublicKeyCredentialSchema';

export const PublicKeyCredentialOrApplicablePublicKeyCredentialsListSchema =
  PublicKeyCredentialSchema.or(z.array(ApplicablePublicKeyCredentialSchema));

export type PublicKeyCredentialOrApplicablePublicKeyCredentialsList = z.infer<
  typeof PublicKeyCredentialOrApplicablePublicKeyCredentialsListSchema
>;
