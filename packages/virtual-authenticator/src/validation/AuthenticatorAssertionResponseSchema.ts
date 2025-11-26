import { Schema } from 'effect';

import { see } from '../meta/see';
import { AuthenticatorResponseSchema } from './AuthenticatorResponseSchema';
import { BytesSchema } from './BytesSchema';
import { UserHandleSchema } from './UserHandleSchema';

/**
 * The AuthenticatorAssertionResponse interface represents an authenticator's response to a client’s request
 * for generation of a new authentication assertion given the WebAuthn Relying Party's challenge and OPTIONAL list
 * of credentials it is aware of. This response contains a cryptographic signature proving possession of the
 * credential private key, and optionally evidence of user consent to a specific transaction.
 *
 * @see https://www.w3.org/TR/webauthn/#authenticatorassertionresponse
 */
export const AuthenticatorAssertionResponseSchema = Schema.extend(
  AuthenticatorResponseSchema,
  Schema.Struct({
    /**
     * @see https://www.w3.org/TR/webauthn/#sctn-authenticator-data
     */
    authenticatorData: BytesSchema.annotations({
      description: `The authenticator data for the assertion. ${see(
        'https://www.w3.org/TR/webauthn/#sctn-authenticator-data',
      )}`,
    }),
    /**
     * This attribute contains the raw signature returned from the authenticator.
     *
     * @see https://www.w3.org/TR/webauthn/#dom-authenticatorassertionresponse-signature
     */
    signature: BytesSchema.annotations({
      description: `The signature for the assertion. ${see(
        'https://www.w3.org/TR/webauthn/#dom-authenticatorassertionresponse-signature',
      )}`,
    }),

    userHandle: Schema.NullOr(UserHandleSchema),
  }),
).annotations({
  identifier: 'AuthenticatorAssertionResponse',
  title: 'AuthenticatorAssertionResponse',
  ref: 'AuthenticatorAssertionResponse',
  description: `The authenticator's response to a client’s request for generation of a new authentication assertion given the WebAuthn Relying Party's challenge and OPTIONAL list of credentials it is aware of. This response contains a cryptographic signature proving possession of the credential private key, and optionally evidence of user consent to a specific transaction. ${see(
    'https://www.w3.org/TR/webauthn/#authenticatorassertionresponse',
  )}`,
});

export type AuthenticatorAssertionResponse = Schema.Schema.Type<
  typeof AuthenticatorAssertionResponseSchema
>;
