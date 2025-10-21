import {
  COSEKeyAlgorithmSchema,
  PublicKeyCredentialTypeSchema,
} from '@repo/enums';
import z from 'zod';

import { see } from '../meta/see';

/**
 * Describes the cryptographic algorithms to be supported
 *
 * @see https://www.w3.org/TR/webauthn/#dictdef-publickeycredentialparameters
 */
export const PublicKeyCredentialParametersSchema = z
  .object({
    type: PublicKeyCredentialTypeSchema,
    alg: COSEKeyAlgorithmSchema,
  })
  .meta({
    id: 'PublicKeyCredentialParameters',
    description: `Describes the cryptographic algorithms to be supported. ${see(
      'https://www.w3.org/TR/webauthn/#dictdef-publickeycredentialparameters',
    )}`,
  });

export type PublicKeyCredentialParameters = z.infer<
  typeof PublicKeyCredentialParametersSchema
>;
