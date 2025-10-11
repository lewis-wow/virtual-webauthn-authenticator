import type { IPublicKeyCredentialParameters } from '@repo/types';
import z from 'zod';
import {
  COSEAlgorithmIdentifierSchema,
  PublicKeyCredentialTypeSchema,
} from '../enums.js';

// Describes the cryptographic algorithms to be supported
export const PublicKeyCredentialParametersSchema = z.object({
  type: PublicKeyCredentialTypeSchema,
  alg: COSEAlgorithmIdentifierSchema,
}) satisfies z.ZodType<IPublicKeyCredentialParameters>;
