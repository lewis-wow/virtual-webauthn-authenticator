import type { IAuthenticatorAssertionResponse } from '@repo/types';
import z from 'zod';

import { Base64URLBufferSchema } from '../transformers/Base64URLBufferSchema.js';
import { AuthenticatorResponseSchema } from './AuthenticatorResponseSchema.js';
import { UserHandleSchema } from './UserHandleSchema.js';

/**
 * The AuthenticatorAssertionResponse interface represents an authenticator's response to a client’s request
 * for generation of a new authentication assertion given the WebAuthn Relying Party's challenge and OPTIONAL list
 * of credentials it is aware of. This response contains a cryptographic signature proving possession of the
 * credential private key, and optionally evidence of user consent to a specific transaction.
 *
 * @see https://www.w3.org/TR/webauthn/#authenticatorassertionresponse
 */
export const AuthenticatorAssertionResponseSchema =
  AuthenticatorResponseSchema.extend({
    /**
     * @see https://www.w3.org/TR/webauthn/#sctn-authenticator-data
     */
    authenticatorData: Base64URLBufferSchema.meta({
      description: 'The authenticator data for the assertion.',
    }),
    /**
     * This attribute contains the raw signature returned from the authenticator.
     *
     * @see https://www.w3.org/TR/webauthn/#dom-authenticatorassertionresponse-signature
     */
    signature: Base64URLBufferSchema.meta({
      description: 'The signature for the assertion.',
    }),

    userHandle: UserHandleSchema.nullable(),
  }).meta({
    id: 'AuthenticatorAssertionResponse',
    description:
      'The JSON payload for an authentication verification. For more information, see https://www.w3.org/TR/webauthn/#authenticatorassertionresponse.',
  }) satisfies z.ZodType<IAuthenticatorAssertionResponse>;
