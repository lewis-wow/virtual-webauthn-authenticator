import { COSEKeyAlgorithmSchema } from '@repo/keys/zod-validation';
import z from 'zod';

import { see } from '../meta/see';
import { PublicKeyCredentialTypeSchema } from './enums/PublicKeyCredentialTypeSchema';

const meta = (id: string) => ({
  id,
  ref: 'PubKeyCredParamSchema',
  description: `Describes the cryptographic algorithms to be supported. ${see(
    'https://www.w3.org/TR/webauthn/#dictdef-publickeycredentialparameters',
  )}`,
});

/**
 * Describes the cryptographic algorithms to be supported
 *
 * @see https://www.w3.org/TR/webauthn/#dictdef-publickeycredentialparameters
 */
export const PubKeyCredParamStrictSchema = z
  .object({
    type: PublicKeyCredentialTypeSchema,
    alg: COSEKeyAlgorithmSchema,
  })
  .meta(meta('PubKeyCredParamStrict'));

export type PubKeyCredParamStrict = z.infer<typeof PubKeyCredParamStrictSchema>;

export const PubKeyCredParamLooseSchema = z
  .object({
    type: z.string(),
    alg: z.number(),
  })
  .meta(meta('PubKeyCredParamLoose'));

export type PubKeyCredParamLoose = z.infer<typeof PubKeyCredParamLooseSchema>;
