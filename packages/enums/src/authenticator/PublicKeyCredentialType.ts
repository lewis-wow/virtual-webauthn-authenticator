import type { ValueOfEnum } from '@repo/types';
import z from 'zod';

/**
 * @see https://w3c.github.io/webauthn/#enum-credentialType
 */
export const PublicKeyCredentialType = {
  PUBLIC_KEY: 'public-key',
} as const;

export type PublicKeyCredentialType = ValueOfEnum<
  typeof PublicKeyCredentialType
>;

export const PublicKeyCredentialTypeSchema = z
  .enum(PublicKeyCredentialType)
  .meta({
    description: 'Public key credential type',
    examples: [PublicKeyCredentialType.PUBLIC_KEY],
  });

export type PublicKeyCredentialTypeLoose = string;
export const PublicKeyCredentialTypeLooseSchema = z.string();
