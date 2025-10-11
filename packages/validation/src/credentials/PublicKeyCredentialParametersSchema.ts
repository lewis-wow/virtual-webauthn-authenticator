import type { IPublicKeyCredentialParameters } from '@repo/types';
import z from 'zod';
import { COSEAlgorithmIdentifierSchema } from '../enums/COSEAlgorithmIdentifierSchema.js';
import { PublicKeyCredentialTypeSchema } from '../enums/PublicKeyCredentialTypeSchema.js';

// Describes the cryptographic algorithms to be supported
export const PublicKeyCredentialParametersSchema = z.object({
  type: PublicKeyCredentialTypeSchema,
  alg: COSEAlgorithmIdentifierSchema,
}) satisfies z.ZodType<IPublicKeyCredentialParameters>;
