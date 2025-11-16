import z from 'zod';

import { PublicKeyCredentialRequestOptionsSchema } from '../../models/credentials/PublicKeyCredentialRequestOptionsSchema';
import { BytesBufferSourceSchemaCodec } from '../BytesBufferSourceSchemaCodec';
import { PublicKeyCredentialDescriptorBrowserSchema } from './PublicKeyCredentialDescriptorBrowserSchema';

export const PublicKeyCredentialRequestOptionsBrowserSchema =
  PublicKeyCredentialRequestOptionsSchema.extend({
    challenge: BytesBufferSourceSchemaCodec,
    allowCredentials: z
      .array(PublicKeyCredentialDescriptorBrowserSchema)
      .optional(),
  });
