import type z from 'zod';

import { see } from '../../meta/see';
import { BytesSchema } from '../BytesSchema';

/**
 * The user ID for credential creation.
 *
 * The user handle is specified by a Relying Party (RP), as the value of `user.id`, and is used to map a
 * specific public key credential to a specific user account with the Relying Party. Authenticators, in turn,
 * map RP IDs and user handle pairs to public key credential sources.
 *
 * A user handle is an opaque byte sequence with a maximum size of 64 bytes, and is **not** meant to be
 * displayed to the user.
 *
 * For credential creation, the user ID MUST NOT be empty (length between 1 and 64 bytes).
 *
 * @see https://www.w3.org/TR/webauthn/#dom-publickeycredentialuserentity-id
 */
export const UserIdSchema = BytesSchema.meta({
  id: 'UserId',
  ref: 'UserId',
  description: `The user ID for credential creation (1-64 bytes, non-empty). ${see(
    'https://www.w3.org/TR/webauthn/#dom-publickeycredentialuserentity-id',
  )}`,
}).refine((buf) => buf.length >= 1 && buf.length <= 64, {
  message:
    'User ID must be between 1 and 64 bytes in length (MUST NOT be empty).',
  path: ['length'],
});

export type UserId = z.infer<typeof UserIdSchema>;
