import type { ValueOfEnum } from '@repo/types';
import z from 'zod';

/**
 * @see https://w3c.github.io/webauthn/#enum-attachment
 */
export const AuthenticatorAttachment = {
  PLATFORM: 'platform',
  CROSS_PLATFORM: 'cross-platform',
} as const;

export type AuthenticatorAttachment = ValueOfEnum<
  typeof AuthenticatorAttachment
>;

export const AuthenticatorAttachmentSchema = z
  .enum(AuthenticatorAttachment)
  .meta({
    description: 'Authenticator attachment',
    examples: [AuthenticatorAttachment.PLATFORM],
  });
