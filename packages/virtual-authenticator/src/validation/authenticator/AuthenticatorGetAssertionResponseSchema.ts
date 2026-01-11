import z from 'zod';

import { BytesSchema } from '../BytesSchema';

/**
 * @see https://www.w3.org/TR/webauthn-3/#authenticatorGetAssertion-return-values
 * @see https://fidoalliance.org/specs/fido-v2.2-ps-20250714/fido-client-to-authenticator-protocol-v2.2-ps-20250714.html#authenticatorGetAssertion
 */
export const AuthenticatorGetAssertionResponseSchema = z.object({
  /**
   * selectedCredential.id, if either a list of credentials (i.e., allowCredentialDescriptorList)
   * of length 2 or greater was supplied by the client, or no such list was supplied.
   *
   * CTAP: PublicKeyCredentialDescriptor structure containing the credential identifier whose private key was used to generate the assertion.
   * Corresponding member name: credential (0x01)
   * CTAP Data type: PublicKeyCredentialDescriptor
   * Required
   */
  credentialId: BytesSchema,

  /**
   * The authenticator data, including RP ID hash, flags, and signature counter.
   *
   * Corresponding member name: authData (0x02)
   * CTAP Data type: Byte String
   * Required
   */
  authenticatorData: BytesSchema,

  /**
   * The assertion signature over the authenticator data and client data.
   *
   * Corresponding member name: signature (0x03)
   * CTAP Data type: Byte String
   * Required
   */
  signature: BytesSchema,

  /**
   * Corresponding member name: user (0x04)
   * CTAP Data type: PublicKeyCredentialUserEntity
   * Optional (nullable)
   */
  userHandle: BytesSchema.nullable(),
});

export type AuthenticatorGetAssertionResponse = z.infer<
  typeof AuthenticatorGetAssertionResponseSchema
>;
