import z from 'zod';

/**
 * Corresponds to: `AuthenticationExtensionsClientOutputs`
 */
export const AuthenticationExtensionsClientOutputsSchema = z
  .record(z.string(), z.unknown())
  .meta({
    id: 'AuthenticationExtensionsClientOutputs',
    description:
      'A generic dictionary representing the client extension results. For more information, see https://www.w3.org/TR/webauthn/#dictdef-authenticationextensionsclientoutputs.',
    type: 'object',
    examples: [{ credProps: { rk: true } }],
  });
