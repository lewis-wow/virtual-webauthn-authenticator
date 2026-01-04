import z from 'zod';

import { see } from '../meta/see';

/**
 * @see https://www.w3.org/TR/webauthn/#dictdef-authenticationextensionsclientinputs
 */
export const AuthenticationExtensionsClientInputsSchema = z
  .record(z.string(), z.unknown())
  .meta({
    id: 'AuthenticationExtensionsClientInputs',
    ref: 'AuthenticationExtensionsClientInputs',
    description: `The client extensions passed to the authenticator. ${see('https://www.w3.org/TR/webauthn/#dictdef-authenticationextensionsclientinputs')}`,
    examples: [{ credProps: true }],
  });

export type AuthenticationExtensionsClientInputs = z.infer<
  typeof AuthenticationExtensionsClientInputsSchema
>;
