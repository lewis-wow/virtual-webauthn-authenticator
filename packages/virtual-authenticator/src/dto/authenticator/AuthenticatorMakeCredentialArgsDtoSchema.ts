import { BytesSchemaCodec } from '@repo/core/zod-validation';
import z from 'zod';

import { AuthenticatorMakeCredentialArgsSchema } from '../../validation';
import { PublicKeyCredentialDescriptorDtoSchema } from '../spec/PublicKeyCredentialDescriptorDtoSchema';
import { PublicKeyCredentialUserEntityDtoSchema } from '../spec/PublicKeyCredentialUserEntityDtoSchema';

export const AuthenticatorMakeCredentialArgsDtoSchema =
  AuthenticatorMakeCredentialArgsSchema.extend({
    /**
     * Hash of the serialized client data collected by the host.
     *
     * Correspoding parameter name: clientDataHash (0x02)
     * CTAP Data type: Byte String
     * Required
     */
    hash: BytesSchemaCodec,

    /**
     * The authenticator associates the created public key credential with the account identifier,
     * and MAY also associate any or all of the user name, and user display name.
     * The user name and display name are OPTIONAL for privacy reasons for single-factor scenarios where only user presence is required.
     *
     * Corresponding parameter name: name (0x03)
     * CTAP Data type: PublicKeyCredentialUserEntity
     * Required
     */
    userEntity: PublicKeyCredentialUserEntityDtoSchema,

    /**
     * An array of PublicKeyCredentialDescriptor structures.
     * The authenticator returns an error if the authenticator already contains one of the credentials enumerated in this array.
     * This allows RPs to limit the creation of multiple credentials for the same account on a single authenticator.
     * If this parameter is present, it MUST NOT be empty.
     *
     * Corresponding parameter name: excludeList (0x05)
     * CTAP Data type: PublicKeyCredentialDescriptor[]
     * Optional
     */
    excludeCredentialDescriptorList: z
      .array(PublicKeyCredentialDescriptorDtoSchema)
      .min(1)
      .optional()
      .meta({
        description:
          'Optional list of credentials to exclude from creation (known credentials).',
      }),
  });
