import {
  AuthenticatorTransportSchema,
  COSEAlgorithmIdentifierSchema,
} from '@repo/enums';
import type { IAuthenticatorAttestationResponseJSON } from '@repo/types';
import z from 'zod';

export const AuthenticatorAttestationResponseJSONSchema = z
  .object({
    clientDataJSON: z.string(),
    attestationObject: z.string().optional(),
    authenticatorData: z.string().optional(),
    transports: z.array(AuthenticatorTransportSchema).optional(),
    publicKeyAlgorithm: COSEAlgorithmIdentifierSchema.optional(),
    publicKey: z.string().optional(),
  })
  .meta({
    id: 'AuthenticatorAttestationResponseJSON',
    description: 'The JSON payload for an attestation verification.',
  }) satisfies z.ZodType<IAuthenticatorAttestationResponseJSON>;
