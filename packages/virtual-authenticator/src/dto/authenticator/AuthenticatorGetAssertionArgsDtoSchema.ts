import { BytesSchemaCodec } from '@repo/core/zod-validation';
import z from 'zod';

import { AuthenticatorGetAssertionArgsSchema } from '../../validation';
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
     * An array of PublicKeyCredentialDescriptor structures, each denoting a credential.
     * A platform MUST NOT send an empty allowList—if it would be empty it MUST be omitted.
     * If this parameter is present the authenticator MUST only generate an assertion using one of the denoted credentials.
     *
     * Correspoding parameter name: allowList (0x03)
     * CTAP Data type: PublicKeyCredentialDescriptor[]
     * Optional
     */
    allowCredentialDescriptorList: z
      .array(PublicKeyCredentialDescriptorDtoSchema)
      .min(1)
      .optional()
      .meta({
        description:
          'Optional list of credentials allowed for this authentication.',
      }),
  });
