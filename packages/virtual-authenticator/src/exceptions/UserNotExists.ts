import { Exception } from '@repo/exception';
import { HttpStatusCode } from '@repo/http';

export class UserNotExists extends Exception {
  static status = HttpStatusCode.NOT_FOUND;
  static readonly code = 'UserNotExists';
  static message = 'User not exists.';
}
