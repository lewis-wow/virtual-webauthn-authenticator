import z from 'zod';

/**
 * @see https://www.w3.org/TR/webauthn-3/#sctn-authenticator-credential-properties-extension
 */
export const CredentialPropertiesOutputSchema = z.object({
  /**
   * Set rk to the value of the requireResidentKey parameter that was used
   * in the invocation of the authenticatorMakeCredential operation.
   */
  rk: z.boolean(),
});

export type CredentialPropertiesOutput = z.infer<
  typeof CredentialPropertiesOutputSchema
>;
