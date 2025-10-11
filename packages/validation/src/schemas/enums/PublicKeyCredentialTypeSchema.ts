import z from 'zod';
import { PublicKeyCredentialType } from '@repo/enums';

/**
 * Corresponds to: `PublicKeyCredentialType`
 */
export const PublicKeyCredentialTypeSchema = z
  .enum(PublicKeyCredentialType)
  .describe('The type of the credential.');
