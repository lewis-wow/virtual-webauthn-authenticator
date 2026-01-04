import z from 'zod';

import { see } from '../meta/see';
import { AuthenticatorResponseSchema } from './AuthenticatorResponseSchema';
import { BytesSchema } from './BytesSchema';
import { AuthenticatorTransportSchema } from './enums/AuthenticatorTransportSchema';

/**
 * @see https://www.w3.org/TR/webauthn/#authenticatorattestationresponse
 */
export const AuthenticatorAttestationResponseSchema =
  AuthenticatorResponseSchema.extend({
    /**
     * @see https://www.w3.org/TR/webauthn-2/#sctn-attestation-object
     */
    attestationObject: BytesSchema.meta({
      description: `The attestation object is a CBOR-encoded object containing the authenticator data and the attestation statement. It is used by the Relying Party to verify the new credential and create a binding to the user account. ${see(
        'https://www.w3.org/TR/webauthn-2/#sctn-attestation-object',
      )}`,
    }),

    transports: z.array(AuthenticatorTransportSchema),
  }).meta({
    id: 'AuthenticatorAttestationResponse',
    ref: 'AuthenticatorAttestationResponse',
    description: `The JSON payload for a registration verification. ${see(
      'https://www.w3.org/TR/webauthn/#authenticatorattestationresponse',
    )}`,
  });

export type AuthenticatorAttestationResponse = z.infer<
  typeof AuthenticatorAttestationResponseSchema
>;
