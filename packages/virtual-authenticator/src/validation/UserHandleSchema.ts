import type z from 'zod';

import { see } from '../meta/see';
import { BytesSchema } from './BytesSchema';

/**
 * This attribute contains the **user handle** returned from the authenticator,
 * or `null` if the authenticator did not return a user handle.
 *
 * The user handle is specified by a **Relying Party** (RP), as the value of `user.id`, and is used to map a
 * specific public key credential to a specific user account with the Relying Party. Authenticators, in turn,
 * map RP IDs and user handle pairs to public key credential sources.
 *
 * A user handle is an **opaque byte sequence** with a maximum size of 64 bytes, and is **not** meant to be
 * displayed to the user.
 *
 * @see https://www.w3.org/TR/webauthn/#user-handle
 */
export const UserHandleSchema = BytesSchema.meta({
  id: 'UserHandle',
  ref: 'UserHandle',
  description: `The user handle for the assertion (max 64 bytes). ${see(
    'https://www.w3.org/TR/webauthn/#user-handle',
  )}`,
}).refine((buf) => buf === null || buf.length <= 64, {
  message: 'User handle must not exceed 64 bytes in length.',
  path: ['length'],
});

export type UserHandle = z.infer<typeof UserHandleSchema>;
