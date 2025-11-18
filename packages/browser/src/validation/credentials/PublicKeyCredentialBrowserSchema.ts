import { z } from 'zod';

import { BytesArrayBufferBrowserSchemaCodec } from '../../../../validation/src/browser/BytesArrayBufferBrowserSchemaCodec';
import { PublicKeyCredentialSchema } from '../../models/credentials/PublicKeyCredentialSchema';
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
