import z from 'zod';

import { PublicKeyCredentialCandidateSchema } from './PublicKeyCredentialCandidateSchema';
import { PublicKeyCredentialSchema } from './PublicKeyCredentialSchema';

export const VirtualAuthenticatorAgentGetAssertionPayloadSchema =
  PublicKeyCredentialSchema.or(z.array(PublicKeyCredentialCandidateSchema));

export type VirtualAuthenticatorAgentGetAssertionPayload = z.infer<
  typeof VirtualAuthenticatorAgentGetAssertionPayloadSchema
>;
