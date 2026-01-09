import { Exception } from '@repo/exception';
import { HttpStatusCode } from '@repo/http';

export class UserVerificationNotAvailable extends Exception {
  static status = HttpStatusCode.BAD_REQUEST;
  static readonly name = 'UserVerificationNotAvailable';
  static message = 'User verification not available.';
}
