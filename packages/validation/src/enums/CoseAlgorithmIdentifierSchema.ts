import z from 'zod';
import { COSEAlgorithmIdentifier } from '@repo/enums';

/**
 * Corresponds to: `COSEAlgorithmIdentifier`
 */
export const COSEAlgorithmIdentifierSchema = z
  .enum(COSEAlgorithmIdentifier)
  .describe('The cryptographic algorithm used by the authenticator.');
