import z from 'zod';
import { CoseAlgorithmIdentifier } from '@repo/enums';

/**
 * Corresponds to: `CoseAlgorithmIdentifier`
 */
export const CoseAlgorithmIdentifierSchema = z
  .nativeEnum(CoseAlgorithmIdentifier)
  .describe('The cryptographic algorithm used by the authenticator.');
