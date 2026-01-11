import { BytesSchemaCodec } from '@repo/core/zod-validation';
import z from 'zod';

import { AuthenticatorGetAssertionArgsSchema } from '../../validation/authenticator/AuthenticatorGetAssertionArgsSchema';
import { PublicKeyCredentialDescriptorDtoSchema } from '../spec/PublicKeyCredentialDescriptorDtoSchema';

export const AuthenticatorGetAssertionArgsDtoSchema =
  AuthenticatorGetAssertionArgsSchema.extend({
    /**
     * Hash of the serialized client data collected by the host.
     *
     * Correspoding parameter name: clientDataHash (0x02)
     * CTAP Data type: Byte String
     * Required
     */
    hash: BytesSchemaCodec,

    /**
     * An OPTIONAL list of PublicKeyCredentialDescriptors describing credentials acceptable to the Relying Party (possibly filtered by the client), if any.
     *
     * Correspoding parameter name: allowList (0x03)
     * CTAP Data type: PublicKeyCredentialDescriptor[]
     * Optional
     */
    allowCredentialDescriptorList: z
      .array(PublicKeyCredentialDescriptorDtoSchema)
      .optional()
      .meta({
        description:
          'Optional list of credentials allowed for this authentication.',
      }),
  });
