import { Schema } from 'effect';

import { see } from '../meta/see';
import { BytesSchema } from './BytesSchema';

/**
 * @see https://www.w3.org/TR/webauthn/#sctn-cryptographic-challenges
 */
export const ChallengeSchema = BytesSchema.pipe(
  Schema.filter((buf) => buf.length >= 16, {
    message: () => 'Challenges SHOULD be at least 16 bytes long.',
  }),
  Schema.annotations({
    identifier: 'Challenge',
    title: 'Challenge',
    description: `As a cryptographic protocol, Web Authentication is dependent upon randomized challenges to avoid replay attacks. In order to prevent replay attacks, the challenges MUST contain enough entropy to make guessing them infeasible. Challenges SHOULD therefore be at least 16 bytes long. ${see(
      'https://www.w3.org/TR/webauthn/#sctn-cryptographic-challenges',
    )}`,
  }),
);

export type Challenge = Schema.Schema.Type<typeof ChallengeSchema>;
