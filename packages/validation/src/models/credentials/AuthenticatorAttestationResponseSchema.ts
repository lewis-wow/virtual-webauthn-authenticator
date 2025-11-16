import z from 'zod';

import { see } from '../../meta/see';
import { BytesSchema } from '../common/BytesSchema';
import { AuthenticatorResponseSchema } from './AuthenticatorResponseSchema';

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
