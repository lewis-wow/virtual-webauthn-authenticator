import type { IAuthenticatorAttestationResponse } from '@repo/types';
import z from 'zod';

import { Base64URLBufferSchema } from '../Base64URLBufferSchema.js';

/**
 * Corresponds to: `IAuthenticatorAttestationResponse`
 * This represents the JSON payload for a registration verification.
 */
export const AuthenticatorAttestationResponseSchema = z
  .object({
    clientDataJSON: Base64URLBufferSchema,
    attestationObject: Base64URLBufferSchema.meta({
      description:
        'The attestation object is a CBOR-encoded object containing the authenticator data and the attestation statement. It is used by the Relying Party to verify the new credential and create a binding to the user account. See https://www.w3.org/TR/webauthn-2/#sctn-attestation-object for more details.',
    }),
  })
  .meta({
    id: 'AuthenticatorAttestationResponse',
    description: 'The JSON payload for a registration verification.',
  }) satisfies z.ZodType<IAuthenticatorAttestationResponse>;
