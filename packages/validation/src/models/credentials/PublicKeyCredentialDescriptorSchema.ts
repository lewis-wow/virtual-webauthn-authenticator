import {
  AuthenticatorTransportSchema,
  PublicKeyCredentialTypeSchema,
} from '@repo/enums';
import z from 'zod';

import { Base64urlToBytesCodecSchema } from '../../codecs/Base64urlToBytesCodecSchema';
import { see } from '../../meta/see';

// Used to exclude existing credentials for a user

/**
 * @see https://www.w3.org/TR/webauthn/#dictdef-publickeycredentialdescriptor
 */
export const PublicKeyCredentialDescriptorSchema = z
  .object({
    type: PublicKeyCredentialTypeSchema,
    id: Base64urlToBytesCodecSchema.meta({
      description: 'The credential ID of the public key credential.',
    }),
    /**
     * This OPTIONAL member contains a hint as to how the client might communicate
     * with the managing authenticator of the public key credential the caller is referring to.
     */
    transports: z.array(AuthenticatorTransportSchema).optional(),
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
