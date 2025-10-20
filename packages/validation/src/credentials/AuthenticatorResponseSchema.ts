import type { IAuthenticatorResponse } from '@repo/types';
import z from 'zod';

import { Base64URLBufferSchema } from '../transformers/Base64URLBufferSchema.js';

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
    clientDataJSON: Base64URLBufferSchema.meta({
      description: 'The client data for the response.',
    }),
  })
  .meta({
    id: 'AuthenticatorResponse',
    description:
      'The response from an authenticator. For more information, see https://www.w3.org/TR/webauthn/#authenticatorresponse.',
  }) satisfies z.ZodType<IAuthenticatorResponse>;
