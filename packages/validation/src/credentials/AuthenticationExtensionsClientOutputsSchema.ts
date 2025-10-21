import z from 'zod';

import { see } from '../meta/see';

/**
 * @see https://www.w3.org/TR/webauthn/#dictdef-authenticationextensionsclientoutputs
 */
export const AuthenticationExtensionsClientOutputsSchema = z
  .record(z.string(), z.unknown())
  .meta({
    id: 'AuthenticationExtensionsClientOutputs',
    description: `A generic dictionary representing the client extension results. ${see('https://www.w3.org/TR/webauthn/#dictdef-authenticationextensionsclientoutputs')}`,
    examples: [{ credProps: { rk: true } }],
  });

export type AuthenticationExtensionsClientOutputs = z.infer<
  typeof AuthenticationExtensionsClientOutputsSchema
>;
