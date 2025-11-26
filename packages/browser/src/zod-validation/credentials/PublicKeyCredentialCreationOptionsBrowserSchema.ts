import { PublicKeyCredentialCreationOptionsSchema } from '@repo/virtual-authenticator/zod-validation';
import z from 'zod';

import { BytesBufferSourceSchemaCodec } from '../codecs/BytesBufferSourceSchemaCodec';
import { PublicKeyCredentialDescriptorBrowserSchema } from './PublicKeyCredentialDescriptorBrowserSchema';
import { PublicKeyCredentialUserEntityBrowserSchema } from './PublicKeyCredentialUserEntityBrowserSchema';

export const PublicKeyCredentialCreationOptionsBrowserSchema =
  PublicKeyCredentialCreationOptionsSchema.extend({
    challenge: BytesBufferSourceSchemaCodec,
    user: PublicKeyCredentialUserEntityBrowserSchema,
    excludeCredentials: z
      .array(PublicKeyCredentialDescriptorBrowserSchema)
      .optional(),
  });
