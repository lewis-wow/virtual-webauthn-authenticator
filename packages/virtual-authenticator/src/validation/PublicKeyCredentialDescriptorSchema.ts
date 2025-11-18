import z from 'zod';

import { AuthenticatorTransportSchema } from '../enums/AuthenticatorTransport';
import { PublicKeyCredentialTypeSchema } from '../enums/PublicKeyCredentialType';
import { see } from '../meta/see';
import { BytesSchema } from './BytesSchema';

// Used to exclude existing credentials for a user

/**
 * @see https://www.w3.org/TR/webauthn/#dictdef-publickeycredentialdescriptor
 */
export const PublicKeyCredentialDescriptorSchema = z
  .object({
    type: PublicKeyCredentialTypeSchema,
    id: BytesSchema.meta({
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
