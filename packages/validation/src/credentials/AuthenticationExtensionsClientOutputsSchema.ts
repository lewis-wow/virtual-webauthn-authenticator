import z from 'zod';

/**
 * Corresponds to: `AuthenticationExtensionsClientOutputs`
 */
export const AuthenticationExtensionsClientOutputsSchema = z
  .record(z.string(), z.unknown())
  .describe('A generic dictionary representing the client extension results.');
