import {
  CollectedClientDataTypeSchema,
  TokenBindingStatusSchema,
} from '@repo/enums';
import type { ICollectedClientData } from '@repo/types';
import z from 'zod';

import { see } from '../meta/see';

/**
 * @see https://www.w3.org/TR/webauthn/#dictdef-collectedclientdata
 *
 * The CollectedClientData may be extended in the future.
 * Therefore it’s critical when parsing to be tolerant of unknown keys and of any reordering of the keys.
 */
export const CollectedClientDataSchema = z
  .looseObject({
    /**
     * This member contains the string "webauthn.create" when creating new credentials,
     * and "webauthn.get" when getting an assertion from an existing credential.
     */
    type: CollectedClientDataTypeSchema,
    /**
     * This member contains the base64url encoding of the challenge provided by the Relying Party.
     */
    challenge: z.base64url().meta({
      description:
        'The base64url encoding of the challenge provided by the Relying Party.',
    }),
    /**
     * This member contains the fully qualified origin of the requester, as provided to the authenticator by the client.
     */
    origin: z.string().meta({
      description:
        'The fully qualified origin of the requester, as provided to the authenticator by the client.',
    }),
    /**
     * This member contains the inverse of the `sameOriginWithAncestors` argument value.
     */
    crossOrigin: z.boolean().optional().meta({
      description:
        'The inverse of the `sameOriginWithAncestors` argument value',
    }),
    /**
     * This OPTIONAL member contains information about the state of the Token Binding protocol used when communicating with the Relying Party.
     * Its absence indicates that the client doesn’t support token binding.
     *
     * @see https://datatracker.ietf.org/doc/html/rfc8471#section-1
     */
    tokenBinding: z
      .object({
        status: TokenBindingStatusSchema,
        id: z.string().optional(),
      })
      .optional()
      .meta({
        description: `This OPTIONAL member contains information about the state of the Token Binding protocol used when communicating with the Relying Party. ${see('https://datatracker.ietf.org/doc/html/rfc8471#section-1')}`,
      }),
  })
  .meta({
    id: 'CollectedClientData',
    description: `The client data collected by the authenticator. ${see('https://www.w3.org/TR/webauthn/#dictdef-collectedclientdata')}`,
  }) satisfies z.ZodType<ICollectedClientData>;
