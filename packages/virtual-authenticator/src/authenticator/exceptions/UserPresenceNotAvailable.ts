import { Exception } from '@repo/exception';
import { HttpStatusCode } from '@repo/http';

export class UserPresenceNotAvailable extends Exception {
  static readonly status = HttpStatusCode.BAD_REQUEST_400;
  static readonly code = 'UserPresenceNotAvailable';
  static readonly message = 'User presence not available.';
}
