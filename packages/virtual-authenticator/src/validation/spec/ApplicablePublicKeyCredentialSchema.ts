import z from 'zod';

/**
 * @see https://fidoalliance.org/specs/fido-v2.2-ps-20250714/fido-client-to-authenticator-protocol-v2.2-ps-20250714.html#op-getassn-step-locate-credentials
 * NOTE: The structure is not by spec.
 */
export const ApplicablePublicKeyCredentialSchema = z.object({
  id: z.string(),
  userId: z.string(),
  userName: z.string(),
  userEmail: z.string(),

  rpUserName: z.string(),
  rpUserDisplayName: z.string(),
});

export type ApplicablePublicKeyCredential = z.infer<
  typeof ApplicablePublicKeyCredentialSchema
>;
