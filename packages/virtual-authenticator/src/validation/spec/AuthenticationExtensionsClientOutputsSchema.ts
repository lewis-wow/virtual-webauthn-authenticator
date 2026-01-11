import z from 'zod';

import { see } from '../../meta/see';
import { CredentialPropertiesOutputSchema } from './CredentialPropertiesOutputSchema';

/**
 * @see https://www.w3.org/TR/webauthn/#dictdef-authenticationextensionsclientoutputs
 */
export const AuthenticationExtensionsClientOutputsSchema = z
  .object({
    credProps: CredentialPropertiesOutputSchema,
  })
  .partial()
  .meta({
    id: 'AuthenticationExtensionsClientOutputs',
    ref: 'AuthenticationExtensionsClientOutputs',
    description: `A generic dictionary representing the client extension results. ${see('https://www.w3.org/TR/webauthn/#dictdef-authenticationextensionsclientoutputs')}`,
    examples: [{ credProps: { rk: true } }],
  });

export type AuthenticationExtensionsClientOutputs = z.infer<
  typeof AuthenticationExtensionsClientOutputsSchema
>;
