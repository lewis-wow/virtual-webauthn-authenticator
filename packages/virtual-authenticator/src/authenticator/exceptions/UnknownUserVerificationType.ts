import { Exception } from '@repo/exception';
import { HttpStatusCode } from '@repo/http';

export class UnknownUserVerificationType extends Exception {
  static readonly code = 'UnknownUserVerificationType';
  static readonly status = HttpStatusCode.BAD_REQUEST_400;
  static readonly message = 'Unknown User Verification type.';
}
