import z from 'zod';

import { BytesBufferSourceSchemaCodec } from '../../../../validation/src/browser/BytesBufferSourceSchemaCodec';
import { PublicKeyCredentialCreationOptionsSchema } from '../../models/credentials/PublicKeyCredentialCreationOptionsSchema';
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
