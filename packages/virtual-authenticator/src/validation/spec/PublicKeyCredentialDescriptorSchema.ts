import z from 'zod';

import { see } from '../../meta/see';
import { BytesSchema } from '../BytesSchema';
import { PublicKeyCredentialTypeSchema } from '../enums/PublicKeyCredentialTypeSchema';

// Used to exclude existing credentials for a user

/**
 * @see https://www.w3.org/TR/webauthn/#dictdef-publickeycredentialdescriptor
 */
export const PublicKeyCredentialDescriptorSchema = z
  .object({
    type: PublicKeyCredentialTypeSchema,
    id: BytesSchema.refine((buf) => buf.length <= 1023, {
      message: `Credential ID length must not exceed 1023 bytes. ${see(
        'https://www.w3.org/TR/webauthn-3/#sctn-attested-credential-data',
      )}`,
    }).meta({
      description:
        'The credential ID of the public key credential (max 1023 bytes).',
    }),
    /**
     * This OPTIONAL member contains a hint as to how the client might communicate
     * with the managing authenticator of the public key credential the caller is referring to.
     */
    transports: z
      .array(z.string().meta({ description: 'AuthenticatorTransport' }))
      .optional(),
  })
  .meta({
    id: 'PublicKeyCredentialDescriptor',
    ref: 'PublicKeyCredentialDescriptor',
    description: `Used to exclude existing credentials for a user. ${see(
      'https://www.w3.org/TR/webauthn/#dictdef-publickeycredentialdescriptor',
    )}`,
  });

export type PublicKeyCredentialDescriptor = z.infer<
  typeof PublicKeyCredentialDescriptorSchema
>;
