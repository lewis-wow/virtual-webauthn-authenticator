import { Schema } from 'effect';

import { see } from '../meta/see';
import { PublicKeyCredentialEntitySchema } from './PublicKeyCredentialEntitySchema';

/**
 * Is used to supply additional Relying Party attributes when creating a new credential.
 *
 * @see https://www.w3.org/TR/webauthn/#dictdef-publickeycredentialrpentity
 */
export const PublicKeyCredentialRpEntitySchema = Schema.extend(
  PublicKeyCredentialEntitySchema,
  Schema.Struct({
    id: Schema.String.annotations({
      description:
        'A unique identifier for the Relying Party entity, which sets the RP ID.',
      examples: ['example.com'],
    }),
  }),
).annotations({
  identifier: 'PublicKeyCredentialRpEntity',
  ref: 'PublicKeyCredentialRpEntity',
  description: `Represents the Relying Party. ${see(
    'https://www.w3.org/TR/webauthn/#dictdef-publickeycredentialrpentity',
  )}`,
});

export type PublicKeyCredentialRpEntity = Schema.Schema.Type<
  typeof PublicKeyCredentialRpEntitySchema
>;
