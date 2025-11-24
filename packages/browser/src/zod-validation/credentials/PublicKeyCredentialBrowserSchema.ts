import { PublicKeyCredentialSchema } from '@repo/virtual-authenticator/zod-validation';
import { z } from 'zod';

import { BytesArrayBufferBrowserSchemaCodec } from '../codecs/BytesArrayBufferBrowserSchemaCodec';
import { AuthenticatorAssertionResponseBrowserSchema } from './AuthenticatorAssertionResponseBrowserSchema';
import { AuthenticatorAttestationResponseBrowserSchema } from './AuthenticatorAttestationResponseBrowserSchema';

export const PublicKeyCredentialBrowserSchema =
  PublicKeyCredentialSchema.extend({
    rawId: BytesArrayBufferBrowserSchemaCodec,
    response: z.union([
      AuthenticatorAttestationResponseBrowserSchema,
      AuthenticatorAssertionResponseBrowserSchema,
    ]),
  });
