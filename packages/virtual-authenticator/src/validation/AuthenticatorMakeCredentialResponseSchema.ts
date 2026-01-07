import z from 'zod';

import { BytesSchema } from './BytesSchema';

/**
 * @see https://www.w3.org/TR/webauthn-3/#attestation-object
 * @see https://fidoalliance.org/specs/fido-v2.2-ps-20250714/fido-client-to-authenticator-protocol-v2.2-ps-20250714.html#sctn-makeCred-authnr-alg
 */
export const AuthenticatorMakeCredentialResponseSchema = z.object({
  /**
   * The attestation object containing the authenticator data and
   * attestation statement
   */
  attestationObject: BytesSchema,

  /**
   * The credential ID of the newly created credential
   * NOTE: This field is not defined by the standard, it is for simplicity and to not require parsing the attestationObject in VirtualAuthenticatorAgent.
   */
  credentialId: BytesSchema,
});

export type AuthenticatorMakeCredentialResponse = z.infer<
  typeof AuthenticatorMakeCredentialResponseSchema
>;
