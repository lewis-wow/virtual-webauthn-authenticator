import { Schema } from 'effect';

import { see } from '../meta/see';
import { BytesSchema } from './BytesSchema';
import { AuthenticatorTransportSchema } from './enums/AuthenticatorTransportSchema';
import { PublicKeyCredentialTypeSchema } from './enums/PublicKeyCredentialTypeSchema';

// Used to exclude existing credentials for a user

/**
 * @see https://www.w3.org/TR/webauthn/#dictdef-publickeycredentialdescriptor
 */
export const PublicKeyCredentialDescriptorSchema = Schema.Struct({
  type: PublicKeyCredentialTypeSchema,
  id: BytesSchema.annotations({
    description: 'The credential ID of the public key credential.',
  }),
  /**
   * This OPTIONAL member contains a hint as to how the client might communicate
   * with the managing authenticator of the public key credential the caller is referring to.
   */
  transports: Schema.optional(Schema.Array(AuthenticatorTransportSchema)),
}).annotations({
  identifier: 'PublicKeyCredentialDescriptor',
  ref: 'PublicKeyCredentialDescriptor',
  description: `Used to exclude existing credentials for a user. ${see(
    'https://www.w3.org/TR/webauthn/#dictdef-publickeycredentialdescriptor',
  )}`,
});

export type PublicKeyCredentialDescriptor = Schema.Schema.Type<
  typeof PublicKeyCredentialDescriptorSchema
>;
