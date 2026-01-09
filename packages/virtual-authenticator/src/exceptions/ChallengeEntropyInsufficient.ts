import { Exception } from '@repo/exception';
import { HttpStatusCode } from '@repo/http';

export class ChallengeEntropyInsufficient extends Exception {
  static status = HttpStatusCode.BAD_REQUEST;
  static readonly name = 'ChallengeEntropyInsufficient';
  static message =
    'Challenge entropy is insufficient. Challenges must be at least 16 bytes.';
}
