import z from 'zod';

import { BytesBufferSourceSchemaCodec } from '../../../../validation/src/browser/BytesBufferSourceSchemaCodec';
import { PublicKeyCredentialRequestOptionsSchema } from '../../models/credentials/PublicKeyCredentialRequestOptionsSchema';
import { PublicKeyCredentialDescriptorBrowserSchema } from './PublicKeyCredentialDescriptorBrowserSchema';

export const PublicKeyCredentialRequestOptionsBrowserSchema =
  PublicKeyCredentialRequestOptionsSchema.extend({
    challenge: BytesBufferSourceSchemaCodec,
    allowCredentials: z
      .array(PublicKeyCredentialDescriptorBrowserSchema)
      .optional(),
  });
