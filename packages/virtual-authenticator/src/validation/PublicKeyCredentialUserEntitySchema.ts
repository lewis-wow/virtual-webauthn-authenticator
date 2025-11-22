import { Schema } from 'effect';

import { see } from '../meta/see';
import { PublicKeyCredentialEntitySchema } from './PublicKeyCredentialEntitySchema';
import { UserHandleSchema } from './UserHandleSchema';

// Represents the user creating the credential

/**
 * @see https://www.w3.org/TR/webauthn/#dictdef-publickeycredentialuserentity
 */
export const PublicKeyCredentialUserEntitySchema = Schema.extend(
  PublicKeyCredentialEntitySchema,
  Schema.Struct({
    id: UserHandleSchema,
    displayName: Schema.String.annotations({
      description: "A human-friendly name for the user's account.",
      examples: ['John Doe'],
    }),
  }),
).annotations({
  identifier: 'PublicKeyCredentialUserEntity',
  ref: 'PublicKeyCredentialUserEntity',
  description: `Represents the user creating the credential. ${see(
    'https://www.w3.org/TR/webauthn/#dictdef-publickeycredentialuserentity',
  )}`,
});

export type PublicKeyCredentialUserEntity = Schema.Schema.Type<
  typeof PublicKeyCredentialUserEntitySchema
>;
