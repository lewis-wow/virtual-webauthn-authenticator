import { Schema } from 'effect';

import { see } from '../meta/see';
import { AuthenticatorResponseSchema } from './AuthenticatorResponseSchema';
import { BytesSchema } from './BytesSchema';

/**
 * @see https://www.w3.org/TR/webauthn/#authenticatorattestationresponse
 */
export const AuthenticatorAttestationResponseSchema = Schema.extend(
  AuthenticatorResponseSchema,
  Schema.Struct({
    /**
     * @see https://www.w3.org/TR/webauthn-2/#sctn-attestation-object
     */
    attestationObject: BytesSchema.annotations({
      description: `The attestation object is a CBOR-encoded object containing the authenticator data and the attestation statement. It is used by the Relying Party to verify the new credential and create a binding to the user account. ${see(
        'https://www.w3.org/TR/webauthn-2/#sctn-attestation-object',
      )}`,
    }),
  }),
).annotations({
  identifier: 'AuthenticatorAttestationResponse',
  ref: 'AuthenticatorAttestationResponse',
  description: `The JSON payload for a registration verification. ${see(
    'https://www.w3.org/TR/webauthn/#authenticatorattestationresponse',
  )}`,
});

export type AuthenticatorAttestationResponse = Schema.Schema.Type<
  typeof AuthenticatorAttestationResponseSchema
>;
