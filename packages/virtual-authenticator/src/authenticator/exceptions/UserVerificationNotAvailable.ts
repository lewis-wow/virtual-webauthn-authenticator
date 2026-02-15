import { Exception } from '@repo/exception';
import { HttpStatusCode } from '@repo/http';

export class UserVerificationNotAvailable extends Exception {
  static readonly status = HttpStatusCode.BAD_REQUEST_400;
  static readonly code = 'UserVerificationNotAvailable';
  static readonly message = 'User verification not available.';
}
