import { Schema } from 'effect';

import { see } from '../meta/see';

/**
 * @see https://www.w3.org/TR/webauthn/#dictdef-authenticationextensionsclientinputs
 */
export const AuthenticationExtensionsClientInputsSchema = Schema.Record({
  key: Schema.String,
  value: Schema.Unknown,
}).annotations({
  identifier: 'AuthenticationExtensionsClientInputs',
  ref: 'AuthenticationExtensionsClientInputs',
  description: `The client extensions passed to the authenticator. ${see(
    'https://www.w3.org/TR/webauthn/#dictdef-authenticationextensionsclientinputs',
  )}`,
  examples: [{ credProps: true }],
});

export type AuthenticationExtensionsClientInputs = Schema.Schema.Type<
  typeof AuthenticationExtensionsClientInputsSchema
>;
