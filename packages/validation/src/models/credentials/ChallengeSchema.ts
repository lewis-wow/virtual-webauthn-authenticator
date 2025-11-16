import type z from 'zod';

import { see } from '../../meta/see';
import { BytesSchema } from '../common/BytesSchema';

/**
 * @see https://www.w3.org/TR/webauthn/#sctn-cryptographic-challenges
 */
export const ChallengeSchema = BytesSchema.meta({
  id: 'Challenge',
  description: `As a cryptographic protocol, Web Authentication is dependent upon randomized challenges to avoid replay attacks. In order to prevent replay attacks, the challenges MUST contain enough entropy to make guessing them infeasible. Challenges SHOULD therefore be at least 16 bytes long. ${see(
    'https://www.w3.org/TR/webauthn/#sctn-cryptographic-challenges',
  )}`,
}).refine((buf) => buf.length >= 16, {
  message: 'Challenges SHOULD be at least 16 bytes long.',
  path: ['length'],
});

export type Challenge = z.infer<typeof ChallengeSchema>;
