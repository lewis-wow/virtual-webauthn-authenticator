import z from 'zod';

import { see } from '../../meta/see';
import { PublicKeyCredentialEntitySchema } from './PublicKeyCredentialEntitySchema';
import { UserIdSchema } from './UserIdSchema';

/**
 * @see https://www.w3.org/TR/webauthn/#dictdef-publickeycredentialuserentity
 */
export const PublicKeyCredentialUserEntitySchema =
  PublicKeyCredentialEntitySchema.extend({
    id: UserIdSchema,
    displayName: z.string().meta({
      description: "A human-friendly name for the user's account.",
      examples: ['John Doe'],
    }),
  }).meta({
    id: 'PublicKeyCredentialUserEntity',
    ref: 'PublicKeyCredentialUserEntity',
    description: `Represents the user creating the credential. ${see(
      'https://www.w3.org/TR/webauthn/#dictdef-publickeycredentialuserentity',
    )}`,
  });

export type PublicKeyCredentialUserEntity = z.infer<
  typeof PublicKeyCredentialUserEntitySchema
>;
