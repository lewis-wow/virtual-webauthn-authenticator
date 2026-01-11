import z from 'zod';

import { ApplicablePublicKeyCredentialSchema } from '../spec/ApplicablePublicKeyCredentialSchema';
import { PublicKeyCredentialSchema } from '../spec/PublicKeyCredentialSchema';

export const PublicKeyCredentialOrApplicablePublicKeyCredentialsListSchema =
  PublicKeyCredentialSchema.or(z.array(ApplicablePublicKeyCredentialSchema));

export type PublicKeyCredentialOrApplicablePublicKeyCredentialsList = z.infer<
  typeof PublicKeyCredentialOrApplicablePublicKeyCredentialsListSchema
>;
