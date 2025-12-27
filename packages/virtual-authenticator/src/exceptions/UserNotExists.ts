import { Exception } from '@repo/exception';

export class UserNotExists extends Exception {
  static code = 'USER_NOT_EXISTS';
  static message = 'User not exists.';
  static status = 404;
}
