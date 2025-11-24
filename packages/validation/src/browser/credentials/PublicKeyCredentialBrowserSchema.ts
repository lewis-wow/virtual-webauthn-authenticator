import { z } from 'zod';

import { PublicKeyCredentialSchema } from '../../models/credentials/PublicKeyCredentialSchema';
import { BytesArrayBufferBrowserSchemaCodec } from '../BytesArrayBufferBrowserSchemaCodec';
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
