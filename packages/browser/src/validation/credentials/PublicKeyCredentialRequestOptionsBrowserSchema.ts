import { PublicKeyCredentialRequestOptionsSchema } from '@repo/virtual-authenticator/validation';
import z from 'zod';

import { BytesBufferSourceSchemaCodec } from '../BytesBufferSourceSchemaCodec';
import { PublicKeyCredentialDescriptorBrowserSchema } from './PublicKeyCredentialDescriptorBrowserSchema';

export const PublicKeyCredentialRequestOptionsBrowserSchema =
  PublicKeyCredentialRequestOptionsSchema.extend({
    challenge: BytesBufferSourceSchemaCodec,
    allowCredentials: z
      .array(PublicKeyCredentialDescriptorBrowserSchema)
      .optional(),
  });
