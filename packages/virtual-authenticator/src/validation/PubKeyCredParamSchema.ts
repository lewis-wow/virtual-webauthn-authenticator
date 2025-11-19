// Assuming these have been converted to Effect Schemas
import { COSEKeyAlgorithmSchema } from '@repo/keys/enums';
import { Schema } from 'effect';

import { see } from '../meta/see';
import { PublicKeyCredentialTypeSchema } from './enums/PublicKeyCredentialTypeSchema';

const annotations = (identifier: string) => ({
  identifier,
  description: `Describes the cryptographic algorithms to be supported. ${see(
    'https://www.w3.org/TR/webauthn/#dictdef-publickeycredentialparameters',
  )}`,
});

/**
 * Describes the cryptographic algorithms to be supported
 *
 * @see https://www.w3.org/TR/webauthn/#dictdef-publickeycredentialparameters
 */
export const PubKeyCredParamStrictSchema = Schema.Struct({
  type: PublicKeyCredentialTypeSchema,
  alg: COSEKeyAlgorithmSchema,
}).annotations(annotations('PubKeyCredParamStrict'));

export type PubKeyCredParamStrict = Schema.Schema.Type<
  typeof PubKeyCredParamStrictSchema
>;

export const PubKeyCredParamLooseSchema = Schema.Struct({
  type: Schema.String,
  alg: Schema.Number,
}).annotations(annotations('PubKeyCredParamLoose'));

export type PubKeyCredParamLoose = Schema.Schema.Type<
  typeof PubKeyCredParamLooseSchema
>;
