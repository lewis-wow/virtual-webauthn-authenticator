import {
  COSEAlgorithmIdentifierSchema,
  PublicKeyCredentialTypeSchema,
} from '@repo/enums';
import type { IPublicKeyCredentialParameters } from '@repo/types';
import z from 'zod';

// Describes the cryptographic algorithms to be supported
export const PublicKeyCredentialParametersSchema = z
  .object({
    type: PublicKeyCredentialTypeSchema,
    alg: COSEAlgorithmIdentifierSchema,
  })
  .meta({
    description: 'Describes the cryptographic algorithms to be supported. For more information, see https://www.w3.org/TR/webauthn/#dictdef-publickeycredentialparameters.',
  }) satisfies z.ZodType<IPublicKeyCredentialParameters>;
