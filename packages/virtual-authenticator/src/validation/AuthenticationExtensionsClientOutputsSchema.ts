import { Schema } from 'effect';

import { see } from '../meta/see';

/**
 * @see https://www.w3.org/TR/webauthn/#dictdef-authenticationextensionsclientoutputs
 */
export const AuthenticationExtensionsClientOutputsSchema = Schema.Record({
  key: Schema.String,
  value: Schema.Unknown,
}).annotations({
  identifier: 'AuthenticationExtensionsClientOutputs',
  title: 'AuthenticationExtensionsClientOutputs',
  ref: 'AuthenticationExtensionsClientOutputs',
  description: `A generic dictionary representing the client extension results. ${see(
    'https://www.w3.org/TR/webauthn/#dictdef-authenticationextensionsclientoutputs',
  )}`,
  examples: [{ credProps: { rk: true } }],
});

export type AuthenticationExtensionsClientOutputs = Schema.Schema.Type<
  typeof AuthenticationExtensionsClientOutputsSchema
>;
