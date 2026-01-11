import { Exception } from '@repo/exception';
import { HttpStatusCode } from '@repo/http';

export class ChallengeEntropyInsufficient extends Exception {
  static status = HttpStatusCode.BAD_REQUEST_400;
  static readonly code = 'ChallengeEntropyInsufficient';
  static message =
    'Challenge entropy is insufficient. Challenges must be at least 16 bytes.';
}
