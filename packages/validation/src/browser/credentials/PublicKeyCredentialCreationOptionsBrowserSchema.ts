import z from 'zod';

import { PublicKeyCredentialCreationOptionsSchema } from '../../models/credentials/PublicKeyCredentialCreationOptionsSchema';
import { BytesBufferSourceSchemaCodec } from '../BytesBufferSourceSchemaCodec';
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
