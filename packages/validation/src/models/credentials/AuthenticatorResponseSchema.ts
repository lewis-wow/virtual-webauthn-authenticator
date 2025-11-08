import z from 'zod';

import { BytesSchemaCodec } from '../../codecs/BytesSchemaCodec';
import { see } from '../../meta/see';

/**
 * @see https://www.w3.org/TR/webauthn/#authenticatorresponse
 */
export const AuthenticatorResponseSchema = z
  .object({
    /**
     * This attribute contains a JSON-compatible serialization of the client data,
     * the hash of which is passed to the authenticator by the client in its call to either create() or get().
     *
     * @see https://www.w3.org/TR/webauthn/#dom-authenticatorresponse-clientdatajson
     */
    clientDataJSON: BytesSchemaCodec.meta({
      description: `The client data for the response. ${see(
        'https://www.w3.org/TR/webauthn/#dom-authenticatorresponse-clientdatajson',
      )}`,
    }),
  })
  .meta({
    id: 'AuthenticatorResponse',
    ref: 'AuthenticatorResponse',
    description:
      'The response from an authenticator. For more information, see https://www.w3.org/TR/webauthn/#authenticatorresponse.',
  });

export type AuthenticatorResponse = z.infer<typeof AuthenticatorResponseSchema>;
