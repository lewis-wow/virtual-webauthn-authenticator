import { Schema } from 'effect';

import { see } from '../meta/see';
import { BytesSchema } from './BytesSchema';

/**
 * @see https://www.w3.org/TR/webauthn/#authenticatorresponse
 */
export const AuthenticatorResponseSchema = Schema.Struct({
  /**
   * This attribute contains a JSON-compatible serialization of the client data,
   * the hash of which is passed to the authenticator by the client in its call to either create() or get().
   *
   * @see https://www.w3.org/TR/webauthn/#dom-authenticatorresponse-clientdatajson
   */
  clientDataJSON: BytesSchema.annotations({
    description: `The client data for the response. ${see(
      'https://www.w3.org/TR/webauthn/#dom-authenticatorresponse-clientdatajson',
    )}`,
  }),
}).annotations({
  identifier: 'AuthenticatorResponse',
  ref: 'AuthenticatorResponse',
  description:
    'The response from an authenticator. For more information, see https://www.w3.org/TR/webauthn/#authenticatorresponse.',
});

export type AuthenticatorResponse = Schema.Schema.Type<
  typeof AuthenticatorResponseSchema
>;
