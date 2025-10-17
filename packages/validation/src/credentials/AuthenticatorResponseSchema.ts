import type { IAuthenticatorResponse } from '@repo/types';
import z from 'zod';

import { Base64URLBufferSchema } from '../Base64URLBufferSchema.js';

export const AuthenticatorResponseSchema = z
  .object({
    clientDataJSON: Base64URLBufferSchema.meta({
      description: 'The client data for the response.',
    }),
  })
  .meta({
    id: 'AuthenticatorResponse',
    description:
      'The response from an authenticator. For more information, see https://www.w3.org/TR/webauthn/#authenticatorresponse.',
  }) satisfies z.ZodType<IAuthenticatorResponse>;
