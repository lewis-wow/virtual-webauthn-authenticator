import { Schema } from 'effect';

import { TokenBindingStatusSchema } from '../enums/TokenBindingStatus';
import { see } from '../meta/see';
import { CollectedClientDataTypeSchema } from './enums/CollectedClientDataTypeSchema';

/**
 * @see https://www.w3.org/TR/webauthn/#dictdef-collectedclientdata
 *
 * The CollectedClientData may be extended in the future.
 * Therefore it’s critical when parsing to be tolerant of unknown keys and of any reordering of the keys.
 */
export const CollectedClientDataSchema = Schema.Struct({
  /**
   * This member contains the string "webauthn.create" when creating new credentials,
   * and "webauthn.get" when getting an assertion from an existing credential.
   */
  type: CollectedClientDataTypeSchema,

  /**
   * This member contains the base64url encoding of the challenge provided by the Relying Party.
   */
  challenge: Schema.String.pipe(
    Schema.pattern(/^[a-zA-Z0-9\-_]*$/, {
      message: () => 'Expected a Base64URL string',
    }),
  ).annotations({
    description:
      'The base64url encoding of the challenge provided by the Relying Party.',
  }),

  /**
   * This member contains the fully qualified origin of the requester, as provided to the authenticator by the client.
   */
  origin: Schema.String.annotations({
    description:
      'The fully qualified origin of the requester, as provided to the authenticator by the client.',
  }),

  /**
   * This member contains the inverse of the `sameOriginWithAncestors` argument value.
   */
  crossOrigin: Schema.optional(Schema.Boolean).annotations({
    description: 'The inverse of the `sameOriginWithAncestors` argument value',
  }),

  /**
   * This OPTIONAL member contains information about the state of the Token Binding protocol used when communicating with the Relying Party.
   * Its absence indicates that the client doesn’t support token binding.
   *
   * @see https://datatracker.ietf.org/doc/html/rfc8471#section-1
   */
  tokenBinding: Schema.optional(
    Schema.Struct({
      status: TokenBindingStatusSchema,
      id: Schema.optional(Schema.String),
    }),
  ).annotations({
    description: `This OPTIONAL member contains information about the state of the Token Binding protocol used when communicating with the Relying Party. ${see(
      'https://datatracker.ietf.org/doc/html/rfc8471#section-1',
    )}`,
  }),
}).annotations({
  identifier: 'CollectedClientData',
  title: 'CollectedClientData',
  ref: 'CollectedClientData',
  description: `The client data collected by the authenticator. ${see(
    'https://www.w3.org/TR/webauthn/#dictdef-collectedclientdata',
  )}`,
});

export type CollectedClientData = Schema.Schema.Type<
  typeof CollectedClientDataSchema
>;
