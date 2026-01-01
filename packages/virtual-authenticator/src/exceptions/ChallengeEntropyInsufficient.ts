import { Exception } from '@repo/exception';

export const CHALLENGE_ENTROPY_INSUFFICIENT = 'CHALLENGE_ENTROPY_INSUFFICIENT';

export class ChallengeEntropyInsufficient extends Exception {
  static message =
    'Challenge entropy is insufficient. Challenges must be at least 16 bytes.';
  static code = CHALLENGE_ENTROPY_INSUFFICIENT;
  static status = 400;
}
