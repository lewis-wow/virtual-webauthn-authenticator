import type { IPublicKeyCredentialUserEntity } from '@repo/types';
import z from 'zod';

import { see } from '../meta/see.js';
import { PublicKeyCredentialEntitySchema } from './PublicKeyCredentialEntitySchema.js';
import { UserHandleSchema } from './UserHandleSchema.js';

// Represents the user creating the credential

/**
 * @see https://www.w3.org/TR/webauthn/#dictdef-publickeycredentialuserentity
 */
export const PublicKeyCredentialUserEntitySchema =
  PublicKeyCredentialEntitySchema.extend({
    id: UserHandleSchema,
    displayName: z.string().meta({
      description: "A human-friendly name for the user's account.",
      examples: ['John Doe'],
    }),
  }).meta({
    id: 'PublicKeyCredentialUserEntity',
    description: `Represents the user creating the credential. ${see('https://www.w3.org/TR/webauthn/#dictdef-publickeycredentialuserentity')}`,
  }) satisfies z.ZodType<IPublicKeyCredentialUserEntity>;
