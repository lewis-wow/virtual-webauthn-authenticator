import { factory } from '@/factory';
import { zValidator } from '@hono/zod-validator';
import type {
  IAuthenticatorAssertionResponse,
  IAuthenticatorAttestationResponse,
} from '@repo/types';
import {
  AuthenticatorAssertionResponseSchema,
  AuthenticatorAttestationResponseSchema,
  PublicKeyCredentialCreationOptionsSchema,
  PublicKeyCredentialRequestOptionsSchema,
} from '@repo/validation';

import { zResponseValidator } from '../middleware/zResponseValidator';

export const credentials = factory.createApp();

credentials.get(
  '/',
  zValidator('query', PublicKeyCredentialRequestOptionsSchema),
  zResponseValidator(AuthenticatorAssertionResponseSchema),
  async (ctx) => {
    const publicKeyCredentialRequestOptions = ctx.req.valid('query');

    return ctx.json<IAuthenticatorAssertionResponse>({} as any);
  },
);

credentials.post(
  '/',
  zValidator('json', PublicKeyCredentialCreationOptionsSchema),
  zResponseValidator(AuthenticatorAttestationResponseSchema),
  async (ctx) => {
    const publicKeyCredentialCreationOptions = ctx.req.valid('json');

    return ctx.json<IAuthenticatorAttestationResponse>({} as any);
  },
);
