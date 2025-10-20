import {
  COSEAlgorithmSchema,
  PublicKeyCredentialTypeSchema,
} from '@repo/enums';
import type { IPublicKeyCredentialParameters } from '@repo/types';
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
    alg: COSEAlgorithmSchema,
  })
  .meta({
    description: `Describes the cryptographic algorithms to be supported. ${see('https://www.w3.org/TR/webauthn/#dictdef-publickeycredentialparameters')}`,
  }) satisfies z.ZodType<IPublicKeyCredentialParameters>;
