import { PublicKeyCredentialRequestOptionsSchema } from '@repo/virtual-authenticator/zod-validation';
import z from 'zod';

import { BytesBufferSourceSchemaCodec } from '../codecs/BytesBufferSourceSchemaCodec';
import { PublicKeyCredentialDescriptorBrowserSchema } from './PublicKeyCredentialDescriptorBrowserSchema';

export const PublicKeyCredentialRequestOptionsBrowserSchema =
  PublicKeyCredentialRequestOptionsSchema.extend({
    challenge: BytesBufferSourceSchemaCodec,
    allowCredentials: z
      .array(PublicKeyCredentialDescriptorBrowserSchema)
      .optional(),
  });
