import z from 'zod';
import { AuthenticatorAttachment } from '@repo/enums';

/**
 * Corresponds to: `AuthenticatorAttachment`
 */
export const AuthenticatorAttachmentSchema = z
  .enum(AuthenticatorAttachment)
  .describe('The attachment type of the authenticator, if known.');
