import z from 'zod';

import { PublicKeyCredentialCandidateSchema } from './PublicKeyCredentialCandidateSchema';
import { PublicKeyCredentialSchema } from './PublicKeyCredentialSchema';

export const PublicKeyCredentialOrPublicKeyCredentialCandidateListSchema =
  PublicKeyCredentialSchema.or(z.array(PublicKeyCredentialCandidateSchema));

export type PublicKeyCredentialOrPublicKeyCredentialCandidateList = z.infer<
  typeof PublicKeyCredentialOrPublicKeyCredentialCandidateListSchema
>;
