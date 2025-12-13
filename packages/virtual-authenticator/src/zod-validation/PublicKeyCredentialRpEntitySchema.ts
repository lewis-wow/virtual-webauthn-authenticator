import z from 'zod';

import { see } from '../meta/see';
import { PublicKeyCredentialEntitySchema } from './PublicKeyCredentialEntitySchema';
import { RpIdSchema } from './RpIdSchema';

/**
 * Is used to supply additional Relying Party attributes when creating a new credential.
 *
 * @see https://www.w3.org/TR/webauthn/#dictdef-publickeycredentialrpentity
 */
export const PublicKeyCredentialRpEntitySchema =
  PublicKeyCredentialEntitySchema.extend({
    id: RpIdSchema.meta({
      description:
        'A unique identifier for the Relying Party entity, which sets the RP ID.',
      examples: ['example.com'],
    }),
  }).meta({
    id: 'PublicKeyCredentialRpEntity',
    ref: 'PublicKeyCredentialRpEntity',
    description: `Represents the Relying Party. ${see(
      'https://www.w3.org/TR/webauthn/#dictdef-publickeycredentialrpentity',
    )}`,
  });

export type PublicKeyCredentialRpEntity = z.infer<
  typeof PublicKeyCredentialRpEntitySchema
>;
