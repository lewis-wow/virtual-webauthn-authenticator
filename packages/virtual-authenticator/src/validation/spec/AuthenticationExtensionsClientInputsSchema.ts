import z from 'zod';

import { see } from '../../meta/see';
import { AuthenticationExtensionsLargeBlobInputsSchema } from './AuthenticationExtensionsLargeBlobInputsSchema';
import { AuthenticationExtensionsPRFInputsSchema } from './AuthenticationExtensionsPRFInputsSchema';

/**
 * @see https://www.w3.org/TR/webauthn/#dictdef-authenticationextensionsclientinputs
 */
export const AuthenticationExtensionsClientInputsSchema = z
  .looseObject({
    /**
     * @see https://www.w3.org/TR/webauthn-3/#sctn-authenticator-credential-properties-extension
     */
    credProps: z.boolean().optional(),
    appid: z.string().optional(),
    credentialProtectionPolicy: z.string().optional(),
    enforceCredentialProtectionPolicy: z.boolean().optional(),
    hmacCreateSecret: z.boolean().optional(),
    largeBlob: AuthenticationExtensionsLargeBlobInputsSchema.optional(),
    minPinLength: z.boolean().optional(),
    prf: AuthenticationExtensionsPRFInputsSchema.optional(),
  })
  .partial()
  .meta({
    id: 'AuthenticationExtensionsClientInputs',
    ref: 'AuthenticationExtensionsClientInputs',
    description: `The client extensions passed to the authenticator. ${see('https://www.w3.org/TR/webauthn/#dictdef-authenticationextensionsclientinputs')}`,
    examples: [{ credProps: true }],
  });

export type AuthenticationExtensionsClientInputs = z.infer<
  typeof AuthenticationExtensionsClientInputsSchema
>;
