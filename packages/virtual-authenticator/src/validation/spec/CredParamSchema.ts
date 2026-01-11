import { COSEKeyAlgorithmSchema } from '@repo/keys/validation';
import z from 'zod';

import { see } from '../../meta/see';
import { PublicKeyCredentialTypeSchema } from '../enums/PublicKeyCredentialTypeSchema';

const meta = (id: string) => ({
  id,
  ref: 'PubKeyCredParamSchema',
  description: `Describes the cryptographic algorithms to be supported. ${see(
    'https://www.w3.org/TR/webauthn/#dictdef-publickeycredentialparameters',
  )}`,
});

export const CredParamSchema = z
  .object({
    type: z.string(),
    alg: z.number(),
  })
  .meta(meta('CredParamSchema'));

export type CredParam = z.infer<typeof CredParamSchema>;

/**
 * Describes the cryptographic algorithms to be supported
 *
 * @see https://www.w3.org/TR/webauthn/#dictdef-publickeycredentialparameters
 */
export const PubKeyCredParamSchema = CredParamSchema.extend({
  type: PublicKeyCredentialTypeSchema,
}).meta(meta('PubKeyCredParamSchema'));

export type PubKeyCredParam = z.infer<typeof PubKeyCredParamSchema>;

/**
 * Describes the cryptographic algorithms supported by the implementation.
 *
 * NOTE: Azure Key Vault does NOT support OKP (EdDSA/Ed25519) keys.
 * If using Azure Key Vault as key provider, only EC and RSA algorithms are supported.
 *
 * @see https://www.w3.org/TR/webauthn/#dictdef-publickeycredentialparameters
 */
export const SupportedPubKeyCredParamSchema = PubKeyCredParamSchema.extend({
  alg: COSEKeyAlgorithmSchema,
}).meta(meta('SupportedPubKeyCredParamSchema'));

export type SupportedPubKeyCredParam = z.infer<
  typeof SupportedPubKeyCredParamSchema
>;
