import type { IAuthenticatorAttestationResponse } from '@repo/types';
import z from 'zod';

import { see } from '../meta/see.js';
import { Base64URLBufferSchema } from '../transformers/Base64URLBufferSchema.js';
import { AuthenticatorResponseSchema } from './AuthenticatorResponseSchema.js';

/**
 * @see https://www.w3.org/TR/webauthn/#authenticatorattestationresponse
 */
export const AuthenticatorAttestationResponseSchema =
  AuthenticatorResponseSchema.extend({
    /**
     * @see https://www.w3.org/TR/webauthn-2/#sctn-attestation-object
     */
    attestationObject: Base64URLBufferSchema.meta({
      description: `The attestation object is a CBOR-encoded object containing the authenticator data and the attestation statement. It is used by the Relying Party to verify the new credential and create a binding to the user account. ${see('https://www.w3.org/TR/webauthn-2/#sctn-attestation-object')}`,
    }),
  }).meta({
    id: 'AuthenticatorAttestationResponse',
    description: `The JSON payload for a registration verification. ${see('https://www.w3.org/TR/webauthn/#authenticatorattestationresponse')}`,
  }) satisfies z.ZodType<IAuthenticatorAttestationResponse>;
