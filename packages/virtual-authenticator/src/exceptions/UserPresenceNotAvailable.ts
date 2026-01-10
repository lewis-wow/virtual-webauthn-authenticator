import { Exception } from '@repo/exception';
import { HttpStatusCode } from '@repo/http';

export class UserPresenceNotAvailable extends Exception {
  static status = HttpStatusCode.BAD_REQUEST;
  static readonly code = 'UserPresenceNotAvailable';
  static message = 'User presence not available.';
}
