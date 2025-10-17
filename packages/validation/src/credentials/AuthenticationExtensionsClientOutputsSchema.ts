import z from 'zod';

/**
 * Corresponds to: `AuthenticationExtensionsClientOutputs`
 */
export const AuthenticationExtensionsClientOutputsSchema = z
  .record(z.string(), z.unknown())
  .meta({
    id: 'AuthenticationExtensionsClientOutputs',
    description:
      'A generic dictionary representing the client extension results.',
    type: 'object',
  });
